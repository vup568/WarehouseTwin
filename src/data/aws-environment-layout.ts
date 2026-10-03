import type { Rect2D, WarehouseEnvelope } from './denso-layout.types.ts'

// Source sizes measured from the AWS DAE POSITION arrays (centimetres -> metres).
// ColladaLoader applies unit and Z_UP conversion; never apply those a second time.
export const AWS_ENVIRONMENT_ASSETS = {
  ground: 'aws_robomaker_warehouse_GroundB_01',
  roof: 'aws_robomaker_warehouse_RoofB_01',
} as const

// Concrete material 946568 only. The paint extends outside the concrete and
// must not set the module spacing, otherwise it leaves 1–2 cm floor seams.
export const AWS_GROUND_MODULE = { widthM: 13.98046997, depthM: 20.90666382 }
export const FLOOR_MARKING_Y = 0.018

export interface EnvironmentTile {
  id: string
  center: readonly [number, number]
  bounds: Rect2D
}

export function createEnvironmentTiles(warehouse: WarehouseEnvelope): EnvironmentTile[] {
  if (![warehouse.widthM, warehouse.depthM, warehouse.heightM].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('Warehouse dimensions must be positive finite metres')
  }
  const { widthM, depthM } = AWS_GROUND_MODULE
  const result: EnvironmentTile[] = []
  for (let column = 0; column < Math.ceil(warehouse.widthM / widthM); column++) {
    for (let row = 0; row < Math.ceil(warehouse.depthM / depthM); row++) {
      const xMin = column * widthM
      const zMin = row * depthM
      result.push({
        id: `aws-tile-${column}-${row}`,
        center: [xMin + widthM / 2, zMin + depthM / 2],
        bounds: { xMin, zMin, xMax: Math.min(xMin + widthM, warehouse.widthM), zMax: Math.min(zMin + depthM, warehouse.depthM) },
      })
    }
  }
  return result
}

export function createEnvironmentCamera(warehouse: WarehouseEnvelope) {
  const diagonal = Math.hypot(warehouse.widthM, warehouse.depthM)
  return {
    position: [warehouse.widthM * 1.02, diagonal * 0.68, warehouse.depthM * 1.28] as [number, number, number],
    target: [warehouse.widthM / 2, 0, warehouse.depthM / 2] as [number, number, number],
    maxDistance: diagonal * 1.55,
    far: diagonal * 4,
  }
}
