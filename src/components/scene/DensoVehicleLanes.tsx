import React, { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import { useStore } from '../../state/store'

const modeColors = { AGV: '#2563eb', AMR: '#16a34a', FORKLIFT: '#f97316' } as const

export const AgvLaneComponent: React.FC<{ points: readonly (readonly [number, number])[] }> = ({ points }) => {
  const vertices = useMemo(() => points.map(([x, z]) => new THREE.Vector3(x, 0.08, z)), [points])
  return <Line points={vertices} color={modeColors.AGV} lineWidth={3} dashed dashSize={1.2} gapSize={0.55} />
}

export const AmrLaneComponent: React.FC<{ points: readonly (readonly [number, number])[] }> = ({ points }) => {
  const vertices = useMemo(() => points.map(([x, z]) => new THREE.Vector3(x, 0.1, z)), [points])
  return <Line points={vertices} color={modeColors.AMR} lineWidth={3} dashed dashSize={1.2} gapSize={0.55} />
}

export const DensoVehicleLanes: React.FC = () => {
  const showAgv = useStore((state) => state.layers.agv)
  const showAmr = useStore((state) => state.layers.amr)
  return (
    <group name="DensoVehicleLaneComponents">
      {DENSO_LAYOUT_V1.travelLanes.map((lane) => lane.vehicleModes[0] === 'AGV'
        ? showAgv && <AgvLaneComponent key={lane.id} points={lane.points} />
        : showAmr && <AmrLaneComponent key={lane.id} points={lane.points} />)}
    </group>
  )
}

export default DensoVehicleLanes
