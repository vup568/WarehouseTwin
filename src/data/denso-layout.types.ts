export type Vec2 = readonly [x: number, z: number]

export interface Rect2D {
  xMin: number
  xMax: number
  zMin: number
  zMax: number
}

export type ZoneKind =
  | 'LOADING_OUTBOUND'
  | 'INBOUND_RECEIVE'
  | 'INBOUND_STAGING'
  | 'INBOUND_INSPECTION'
  | 'INBOUND_CONVEYOR_QC'
  | 'TRANSFER_STAGING'
  | 'OUTBOUND_PICK'
  | 'OUTBOUND_CONVEYOR_QC'
  | 'OUTBOUND_DISPATCH_STAGING'
  | 'INTERNAL_HANDOFF'
  | 'MAIN_STORAGE'
  | 'DOMESTIC'
  | 'INTERNATIONAL'
  | 'OFFICE_SUPPORT'

export interface WarehouseZone {
  id: string
  kind: ZoneKind
  name: string
  bounds: Rect2D
  parentZoneId?: string
}

export interface WarehouseEnvelope {
  widthM: number
  depthM: number
  heightM: number
  approximateAreaM2: number
}

export interface WarehouseGate {
  id: string
  kind: 'IN' | 'OUT'
  label: string
  position: Vec2
  headingRad: number
}

export type RackFace = 'FR' | 'BK'
export type MovementClass = 'FAST_MOVING' | 'SLOW_MOVING'

export interface RackBlock {
  id: string
  zoneId: string
  center: Vec2
  orientation: 'X' | 'Z'
  faces: 2
  levels: 6 | 7
  binsPerLevel: 10
  binWidthM: number
  levelPitchM: number
  rackDepthM: number
  palletCapacityPerBin: 1
  palletPositionCount: number
  operationalReferenceCapacity: number
  movementClass: MovementClass
}

export interface BinAddress {
  id: string
  rackId: string
  face: RackFace
  level: number
  bin: number
  palletCapacity: 1
  occupiedPallets: 0 | 1
  skuId: string | null
  movementClass: MovementClass
}

export interface PalletSpec {
  widthM: number
  depthM: number
  lowHeightM: number
  targetGapM: number
}

export interface FixedBarrier {
  id: string
  kind: 'CUSTOMS_FENCE' | 'FORKLIFT_BARRIER' | 'AGV_BARRIER' | 'AMR_BARRIER'
  bounds: Rect2D
  northZoneId?: string
  southZoneId?: string
}

export interface CameraFixture {
  id: string
  position: Vec2
  heightM: number
  headingRad: number
  monitorsBarrierId?: string
}

export interface ConveyorFixture {
  id: string
  zoneId: string
  bounds: Rect2D
  direction: 'X' | 'Z'
}

export interface FlowNode {
  id: string
  zoneId: string
  position: Vec2
  action: 'RECEIVE' | 'STAGE' | 'INSPECT' | 'QC' | 'HANDOFF' | 'STORE' | 'PICK' | 'DISPATCH' | 'INTERNAL_HANDOFF'
}

export interface WarehouseFlow {
  id: string
  name: string
  nodeIds: readonly string[]
}

export interface TravelLane {
  id: string
  name: string
  vehicleModes: readonly ('AGV' | 'AMR' | 'FORKLIFT')[]
  directed: boolean
  widthM: number
  points: readonly Vec2[]
}

export interface OperationalCell {
  id: string
  kind: 'INBOUND' | 'OUTBOUND'
  gateId?: string
  zoneIds: readonly string[]
  conveyorId: string
  flowId: string
}

export interface ForkliftWorkCell {
  id: string
  zoneId: string
  barrierIds: readonly string[]
  maximumForklifts: 1
}

export interface PutawayBand {
  id: string
  movementClass: MovementClass
  bounds: Rect2D
  priority: number
}

export interface LoadingDock {
  id: string
  gateId: string
  zoneId: string
  kind: 'INBOUND' | 'OUTBOUND'
  bounds: Rect2D
}

export interface RoadSegment {
  id: string
  name: string
  widthM: number
  points: readonly Vec2[]
}

export interface PedestrianWalkway {
  id: string
  name: string
  widthM: number
  points: readonly Vec2[]
}

export interface RestrictedArea {
  id: string
  name: string
  reason: string
  bounds: Rect2D
}

export interface CameraPreset {
  id: string
  name: string
  position: readonly [x: number, y: number, z: number]
  target: readonly [x: number, y: number, z: number]
  hideRoof: boolean
}

export interface DensoLayout {
  schemaVersion: '0.1.0' | '0.2.0'
  id: 'denso-tlip-external-warehouse-v0' | 'denso-tlip-external-warehouse-v1'
  units: 'm'
  coordinateSystem: {
    origin: 'SOUTH_WEST'
    xAxis: 'EAST'
    zAxis: 'NORTH'
  }
  warehouse: WarehouseEnvelope
  pallet: PalletSpec
  zones: readonly WarehouseZone[]
  gates: readonly WarehouseGate[]
  rackBlocks: readonly RackBlock[]
  barriers: readonly FixedBarrier[]
  cameras: readonly CameraFixture[]
  conveyors: readonly ConveyorFixture[]
  flowNodes: readonly FlowNode[]
  flows: readonly WarehouseFlow[]
  travelLanes: readonly TravelLane[]
  putawayBands: readonly PutawayBand[]
  docks: readonly LoadingDock[]
  roads: readonly RoadSegment[]
  walkways: readonly PedestrianWalkway[]
  restrictedAreas: readonly RestrictedArea[]
  cameraPresets: readonly CameraPreset[]
  operationalCells?: readonly OperationalCell[]
  forkliftWorkCells?: readonly ForkliftWorkCell[]
  assumptions: readonly string[]
}

export interface LayoutValidationResult {
  valid: boolean
  errors: readonly string[]
}
