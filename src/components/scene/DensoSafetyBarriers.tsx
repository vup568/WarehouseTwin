import React from 'react'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import { useStore } from '../../state/store'

const barrierColors = { CUSTOMS_FENCE: '#dc2626', FORKLIFT_BARRIER: '#f97316', AGV_BARRIER: '#2563eb', AMR_BARRIER: '#16a34a' } as const

export const SafetyBarrierComponent: React.FC = () => {
  const visible = useStore((state) => state.layers.barriers)
  if (!visible) return null
  return (
    <group name="SafetyBarrierComponents">
      {DENSO_LAYOUT_V1.barriers.map((barrier) => {
        const width = barrier.bounds.xMax - barrier.bounds.xMin
        const depth = barrier.bounds.zMax - barrier.bounds.zMin
        const isCustoms = barrier.kind === 'CUSTOMS_FENCE'
        return <mesh key={barrier.id} name={`SafetyBarrier:${barrier.id}`} position={[(barrier.bounds.xMin + barrier.bounds.xMax) / 2, isCustoms ? 1.4 : 0.65, (barrier.bounds.zMin + barrier.bounds.zMax) / 2]} castShadow receiveShadow><boxGeometry args={[width, isCustoms ? 2.8 : 1.3, depth]} /><meshStandardMaterial color={barrierColors[barrier.kind]} metalness={0.55} roughness={0.4} /></mesh>
      })}
    </group>
  )
}

export default SafetyBarrierComponent
