import * as THREE from 'three';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Application State
const state = {
  worldData: null,
  modelCache: new Map(), // model_id -> Three.js Object3D
  instanceObjects: [],   // list of placed objects
  layers: {
    roof: false,         // Default roof OFF so interior is visible
    walls: true,
    racks: true,
    cargo: true,
    amr: true,
    lights: true
  },
  cameraMode: 'orbit',   // 'orbit' | 'top' | 'fps' | 'amr'
  lightingMode: 'industrial', // 'day' | 'industrial'
  selectedObject: null,
  highlightBox: null,
  fpsControls: {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    speed: 4.5,
    pitch: 0,
    yaw: 0,
    isDragging: false,
    prevMouse: { x: 0, y: 0 }
  }
};

// Scene, Camera, Renderer
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b14);
scene.fog = new THREE.FogExp2(0x070b14, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(16, 14, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going underneath floor
controls.minDistance = 1;
controls.maxDistance = 60;
controls.target.set(0, 1.5, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
sunLight.position.set(15, 25, 12);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 60;
sunLight.shadow.camera.left = -20;
sunLight.shadow.camera.right = 20;
sunLight.shadow.camera.top = 20;
sunLight.shadow.camera.bottom = -20;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// Point lights inside warehouse
const warehouseLights = new THREE.Group();
const lightPositions = [
  { x: 0, y: 7.5, z: 0, color: 0xffedd5, int: 2.2 },
  { x: 4.5, y: 7.0, z: -5.0, color: 0x38bdf8, int: 1.4 },
  { x: -4.5, y: 7.0, z: 5.0, color: 0x38bdf8, int: 1.4 },
  { x: 0, y: 6.5, z: -8.0, color: 0xffaa00, int: 1.2 }
];

lightPositions.forEach(lp => {
  const pl = new THREE.PointLight(lp.color, lp.int, 22, 1.2);
  pl.position.set(lp.x, lp.y, lp.z);
  warehouseLights.add(pl);

  // Visual light fixture marker
  const fixture = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16),
    new THREE.MeshBasicMaterial({ color: lp.color })
  );
  fixture.position.set(lp.x, lp.y + 0.1, lp.z);
  warehouseLights.add(fixture);
});
scene.add(warehouseLights);

// Grid Helper for logistics ground floor
const gridHelper = new THREE.GridHelper(40, 40, 0x0284c7, 0x1e293b);
gridHelper.position.y = -0.05;
scene.add(gridHelper);

// Highlight selection box
const selectionGroup = new THREE.Group();
scene.add(selectionGroup);

// AMR Robot Simulation Object
let amrRobot = null;
let amrPathIndex = 0;
let amrWaypoints = [
  new THREE.Vector3(-3.0, 0, -8.0),
  new THREE.Vector3(-3.0, 0, 7.5),
  new THREE.Vector3(1.5, 0, 7.5),
  new THREE.Vector3(1.5, 0, -8.0),
  new THREE.Vector3(1.5, 0, -1.0),
  new THREE.Vector3(-1.0, 0, -1.0)
];

function createAMRRobot() {
  const group = new THREE.Group();

  // Base chassis
  const bodyGeo = new THREE.BoxGeometry(0.9, 0.28, 1.3);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.8,
    roughness: 0.3
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.2;
  body.castShadow = true;
  group.add(body);

  // Yellow hazard side stripes
  const stripeGeo = new THREE.BoxGeometry(0.92, 0.08, 1.1);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.4
  });
  const stripes = new THREE.Mesh(stripeGeo, stripeMat);
  stripes.position.y = 0.2;
  group.add(stripes);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  [[-0.48, 0.12, 0.35], [0.48, 0.12, 0.35], [-0.48, 0.12, -0.35], [0.48, 0.12, -0.35]].forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    group.add(wheel);
  });

  // Top Turntable / Cargo Lift
  const liftGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 24);
  const liftMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
  const lift = new THREE.Mesh(liftGeo, liftMat);
  lift.position.y = 0.37;
  group.add(lift);

  // LiDAR Sensor Tower
  const lidarBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.14, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 })
  );
  lidarBase.position.set(0, 0.45, 0.5);
  group.add(lidarBase);

  // LiDAR Scanner Ring (Cyan Glow)
  const ringGeo = new THREE.TorusGeometry(0.07, 0.02, 8, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.51, 0.5);
  group.add(ring);

  // 270° Laser Scanning Fan
  const fanGeo = new THREE.CircleGeometry(2.5, 32, 0, Math.PI * 1.5);
  const fanMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide
  });
  const fan = new THREE.Mesh(fanGeo, fanMat);
  fan.rotation.x = -Math.PI / 2;
  fan.rotation.z = -Math.PI * 0.75;
  fan.position.set(0, 0.25, 0.5);
  group.add(fan);

  // Mini Pallet on Top
  const palletGeo = new THREE.BoxGeometry(0.75, 0.08, 0.9);
  const palletMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
  const pallet = new THREE.Mesh(palletGeo, palletMat);
  pallet.position.set(0, 0.44, 0);
  group.add(pallet);

  // Cargo Boxes
  const boxGeo = new THREE.BoxGeometry(0.6, 0.45, 0.7);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
  const cargoBox = new THREE.Mesh(boxGeo, boxMat);
  cargoBox.position.set(0, 0.7, 0);
  cargoBox.castShadow = true;
  group.add(cargoBox);

  // Status Indicator Light
  const statusLight = new THREE.PointLight(0x10b981, 0.8, 2);
  statusLight.position.set(0, 0.4, -0.6);
  group.add(statusLight);

  group.position.copy(amrWaypoints[0]);
  scene.add(group);
  return group;
}

// Raycasting for object selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Loading UI elements
const loadingScreen = document.getElementById('loading-screen');
const progressFill = document.getElementById('progress-fill');
const loaderStatus = document.getElementById('loader-status');

// Load Data and Models
async function init() {
  try {
    loaderStatus.textContent = 'Loading warehouse metadata...';
    const resp = await fetch('warehouse_data.json');
    state.worldData = await resp.json();
    progressFill.style.width = '20%';

    const catalog = state.worldData.catalog;
    const instances = state.worldData.instances;
    const totalInstances = instances.length;

    loaderStatus.textContent = 'Loading 3D Collada models (.DAE)...';
    const colladaLoader = new ColladaLoader();

    // Unique model IDs that are actually used in instances
    const uniqueModelIds = [...new Set(instances.map(i => i.model_id))];
    let loadedCount = 0;

    for (const modelId of uniqueModelIds) {
      const cat = catalog[modelId];
      if (!cat) continue;

      loaderStatus.textContent = `Loading ${cat.name || modelId}...`;
      try {
        const collada = await new Promise((resolve, reject) => {
          colladaLoader.load(
            cat.dae_path,
            (res) => resolve(res),
            (xhr) => {
              if (xhr.lengthComputable) {
                const pct = (xhr.loaded / xhr.total) * 100;
              }
            },
            (err) => {
              console.warn(`Error loading model ${modelId}:`, err);
              resolve(null);
            }
          );
        });

        if (collada && collada.scene) {
          const modelScene = collada.scene;

          // Standardize materials and enable shadows
          modelScene.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
                if (child.material.map) {
                  child.material.map.colorSpace = THREE.SRGBColorSpace;
                }
              }
            }
          });

          state.modelCache.set(modelId, modelScene);
        }
      } catch (err) {
        console.warn(`Failed to process model ${modelId}:`, err);
      }

      loadedCount++;
      const pct = 20 + Math.floor((loadedCount / uniqueModelIds.length) * 60);
      progressFill.style.width = `${pct}%`;
    }

    loaderStatus.textContent = 'Assembling warehouse simulation scene...';

    // Place instances according to small_warehouse.world
    const warehouseRoot = new THREE.Group();
    warehouseRoot.name = 'WarehouseRoot';

    instances.forEach((inst, idx) => {
      const baseModel = state.modelCache.get(inst.model_id);
      if (!baseModel) return;

      const instanceClone = baseModel.clone(true);
      instanceClone.name = inst.name;

      // Coordinate transformation:
      // Gazebo X -> Three.js X
      // Gazebo Z -> Three.js Y (height)
      // Gazebo Y -> Three.js -Z
      // Gazebo Yaw -> Three.js Y rotation
      instanceClone.position.set(
        inst.pose.x,
        inst.pose.z,
        -inst.pose.y
      );

      // Rotation around vertical axis (Three.js Y)
      instanceClone.rotation.y = inst.pose.yaw;

      // Attach metadata for raycasting / inspector
      instanceClone.userData = {
        name: inst.name,
        model_id: inst.model_id,
        category: inst.category,
        pose: inst.pose,
        catalog: catalog[inst.model_id]
      };

      // Set initial layer visibility
      if (inst.category === 'roof') {
        instanceClone.visible = state.layers.roof; // false by default
      }

      warehouseRoot.add(instanceClone);
      state.instanceObjects.push(instanceClone);
    });

    scene.add(warehouseRoot);

    // Create Autonomous Mobile Robot (AMR)
    amrRobot = createAMRRobot();

    // Populate catalog modal list
    populateShowcaseCatalog(catalog);

    // Hide loader
    progressFill.style.width = '100%';
    loaderStatus.textContent = 'Simulation ready!';
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 400);

  } catch (err) {
    console.error('Initialization error:', err);
    loaderStatus.textContent = `Initialization failed: ${err.message}`;
  }
}

// Populate Asset Showcase Sidebar
function populateShowcaseCatalog(catalog) {
  const catalogList = document.getElementById('catalog-list');
  catalogList.innerHTML = '';

  Object.values(catalog).forEach((item, index) => {
    const el = document.createElement('div');
    el.className = `catalog-item ${index === 0 ? 'active' : ''}`;
    el.innerHTML = `
      <div class="catalog-title">${item.name}</div>
      <div class="catalog-sub">${item.id}</div>
    `;
    el.addEventListener('click', () => {
      document.querySelectorAll('.catalog-item').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      loadPreviewModel(item.id);
    });
    catalogList.appendChild(el);
  });
}

// Preview Studio for Asset Showcase Modal
let previewScene, previewCamera, previewRenderer, previewControls, previewModel = null;
let isPreviewTurntable = true;
let isPreviewWireframe = false;

function initPreviewStudio() {
  const container = document.getElementById('preview-canvas-container');
  previewScene = new THREE.Scene();
  previewScene.background = new THREE.Color(0x0c1322);

  previewCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  previewCamera.position.set(4, 3, 5);

  previewRenderer = new THREE.WebGLRenderer({ antialias: true });
  previewRenderer.setSize(container.clientWidth, container.clientHeight);
  previewRenderer.shadowMap.enabled = true;
  previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(previewRenderer.domElement);

  previewControls = new OrbitControls(previewCamera, previewRenderer.domElement);
  previewControls.enableDamping = true;

  // Studio Lighting
  const amb = new THREE.AmbientLight(0xffffff, 0.8);
  previewScene.add(amb);
  const dir1 = new THREE.DirectionalLight(0xffffff, 1.5);
  dir1.position.set(5, 10, 7);
  dir1.castShadow = true;
  previewScene.add(dir1);
  const dir2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
  dir2.position.set(-5, -2, -5);
  previewScene.add(dir2);

  // Circular Pedestal / Grid
  const grid = new THREE.GridHelper(8, 16, 0x38bdf8, 0x1e293b);
  previewScene.add(grid);

  window.addEventListener('resize', () => {
    if (!document.getElementById('showcase-modal').classList.contains('open')) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    previewCamera.aspect = w / h;
    previewCamera.updateProjectionMatrix();
    previewRenderer.setSize(w, h);
  });

  function animatePreview() {
    requestAnimationFrame(animatePreview);
    if (previewControls) previewControls.update();
    if (isPreviewTurntable && previewModel) {
      previewModel.rotation.y += 0.008;
    }
    if (previewRenderer && previewScene && previewCamera) {
      previewRenderer.render(previewScene, previewCamera);
    }
  }
  animatePreview();
}

function loadPreviewModel(modelId) {
  if (!previewScene) initPreviewStudio();

  if (previewModel) {
    previewScene.remove(previewModel);
    previewModel = null;
  }

  const cached = state.modelCache.get(modelId);
  const infoEl = document.getElementById('preview-model-info');
  const cat = state.worldData.catalog[modelId];

  if (!cached) {
    infoEl.textContent = `Model ${modelId} is not loaded.`;
    return;
  }

  previewModel = cached.clone(true);
  previewModel.position.set(0, 0, 0);
  previewModel.rotation.set(0, 0, 0);

  // Compute bounding box and center model
  const box = new THREE.Box3().setFromObject(previewModel);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  previewModel.position.sub(center);
  previewModel.position.y += size.y / 2; // Sit on ground

  previewScene.add(previewModel);

  // Adjust camera to fit
  const maxDim = Math.max(size.x, size.y, size.z);
  previewCamera.position.set(maxDim * 1.6, maxDim * 1.2, maxDim * 1.8);
  previewControls.target.set(0, size.y / 2, 0);
  previewControls.update();

  infoEl.innerHTML = `
    <strong>${cat.name}</strong><br>
    SDF ID: ${modelId}<br>
    Dimensions: ${size.x.toFixed(2)}m × ${size.z.toFixed(2)}m × ${size.y.toFixed(2)}m<br>
    Textures: ${cat.textures.length > 0 ? cat.textures.join(', ') : 'Default shader'}<br>
    DAE Mesh: ${cat.dae_path}
  `;
}

// AMR Robot Waypoint Navigation Animation
function updateAMR(delta) {
  if (!amrRobot || !state.layers.amr) return;

  const target = amrWaypoints[amrPathIndex];
  const currentPos = amrRobot.position;
  const dist = currentPos.distanceTo(target);

  if (dist < 0.25) {
    amrPathIndex = (amrPathIndex + 1) % amrWaypoints.length;
  } else {
    // Move towards target
    const dir = new THREE.Vector3().subVectors(target, currentPos).normalize();
    currentPos.addScaledVector(dir, 1.8 * delta);

    // Rotate towards direction of movement
    const targetAngle = Math.atan2(-dir.z, dir.x) + Math.PI / 2;
    amrRobot.rotation.y = THREE.MathUtils.lerp(amrRobot.rotation.y, targetAngle, 0.1);
  }

  // If in AMR Cam mode, follow robot
  if (state.cameraMode === 'amr') {
    const camOffset = new THREE.Vector3(0, 2.2, -3.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), amrRobot.rotation.y);
    camera.position.lerp(amrRobot.position.clone().add(camOffset), 0.1);
    camera.lookAt(amrRobot.position.clone().add(new THREE.Vector3(0, 0.8, 0)));
  }
}

// First-Person Walkthrough (FPS) Movement
function updateFPS(delta) {
  if (state.cameraMode !== 'fps') return;

  const moveDir = new THREE.Vector3();
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const side = new THREE.Vector3(-forward.z, 0, forward.x);

  if (state.fpsControls.moveForward) moveDir.add(forward);
  if (state.fpsControls.moveBackward) moveDir.sub(forward);
  if (state.fpsControls.moveRight) moveDir.add(side);
  if (state.fpsControls.moveLeft) moveDir.sub(side);

  if (moveDir.lengthSq() > 0) {
    moveDir.normalize();
    camera.position.addScaledVector(moveDir, state.fpsControls.speed * delta);
  }

  // Enforce warehouse floor boundaries & eye height
  camera.position.y = 1.7; // 1.7m human eye level
  camera.position.x = Math.max(-6.5, Math.min(6.5, camera.position.x));
  camera.position.z = Math.max(-9.8, Math.min(9.8, camera.position.z));
}

// Event Listeners for UI
function setupUI() {
  // Layer Toggles
  const layerMap = {
    'roof': () => toggleLayer('roof', ['roof']),
    'walls': () => toggleLayer('walls', ['wall']),
    'racks': () => toggleLayer('racks', ['rack']),
    'cargo': () => toggleLayer('cargo', ['cargo', 'facility']),
    'amr': () => {
      state.layers.amr = !state.layers.amr;
      if (amrRobot) amrRobot.visible = state.layers.amr;
      document.getElementById('toggle-amr').classList.toggle('on', state.layers.amr);
    },
    'lights': () => {
      state.layers.lights = !state.layers.lights;
      warehouseLights.visible = state.layers.lights;
      document.getElementById('toggle-lights').classList.toggle('on', state.layers.lights);
    }
  };

  document.querySelectorAll('.layer-item').forEach(item => {
    const layer = item.dataset.layer;
    item.addEventListener('click', () => {
      if (layerMap[layer]) layerMap[layer]();
    });
  });

  function toggleLayer(layerKey, categories) {
    state.layers[layerKey] = !state.layers[layerKey];
    const isOn = state.layers[layerKey];
    document.getElementById(`toggle-${layerKey}`).classList.toggle('on', isOn);

    state.instanceObjects.forEach(obj => {
      if (categories.includes(obj.userData.category)) {
        obj.visible = isOn;
      }
    });
  }

  // Camera Mode Buttons
  const camBtns = {
    'orbit': document.getElementById('cam-orbit'),
    'top': document.getElementById('cam-top'),
    'fps': document.getElementById('cam-fps'),
    'amr': document.getElementById('cam-amr')
  };

  function setCameraMode(mode) {
    state.cameraMode = mode;
    Object.keys(camBtns).forEach(k => camBtns[k].classList.toggle('active', k === mode));
    document.getElementById('current-view-badge').textContent = camBtns[mode].querySelector('.btn-label').textContent;

    const fpsHint = document.getElementById('fps-hint');
    if (fpsHint) fpsHint.style.display = (mode === 'fps') ? 'flex' : 'none';

    if (mode === 'orbit') {
      controls.enabled = true;
      controls.maxPolarAngle = Math.PI / 2 - 0.02;
    } else if (mode === 'top') {
      controls.enabled = true;
      camera.position.set(0, 24, 0.001);
      controls.target.set(0, 0, 0);
      controls.update();
    } else if (mode === 'fps') {
      controls.enabled = false;
      camera.position.set(0, 1.7, 8);
      camera.lookAt(0, 1.7, 0);
    } else if (mode === 'amr') {
      controls.enabled = false;
    }
  }

  Object.keys(camBtns).forEach(k => {
    camBtns[k].addEventListener('click', () => setCameraMode(k));
  });

  // Teleport Buttons
  const teleports = {
    'tele-aisle-a': { pos: [4.7, 3.5, 5.0], target: [4.7, 1.5, -2.0] },
    'tele-aisle-b': { pos: [-5.8, 3.5, 5.0], target: [-5.8, 1.5, -2.0] },
    'tele-dock': { pos: [-0.3, 2.5, 6.0], target: [-0.3, 0.5, 9.4] },
    'tele-clutter': { pos: [4.0, 2.5, -4.0], target: [4.5, 0.5, -7.5] }
  };

  Object.entries(teleports).forEach(([id, cfg]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        setCameraMode('orbit');
        camera.position.set(...cfg.pos);
        controls.target.set(...cfg.target);
        controls.update();
      });
    }
  });

  // Top Nav Buttons
  document.getElementById('btn-reset').addEventListener('click', () => {
    setCameraMode('orbit');
    camera.position.set(16, 14, 18);
    controls.target.set(0, 1.5, 0);
    controls.update();
  });

  document.getElementById('btn-lighting').addEventListener('click', () => {
    if (state.lightingMode === 'industrial') {
      state.lightingMode = 'day';
      scene.background.set(0x0f172a);
      sunLight.intensity = 2.2;
      ambientLight.intensity = 1.0;
      renderer.toneMappingExposure = 1.3;
    } else {
      state.lightingMode = 'industrial';
      scene.background.set(0x070b14);
      sunLight.intensity = 1.4;
      ambientLight.intensity = 0.7;
      renderer.toneMappingExposure = 1.15;
    }
  });

  // Showcase Modal
  const modal = document.getElementById('showcase-modal');
  document.getElementById('btn-showcase').addEventListener('click', () => {
    modal.classList.add('open');
    const firstCat = Object.keys(state.worldData.catalog)[0];
    loadPreviewModel(firstCat);
  });

  document.getElementById('btn-close-modal').addEventListener('click', () => {
    modal.classList.remove('open');
  });

  document.getElementById('btn-preview-rotate').addEventListener('click', (e) => {
    isPreviewTurntable = !isPreviewTurntable;
    e.target.classList.toggle('active', isPreviewTurntable);
  });

  document.getElementById('btn-preview-wireframe').addEventListener('click', (e) => {
    isPreviewWireframe = !isPreviewWireframe;
    e.target.classList.toggle('active', isPreviewWireframe);
    if (previewModel) {
      previewModel.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.wireframe = isPreviewWireframe;
        }
      });
    }
  });

  // Inspector Focus Button
  document.getElementById('inspect-focus-btn').addEventListener('click', () => {
    if (state.selectedObject) {
      setCameraMode('orbit');
      const pos = state.selectedObject.position;
      camera.position.set(pos.x + 3.5, pos.y + 2.5, pos.z + 3.5);
      controls.target.copy(pos);
      controls.update();
    }
  });

  // FPS Keyboard listeners
  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': state.fpsControls.moveForward = true; break;
      case 'KeyS': case 'ArrowDown': state.fpsControls.moveBackward = true; break;
      case 'KeyA': case 'ArrowLeft': state.fpsControls.moveLeft = true; break;
      case 'KeyD': case 'ArrowRight': state.fpsControls.moveRight = true; break;
      case 'ShiftLeft': state.fpsControls.speed = 8.0; break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': state.fpsControls.moveForward = false; break;
      case 'KeyS': case 'ArrowDown': state.fpsControls.moveBackward = false; break;
      case 'KeyA': case 'ArrowLeft': state.fpsControls.moveLeft = false; break;
      case 'KeyD': case 'ArrowRight': state.fpsControls.moveRight = false; break;
      case 'ShiftLeft': state.fpsControls.speed = 4.5; break;
    }
  });

  // FPS Mouse Drag Look
  renderer.domElement.addEventListener('mousedown', (e) => {
    if (state.cameraMode === 'fps') {
      state.fpsControls.isDragging = true;
      state.fpsControls.prevMouse = { x: e.clientX, y: e.clientY };
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (state.cameraMode === 'fps' && state.fpsControls.isDragging) {
      const dx = e.clientX - state.fpsControls.prevMouse.x;
      const dy = e.clientY - state.fpsControls.prevMouse.y;
      state.fpsControls.prevMouse = { x: e.clientX, y: e.clientY };

      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= dx * 0.003;
      euler.x -= dy * 0.003;
      euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.x));
      camera.quaternion.setFromEuler(euler);
    }
  });

  window.addEventListener('mouseup', () => {
    state.fpsControls.isDragging = false;
  });

  // Object Raycasting / Selection
  renderer.domElement.addEventListener('click', (e) => {
    if (state.cameraMode === 'fps') return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(state.instanceObjects, true);
    if (intersects.length > 0) {
      // Find top-level instance root
      let targetObj = intersects[0].object;
      while (targetObj.parent && targetObj.parent !== scene.getObjectByName('WarehouseRoot')) {
        targetObj = targetObj.parent;
      }
      selectObject(targetObj);
    }
  });

  // Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function selectObject(obj) {
  if (!obj || !obj.userData) return;
  state.selectedObject = obj;

  const data = obj.userData;
  const inspectorCard = document.getElementById('inspector-card');
  inspectorCard.classList.add('active');

  document.getElementById('inspect-name').textContent = data.name;
  document.getElementById('inspect-id').textContent = `model://${data.model_id}`;
  document.getElementById('inspect-pos').textContent = `${data.pose.x.toFixed(2)}, ${data.pose.z.toFixed(2)}, ${(-data.pose.y).toFixed(2)}`;
  document.getElementById('inspect-yaw').textContent = `${data.pose.yaw.toFixed(2)} rad (${(data.pose.yaw * 180 / Math.PI).toFixed(0)}°)`;
  document.getElementById('inspect-cat').textContent = data.category.toUpperCase();

  const badge = document.getElementById('inspect-badge');
  badge.textContent = data.category.toUpperCase();
  badge.className = `inspector-badge badge-${data.category}`;

  // Highlight Box
  selectionGroup.clear();
  const box = new THREE.Box3().setFromObject(obj);
  const boxHelper = new THREE.Box3Helper(box, new THREE.Color(0x38bdf8));
  selectionGroup.add(boxHelper);
}

// Animation Loop & FPS Counter
let lastTime = performance.now();
let frameCount = 0;
let fpsTimer = 0;
const fpsDisplay = document.getElementById('fps-counter');

function animate(now) {
  requestAnimationFrame(animate);

  const delta = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  // FPS calculation
  frameCount++;
  fpsTimer += delta;
  if (fpsTimer >= 0.5) {
    const fps = Math.round((frameCount / fpsTimer));
    fpsDisplay.textContent = fps;
    frameCount = 0;
    fpsTimer = 0;
  }

  // Update controls and animations
  if (state.cameraMode === 'orbit' || state.cameraMode === 'top') {
    controls.update();
  } else if (state.cameraMode === 'fps') {
    updateFPS(delta);
  }

  updateAMR(delta);

  renderer.render(scene, camera);
}

// Start
setupUI();
init();
animate(performance.now());
