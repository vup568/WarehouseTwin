import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DENSO_LAYOUT_V0 as DENSO_LAYOUT,
  calculateRackCapacity,
  createBinAddresses,
  validateBinState,
  validateDensoLayout,
} from '../src/data/denso-layout.ts'
import { DENSO_LAYOUT_V1 } from '../src/data/denso-layout-v1.ts'

test('warehouse v0 approximates 10,000 m² and is 5 m high', () => {
  const actualArea = DENSO_LAYOUT.warehouse.widthM * DENSO_LAYOUT.warehouse.depthM
  assert.equal(actualArea, 9_900)
  assert.equal(DENSO_LAYOUT.warehouse.heightM, 5)
  assert.ok(Math.abs(actualArea - DENSO_LAYOUT.warehouse.approximateAreaM2) <= 500)
})

test('demo double rack has 120 single-pallet bin positions', () => {
  const rack = DENSO_LAYOUT.rackBlocks[0]
  assert.equal(rack.levels, 6)
  assert.equal(rack.binsPerLevel, 10)
  assert.equal(rack.faces, 2)
  assert.equal(rack.palletCapacityPerBin, 1)
  assert.equal(calculateRackCapacity(rack), 120)

  const addresses = createBinAddresses(rack)
  assert.equal(addresses.length, 120)
  assert.equal(new Set(addresses.map((address) => address.id)).size, 120)
  assert.ok(addresses.every((address) => (
    address.palletCapacity === 1
    && address.occupiedPallets === 0
    && address.skuId === null
    && address.movementClass === rack.movementClass
  )))
})

test('seven-level rack variant calculates 140 positions', () => {
  assert.equal(calculateRackCapacity({ faces: 2, levels: 7, binsPerLevel: 10 }), 140)
})

test('inbound flow follows receive, staging, QC, staging, handoff and storage', () => {
  const inboundFlow = DENSO_LAYOUT.flows.find((flow) => flow.id === 'INBOUND_FLOW')
  assert.ok(inboundFlow)

  const nodes = inboundFlow.nodeIds.map((nodeId) => {
    const node = DENSO_LAYOUT.flowNodes.find((candidate) => candidate.id === nodeId)
    assert.ok(node, `Missing flow node ${nodeId}`)
    return node
  })

  assert.deepEqual(nodes.map((node) => node.action), [
    'RECEIVE',
    'STAGE',
    'QC',
    'STAGE',
    'HANDOFF',
    'STORE',
  ])
})

test('v1 has three independent inbound cells and a westbound outbound handoff', () => {
  const inboundCells = DENSO_LAYOUT_V1.operationalCells?.filter((cell) => cell.kind === 'INBOUND') ?? []
  assert.equal(inboundCells.length, 3)
  assert.deepEqual(inboundCells.map((cell) => cell.gateId).sort(), ['gate-container-01', 'gate-truck-01', 'gate-truck-02'])
  assert.ok(inboundCells.every((cell) => cell.zoneIds.length === 4))
  assert.ok(inboundCells.every((cell) => DENSO_LAYOUT_V1.conveyors.some((conveyor) => conveyor.id === cell.conveyorId)))

  const outbound = DENSO_LAYOUT_V1.operationalCells?.find((cell) => cell.kind === 'OUTBOUND')
  assert.ok(outbound)
  assert.ok(outbound.zoneIds.includes('zone-outbound-conveyor'))
  assert.ok(outbound.zoneIds.includes('zone-outbound-dispatch'))
  assert.ok(DENSO_LAYOUT_V1.gates.some((gate) => gate.id === 'gate-outbound-west' && gate.position[0] === 0))
})

test('v1 enforces a one-forklift-per-zone contract and dedicated AGV/AMR lanes', () => {
  assert.ok(DENSO_LAYOUT_V1.forkliftWorkCells?.every((cell) => cell.maximumForklifts === 1))
  assert.deepEqual(DENSO_LAYOUT_V1.forkliftWorkCells?.map((cell) => cell.zoneId).sort(), [
    'zone-container-01-staging-2',
    'zone-main-storage',
    'zone-outbound-pick',
    'zone-truck-01-staging-2',
    'zone-truck-02-staging-2',
  ])
  assert.deepEqual(DENSO_LAYOUT_V1.travelLanes.map((lane) => lane.vehicleModes), [['AGV'], ['AMR']])
  assert.ok(DENSO_LAYOUT_V1.barriers.some((barrier) => barrier.kind === 'FORKLIFT_BARRIER'))
  assert.ok(DENSO_LAYOUT_V1.barriers.some((barrier) => barrier.kind === 'AGV_BARRIER'))
  assert.ok(DENSO_LAYOUT_V1.barriers.some((barrier) => barrier.kind === 'AMR_BARRIER'))
})

test('v1 passes structural validation with independent east inbound and west outbound flows', () => {
  const result = validateDensoLayout(DENSO_LAYOUT_V1)
  assert.deepEqual(result.errors, [])
  assert.equal(result.valid, true)
})

test('v1 validator rejects unsafe forklift work-cell and cross-vehicle mutations', () => {
  const duplicateForkliftZone = structuredClone(DENSO_LAYOUT_V1)
  duplicateForkliftZone.forkliftWorkCells?.push({
    ...duplicateForkliftZone.forkliftWorkCells[0],
    id: 'forklift-storage-duplicate',
  })
  assert.ok(validateDensoLayout(duplicateForkliftZone).errors.some((error) => error.includes('must not share a zone')))

  const detachedOutboundBarriers = structuredClone(DENSO_LAYOUT_V1)
  for (const barrier of detachedOutboundBarriers.barriers) {
    if (barrier.id.startsWith('barrier-forklift-outbound-')) {
      barrier.bounds = { xMin: 20, xMax: 25, zMin: 25, zMax: 25.3 }
    }
  }
  assert.ok(validateDensoLayout(detachedOutboundBarriers).errors.some((error) => error.includes('requires a barrier that touches')))

  const agvCrossesForkliftZone = structuredClone(DENSO_LAYOUT_V1)
  agvCrossesForkliftZone.travelLanes[0].points = [[22.25, 73], [22.25, 35]]
  assert.ok(validateDensoLayout(agvCrossesForkliftZone).errors.some((error) => error.includes('intersects forklift work zone')))
})

test('customs fence separates domestic north from international south', () => {
  const barrier = DENSO_LAYOUT.barriers.find((item) => item.kind === 'CUSTOMS_FENCE')
  const domestic = DENSO_LAYOUT.zones.find((zone) => zone.kind === 'DOMESTIC')
  const international = DENSO_LAYOUT.zones.find((zone) => zone.kind === 'INTERNATIONAL')

  assert.ok(barrier)
  assert.ok(domestic)
  assert.ok(international)
  assert.ok(domestic.bounds.zMin >= barrier.bounds.zMax - 0.1)
  assert.ok(international.bounds.zMax <= barrier.bounds.zMin + 0.1)
  assert.ok(DENSO_LAYOUT.cameras.some((camera) => camera.monitorsBarrierId === barrier.id))
})

test('all rack bin addresses are globally unique', () => {
  const allAddresses = DENSO_LAYOUT.rackBlocks.flatMap(createBinAddresses)
  assert.equal(allAddresses.length, 1_920)
  assert.equal(new Set(allAddresses.map((address) => address.id)).size, 1_920)
})

test('layout passes structural validation', () => {
  const result = validateDensoLayout()
  assert.deepEqual(result.errors, [])
  assert.equal(result.valid, true)
})

test('validator rejects missing references and invalid dimensions', () => {
  const missingRackZone = structuredClone(DENSO_LAYOUT)
  missingRackZone.rackBlocks[0].zoneId = 'missing-zone'
  assert.ok(validateDensoLayout(missingRackZone).errors.some((error) => error.includes('references missing zone')))

  const missingConveyorZone = structuredClone(DENSO_LAYOUT)
  missingConveyorZone.conveyors[0].zoneId = 'missing-zone'
  assert.ok(validateDensoLayout(missingConveyorZone).errors.some((error) => error.includes('references missing zone')))

  const invalidRackWidth = structuredClone(DENSO_LAYOUT)
  invalidRackWidth.rackBlocks[0].binWidthM = -2.5
  assert.ok(validateDensoLayout(invalidRackWidth).errors.some((error) => error.includes('dimensions must be positive')))

  const missingParentZone = structuredClone(DENSO_LAYOUT)
  missingParentZone.zones[2].parentZoneId = 'missing-zone'
  assert.ok(validateDensoLayout(missingParentZone).errors.some((error) => error.includes('missing parent zone')))
})

test('validator rejects broken inbound flow and misplaced nodes', () => {
  const missingFlow = structuredClone(DENSO_LAYOUT)
  missingFlow.flows = []
  assert.ok(validateDensoLayout(missingFlow).errors.includes('INBOUND_FLOW is required'))

  const reversedFlow = structuredClone(DENSO_LAYOUT)
  reversedFlow.flows[0].nodeIds = [...reversedFlow.flows[0].nodeIds].reverse()
  assert.ok(validateDensoLayout(reversedFlow).errors.some((error) => error.includes('action sequence')))

  const nodeOutsideZone = structuredClone(DENSO_LAYOUT)
  nodeOutsideZone.flowNodes[0].position = [50, 50]
  assert.ok(validateDensoLayout(nodeOutsideZone).errors.some((error) => error.includes('outside referenced zone')))
})

test('validator rejects lanes outside the shell or crossing rack obstacles', () => {
  const outsideLane = structuredClone(DENSO_LAYOUT)
  outsideLane.travelLanes[0].points = [[999, 999], [1000, 1000]]
  assert.ok(validateDensoLayout(outsideLane).errors.some((error) => error.includes('leaves warehouse footprint')))

  const crossingLane = structuredClone(DENSO_LAYOUT)
  crossingLane.travelLanes[0].points = [[40, 0], [40, 80]]
  assert.ok(validateDensoLayout(crossingLane).errors.some((error) => error.includes('intersects rack')))

  const restrictedLane = structuredClone(DENSO_LAYOUT)
  restrictedLane.travelLanes[0].widthM = 0.1
  restrictedLane.travelLanes[0].points = [[30, 76], [70, 76]]
  assert.ok(validateDensoLayout(restrictedLane).errors.some((error) => error.includes('intersects restricted area')))
})

test('validator rejects invalid customs, dock, pallet and camera semantics', () => {
  const wrongCustomsZones = structuredClone(DENSO_LAYOUT)
  wrongCustomsZones.barriers[0].northZoneId = 'zone-main-storage'
  assert.ok(validateDensoLayout(wrongCustomsZones).errors.some((error) => error.includes('north zone must be DOMESTIC')))

  const wrongDockKind = structuredClone(DENSO_LAYOUT)
  wrongDockKind.docks[0].kind = 'OUTBOUND'
  assert.ok(validateDensoLayout(wrongDockKind).errors.some((error) => error.includes('kind does not match gate')))

  const invalidPallet = structuredClone(DENSO_LAYOUT)
  invalidPallet.pallet.widthM = -1
  assert.ok(validateDensoLayout(invalidPallet).errors.some((error) => error.includes('Pallet dimensions')))

  const wrongPalletFootprint = structuredClone(DENSO_LAYOUT)
  wrongPalletFootprint.pallet.widthM = 9
  assert.ok(validateDensoLayout(wrongPalletFootprint).errors.some((error) => error.includes('Pallet footprint')))

  const wrongLowPalletHeight = structuredClone(DENSO_LAYOUT)
  wrongLowPalletHeight.pallet.lowHeightM = 2
  assert.ok(validateDensoLayout(wrongLowPalletHeight).errors.some((error) => error.includes('Low pallet height')))

  const wrongPalletGap = structuredClone(DENSO_LAYOUT)
  wrongPalletGap.pallet.targetGapM = 5
  assert.ok(validateDensoLayout(wrongPalletGap).errors.some((error) => error.includes('target gap')))

  const wrongBinWidth = structuredClone(DENSO_LAYOUT)
  wrongBinWidth.rackBlocks[0].binWidthM = 2
  assert.ok(validateDensoLayout(wrongBinWidth).errors.some((error) => error.includes('bin width')))

  const excessiveLevelPitch = structuredClone(DENSO_LAYOUT)
  excessiveLevelPitch.rackBlocks[0].levelPitchM = 1.2
  assert.ok(validateDensoLayout(excessiveLevelPitch).errors.some((error) => error.includes('level pitch')))
  assert.ok(validateDensoLayout(excessiveLevelPitch).errors.some((error) => error.includes('total rack height')))

  const insufficientLevelPitch = structuredClone(DENSO_LAYOUT)
  insufficientLevelPitch.rackBlocks[0].levelPitchM = 0.1
  assert.ok(validateDensoLayout(insufficientLevelPitch).errors.some((error) => error.includes('cannot fit the low pallet')))

  const insufficientRackDepth = structuredClone(DENSO_LAYOUT)
  insufficientRackDepth.rackBlocks[0].rackDepthM = 1.1
  assert.ok(validateDensoLayout(insufficientRackDepth).errors.some((error) => error.includes('cannot fit pallets on both faces')))

  const lowerGapBoundary = structuredClone(DENSO_LAYOUT)
  lowerGapBoundary.pallet.targetGapM = 0.08
  assert.ok(!validateDensoLayout(lowerGapBoundary).errors.some((error) => error.includes('target gap must remain')))

  const upperGapBoundary = structuredClone(DENSO_LAYOUT)
  upperGapBoundary.pallet.targetGapM = 0.12
  assert.ok(!validateDensoLayout(upperGapBoundary).errors.some((error) => error.includes('target gap must remain')))

  const invalidCamera = structuredClone(DENSO_LAYOUT)
  invalidCamera.cameraPresets[0].position = [55, Number.NaN, 45]
  assert.ok(validateDensoLayout(invalidCamera).errors.some((error) => error.includes('camera vectors must be finite')))

  const invalidCameraHeight = structuredClone(DENSO_LAYOUT)
  invalidCameraHeight.cameraPresets[0].position = [55, -1, 45]
  assert.ok(validateDensoLayout(invalidCameraHeight).errors.some((error) => error.includes('camera heights')))

  const invalidArea = structuredClone(DENSO_LAYOUT)
  invalidArea.warehouse.approximateAreaM2 = Number.NaN
  assert.ok(validateDensoLayout(invalidArea).errors.some((error) => error.includes('approximate area')))

  const invalidGateHeading = structuredClone(DENSO_LAYOUT)
  invalidGateHeading.gates[0].headingRad = Number.NaN
  assert.ok(validateDensoLayout(invalidGateHeading).errors.some((error) => error.includes('heading must be finite')))
})

test('bin state validator enforces one pallet and one SKU', () => {
  const base = createBinAddresses(DENSO_LAYOUT.rackBlocks[0])[0]
  assert.deepEqual(validateBinState(base), [])
  assert.deepEqual(validateBinState({ ...base, occupiedPallets: 1, skuId: 'SKU-001' }), [])
  assert.ok(validateBinState({ ...base, occupiedPallets: 1, skuId: null }).some((error) => error.includes('must have one SKU')))
  assert.ok(validateBinState({ ...base, occupiedPallets: 0, skuId: 'SKU-001' }).some((error) => error.includes('cannot hold an SKU')))
})
