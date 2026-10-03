import type {
  BinAddress,
  DensoLayout,
  LayoutValidationResult,
  RackBlock,
  RackFace,
  Rect2D,
  Vec2,
} from './denso-layout.types'
import { DENSO_LAYOUT_V1 } from './denso-layout-v1.ts'

const WAREHOUSE_WIDTH_M = 110
const WAREHOUSE_DEPTH_M = 90
const CUSTOMS_FENCE_Z_M = 76.5
const CONFIRMED_PALLET_WIDTH_M = 1.13
const CONFIRMED_PALLET_DEPTH_M = 0.97
const CONFIRMED_LOW_PALLET_HEIGHT_M = 0.5
const TARGET_PALLET_GAP_M = 0.1
const TARGET_BIN_WIDTH_M = 2.5
const APPROXIMATE_DIMENSION_TOLERANCE_M = 0.02
const APPROXIMATE_BIN_WIDTH_TOLERANCE_M = 0.25

function createRackBlock(
  id: string,
  center: Vec2,
  movementClass: RackBlock['movementClass'],
): RackBlock {
  return {
    id,
    zoneId: 'zone-main-storage',
    center,
    orientation: 'X',
    faces: 2,
    levels: 6,
    binsPerLevel: 10,
    binWidthM: 2.5,
    levelPitchM: 0.78,
    rackDepthM: 2.2,
    palletCapacityPerBin: 1,
    palletPositionCount: 120,
    operationalReferenceCapacity: 200,
    movementClass,
  }
}

const RACK_ROW_Z = [19, 25.4, 31.8, 38.2, 44.6, 51, 57.4, 63.8] as const

const rackBlocks: RackBlock[] = RACK_ROW_Z.flatMap((z, rowIndex) => {
  const movementClass = rowIndex >= 2 && rowIndex <= 5 ? 'FAST_MOVING' : 'SLOW_MOVING'
  const row = String(rowIndex + 1).padStart(2, '0')
  return [
    createRackBlock(`ST-A${row}`, [40, z], movementClass),
    createRackBlock(`ST-B${row}`, [67, z], movementClass),
  ]
})

export const DENSO_LAYOUT_V0: DensoLayout = {
  schemaVersion: '0.1.0',
  id: 'denso-tlip-external-warehouse-v0',
  units: 'm',
  coordinateSystem: {
    origin: 'SOUTH_WEST',
    xAxis: 'EAST',
    zAxis: 'NORTH',
  },
  warehouse: {
    widthM: WAREHOUSE_WIDTH_M,
    depthM: WAREHOUSE_DEPTH_M,
    heightM: 5,
    approximateAreaM2: 10_000,
  },
  pallet: {
    widthM: 1.13,
    depthM: 0.97,
    lowHeightM: 0.5,
    targetGapM: 0.1,
  },
  zones: [
    {
      id: 'zone-loading-outbound',
      kind: 'LOADING_OUTBOUND',
      name: 'Loading / Outbound',
      bounds: { xMin: 0, xMax: 24, zMin: 8, zMax: 82 },
    },
    {
      id: 'zone-inbound-receive',
      kind: 'INBOUND_RECEIVE',
      name: 'Inbound Receive',
      bounds: { xMin: 84, xMax: 110, zMin: 8, zMax: 82 },
    },
    {
      id: 'zone-inbound-staging',
      kind: 'INBOUND_STAGING',
      name: 'Arrival Staging',
      parentZoneId: 'zone-inbound-receive',
      bounds: { xMin: 88, xMax: 106, zMin: 60, zMax: 74 },
    },
    {
      id: 'zone-inbound-conveyor-qc',
      kind: 'INBOUND_CONVEYOR_QC',
      name: 'Inbound Conveyor QC',
      parentZoneId: 'zone-inbound-receive',
      bounds: { xMin: 87, xMax: 103, zMin: 50, zMax: 58 },
    },
    {
      id: 'zone-transfer-staging',
      kind: 'TRANSFER_STAGING',
      name: 'Transfer Staging',
      parentZoneId: 'zone-inbound-receive',
      bounds: { xMin: 86, xMax: 104, zMin: 38, zMax: 48 },
    },
    {
      id: 'zone-main-storage',
      kind: 'MAIN_STORAGE',
      name: 'Main Storage',
      bounds: { xMin: 26, xMax: 82, zMin: 15, zMax: 67 },
    },
    {
      id: 'zone-domestic',
      kind: 'DOMESTIC',
      name: 'Domestic / VAT',
      bounds: { xMin: 22, xMax: 82, zMin: CUSTOMS_FENCE_Z_M + 0.1, zMax: 88 },
    },
    {
      id: 'zone-international',
      kind: 'INTERNATIONAL',
      name: 'International / Non-VAT',
      bounds: { xMin: 22, xMax: 82, zMin: 15, zMax: CUSTOMS_FENCE_Z_M - 0.1 },
    },
    {
      id: 'zone-office-support',
      kind: 'OFFICE_SUPPORT',
      name: 'Office & Support',
      bounds: { xMin: 24, xMax: 84, zMin: 2, zMax: 13 },
    },
  ],
  gates: [
    {
      id: 'gate-1-in',
      kind: 'IN',
      label: 'Gate 1 / IN',
      position: [100, 0],
      headingRad: Math.PI / 2,
    },
    {
      id: 'gate-2-out',
      kind: 'OUT',
      label: 'Gate 2 / OUT',
      position: [10, 0],
      headingRad: -Math.PI / 2,
    },
  ],
  rackBlocks,
  barriers: [
    {
      id: 'customs-fence-north',
      kind: 'CUSTOMS_FENCE',
      bounds: { xMin: 22, xMax: 82, zMin: CUSTOMS_FENCE_Z_M - 0.1, zMax: CUSTOMS_FENCE_Z_M + 0.1 },
      northZoneId: 'zone-domestic',
      southZoneId: 'zone-international',
    },
  ],
  cameras: [
    {
      id: 'CUST-CAM-01',
      position: [52, 77],
      heightM: 4.5,
      headingRad: Math.PI,
      monitorsBarrierId: 'customs-fence-north',
    },
  ],
  conveyors: [
    {
      id: 'CV-IN-QC-01',
      zoneId: 'zone-inbound-conveyor-qc',
      bounds: { xMin: 89, xMax: 101, zMin: 53, zMax: 55 },
      direction: 'X',
    },
  ],
  flowNodes: [
    { id: 'flow-receive', zoneId: 'zone-inbound-receive', position: [103, 18], action: 'RECEIVE' },
    { id: 'flow-arrival-staging', zoneId: 'zone-inbound-staging', position: [97, 66], action: 'STAGE' },
    { id: 'flow-conveyor-qc', zoneId: 'zone-inbound-conveyor-qc', position: [95, 54], action: 'QC' },
    { id: 'flow-transfer-staging', zoneId: 'zone-transfer-staging', position: [95, 43], action: 'STAGE' },
    { id: 'flow-storage-handoff', zoneId: 'zone-main-storage', position: [81, 41.4], action: 'HANDOFF' },
    { id: 'flow-storage-bin', zoneId: 'zone-main-storage', position: [68, 41.4], action: 'STORE' },
  ],
  flows: [
    {
      id: 'INBOUND_FLOW',
      name: 'Receive to Storage',
      nodeIds: [
        'flow-receive',
        'flow-arrival-staging',
        'flow-conveyor-qc',
        'flow-transfer-staging',
        'flow-storage-handoff',
        'flow-storage-bin',
      ],
    },
  ],
  travelLanes: [
    {
      id: 'lane-agv-inbound',
      name: 'AGV Inbound Line',
      vehicleModes: ['AGV'],
      directed: true,
      widthM: 2.5,
      points: [[95, 43], [84, 41.4], [81, 41.4]],
    },
    {
      id: 'lane-amr-storage-spine',
      name: 'AMR Storage Spine',
      vehicleModes: ['AMR'],
      directed: false,
      widthM: 3,
      points: [[82, 41.4], [82, 14], [24, 14], [24, 67], [82, 67]],
    },
    {
      id: 'lane-agv-outbound',
      name: 'AGV Outbound Line',
      vehicleModes: ['AGV'],
      directed: true,
      widthM: 2.5,
      points: [[26, 41.4], [16, 41.4], [10, 0]],
    },
  ],
  putawayBands: [
    {
      id: 'putaway-fast',
      movementClass: 'FAST_MOVING',
      bounds: { xMin: 27, xMax: 80, zMin: 30, zMax: 56 },
      priority: 1,
    },
    {
      id: 'putaway-slow-south',
      movementClass: 'SLOW_MOVING',
      bounds: { xMin: 27, xMax: 80, zMin: 16, zMax: 30 },
      priority: 2,
    },
    {
      id: 'putaway-slow-north',
      movementClass: 'SLOW_MOVING',
      bounds: { xMin: 27, xMax: 80, zMin: 56, zMax: 67 },
      priority: 3,
    },
  ],
  docks: [
    {
      id: 'dock-gate-1-in',
      gateId: 'gate-1-in',
      zoneId: 'zone-inbound-receive',
      kind: 'INBOUND',
      bounds: { xMin: 96, xMax: 106, zMin: 0, zMax: 8 },
    },
    {
      id: 'dock-gate-2-out',
      gateId: 'gate-2-out',
      zoneId: 'zone-loading-outbound',
      kind: 'OUTBOUND',
      bounds: { xMin: 6, xMax: 16, zMin: 0, zMax: 8 },
    },
  ],
  roads: [
    {
      id: 'road-external-south',
      name: 'TLIP External South Road',
      widthM: 6,
      points: [[0, 2], [110, 2]],
    },
  ],
  walkways: [
    {
      id: 'walkway-office-storage',
      name: 'Office to Storage Walkway',
      widthM: 1.5,
      points: [[24, 12], [84, 12]],
    },
  ],
  restrictedAreas: [
    {
      id: 'restricted-customs-fence',
      name: 'Customs Separation Buffer',
      reason: 'Prevent mixing domestic and international inventory',
      bounds: { xMin: 21.5, xMax: 82.5, zMin: CUSTOMS_FENCE_Z_M - 0.6, zMax: CUSTOMS_FENCE_Z_M + 0.6 },
    },
  ],
  cameraPresets: [
    {
      id: 'camera-overview',
      name: 'Warehouse Overview',
      position: [55, 115, 45],
      target: [55, 0, 45],
      hideRoof: true,
    },
    {
      id: 'camera-receive',
      name: 'Inbound Receive',
      position: [104, 28, 45],
      target: [96, 0, 45],
      hideRoof: true,
    },
    {
      id: 'camera-storage',
      name: 'Main Storage',
      position: [54, 42, 42],
      target: [54, 0, 42],
      hideRoof: true,
    },
    {
      id: 'camera-loading',
      name: 'Loading Outbound',
      position: [8, 28, 43],
      target: [16, 0, 43],
      hideRoof: true,
    },
    {
      id: 'camera-customs-fence',
      name: 'Customs Fence',
      position: [52, 20, 84],
      target: [52, 2, CUSTOMS_FENCE_Z_M],
      hideRoof: true,
    },
  ],
  assumptions: [
    'Warehouse footprint is approximated as 110 m × 90 m until CAD dimensions are available.',
    'Customs fence coordinates are estimated from the supplied top-down image.',
    'No customs-fence access gate is modeled until its location is confirmed.',
    'AGV/AMR counts and static forklift locations remain unspecified.',
    'Rack aisle spacing remains provisional pending visual review.',
  ],
}

export function calculateRackCapacity(rack: Pick<RackBlock, 'faces' | 'levels' | 'binsPerLevel'>): number {
  return rack.faces * rack.levels * rack.binsPerLevel
}

export function createBinAddresses(rack: RackBlock): BinAddress[] {
  const addresses: BinAddress[] = []
  const faces: readonly RackFace[] = ['FR', 'BK']

  for (const face of faces) {
    for (let level = 1; level <= rack.levels; level += 1) {
      for (let bin = 1; bin <= rack.binsPerLevel; bin += 1) {
        addresses.push({
          id: `${rack.id}-${face}-L${String(level).padStart(2, '0')}-B${String(bin).padStart(2, '0')}`,
          rackId: rack.id,
          face,
          level,
          bin,
          palletCapacity: 1,
          occupiedPallets: 0,
          skuId: null,
          movementClass: rack.movementClass,
        })
      }
    }
  }

  return addresses
}

export function validateBinState(bin: BinAddress): string[] {
  const errors: string[] = []
  if (bin.palletCapacity !== 1) errors.push(`${bin.id} must have palletCapacity = 1`)
  if (bin.occupiedPallets !== 0 && bin.occupiedPallets !== 1) errors.push(`${bin.id} occupiedPallets must be 0 or 1`)
  if (bin.occupiedPallets === 0 && bin.skuId !== null) errors.push(`${bin.id} cannot hold an SKU while empty`)
  if (bin.occupiedPallets === 1 && !bin.skuId) errors.push(`${bin.id} must have one SKU when occupied`)
  return errors
}

export function rackBounds(rack: RackBlock): Rect2D {
  const runLengthM = rack.binsPerLevel * rack.binWidthM
  const halfX = rack.orientation === 'X' ? runLengthM / 2 : rack.rackDepthM / 2
  const halfZ = rack.orientation === 'X' ? rack.rackDepthM / 2 : runLengthM / 2
  return {
    xMin: rack.center[0] - halfX,
    xMax: rack.center[0] + halfX,
    zMin: rack.center[1] - halfZ,
    zMax: rack.center[1] + halfZ,
  }
}

function pointInsideWarehouse(point: Vec2, layout: DensoLayout): boolean {
  return Number.isFinite(point[0])
    && Number.isFinite(point[1])
    && point[0] >= 0
    && point[0] <= layout.warehouse.widthM
    && point[1] >= 0
    && point[1] <= layout.warehouse.depthM
}

function rectIsValid(rect: Rect2D): boolean {
  return [rect.xMin, rect.xMax, rect.zMin, rect.zMax].every(Number.isFinite)
    && rect.xMin < rect.xMax
    && rect.zMin < rect.zMax
}

function rectInsideWarehouse(rect: Rect2D, layout: DensoLayout): boolean {
  return rectIsValid(rect)
    && rect.xMin >= 0
    && rect.xMax <= layout.warehouse.widthM
    && rect.zMin >= 0
    && rect.zMax <= layout.warehouse.depthM
}

function pointInsideRect(point: Vec2, rect: Rect2D): boolean {
  return point[0] >= rect.xMin
    && point[0] <= rect.xMax
    && point[1] >= rect.zMin
    && point[1] <= rect.zMax
}

function rectsOverlap(a: Rect2D, b: Rect2D): boolean {
  return a.xMin < b.xMax && a.xMax > b.xMin && a.zMin < b.zMax && a.zMax > b.zMin
}

function rectContainsRect(container: Rect2D, inner: Rect2D): boolean {
  return inner.xMin >= container.xMin
    && inner.xMax <= container.xMax
    && inner.zMin >= container.zMin
    && inner.zMax <= container.zMax
}

function rectsTouchOrOverlap(a: Rect2D, b: Rect2D): boolean {
  return a.xMin <= b.xMax && a.xMax >= b.xMin && a.zMin <= b.zMax && a.zMax >= b.zMin
}

function expandRect(rect: Rect2D, amount: number): Rect2D {
  return {
    xMin: rect.xMin - amount,
    xMax: rect.xMax + amount,
    zMin: rect.zMin - amount,
    zMax: rect.zMax + amount,
  }
}

function segmentIntersectsRect(start: Vec2, end: Vec2, rect: Rect2D): boolean {
  if (pointInsideRect(start, rect) || pointInsideRect(end, rect)) return true

  const dx = end[0] - start[0]
  const dz = end[1] - start[1]
  let tMin = 0
  let tMax = 1
  const checks: readonly [number, number][] = [
    [-dx, start[0] - rect.xMin],
    [dx, rect.xMax - start[0]],
    [-dz, start[1] - rect.zMin],
    [dz, rect.zMax - start[1]],
  ]

  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return false
      continue
    }
    const ratio = q / p
    if (p < 0) tMin = Math.max(tMin, ratio)
    else tMax = Math.min(tMax, ratio)
    if (tMin > tMax) return false
  }
  return true
}

function laneIntersectsRect(points: readonly Vec2[], widthM: number, rect: Rect2D): boolean {
  const sweptObstacle = expandRect(rect, widthM / 2)
  for (let index = 1; index < points.length; index += 1) {
    if (segmentIntersectsRect(points[index - 1], points[index], sweptObstacle)) return true
  }
  return false
}

function positiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function approximatelyEqual(value: number, target: number, tolerance: number): boolean {
  const epsilon = Number.EPSILON * Math.max(1, Math.abs(value), Math.abs(target)) * 4
  return Number.isFinite(value) && Math.abs(value - target) <= tolerance + epsilon
}

function duplicateIds(items: readonly { id: string }[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) duplicates.add(item.id)
    seen.add(item.id)
  }
  return [...duplicates]
}

export function validateDensoLayout(layout: DensoLayout = DENSO_LAYOUT): LayoutValidationResult {
  const errors: string[] = []
  const collections: readonly [string, readonly { id: string }[]][] = [
    ['zones', layout.zones],
    ['gates', layout.gates],
    ['rackBlocks', layout.rackBlocks],
    ['barriers', layout.barriers],
    ['cameras', layout.cameras],
    ['conveyors', layout.conveyors],
    ['flowNodes', layout.flowNodes],
    ['flows', layout.flows],
    ['travelLanes', layout.travelLanes],
    ['putawayBands', layout.putawayBands],
    ['docks', layout.docks],
    ['roads', layout.roads],
    ['walkways', layout.walkways],
    ['restrictedAreas', layout.restrictedAreas],
    ['cameraPresets', layout.cameraPresets],
  ]

  for (const [name, items] of collections) {
    for (const id of duplicateIds(items)) errors.push(`Duplicate ${name} id: ${id}`)
  }

  if (!positiveFinite(layout.warehouse.widthM) || !positiveFinite(layout.warehouse.depthM)) {
    errors.push('Warehouse width and depth must be positive finite numbers')
  }
  const expectedHeightM = layout.id === 'denso-tlip-external-warehouse-v1' ? 25 : 5
  if (layout.warehouse.heightM !== expectedHeightM) errors.push(`Warehouse height must be ${expectedHeightM} m for ${layout.id}`)
  if (
    !positiveFinite(layout.warehouse.approximateAreaM2)
    || Math.abs(layout.warehouse.widthM * layout.warehouse.depthM - layout.warehouse.approximateAreaM2) > 500
  ) {
    errors.push('Warehouse footprint must remain within 500 m² of the approximate area')
  }
  if (
    !positiveFinite(layout.pallet.widthM)
    || !positiveFinite(layout.pallet.depthM)
    || !positiveFinite(layout.pallet.lowHeightM)
    || !positiveFinite(layout.pallet.targetGapM)
  ) errors.push('Pallet dimensions and target gap must be positive finite numbers')
  if (
    layout.pallet.widthM !== CONFIRMED_PALLET_WIDTH_M
    || layout.pallet.depthM !== CONFIRMED_PALLET_DEPTH_M
  ) errors.push('Pallet footprint must match the confirmed 1.13 m x 0.97 m specification')
  if (layout.pallet.lowHeightM !== CONFIRMED_LOW_PALLET_HEIGHT_M) {
    errors.push('Low pallet height must match the confirmed 0.5 m specification')
  }
  if (!approximatelyEqual(layout.pallet.targetGapM, TARGET_PALLET_GAP_M, APPROXIMATE_DIMENSION_TOLERANCE_M)) {
    errors.push('Pallet target gap must remain approximately 0.1 m')
  }

  const barrierById = new Map(layout.barriers.map((barrier) => [barrier.id, barrier]))
  const gateById = new Map(layout.gates.map((gate) => [gate.id, gate]))
  const zoneById = new Map(layout.zones.map((zone) => [zone.id, zone]))
  const flowNodeById = new Map(layout.flowNodes.map((node) => [node.id, node]))

  for (const zone of layout.zones) {
    if (!rectInsideWarehouse(zone.bounds, layout)) errors.push(`${zone.id} has invalid or out-of-bounds geometry`)
    if (zone.parentZoneId) {
      const parent = zoneById.get(zone.parentZoneId)
      if (!parent) errors.push(`${zone.id} references missing parent zone ${zone.parentZoneId}`)
      else if (
        zone.bounds.xMin < parent.bounds.xMin
        || zone.bounds.xMax > parent.bounds.xMax
        || zone.bounds.zMin < parent.bounds.zMin
        || zone.bounds.zMax > parent.bounds.zMax
      ) errors.push(`${zone.id} extends outside parent zone ${zone.parentZoneId}`)
    }
  }

  for (const barrier of layout.barriers) {
    if (!rectInsideWarehouse(barrier.bounds, layout)) errors.push(`${barrier.id} has invalid or out-of-bounds geometry`)
    if (barrier.kind === 'CUSTOMS_FENCE') {
      if (!barrier.northZoneId || !zoneById.has(barrier.northZoneId)) errors.push(`${barrier.id} references missing north zone ${barrier.northZoneId ?? 'undefined'}`)
      if (!barrier.southZoneId || !zoneById.has(barrier.southZoneId)) errors.push(`${barrier.id} references missing south zone ${barrier.southZoneId ?? 'undefined'}`)
    }
  }

  for (const rack of layout.rackBlocks) {
    const capacity = calculateRackCapacity(rack)
    const expectedCapacity = rack.levels === 6 ? 120 : 140
    if (capacity !== expectedCapacity) errors.push(`${rack.id} capacity ${capacity} does not match ${expectedCapacity}`)
    if (rack.palletPositionCount !== capacity) errors.push(`${rack.id} palletPositionCount must equal derived capacity ${capacity}`)
    if (!positiveFinite(rack.operationalReferenceCapacity) || rack.operationalReferenceCapacity < capacity) {
      errors.push(`${rack.id} operational reference capacity must be finite and not below rendered capacity`)
    }
    if (rack.palletCapacityPerBin !== 1) errors.push(`${rack.id} must keep one pallet per bin`)
    if (!positiveFinite(rack.binWidthM) || !positiveFinite(rack.levelPitchM) || !positiveFinite(rack.rackDepthM)) {
      errors.push(`${rack.id} dimensions must be positive finite numbers`)
    }
    if (!approximatelyEqual(rack.binWidthM, TARGET_BIN_WIDTH_M, APPROXIMATE_BIN_WIDTH_TOLERANCE_M)) {
      errors.push(`${rack.id} bin width must remain approximately 2.5 m`)
    }
    if (rack.levelPitchM < layout.pallet.lowHeightM) {
      errors.push(`${rack.id} level pitch cannot fit the low pallet height`)
    }
    if (rack.levelPitchM >= 1) errors.push(`${rack.id} level pitch must remain below 1 m`)
    if (rack.levels * rack.levelPitchM > layout.warehouse.heightM) {
      errors.push(`${rack.id} total rack height exceeds the warehouse height`)
    }
    const minimumDoubleRackDepthM = rack.faces * layout.pallet.depthM + layout.pallet.targetGapM
    if (rack.rackDepthM < minimumDoubleRackDepthM) {
      errors.push(`${rack.id} depth cannot fit pallets on both faces`)
    }
    const rackZone = zoneById.get(rack.zoneId)
    if (!rackZone) errors.push(`${rack.id} references missing zone ${rack.zoneId}`)

    const bounds = rackBounds(rack)
    if (!rectInsideWarehouse(bounds, layout)) errors.push(`${rack.id} extends outside warehouse footprint`)
    if (rackZone && !rectContainsRect(rackZone.bounds, bounds)) errors.push(`${rack.id} extends outside zone ${rack.zoneId}`)
    for (const barrier of layout.barriers) {
      if (rectsOverlap(bounds, barrier.bounds)) errors.push(`${rack.id} intersects barrier ${barrier.id}`)
    }

    const addresses = createBinAddresses(rack)
    if (addresses.length !== capacity) errors.push(`${rack.id} generated ${addresses.length} addresses for ${capacity} positions`)
    if (new Set(addresses.map((address) => address.id)).size !== addresses.length) {
      errors.push(`${rack.id} generated duplicate bin addresses`)
    }
    for (const address of addresses) errors.push(...validateBinState(address))
  }

  const allBinAddresses = layout.rackBlocks.flatMap(createBinAddresses)
  if (new Set(allBinAddresses.map((address) => address.id)).size !== allBinAddresses.length) {
    errors.push('Rack layout generated duplicate bin addresses across rack blocks')
  }

  for (let left = 0; left < layout.rackBlocks.length; left += 1) {
    for (let right = left + 1; right < layout.rackBlocks.length; right += 1) {
      if (rectsOverlap(rackBounds(layout.rackBlocks[left]), rackBounds(layout.rackBlocks[right]))) {
        errors.push(`${layout.rackBlocks[left].id} overlaps rack ${layout.rackBlocks[right].id}`)
      }
    }
  }

  for (const gate of layout.gates) {
    if (!pointInsideWarehouse(gate.position, layout)) errors.push(`${gate.id} is outside warehouse footprint`)
    if (!Number.isFinite(gate.headingRad)) errors.push(`${gate.id} heading must be finite`)
  }

  for (const node of layout.flowNodes) {
    const zone = zoneById.get(node.zoneId)
    if (!zone) errors.push(`${node.id} references missing zone ${node.zoneId}`)
    if (!pointInsideWarehouse(node.position, layout)) errors.push(`${node.id} is outside warehouse footprint`)
    else if (zone && !pointInsideRect(node.position, zone.bounds)) errors.push(`${node.id} is outside referenced zone ${node.zoneId}`)
  }

  for (const flow of layout.flows) {
    for (const nodeId of flow.nodeIds) {
      if (!flowNodeById.has(nodeId)) errors.push(`${flow.id} references missing node ${nodeId}`)
    }
  }

  if (layout.schemaVersion === '0.1.0') {
    const inboundFlow = layout.flows.find((flow) => flow.id === 'INBOUND_FLOW')
    const expectedInboundActions = ['RECEIVE', 'STAGE', 'QC', 'STAGE', 'HANDOFF', 'STORE']
    if (!inboundFlow) errors.push('INBOUND_FLOW is required')
    else {
      const actualActions = inboundFlow.nodeIds.map((nodeId) => flowNodeById.get(nodeId)?.action ?? 'MISSING')
      if (actualActions.join('|') !== expectedInboundActions.join('|')) {
        errors.push(`INBOUND_FLOW action sequence must be ${expectedInboundActions.join(' → ')}`)
      }
    }
  } else {
    const inboundCells = layout.operationalCells?.filter((cell) => cell.kind === 'INBOUND') ?? []
    const expectedInboundActions = ['RECEIVE', 'STAGE', 'INSPECT', 'QC', 'STAGE', 'HANDOFF', 'STORE']
    if (inboundCells.length !== 3) errors.push('Layout v1 requires exactly three independent inbound cells')
    for (const cell of inboundCells) {
      const gate = cell.gateId ? gateById.get(cell.gateId) : undefined
      if (!gate || gate.kind !== 'IN' || gate.position[0] !== layout.warehouse.widthM) errors.push(`${cell.id} requires an east-side inbound gate`)
      if (cell.zoneIds.length !== 4 || cell.zoneIds.some((zoneId) => !zoneById.has(zoneId))) errors.push(`${cell.id} requires four independent stage zones`)
      if (!layout.conveyors.some((conveyor) => conveyor.id === cell.conveyorId)) errors.push(`${cell.id} references missing conveyor ${cell.conveyorId}`)
      const flow = layout.flows.find((candidate) => candidate.id === cell.flowId)
      const actions = flow?.nodeIds.map((nodeId) => flowNodeById.get(nodeId)?.action ?? 'MISSING') ?? []
      if (actions.join('|') !== expectedInboundActions.join('|')) errors.push(`${cell.id} inbound action sequence must be ${expectedInboundActions.join(' → ')}`)
    }
    const outboundCell = layout.operationalCells?.find((cell) => cell.kind === 'OUTBOUND')
    const expectedOutboundActions = ['PICK', 'QC', 'DISPATCH', 'INTERNAL_HANDOFF']
    if (!outboundCell) errors.push('Layout v1 requires an outbound operational cell')
    else {
      if (outboundCell.zoneIds.length !== 4 || outboundCell.zoneIds.some((zoneId) => !zoneById.has(zoneId))) errors.push('Outbound cell requires pick, QC, dispatch and handoff zones')
      const flow = layout.flows.find((candidate) => candidate.id === outboundCell.flowId)
      const actions = flow?.nodeIds.map((nodeId) => flowNodeById.get(nodeId)?.action ?? 'MISSING') ?? []
      if (actions.join('|') !== expectedOutboundActions.join('|')) errors.push(`OUTBOUND_FLOW action sequence must be ${expectedOutboundActions.join(' → ')}`)
      if (!layout.gates.some((gate) => gate.kind === 'OUT' && gate.position[0] === 0)) errors.push('Layout v1 requires a west-side outbound gate')
    }
    const workCells = layout.forkliftWorkCells ?? []
    if (workCells.some((cell) => cell.maximumForklifts !== 1 || !zoneById.has(cell.zoneId) || cell.barrierIds.some((id) => !barrierById.has(id)))) {
      errors.push('Each forklift work cell must have one forklift, one valid zone and valid barriers')
    }
    if (new Set(workCells.map((cell) => cell.zoneId)).size !== workCells.length) errors.push('Forklift work cells must not share a zone')
    for (const cell of workCells) {
      const zone = zoneById.get(cell.zoneId)
      if (zone && !cell.barrierIds.some((barrierId) => {
        const barrier = barrierById.get(barrierId)
        return barrier ? rectsTouchOrOverlap(zone.bounds, barrier.bounds) : false
      })) errors.push(`${cell.id} requires a barrier that touches its work zone`)
      if (zone) {
        for (const lane of layout.travelLanes) {
          if (!lane.vehicleModes.includes('FORKLIFT') && laneIntersectsRect(lane.points, lane.widthM, zone.bounds)) {
            errors.push(`${lane.id} intersects forklift work zone ${cell.zoneId}`)
          }
        }
      }
    }
    const requiredForkliftZones = [
      ...inboundCells.map((cell) => cell.zoneIds[3]),
      outboundCell?.zoneIds[0],
      'zone-main-storage',
    ]
    if (requiredForkliftZones.some((zoneId) => !workCells.some((cell) => cell.zoneId === zoneId))) {
      errors.push('Layout v1 requires one forklift work cell for storage, every inbound transfer stage and outbound pick')
    }
  }

  for (const camera of layout.cameras) {
    if (!pointInsideWarehouse(camera.position, layout)) errors.push(`${camera.id} is outside warehouse footprint`)
    if (!positiveFinite(camera.heightM) || !Number.isFinite(camera.headingRad)) errors.push(`${camera.id} has invalid camera geometry`)
    if (camera.monitorsBarrierId && !barrierById.has(camera.monitorsBarrierId)) {
      errors.push(`${camera.id} references missing barrier ${camera.monitorsBarrierId}`)
    }
  }

  for (const conveyor of layout.conveyors) {
    const zone = zoneById.get(conveyor.zoneId)
    if (!zone) errors.push(`${conveyor.id} references missing zone ${conveyor.zoneId}`)
    if (!rectInsideWarehouse(conveyor.bounds, layout)) errors.push(`${conveyor.id} has invalid or out-of-bounds geometry`)
    else if (zone && (
      conveyor.bounds.xMin < zone.bounds.xMin
      || conveyor.bounds.xMax > zone.bounds.xMax
      || conveyor.bounds.zMin < zone.bounds.zMin
      || conveyor.bounds.zMax > zone.bounds.zMax
    )) errors.push(`${conveyor.id} extends outside zone ${conveyor.zoneId}`)
  }

  for (const lane of layout.travelLanes) {
    if (!positiveFinite(lane.widthM) || lane.points.length < 2) errors.push(`${lane.id} must have positive width and at least two points`)
    if (lane.points.some((point) => !pointInsideWarehouse(point, layout))) errors.push(`${lane.id} leaves warehouse footprint`)
    for (const rack of layout.rackBlocks) {
      if (laneIntersectsRect(lane.points, lane.widthM, rackBounds(rack))) errors.push(`${lane.id} intersects rack ${rack.id}`)
    }
    for (const barrier of layout.barriers) {
      if (laneIntersectsRect(lane.points, lane.widthM, barrier.bounds)) errors.push(`${lane.id} intersects barrier ${barrier.id}`)
    }
    for (const conveyor of layout.conveyors) {
      if (laneIntersectsRect(lane.points, lane.widthM, conveyor.bounds)) errors.push(`${lane.id} intersects conveyor ${conveyor.id}`)
    }
    for (const area of layout.restrictedAreas) {
      if (laneIntersectsRect(lane.points, lane.widthM, area.bounds)) errors.push(`${lane.id} intersects restricted area ${area.id}`)
    }
  }

  for (const band of layout.putawayBands) {
    if (!rectInsideWarehouse(band.bounds, layout)) errors.push(`${band.id} has invalid or out-of-bounds geometry`)
    if (!Number.isInteger(band.priority) || band.priority < 1) errors.push(`${band.id} priority must be a positive integer`)
  }

  for (const dock of layout.docks) {
    const gate = gateById.get(dock.gateId)
    const zone = zoneById.get(dock.zoneId)
    if (!gate) errors.push(`${dock.id} references missing gate ${dock.gateId}`)
    if (!zone) errors.push(`${dock.id} references missing zone ${dock.zoneId}`)
    if (!rectInsideWarehouse(dock.bounds, layout)) errors.push(`${dock.id} has invalid or out-of-bounds geometry`)
    if (gate && !pointInsideRect(gate.position, dock.bounds)) errors.push(`${dock.id} does not contain gate ${dock.gateId}`)
    if (gate && ((dock.kind === 'INBOUND' && gate.kind !== 'IN') || (dock.kind === 'OUTBOUND' && gate.kind !== 'OUT'))) {
      errors.push(`${dock.id} kind does not match gate ${dock.gateId}`)
    }
    if (zone && !rectsTouchOrOverlap(dock.bounds, zone.bounds)) errors.push(`${dock.id} does not touch zone ${dock.zoneId}`)
  }

  for (const path of [...layout.roads, ...layout.walkways]) {
    if (!positiveFinite(path.widthM) || path.points.length < 2) errors.push(`${path.id} must have positive width and at least two points`)
    if (path.points.some((point) => !pointInsideWarehouse(point, layout))) errors.push(`${path.id} leaves warehouse footprint`)
  }

  for (const area of layout.restrictedAreas) {
    if (!rectInsideWarehouse(area.bounds, layout)) errors.push(`${area.id} has invalid or out-of-bounds geometry`)
  }

  for (const preset of layout.cameraPresets) {
    if (![...preset.position, ...preset.target].every(Number.isFinite)) errors.push(`${preset.id} camera vectors must be finite`)
    if (preset.position[1] <= 0 || preset.target[1] < 0) errors.push(`${preset.id} camera heights must be non-negative with position above floor`)
    if (!pointInsideWarehouse([preset.position[0], preset.position[2]], layout)) errors.push(`${preset.id} camera position is outside warehouse footprint`)
    if (!pointInsideWarehouse([preset.target[0], preset.target[2]], layout)) errors.push(`${preset.id} camera target is outside warehouse footprint`)
  }

  const customsBarrier = layout.barriers.find((barrier) => barrier.kind === 'CUSTOMS_FENCE')
  const domestic = layout.zones.find((zone) => zone.kind === 'DOMESTIC')
  const international = layout.zones.find((zone) => zone.kind === 'INTERNATIONAL')
  if (!customsBarrier || !domestic || !international) {
    errors.push('Customs barrier, domestic zone and international zone are required')
  } else {
    const northZone = zoneById.get(customsBarrier.northZoneId ?? '')
    const southZone = zoneById.get(customsBarrier.southZoneId ?? '')
    if (northZone?.kind !== 'DOMESTIC') errors.push('Customs fence north zone must be DOMESTIC')
    if (southZone?.kind !== 'INTERNATIONAL') errors.push('Customs fence south zone must be INTERNATIONAL')
    if (domestic.bounds.zMin < customsBarrier.bounds.zMax) errors.push('Domestic zone must stay north of customs fence')
    if (international.bounds.zMax > customsBarrier.bounds.zMin) errors.push('International zone must stay south of customs fence')
    if (domestic.bounds.xMin > customsBarrier.bounds.xMin || domestic.bounds.xMax < customsBarrier.bounds.xMax) {
      errors.push('Domestic zone must cover the customs fence X span')
    }
    if (international.bounds.xMin > customsBarrier.bounds.xMin || international.bounds.xMax < customsBarrier.bounds.xMax) {
      errors.push('International zone must cover the customs fence X span')
    }
  }

  return { valid: errors.length === 0, errors }
}

/** Active, approved layout. V0 remains exported solely as a migration baseline. */
export const DENSO_LAYOUT = DENSO_LAYOUT_V1
