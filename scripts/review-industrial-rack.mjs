// Local dev-only CDP review using an isolated Chrome profile; no product debug hooks.
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const output = resolve('plans/261002-denso-warehouse-reconstruction/reports/roof-25m-visuals')
await mkdir(output, { recursive: true })
const tabs = await (await fetch('http://127.0.0.1:9334/json/list')).json()
const tab = tabs.find(tab => tab.type === 'page')
if (!tab) throw new Error('Isolated review Chrome is not available')
const socket = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('CDP connection timed out')), 10000)
  socket.onopen = () => { clearTimeout(timer); resolve() }
  socket.onerror = error => { clearTimeout(timer); reject(error) }
})
let sequence = 0
const waiting = new Map(), errors = []
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
    const timer = setTimeout(() => { waiting.delete(id); reject(new Error(`Timeout: ${method}`)) }, 20000)
    waiting.set(id, { resolve: value => { clearTimeout(timer); resolve(value) }, reject: error => { clearTimeout(timer); reject(error) } })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result.value
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
await send('Runtime.enable'); await send('Network.enable'); await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: process.argv[2] || 'http://127.0.0.1:5173' })
for (let attempt = 0; attempt < 40; attempt++) {
  await pause(500)
  if (await evaluate(`!!document.querySelector('canvas') && !document.querySelector('.asset-status')`)) break
  if (attempt === 39) throw new Error('Scene assets did not load')
}
await evaluate(`(async () => {
  const source = await (await fetch('/src/components/scene/Scene3D.tsx')).text();
  const url = source.match(/"([^"\\n]*@react-three_fiber[^"\\n]*)"/)[1];
  const fiber = await import(url);
  window.reviewRoot = fiber._roots.get(document.querySelector('canvas')).store;
  window.reviewStore = (await import('/src/state/store.ts')).useStore;
})()`)
const sceneState = () => evaluate(`(() => {
  const state = reviewRoot.getState(), objects = [];
  state.scene.updateMatrixWorld(true);
  state.scene.traverse(object => { if (/^(ground:|roof:|lamp:|AWS:|AwsLamp|DensoWalls|RackStructure:|Cargo:)/.test(object.name)) objects.push({ name: object.name, count: object.count, visible: object.visible }); });
  let roofMinY = Infinity;
  state.scene.getObjectByName('AwsRoofTiles').traverse(object => {
    if (!object.isMesh) return;
    const positions = object.geometry.attributes.position, vertex = state.camera.position.clone();
    for (let index = 0; index < positions.count; index++) {
      vertex.fromBufferAttribute(positions,index).applyMatrix4(object.matrixWorld);
      roofMinY = Math.min(roofMinY, vertex.y);
    }
  });
  return { objects, roofMinY, fog: state.scene.fog, occupiedBins: state.scene.getObjectByName('DensoPalletInstances').userData.occupiedBins,
    lights: state.scene.children.flatMap(root => { const lights=[]; root.traverse(object=>{if(object.isLight)lights.push(object.type)});return lights }),
    renderer: { calls: state.gl.info.render.calls, triangles: state.gl.info.render.triangles }, cargoSeed: reviewStore.getState().cargoSeed };
})()`)
async function screenshot(name) {
  await pause(700)
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  await writeFile(resolve(output, name + '.png'), Buffer.from(data, 'base64'))
}
async function view(position, target) {
  await evaluate(`(() => { const state=reviewRoot.getState(); state.camera.position.set(...${JSON.stringify(position)}); state.controls.target.set(...${JSON.stringify(target)}); state.controls.update(); })()`)
}
async function click(label) {
  await evaluate(`(() => { const button=[...document.querySelectorAll('button')].find(button=>button.textContent.includes('${label}')); if(!button)throw new Error('Button missing: ${label}');button.click(); })()`)
  await pause(200)
}
function assert(condition, message) { if (!condition) throw new Error(message) }
const initial = await sceneState()
assert(Math.abs(initial.roofMinY - 25) < 0.002, 'AWS roof underside must be at 25 m')
assert(!initial.objects.some(object => /lamp|DensoWalls/i.test(object.name)), 'Unexpected hanging lamp or wall')
assert(!initial.lights.includes('PointLight'), 'Hanging lamp-associated point lights remain')
assert(initial.fog === null, 'Distance fog must remain absent')
assert(initial.objects.find(object => object.name === 'RackStructure:decks')?.count === 1920, 'Expected 120 decks ×16 racks')
assert(await evaluate(`![...document.querySelectorAll('button')].some(button => button.textContent.includes('Lights:'))`), 'Lights control remains')
await screenshot('01-overview-cargo-on')
await click('Cargo:')
const empty = await sceneState()
assert(JSON.stringify(initial.objects.filter(object => object.name.startsWith('RackStructure:'))) === JSON.stringify(empty.objects.filter(object => object.name.startsWith('RackStructure:'))), 'Cargo toggle changed structure')
await screenshot('02-overview-cargo-off')
await view([35, 5.5, 11], [39, 2.3, 19])
await screenshot('03-aisle-cargo-off')
await click('Cargo:')
await screenshot('04-aisle-cargo-on')
await click('Cargo:')
await view([23, 4.6, 15], [28, 2.2, 19])
await screenshot('05-end-frame-cargo-off')
await click('Cargo:')
await screenshot('06-end-frame-cargo-on')
await click('Racks')
assert(await evaluate(`!reviewRoot.getState().scene.getObjectByName('DensoDoubleRackInstances').visible && reviewRoot.getState().scene.getObjectByName('DensoPalletInstances').visible`), 'Cargo should be independent of rack visibility')
await click('Randomize')
await click('Racks')
assert(await evaluate(`(() => { const state=reviewRoot.getState(), mesh=state.scene.getObjectByName('Cargo:woodenPallets');return state.scene.getObjectByName('DensoDoubleRackInstances').visible && mesh.boundingSphere.radius > 0 && Number.isFinite(mesh.boundingSphere.radius);})()`), 'Layer/randomize bounds regression')
await evaluate(`reviewStore.setState({cargoSeed:${initial.cargoSeed}})`)
await click('Roof:')
await evaluate(`reviewStore.getState().setCameraPreset('camera-inbound')`)
await pause(200)
assert(await evaluate(`reviewRoot.getState().scene.getObjectByName('AwsRoofTiles').visible`), 'Camera preset changed manual roof visibility')
await view([25, 3, 9], [35, 6, 26])
await screenshot('07-interior-roof-25m')
await click('Roof:')
await view([157, 160, 139], [55, 0, 45])
await screenshot('08-far-night')
await evaluate(`reviewStore.getState().setLightingMode('day')`)
await screenshot('09-far-day')
const final = await sceneState()
const result = { ...initial, finalRenderer: final.renderer, errors,
  checks: { cargoDoesNotChangeStructure: true, independentCargo: true, randomizeWhileRackHidden: true, roofPreservedByCamera: true, noHangingLamps: true } }
await writeFile(resolve(output, 'review-results.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify({ output, roofMinY: initial.roofMinY, occupiedBins: initial.occupiedBins, renderer: initial.renderer, errors, checks: result.checks }, null, 2))
socket.close()
if (errors.length) process.exitCode = 1
