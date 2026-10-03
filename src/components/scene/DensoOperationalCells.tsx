import React from 'react'
import * as THREE from 'three'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import type { OperationalCell, WarehouseZone } from '../../data/denso-layout.types'
import { useStore } from '../../state/store'

const stageColors: Partial<Record<WarehouseZone['kind'], string>> = {
  INBOUND_STAGING: '#facc15',
  INBOUND_INSPECTION: '#ef4444',
  INBOUND_CONVEYOR_QC: '#1f2937',
  TRANSFER_STAGING: '#fb923c',
  OUTBOUND_PICK: '#f59e0b',
  OUTBOUND_CONVEYOR_QC: '#7f1d1d',
  OUTBOUND_DISPATCH_STAGING: '#fb923c',
  INTERNAL_HANDOFF: '#2563eb',
}

const zoneById = new Map(DENSO_LAYOUT_V1.zones.map((zone) => [zone.id, zone]))
const conveyorById = new Map(DENSO_LAYOUT_V1.conveyors.map((conveyor) => [conveyor.id, conveyor]))

interface StageSurfaceProps { zone: WarehouseZone }
const StageSurface: React.FC<StageSurfaceProps> = ({ zone }) => {
  const width = zone.bounds.xMax - zone.bounds.xMin
  const depth = zone.bounds.zMax - zone.bounds.zMin
  const color = stageColors[zone.kind] ?? '#94a3b8'
  return (
    <group position={[(zone.bounds.xMin + zone.bounds.xMax) / 2, 0.01, (zone.bounds.zMin + zone.bounds.zMax) / 2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, 0.05, depth)]} />
        <lineBasicMaterial color={color} />
      </lineSegments>
    </group>
  )
}

interface ConveyorComponentProps { conveyorId: string }
export const ConveyorComponent: React.FC<ConveyorComponentProps> = ({ conveyorId }) => {
  const conveyor = conveyorById.get(conveyorId)
  if (!conveyor) return null
  const width = conveyor.bounds.xMax - conveyor.bounds.xMin
  const depth = conveyor.bounds.zMax - conveyor.bounds.zMin
  return <mesh name={`Conveyor:${conveyor.id}`} position={[(conveyor.bounds.xMin + conveyor.bounds.xMax) / 2, 0.15, (conveyor.bounds.zMin + conveyor.bounds.zMax) / 2]} castShadow receiveShadow><boxGeometry args={[width, 0.3, depth]} /><meshStandardMaterial color="#111827" metalness={0.6} roughness={0.35} /></mesh>
}

interface OperationalCellProps { cell: OperationalCell; showStages: boolean }
export const InboundCellComponent: React.FC<OperationalCellProps> = ({ cell, showStages }) => (
  <group name={`InboundCell:${cell.id}`}>
    {showStages && cell.zoneIds.map((zoneId) => {
      const zone = zoneById.get(zoneId)
      return zone ? <StageSurface key={zone.id} zone={zone} /> : null
    })}
    <ConveyorComponent conveyorId={cell.conveyorId} />
  </group>
)

export const OutboundCellComponent: React.FC<OperationalCellProps> = ({ cell, showStages }) => (
  <group name={`OutboundCell:${cell.id}`}>
    {showStages && cell.zoneIds.map((zoneId) => {
      const zone = zoneById.get(zoneId)
      return zone ? <StageSurface key={zone.id} zone={zone} /> : null
    })}
    <ConveyorComponent conveyorId={cell.conveyorId} />
  </group>
)

export const DensoOperationalCells: React.FC = () => {
  const visible = useStore((state) => state.layers.zones)
  return (
    <group name="DensoOperationalCells">
      {DENSO_LAYOUT_V1.operationalCells?.map((cell) => (
        cell.kind === 'INBOUND'
          ? <InboundCellComponent key={cell.id} cell={cell} showStages={visible} />
          : <OutboundCellComponent key={cell.id} cell={cell} showStages={visible} />
      ))}
    </group>
  )
}

export default DensoOperationalCells
