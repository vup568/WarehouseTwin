import React from 'react'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import { useStore } from '../../state/store'

const wallMaterial = <meshStandardMaterial color="#d7dde5" roughness={0.8} metalness={0.05} />

interface WallSegmentProps { x: number; z: number; width: number; depth: number; height: number }
const WallSegment: React.FC<WallSegmentProps> = ({ x, z, width, depth, height }) => (
  <mesh position={[x, height / 2, z]} castShadow>{wallMaterial}<boxGeometry args={[width, height, depth]} /></mesh>
)

export const DensoWarehouseShell: React.FC = () => {
  const layers = useStore((state) => state.layers)
  const { widthM, depthM, heightM } = DENSO_LAYOUT_V1.warehouse

  return (
    <group name="DensoWarehouseShell">
      <mesh position={[widthM / 2, -0.12, depthM / 2]} receiveShadow>
        <boxGeometry args={[widthM, 0.2, depthM]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.92} />
      </mesh>
      {layers.walls && (
        <group name="DensoWalls">
          <WallSegment x={widthM / 2} z={0} width={widthM} depth={0.25} height={heightM} />
          <WallSegment x={widthM / 2} z={depthM} width={widthM} depth={0.25} height={heightM} />
          {/* West opening: outbound transfer to the internal warehouse at Z 35–45. */}
          <WallSegment x={0} z={17.5} width={0.25} depth={35} height={heightM} />
          <WallSegment x={0} z={67.5} width={0.25} depth={45} height={heightM} />
          {/* East openings: container at Z 16–22, truck 02 at 54–60, truck 01 at 68–74. */}
          <WallSegment x={widthM} z={8} width={0.25} depth={16} height={heightM} />
          <WallSegment x={widthM} z={38} width={0.25} depth={32} height={heightM} />
          <WallSegment x={widthM} z={64} width={0.25} depth={8} height={heightM} />
          <WallSegment x={widthM} z={82} width={0.25} depth={16} height={heightM} />
          {DENSO_LAYOUT_V1.gates.map((gate) => (
            <mesh key={gate.id} position={[gate.position[0] === 0 ? 0.16 : widthM - 0.16, 1.5, gate.position[1]]}>
              <boxGeometry args={[0.12, 3, 6]} />
              <meshStandardMaterial color={gate.kind === 'IN' ? '#16a34a' : '#2563eb'} emissive={gate.kind === 'IN' ? '#14532d' : '#1e3a8a'} emissiveIntensity={0.25} />
            </mesh>
          ))}
        </group>
      )}
      {layers.roof && (
        <mesh position={[widthM / 2, heightM + 0.08, depthM / 2]} receiveShadow>
          <boxGeometry args={[widthM, 0.18, depthM]} />
          <meshStandardMaterial color="#64748b" transparent opacity={0.72} roughness={0.7} />
        </mesh>
      )}
    </group>
  )
}

export default DensoWarehouseShell
