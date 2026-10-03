import type { DensoLayout, RackBlock, Vec2 } from './denso-layout.types'

const WAREHOUSE_WIDTH_M = 110
const WAREHOUSE_DEPTH_M = 90
const CUSTOMS_FENCE_Z_M = 76.5

function createRackBlock(id: string, center: Vec2, movementClass: RackBlock['movementClass']): RackBlock {
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

const rackRows = [19, 25.4, 31.8, 38.2, 44.6, 51, 57.4, 63.8] as const

const rackBlocks = rackRows.flatMap((z, index) => {
  const movementClass = index >= 2 && index <= 5 ? 'FAST_MOVING' : 'SLOW_MOVING'
  const row = String(index + 1).padStart(2, '0')
  return [
    createRackBlock(`ST-A${row}`, [40, z], movementClass),
    createRackBlock(`ST-B${row}`, [67, z], movementClass),
  ]
})

export const DENSO_LAYOUT_V1: DensoLayout = {
  schemaVersion: '0.2.0',
  id: 'denso-tlip-external-warehouse-v1',
  units: 'm',
  coordinateSystem: { origin: 'SOUTH_WEST', xAxis: 'EAST', zAxis: 'NORTH' },
  // User-authorized demo roof elevation; legacy v0 retains the original 5 m reference.
  warehouse: { widthM: WAREHOUSE_WIDTH_M, depthM: WAREHOUSE_DEPTH_M, heightM: 25, approximateAreaM2: 10_000 },
  pallet: { widthM: 1.13, depthM: 0.97, lowHeightM: 0.5, targetGapM: 0.1 },
  zones: [
    { id: 'zone-main-storage', kind: 'MAIN_STORAGE', name: 'Main Storage', bounds: { xMin: 26, xMax: 82, zMin: 15, zMax: 67 } },
    { id: 'zone-domestic', kind: 'DOMESTIC', name: 'Domestic / VAT', bounds: { xMin: 22, xMax: 82, zMin: 76.6, zMax: 88 } },
    { id: 'zone-international', kind: 'INTERNATIONAL', name: 'International / Non-VAT', bounds: { xMin: 22, xMax: 82, zMin: 15, zMax: 76.4 } },
    { id: 'zone-truck-01-staging', kind: 'INBOUND_STAGING', name: 'Truck 01 Arrival Staging', bounds: { xMin: 99, xMax: 108, zMin: 68, zMax: 74 } },
    { id: 'zone-truck-01-inspection', kind: 'INBOUND_INSPECTION', name: 'Truck 01 Inspection', bounds: { xMin: 93, xMax: 98, zMin: 68, zMax: 74 } },
    { id: 'zone-truck-01-conveyor', kind: 'INBOUND_CONVEYOR_QC', name: 'Truck 01 Conveyor', bounds: { xMin: 87, xMax: 92, zMin: 68, zMax: 74 } },
    { id: 'zone-truck-01-staging-2', kind: 'TRANSFER_STAGING', name: 'Truck 01 Transfer Staging', bounds: { xMin: 83, xMax: 86, zMin: 68, zMax: 74 } },
    { id: 'zone-truck-02-staging', kind: 'INBOUND_STAGING', name: 'Truck 02 Arrival Staging', bounds: { xMin: 99, xMax: 108, zMin: 54, zMax: 60 } },
    { id: 'zone-truck-02-inspection', kind: 'INBOUND_INSPECTION', name: 'Truck 02 Inspection', bounds: { xMin: 93, xMax: 98, zMin: 54, zMax: 60 } },
    { id: 'zone-truck-02-conveyor', kind: 'INBOUND_CONVEYOR_QC', name: 'Truck 02 Conveyor', bounds: { xMin: 87, xMax: 92, zMin: 54, zMax: 60 } },
    { id: 'zone-truck-02-staging-2', kind: 'TRANSFER_STAGING', name: 'Truck 02 Transfer Staging', bounds: { xMin: 83, xMax: 86, zMin: 54, zMax: 60 } },
    { id: 'zone-container-01-staging', kind: 'INBOUND_STAGING', name: 'Container Arrival Staging', bounds: { xMin: 99, xMax: 108, zMin: 16, zMax: 22 } },
    { id: 'zone-container-01-inspection', kind: 'INBOUND_INSPECTION', name: 'Container Inspection', bounds: { xMin: 93, xMax: 98, zMin: 16, zMax: 22 } },
    { id: 'zone-container-01-conveyor', kind: 'INBOUND_CONVEYOR_QC', name: 'Container Conveyor', bounds: { xMin: 87, xMax: 92, zMin: 16, zMax: 22 } },
    { id: 'zone-container-01-staging-2', kind: 'TRANSFER_STAGING', name: 'Container Transfer Staging', bounds: { xMin: 83, xMax: 86, zMin: 16, zMax: 22 } },
    { id: 'zone-outbound-pick', kind: 'OUTBOUND_PICK', name: 'Outbound Forklift Pick', bounds: { xMin: 20, xMax: 25, zMin: 36, zMax: 44 } },
    { id: 'zone-outbound-conveyor', kind: 'OUTBOUND_CONVEYOR_QC', name: 'Outbound QC Conveyor', bounds: { xMin: 11, xMax: 19, zMin: 37, zMax: 43 } },
    { id: 'zone-outbound-dispatch', kind: 'OUTBOUND_DISPATCH_STAGING', name: 'Outbound Dispatch Staging', bounds: { xMin: 3, xMax: 10, zMin: 35, zMax: 45 } },
    { id: 'zone-internal-handoff', kind: 'INTERNAL_HANDOFF', name: 'Internal Warehouse Handoff', bounds: { xMin: 0, xMax: 2.5, zMin: 35, zMax: 45 } },
    { id: 'zone-office-support', kind: 'OFFICE_SUPPORT', name: 'Office & Support', bounds: { xMin: 24, xMax: 84, zMin: 2, zMax: 13 } },
  ],
  gates: [
    { id: 'gate-truck-01', kind: 'IN', label: 'Truck IN 01', position: [110, 71], headingRad: Math.PI },
    { id: 'gate-truck-02', kind: 'IN', label: 'Truck IN 02', position: [110, 57], headingRad: Math.PI },
    { id: 'gate-container-01', kind: 'IN', label: 'Container IN', position: [110, 19], headingRad: Math.PI },
    { id: 'gate-outbound-west', kind: 'OUT', label: 'Outbound to Internal Warehouse', position: [0, 40], headingRad: 0 },
  ],
  rackBlocks,
  barriers: [
    { id: 'customs-fence-north', kind: 'CUSTOMS_FENCE', bounds: { xMin: 22, xMax: 82, zMin: CUSTOMS_FENCE_Z_M - 0.1, zMax: CUSTOMS_FENCE_Z_M + 0.1 }, northZoneId: 'zone-domestic', southZoneId: 'zone-international' },
    { id: 'barrier-forklift-storage-west', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 25.9, xMax: 26.2, zMin: 15, zMax: 67 } },
    { id: 'barrier-forklift-storage-east', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 81.8, xMax: 82.1, zMin: 15, zMax: 67 } },
    { id: 'barrier-forklift-truck-01-north', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 83, xMax: 86, zMin: 67.8, zMax: 68.1 } },
    { id: 'barrier-forklift-truck-01-south', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 83, xMax: 86, zMin: 73.9, zMax: 74.2 } },
    { id: 'barrier-forklift-truck-02-north', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 83, xMax: 86, zMin: 53.8, zMax: 54.1 } },
    { id: 'barrier-forklift-truck-02-south', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 83, xMax: 86, zMin: 59.9, zMax: 60.2 } },
    { id: 'barrier-forklift-container-01-north', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 83, xMax: 86, zMin: 15.8, zMax: 16.1 } },
    { id: 'barrier-forklift-container-01-south', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 83, xMax: 86, zMin: 21.9, zMax: 22.2 } },
    { id: 'barrier-forklift-outbound-north', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 20, xMax: 25, zMin: 35.8, zMax: 36.1 } },
    { id: 'barrier-forklift-outbound-south', kind: 'FORKLIFT_BARRIER', bounds: { xMin: 20, xMax: 25, zMin: 43.9, zMax: 44.2 } },
    { id: 'barrier-agv-west', kind: 'AGV_BARRIER', bounds: { xMin: 20.5, xMax: 21, zMin: 13, zMax: 74 } },
    { id: 'barrier-agv-east', kind: 'AGV_BARRIER', bounds: { xMin: 23.5, xMax: 24, zMin: 13, zMax: 74 } },
    { id: 'barrier-amr-south', kind: 'AMR_BARRIER', bounds: { xMin: 25, xMax: 80, zMin: 12, zMax: 12.4 } },
    { id: 'barrier-amr-north', kind: 'AMR_BARRIER', bounds: { xMin: 25, xMax: 80, zMin: 14.6, zMax: 15 } },
  ],
  cameras: [{ id: 'CUST-CAM-01', position: [52, 77], heightM: 4.5, headingRad: Math.PI, monitorsBarrierId: 'customs-fence-north' }],
  conveyors: [
    { id: 'CV-TRUCK-01', zoneId: 'zone-truck-01-conveyor', bounds: { xMin: 87, xMax: 92, zMin: 70, zMax: 72 }, direction: 'X' },
    { id: 'CV-TRUCK-02', zoneId: 'zone-truck-02-conveyor', bounds: { xMin: 87, xMax: 92, zMin: 56, zMax: 58 }, direction: 'X' },
    { id: 'CV-CONTAINER-01', zoneId: 'zone-container-01-conveyor', bounds: { xMin: 87, xMax: 92, zMin: 18, zMax: 20 }, direction: 'X' },
    { id: 'CV-OUTBOUND-01', zoneId: 'zone-outbound-conveyor', bounds: { xMin: 12, xMax: 18, zMin: 39, zMax: 41 }, direction: 'X' },
  ],
  flowNodes: [
    { id: 'truck-01-receive', zoneId: 'zone-truck-01-staging', position: [106, 71], action: 'RECEIVE' }, { id: 'truck-01-stage-1', zoneId: 'zone-truck-01-staging', position: [101, 71], action: 'STAGE' }, { id: 'truck-01-inspect', zoneId: 'zone-truck-01-inspection', position: [95, 71], action: 'INSPECT' }, { id: 'truck-01-qc', zoneId: 'zone-truck-01-conveyor', position: [89, 71], action: 'QC' }, { id: 'truck-01-stage-2', zoneId: 'zone-truck-01-staging-2', position: [84, 71], action: 'STAGE' }, { id: 'truck-01-handoff', zoneId: 'zone-main-storage', position: [81, 66], action: 'HANDOFF' }, { id: 'truck-01-store', zoneId: 'zone-main-storage', position: [68, 63.8], action: 'STORE' },
    { id: 'truck-02-receive', zoneId: 'zone-truck-02-staging', position: [106, 57], action: 'RECEIVE' }, { id: 'truck-02-stage-1', zoneId: 'zone-truck-02-staging', position: [101, 57], action: 'STAGE' }, { id: 'truck-02-inspect', zoneId: 'zone-truck-02-inspection', position: [95, 57], action: 'INSPECT' }, { id: 'truck-02-qc', zoneId: 'zone-truck-02-conveyor', position: [89, 57], action: 'QC' }, { id: 'truck-02-stage-2', zoneId: 'zone-truck-02-staging-2', position: [84, 57], action: 'STAGE' }, { id: 'truck-02-handoff', zoneId: 'zone-main-storage', position: [81, 53], action: 'HANDOFF' }, { id: 'truck-02-store', zoneId: 'zone-main-storage', position: [68, 51], action: 'STORE' },
    { id: 'container-receive', zoneId: 'zone-container-01-staging', position: [106, 19], action: 'RECEIVE' }, { id: 'container-stage-1', zoneId: 'zone-container-01-staging', position: [101, 19], action: 'STAGE' }, { id: 'container-inspect', zoneId: 'zone-container-01-inspection', position: [95, 19], action: 'INSPECT' }, { id: 'container-qc', zoneId: 'zone-container-01-conveyor', position: [89, 19], action: 'QC' }, { id: 'container-stage-2', zoneId: 'zone-container-01-staging-2', position: [84, 19], action: 'STAGE' }, { id: 'container-handoff', zoneId: 'zone-main-storage', position: [81, 19], action: 'HANDOFF' }, { id: 'container-store', zoneId: 'zone-main-storage', position: [68, 19], action: 'STORE' },
    { id: 'outbound-pick', zoneId: 'zone-outbound-pick', position: [23, 40], action: 'PICK' }, { id: 'outbound-qc', zoneId: 'zone-outbound-conveyor', position: [15, 40], action: 'QC' }, { id: 'outbound-dispatch', zoneId: 'zone-outbound-dispatch', position: [6, 40], action: 'DISPATCH' }, { id: 'outbound-handoff', zoneId: 'zone-internal-handoff', position: [1, 40], action: 'INTERNAL_HANDOFF' },
  ],
  flows: [
    { id: 'INBOUND_TRUCK_01_FLOW', name: 'Truck 01 to Storage', nodeIds: ['truck-01-receive', 'truck-01-stage-1', 'truck-01-inspect', 'truck-01-qc', 'truck-01-stage-2', 'truck-01-handoff', 'truck-01-store'] },
    { id: 'INBOUND_TRUCK_02_FLOW', name: 'Truck 02 to Storage', nodeIds: ['truck-02-receive', 'truck-02-stage-1', 'truck-02-inspect', 'truck-02-qc', 'truck-02-stage-2', 'truck-02-handoff', 'truck-02-store'] },
    { id: 'INBOUND_CONTAINER_01_FLOW', name: 'Container to Storage', nodeIds: ['container-receive', 'container-stage-1', 'container-inspect', 'container-qc', 'container-stage-2', 'container-handoff', 'container-store'] },
    { id: 'OUTBOUND_FLOW', name: 'Storage to Internal Warehouse', nodeIds: ['outbound-pick', 'outbound-qc', 'outbound-dispatch', 'outbound-handoff'] },
  ],
  travelLanes: [
    { id: 'lane-agv-dedicated', name: 'AGV Dedicated Line', vehicleModes: ['AGV'], directed: true, widthM: 2, points: [[22.25, 73], [22.25, 45.25]] },
    { id: 'lane-amr-dedicated', name: 'AMR Dedicated Map Lane', vehicleModes: ['AMR'], directed: false, widthM: 2, points: [[26, 13.5], [79, 13.5]] },
  ],
  putawayBands: [
    { id: 'putaway-fast', movementClass: 'FAST_MOVING', bounds: { xMin: 27, xMax: 80, zMin: 30, zMax: 56 }, priority: 1 },
    { id: 'putaway-slow-south', movementClass: 'SLOW_MOVING', bounds: { xMin: 27, xMax: 80, zMin: 16, zMax: 30 }, priority: 2 },
    { id: 'putaway-slow-north', movementClass: 'SLOW_MOVING', bounds: { xMin: 27, xMax: 80, zMin: 56, zMax: 67 }, priority: 3 },
  ],
  docks: [
    { id: 'dock-truck-01', gateId: 'gate-truck-01', zoneId: 'zone-truck-01-staging', kind: 'INBOUND', bounds: { xMin: 108, xMax: 110, zMin: 68, zMax: 74 } },
    { id: 'dock-truck-02', gateId: 'gate-truck-02', zoneId: 'zone-truck-02-staging', kind: 'INBOUND', bounds: { xMin: 108, xMax: 110, zMin: 54, zMax: 60 } },
    { id: 'dock-container-01', gateId: 'gate-container-01', zoneId: 'zone-container-01-staging', kind: 'INBOUND', bounds: { xMin: 108, xMax: 110, zMin: 16, zMax: 22 } },
    { id: 'dock-outbound-west', gateId: 'gate-outbound-west', zoneId: 'zone-internal-handoff', kind: 'OUTBOUND', bounds: { xMin: 0, xMax: 2.5, zMin: 35, zMax: 45 } },
  ],
  roads: [{ id: 'road-external-south', name: 'TLIP External South Road', widthM: 6, points: [[0, 2], [110, 2]] }],
  walkways: [{ id: 'walkway-office-storage', name: 'Office to Storage Walkway', widthM: 1.5, points: [[24, 12], [84, 12]] }],
  restrictedAreas: [{ id: 'restricted-customs-fence', name: 'Customs Separation Buffer', reason: 'Prevent mixing domestic and international inventory', bounds: { xMin: 21.5, xMax: 82.5, zMin: 75.9, zMax: 77.1 } }],
  cameraPresets: [
    { id: 'camera-overview', name: 'Warehouse Overview', position: [55, 115, 45], target: [55, 0, 45], hideRoof: true },
    { id: 'camera-inbound', name: 'Inbound Cells', position: [105, 28, 45], target: [91, 0, 45], hideRoof: true },
    { id: 'camera-storage', name: 'Main Storage', position: [54, 42, 42], target: [54, 0, 42], hideRoof: true },
    { id: 'camera-outbound', name: 'Outbound West', position: [10, 28, 42], target: [15, 0, 40], hideRoof: true },
  ],
  operationalCells: [
    { id: 'cell-inbound-truck-01', kind: 'INBOUND', gateId: 'gate-truck-01', zoneIds: ['zone-truck-01-staging', 'zone-truck-01-inspection', 'zone-truck-01-conveyor', 'zone-truck-01-staging-2'], conveyorId: 'CV-TRUCK-01', flowId: 'INBOUND_TRUCK_01_FLOW' },
    { id: 'cell-inbound-truck-02', kind: 'INBOUND', gateId: 'gate-truck-02', zoneIds: ['zone-truck-02-staging', 'zone-truck-02-inspection', 'zone-truck-02-conveyor', 'zone-truck-02-staging-2'], conveyorId: 'CV-TRUCK-02', flowId: 'INBOUND_TRUCK_02_FLOW' },
    { id: 'cell-inbound-container-01', kind: 'INBOUND', gateId: 'gate-container-01', zoneIds: ['zone-container-01-staging', 'zone-container-01-inspection', 'zone-container-01-conveyor', 'zone-container-01-staging-2'], conveyorId: 'CV-CONTAINER-01', flowId: 'INBOUND_CONTAINER_01_FLOW' },
    { id: 'cell-outbound-west', kind: 'OUTBOUND', zoneIds: ['zone-outbound-pick', 'zone-outbound-conveyor', 'zone-outbound-dispatch', 'zone-internal-handoff'], conveyorId: 'CV-OUTBOUND-01', flowId: 'OUTBOUND_FLOW' },
  ],
  forkliftWorkCells: [
    { id: 'forklift-storage-west', zoneId: 'zone-main-storage', barrierIds: ['barrier-forklift-storage-west', 'barrier-forklift-storage-east'], maximumForklifts: 1 },
    { id: 'forklift-truck-01', zoneId: 'zone-truck-01-staging-2', barrierIds: ['barrier-forklift-truck-01-north', 'barrier-forklift-truck-01-south'], maximumForklifts: 1 },
    { id: 'forklift-truck-02', zoneId: 'zone-truck-02-staging-2', barrierIds: ['barrier-forklift-truck-02-north', 'barrier-forklift-truck-02-south'], maximumForklifts: 1 },
    { id: 'forklift-container-01', zoneId: 'zone-container-01-staging-2', barrierIds: ['barrier-forklift-container-01-north', 'barrier-forklift-container-01-south'], maximumForklifts: 1 },
    { id: 'forklift-outbound-west', zoneId: 'zone-outbound-pick', barrierIds: ['barrier-forklift-outbound-north', 'barrier-forklift-outbound-south'], maximumForklifts: 1 },
  ],
  assumptions: ['Warehouse footprint remains 110 m × 90 m until CAD dimensions are available.', 'Vehicle counts are not modeled in this slice; only the one-forklift-per-zone limit and separated corridors are represented.', 'Exact barrier offsets and door widths remain provisional pending onsite dimensions.'],
}
