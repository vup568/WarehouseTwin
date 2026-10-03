import React from 'react'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import { useStore } from '../../state/store'

const zoneById = new Map(DENSO_LAYOUT_V1.zones.map((zone) => [zone.id, zone]))

/** Static, untracked forklift indicators: exactly one instance per approved work cell. */
export const ForkliftWorkCellComponent: React.FC = () => {
  const visible = useStore((state) => state.layers.barriers)
  if (!visible) return null
  return (
    <group name="ForkliftWorkCellComponents">
      {DENSO_LAYOUT_V1.forkliftWorkCells?.map((cell) => {
        const zone = zoneById.get(cell.zoneId)
        if (!zone) return null
        const x = (zone.bounds.xMin + zone.bounds.xMax) / 2
        const z = (zone.bounds.zMin + zone.bounds.zMax) / 2
        return <group key={cell.id} name={`ForkliftWorkCell:${cell.id}`} position={[x, 0.35, z]}>
          <mesh castShadow receiveShadow><boxGeometry args={[1.4, 0.7, 0.85]} /><meshStandardMaterial color="#f97316" metalness={0.45} roughness={0.42} /></mesh>
          <mesh position={[0.52, 0.5, 0]} castShadow><boxGeometry args={[0.08, 1, 0.45]} /><meshStandardMaterial color="#334155" metalness={0.65} roughness={0.3} /></mesh>
        </group>
      })}
    </group>
  )
}

export default ForkliftWorkCellComponent
