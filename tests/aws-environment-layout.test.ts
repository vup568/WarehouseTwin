import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync } from 'node:fs'
import { AWS_ENVIRONMENT_ASSETS, AWS_GROUND_MODULE, createEnvironmentTiles, createEnvironmentCamera } from '../src/data/aws-environment-layout.ts'
import { createDensoFloorMarkings } from '../src/data/denso-floor-markings.ts'
import { DENSO_LAYOUT_V1 } from '../src/data/denso-layout-v1.ts'
import { validateDensoLayout } from '../src/data/denso-layout.ts'

const layout = DENSO_LAYOUT_V1

test('AWS module tiles cover the complete 9,900 m² footprint with clipped edges, without scaling one warehouse', () => {
  const tiles = createEnvironmentTiles(layout.warehouse)
  assert.equal(tiles.length, 40)
  const area = tiles.reduce((sum, tile) => sum + (tile.bounds.xMax - tile.bounds.xMin) * (tile.bounds.zMax - tile.bounds.zMin), 0)
  assert.ok(Math.abs(area - 9900) < 1e-6)
  for (const tile of tiles) {
    assert.ok(tile.bounds.xMin >= 0 && tile.bounds.zMin >= 0 && tile.bounds.xMax <= 110 && tile.bounds.zMax <= 90)
    assert.ok(tile.bounds.xMax - tile.bounds.xMin <= AWS_GROUND_MODULE.widthM + 1e-8)
    for (const other of tiles.filter(other => other !== tile)) {
      assert.ok(!(tile.bounds.xMin < other.bounds.xMax - 1e-8 && tile.bounds.xMax > other.bounds.xMin + 1e-8 && tile.bounds.zMin < other.bounds.zMax - 1e-8 && tile.bounds.zMax > other.bounds.zMin + 1e-8))
    }
  }
})

test('asset manifest reuses actual AWS floor/roof sources, without hanging lamps or walls', () => {
  assert.deepEqual(Object.keys(AWS_ENVIRONMENT_ASSETS).sort(), ['ground', 'roof'])
  for (const modelId of Object.values(AWS_ENVIRONMENT_ASSETS)) {
    assert.ok(existsSync(new URL(`../models/${modelId}/meshes/${modelId}_visual.DAE`, import.meta.url)))
    assert.ok(!/Wall|Shelf|PalletJack|Lamp/.test(modelId))
  }
})

test('active demo roof is raised to 25 m with clearance above all six rack levels', () => {
  assert.equal(layout.warehouse.heightM, 25)
  assert.ok(layout.rackBlocks.every(rack => rack.levels === 6 && rack.levels * rack.levelPitchM < layout.warehouse.heightM))
  assert.deepEqual(validateDensoLayout(layout).errors, [])
  const obsoleteHeight = structuredClone(layout)
  obsoleteHeight.warehouse.heightM = 10
  assert.ok(validateDensoLayout(obsoleteHeight).errors.some(error => error.includes('height must be 25 m')))
})

test('camera clipping covers the scene at maximum zoom-out and scales with footprint', () => {
  const camera = createEnvironmentCamera(layout.warehouse)
  assert.ok(camera.far > camera.maxDistance + Math.hypot(110, 90))
  const large = createEnvironmentCamera({ ...layout.warehouse, widthM: 220, depthM: 180 })
  assert.equal(large.far, camera.far * 2)
  assert.equal(large.maxDistance, camera.maxDistance * 2)
})

test('markings distinguish all five categories and preserve Denso processing endpoints', () => {
  const markings = createDensoFloorMarkings(layout)
  assert.deepEqual([...new Set(markings.map(item => item.kind))].sort(), ['AGV', 'AMR', 'FORKLIFT', 'INBOUND', 'OUTBOUND'])
  assert.equal(markings.filter(item => item.kind === 'INBOUND').length, 3)
  for (const marking of markings) {
    assert.ok(marking.points.length >= 2)
    for (const [x, z] of marking.points) assert.ok(x >= 0 && x <= 110 && z >= 0 && z <= 90)
    if (marking.kind === 'INBOUND') assert.ok(marking.points.every(([x]) => x >= 83), 'Do not paint a route into rack STORE endpoints')
  }
  const outbound = markings.find(item => item.kind === 'OUTBOUND')!
  assert.deepEqual(outbound.points.at(-1), [1, 40])
})

test('tiling handles a smaller/non-multiple warehouse and rejects invalid dimensions', () => {
  const small = createEnvironmentTiles({ widthM: 7, depthM: 8, heightM: 5, approximateAreaM2: 56 })
  assert.equal(small.length, 1)
  assert.deepEqual(small[0].bounds, { xMin: 0, zMin: 0, xMax: 7, zMax: 8 })
  for (const value of [0, -1, Infinity, NaN]) assert.throws(() => createEnvironmentTiles({ ...layout.warehouse, widthM: value }))
})
