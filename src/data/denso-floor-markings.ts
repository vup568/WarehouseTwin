import type { DensoLayout, Vec2 } from './denso-layout.types.ts'

export type MarkingKind = 'INBOUND' | 'OUTBOUND' | 'FORKLIFT' | 'AGV' | 'AMR'
export const MARKING_COLORS: Record<MarkingKind, string> = {
  INBOUND: '#eab308', OUTBOUND: '#a855f7', FORKLIFT: '#ea580c', AGV: '#2563eb', AMR: '#16a34a',
}
export interface FloorMarking {
  id: string
  kind: MarkingKind
  points: readonly Vec2[]
  widthM: number
  arrows?: boolean
  label?: string
}

export function createDensoFloorMarkings(layout: DensoLayout): FloorMarking[] {
  const result: FloorMarking[] = layout.travelLanes.flatMap(lane => lane.vehicleModes.map(kind => ({
    id: `${lane.id}-${kind}`, kind, points: lane.points, widthM: 0.14, arrows: lane.directed, label: kind,
  })))
  const nodeById = new Map(layout.flowNodes.map(node => [node.id, node]))
  for (const cell of layout.operationalCells ?? []) {
    const flow = layout.flows.find(flow => flow.id === cell.flowId)
    if (!flow) continue
    // Mark the processing chain only. HANDOFF/STORE endpoints in racks are not
    // vehicle routes, so connecting them would paint a false path through racks.
    const points = flow.nodeIds.flatMap(id => {
      const node = nodeById.get(id)
      return node && (cell.kind === 'OUTBOUND' || !['HANDOFF', 'STORE'].includes(node.action)) ? [node.position] : []
    })
    result.push({ id: cell.id, kind: cell.kind, points, widthM: 0.18, arrows: true,
      label: cell.kind === 'INBOUND' ? layout.gates.find(gate => gate.id === cell.gateId)?.label : 'OUTBOUND / WEST' })
  }
  for (const cell of layout.forkliftWorkCells ?? []) {
    const zone = layout.zones.find(zone => zone.id === cell.zoneId)
    if (!zone) continue
    const { xMin, xMax, zMin, zMax } = zone.bounds
    const inset = 0.4
    result.push({ id: cell.id, kind: 'FORKLIFT', widthM: 0.1, label: 'FORKLIFT',
      points: [[xMin + inset, zMin + inset], [xMax - inset, zMin + inset], [xMax - inset, zMax - inset], [xMin + inset, zMax - inset], [xMin + inset, zMin + inset]] })
  }
  return result
}
