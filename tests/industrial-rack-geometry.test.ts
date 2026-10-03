import assert from 'node:assert/strict'
import test from 'node:test'
import { Quaternion, Vector3 } from 'three'
import { createIndustrialRackGeometry, RACK_STRUCTURE } from '../src/components/scene/industrial-rack-geometry.ts'
import type { RackMember } from '../src/components/scene/industrial-rack-geometry.ts'
import { createDemoInventory, validateDemoInventory } from '../src/data/denso-demo-inventory.ts'
import { DENSO_LAYOUT_V1 } from '../src/data/denso-layout-v1.ts'
import { createBinAddresses } from '../src/data/denso-layout.ts'

const rack = DENSO_LAYOUT_V1.rackBlocks[0]
const epsilon = 1e-6

function worldBounds(member: RackMember) {
  const quaternion = new Quaternion(...member.quaternion)
  const corners = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z =>
    new Vector3(x * member.size[0] / 2, y * member.size[1] / 2, z * member.size[2] / 2)
      .applyQuaternion(quaternion).add(new Vector3(...member.position)))))
  return {
    xMin: Math.min(...corners.map(point => point.x)), xMax: Math.max(...corners.map(point => point.x)),
    yMin: Math.min(...corners.map(point => point.y)), yMax: Math.max(...corners.map(point => point.y)),
    zMin: Math.min(...corners.map(point => point.z)), zMax: Math.max(...corners.map(point => point.z)),
  }
}

function close(actual: number, expected: number, message: string) {
  assert.ok(Math.abs(actual - expected) < epsilon, `${message}: ${actual} vs ${expected}`)
}

test('industrial double rack defines 120 unique single-pallet positions, and seven levels define 140', () => {
  for (const levels of [6, 7] as const) {
    const geometry = createIndustrialRackGeometry({ ...rack, levels, palletPositionCount: levels * 20 })
    assert.equal(geometry.slots.length, levels * 20)
    assert.equal(new Set(geometry.slots.map(slot => slot.id)).size, levels * 20)
    assert.deepEqual(geometry.slots.map(slot => slot.id).sort(), createBinAddresses({ ...rack, levels }).map(slot => slot.id).sort())
    assert.ok(geometry.slots.every(slot => slot.palletCapacity === 1 && slot.occupiedPallets === 0 && slot.skuId === null))
    for (const face of ['FR', 'BK']) {
      for (let level = 1; level <= levels; level++) {
        assert.equal(geometry.slots.filter(slot => slot.face === face && slot.level === level).length, 10)
      }
    }
  }
})

test('empty rack contains every industrial member class and one load-bearing deck per bin', () => {
  const geometry = createIndustrialRackGeometry(rack)
  assert.deepEqual(Object.keys(geometry.members).sort(), ['beams', 'braces', 'decks', 'footplates', 'frameTies', 'spacers', 'supports', 'uprights'])
  for (const [kind, members] of Object.entries(geometry.members)) {
    assert.ok(members.length > 0, `Missing industrial rack member: ${kind}`)
    for (const member of members) {
      assert.ok([...member.position, ...member.size, ...member.quaternion].every(Number.isFinite))
      assert.ok(member.size.every(size => size > 0), `${kind} must have non-zero physical dimensions`)
      close(new Quaternion(...member.quaternion).length(), 1, `${kind} orientation must be normalized`)
    }
  }
  assert.equal(geometry.members.decks.length, 120)
  const deckBounds = geometry.members.decks.map(worldBounds)
  for (const slot of geometry.slots) {
    const decks = deckBounds.filter(deck =>
      Math.abs((deck.xMin + deck.xMax) / 2 - slot.position[0]) < epsilon &&
      Math.abs((deck.zMin + deck.zMax) / 2 - slot.position[2]) < epsilon &&
      Math.abs(deck.yMax - slot.position[1]) < epsilon)
    assert.equal(decks.length, 1, `Exactly one deck must support ${slot.id}`)
    close(decks[0].yMax - decks[0].yMin, RACK_STRUCTURE.deckThicknessM, 'Deck thickness')
  }
})

test('rack geometry derives physical capacity and rejects dimensions that cannot fit pallets', () => {
  assert.equal(createIndustrialRackGeometry({ ...rack, palletPositionCount: 200 }).slots.length, 120,
    'The historical 200-pallet reference must not create extra positions')
  for (const mutation of [{ rackDepthM: 1.5 }, { binWidthM: 1 }, { levelPitchM: 0.4 }, { binWidthM: NaN }]) {
    assert.throws(() => createIndustrialRackGeometry({ ...rack, ...mutation }))
  }
})

test('all six levels have actual deck surfaces, pallet clearance and two-sided support', () => {
  const geometry = createIndustrialRackGeometry(rack)
  const heights = [...new Set(geometry.slots.map(slot => slot.position[1]))].sort((a, b) => a - b)
  assert.equal(heights.length, 6)
  assert.ok(heights[0] > 0, 'First stored pallet must be supported by a rack deck, not the floor')
  for (let index = 1; index < heights.length; index++) {
    close(heights[index] - heights[index - 1], rack.levelPitchM, 'Level pitch')
    assert.ok(heights[index] - heights[index - 1] - RACK_STRUCTURE.deckThicknessM > DENSO_LAYOUT_V1.pallet.lowHeightM)
  }
  for (const slot of geometry.slots) {
    assert.ok(slot.deckSize[0] >= DENSO_LAYOUT_V1.pallet.widthM, `${slot.id} fits pallet width`)
    assert.ok(slot.deckSize[1] >= DENSO_LAYOUT_V1.pallet.depthM, `${slot.id} fits pallet depth`)
    assert.ok(slot.position[1] + DENSO_LAYOUT_V1.pallet.lowHeightM < DENSO_LAYOUT_V1.warehouse.heightM)
  }
  const bearings = [...geometry.members.supports, ...geometry.members.beams].map(worldBounds)
  for (const deck of geometry.members.decks.map(worldBounds)) {
    const touching = bearings.filter(bearing => Math.abs(bearing.yMax - deck.yMin) < 0.001 &&
      bearing.xMin < deck.xMax - epsilon && bearing.xMax > deck.xMin + epsilon &&
      bearing.zMin < deck.zMax - epsilon && bearing.zMax > deck.zMin + epsilon)
    assert.ok(touching.length >= 2, 'Every deck must rest on at least two modeled supports/beams')
  }
})

test('every rotated member stays within storage and clear of operational barriers', () => {
  const zone = DENSO_LAYOUT_V1.zones.find(item => item.id === 'zone-main-storage')!
  for (const block of DENSO_LAYOUT_V1.rackBlocks) {
    const geometry = createIndustrialRackGeometry(block)
    for (const member of Object.values(geometry.members).flat()) {
      const bounds = worldBounds(member)
      assert.ok(bounds.xMin >= zone.bounds.xMin - epsilon && bounds.xMax <= zone.bounds.xMax + epsilon &&
        bounds.zMin >= zone.bounds.zMin - epsilon && bounds.zMax <= zone.bounds.zMax + epsilon, `${block.id} structure stays inside storage`)
      assert.ok(bounds.yMin >= -epsilon && bounds.yMax <= DENSO_LAYOUT_V1.warehouse.heightM)
      for (const barrier of DENSO_LAYOUT_V1.barriers) {
        const other = barrier.bounds
        assert.ok(!(bounds.xMin < other.xMax - epsilon && bounds.xMax > other.xMin + epsilon &&
          bounds.zMin < other.zMax - epsilon && bounds.zMax > other.zMin + epsilon), `${block.id} must not intersect ${barrier.id}`)
      }
    }
  }
})

test('Z-oriented rack rotates the full structure and every bin around its center', () => {
  const xGeometry = createIndustrialRackGeometry(rack)
  const zGeometry = createIndustrialRackGeometry({ ...rack, orientation: 'Z' })
  const aggregate = (geometry: typeof xGeometry) => {
    const bounds = Object.values(geometry.members).flat().map(worldBounds)
    return { x: Math.max(...bounds.map(b => b.xMax)) - Math.min(...bounds.map(b => b.xMin)),
      z: Math.max(...bounds.map(b => b.zMax)) - Math.min(...bounds.map(b => b.zMin)) }
  }
  const x = aggregate(xGeometry), z = aggregate(zGeometry)
  close(x.x, z.z, 'Rotated run length')
  close(x.z, z.x, 'Rotated rack depth')
  for (const slot of xGeometry.slots) {
    const rotated = zGeometry.slots.find(candidate => candidate.id === slot.id)!
    close(Math.hypot(slot.position[0] - rack.center[0], slot.position[2] - rack.center[1]),
      Math.hypot(rotated.position[0] - rack.center[0], rotated.position[2] - rack.center[1]), 'Rotated bin distance')
    close(Math.abs(rotated.rotationY - slot.rotationY), Math.PI / 2, 'Pallet orientation follows rack')
    close(rotated.position[1], slot.position[1], 'Rotation preserves deck level')
  }
})

test('demo inventory is deterministic and assigns no more than one pallet and one SKU per bin', () => {
  const slots = DENSO_LAYOUT_V1.rackBlocks.flatMap(block => createIndustrialRackGeometry(block).slots)
  const emptySlots = structuredClone(slots)
  const inventory = createDemoInventory(slots, 42)
  assert.deepEqual(inventory, createDemoInventory(slots, 42))
  assert.notDeepEqual(inventory, createDemoInventory(slots, 43))
  assert.ok(inventory.length > 0 && inventory.length < slots.length, 'Demo has both stocked and empty bins')
  assert.equal(new Set(inventory.map(record => record.binId)).size, inventory.length)
  assert.equal(new Set(inventory.map(record => record.id)).size, inventory.length)
  assert.deepEqual(validateDemoInventory(slots, inventory), [])
  assert.deepEqual(slots, emptySlots, 'Cargo generation/validation does not change rack structure or empty slot data')
  assert.deepEqual(createDemoInventory([], 42), [])
  assert.ok(new Set(inventory.map(record => slots.find(slot => slot.id === record.binId)!.level)).size === 6,
    'Cargo belongs to bins across all six rack levels')
})

test('inventory validation rejects duplicate pallets, orphan bins and missing SKU', () => {
  const slots = createIndustrialRackGeometry(rack).slots
  const inventory = createDemoInventory(slots, 42)
  assert.ok(inventory.length > 0)
  const first = inventory[0]
  assert.ok(validateDemoInventory(slots, [first, { ...first, id: 'another-pallet' }]).length > 0)
  assert.ok(validateDemoInventory(slots, [first, { ...first, binId: slots.find(slot => slot.id !== first.binId)!.id }]).length > 0)
  assert.ok(validateDemoInventory(slots, [{ ...first, binId: 'nonexistent-bin' }]).length > 0)
  assert.ok(validateDemoInventory(slots, [{ ...first, skuId: '' }]).length > 0)
  assert.ok(validateDemoInventory(slots, [{ ...first, skuId: '   ' }]).length > 0)
})
