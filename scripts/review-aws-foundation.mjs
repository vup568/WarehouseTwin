// Local review tool: connect to an isolated headless Chrome (default port 9334).
// No runtime debug hooks or screenshot libraries are added to the app.
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const origin = process.argv[2] || 'http://127.0.0.1:5173'
const debugPort = process.argv[3] || '9334'
const output = resolve('plans/261002-denso-warehouse-reconstruction/reports/step-a-visuals')
await mkdir(output, { recursive: true })
const tabs = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
const tab = tabs.find(tab => tab.type === 'page')
if (!tab) throw new Error('No isolated Chrome page available')
const socket = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Chrome WebSocket connection timed out')), 10000)
  socket.onopen = () => { clearTimeout(timeout); resolve() }
  socket.onerror = error => { clearTimeout(timeout); reject(error) }
})
let sequence = 0
const waiting = new Map()
const errors = []
socket.onmessage = event => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const pending = waiting.get(message.id)
    waiting.delete(message.id)
    if (message.error) pending?.reject(new Error(message.error.message))
    else pending?.resolve(message.result)
  } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails)
  else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push({ console: message.params.args.map(arg => arg.value ?? arg.description).join(' ') })
  else if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) errors.push({ status: message.params.response.status, url: message.params.response.url })
}
function send(method, params = {}) {
  const id = ++sequence
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { waiting.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 20000)
    waiting.set(id, { resolve: value => { clearTimeout(timeout); resolve(value) }, reject: error => { clearTimeout(timeout); reject(error) } })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
await send('Runtime.enable')
await send('Network.enable')
await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
console.log('Navigating to review app')
await send('Page.navigate', { url: origin })
for (let attempt = 0; attempt < 40; attempt++) {
  await pause(500)
  const ready = await evaluate(`!!document.querySelector('canvas') && !document.querySelector('.asset-status')`)
  if (ready) break
  if (attempt === 39) throw new Error('Scene did not load within 20 seconds')
}

// Read the same Vite module URL that the application imports; the R3F roots
// export supplies the live renderer/store without modifying product source.
console.log('Assets ready; connecting to renderer')
await evaluate(`(async () => {
  const source = await (await fetch('/src/components/scene/Scene3D.tsx')).text();
  const url = source.match(/"([^"\\n]*@react-three_fiber[^"\\n]*)"/)[1];
  const fiber = await import(url);
  window.reviewRoot = fiber._roots.get(document.querySelector('canvas')).store;
  window.reviewStore = (await import('/src/state/store.ts')).useStore;
})()`)

const summary = await evaluate(`(() => {
  const state = reviewRoot.getState();
  const objects = []; state.scene.traverse(object => { if (/^(Aws|AWS:|lamp:|ground:|roof:|DensoWalls)/.test(object.name)) objects.push({ name: object.name, visible: object.visible }); });
  return { objects, fog: state.scene.fog, cameraFar: state.camera.far, renderer: { calls: state.gl.info.render.calls, triangles: state.gl.info.render.triangles }, layers: reviewStore.getState().layers, cargoSeed: reviewStore.getState().cargoSeed };
})()`)
async function clickControl(text) {
  await evaluate(`(() => {
    const button = [...document.querySelectorAll('button')].find(button => button.textContent.includes(${JSON.stringify(text)}));
    if (!button) throw new Error('Review button missing: ' + ${JSON.stringify(text)});
    button.click();
  })()`)
  await pause(150)
}
const controls = []
for (const [label, groupName] of [['Roof:', 'AwsRoofTiles'], ['Lights:', 'AwsLampGrid']]) {
  await clickControl(label)
  const first = await evaluate(`reviewRoot.getState().scene.getObjectByName('${groupName}').visible`)
  await clickControl(label)
  const second = await evaluate(`reviewRoot.getState().scene.getObjectByName('${groupName}').visible`)
  if (first === second) throw new Error(`${label} did not toggle scene visibility`)
  controls.push({ label, first, second })
}
await clickControl('Racks')
await clickControl('Randomize')
await clickControl('Racks')
const rackRestored = await evaluate(`(() => {
  const root = reviewRoot.getState().scene.getObjectByName('DensoDoubleRackInstances');
  return root.visible && root.children[0].instanceMatrix.array[0] > 0 && root.children[0].instanceMatrix.array[12] > 0;
})()`)
if (!rackRestored) throw new Error('Rack visibility/randomize lifecycle regression')
// Restore the original cargo distribution before recording review screenshots.
await evaluate(`reviewStore.setState({ cargoSeed: ${summary.cargoSeed} })`)
summary.controls = controls
summary.rackRestored = rackRestored
summary.geometry = await evaluate(`(() => {
  const state = reviewRoot.getState(); state.scene.updateMatrixWorld(true);
  const result = [];
  for (const name of ['AwsGroundTiles', 'DensoFloorMarkings']) state.scene.getObjectByName(name).traverse(object => {
    if (!object.isMesh || result.filter(item => item.group === name).length >= 2) return;
    const positions = object.geometry.attributes.position;
    const vector = state.camera.position.clone(); let min = Infinity, max = -Infinity;
    for (let index = 0; index < positions.count; index++) {
      vector.fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld);
      min = Math.min(min, vector.y); max = Math.max(max, vector.y);
    }
    result.push({ group: name, y: [min,max], drawGroups: object.geometry.groups, material: Array.isArray(object.material) ? object.material.map(material => ({ name: material.name, visible: material.visible })) : object.material.type });
  }); return result;
})()`)
async function screenshot(name) {
  await pause(800)
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  await writeFile(resolve(output, `${name}.png`), Buffer.from(data, 'base64'))
}
async function view(position, target) {
  await evaluate(`(() => { const state = reviewRoot.getState(); state.camera.position.set(...${JSON.stringify(position)}); state.controls.target.set(...${JSON.stringify(target)}); state.controls.update(); })()`)
}
await screenshot('01-overview-night')
await evaluate(`reviewStore.getState().setLightingMode('day')`)
await screenshot('02-overview-day')
await evaluate(`reviewStore.getState().setLayer('roof', true)`)
await screenshot('03-roof-on')
await view([25, 3, 9], [30, 4.7, 23])
await screenshot('04-interior-roof-lamps')
await evaluate(`reviewStore.getState().setLayer('roof', false)`)
await clickControl('Roof:')
await evaluate(`reviewStore.getState().setCameraPreset('camera-inbound')`)
await pause(200)
summary.roofPreservedByCamera = await evaluate(`reviewStore.getState().layers.roof && reviewRoot.getState().scene.getObjectByName('AwsRoofTiles').visible`)
if (!summary.roofPreservedByCamera) throw new Error('Camera preset changed manual roof visibility')
await clickControl('Roof:')
await view([157, 160, 139], [55, 0, 45])
await screenshot('05-far-day')
await evaluate(`reviewStore.getState().setLightingMode('industrial')`)
await screenshot('06-far-night')
await evaluate(`reviewStore.getState().setLayer('lights', false)`)
await screenshot('07-lights-off')
await evaluate(`reviewStore.getState().setLayer('lights', true)`)
const presetResults = []
for (const id of ['camera-overview', 'camera-inbound', 'camera-storage', 'camera-outbound']) {
  await evaluate(`reviewStore.getState().setCameraPreset('${id}')`)
  await pause(250)
  presetResults.push(await evaluate(`({ id: '${id}', position: reviewRoot.getState().camera.position.toArray(), target: reviewRoot.getState().controls.target.toArray(), roof: reviewStore.getState().layers.roof })`))
}
await screenshot('08-outbound')
await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false })
await evaluate(`reviewStore.getState().setCameraPreset('camera-overview')`)
await screenshot('09-compact-overview')
const result = { ...summary, presetResults, errors }
await writeFile(resolve(output, 'review-results.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify({ output, groundTiles: summary.objects.filter(item => item.name.startsWith('ground:')).length, roofTiles: summary.objects.filter(item => item.name.startsWith('roof:')).length, lamps: summary.objects.filter(item => item.name.startsWith('lamp:')).length, fog: summary.fog, errors, renderer: summary.renderer, presetResults, geometry: summary.geometry }, null, 2))
socket.close()
if (errors.length) process.exitCode = 1
