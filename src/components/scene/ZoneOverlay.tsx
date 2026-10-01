import React, { useMemo, useState } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { WAREHOUSE_ZONES, ZoneData, ZoneStatus } from '../../data/zone_layout'
import { useStore } from '../../state/store'

interface SingleZoneProps {
  zone: ZoneData;
  status: ZoneStatus;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onCycleStatus: (id: string) => void;
}

const SingleZone: React.FC<SingleZoneProps> = ({
  zone,
  status,
  isSelected,
  onSelect,
  onCycleStatus
}) => {
  const [hovered, setHovered] = useState(false)

  // Status-driven colors
  const statusColor = useMemo(() => {
    switch (status) {
      case 'CONGESTED':
        return '#f59e0b' // Warning Orange/Amber
      case 'BLOCKED':
        return '#ef4444' // Alert Red
      default:
        return zone.color // Default zone theme color
    }
  }, [status, zone.color])

  // Boundary lines geometry
  const lineGeo = useMemo(() => {
    const [w, d] = zone.size
    const hw = w / 2
    const hd = d / 2
    const points = [
      new THREE.Vector3(-hw, 0, -hd),
      new THREE.Vector3(hw, 0, -hd),
      new THREE.Vector3(hw, 0, hd),
      new THREE.Vector3(-hw, 0, hd),
      new THREE.Vector3(-hw, 0, -hd),
    ]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [zone.size])

  const [cx, cy, cz] = zone.center
  const [w, d] = zone.size

  const fillOpacity = isSelected ? 0.35 : hovered ? 0.28 : status === 'BLOCKED' ? 0.25 : 0.14

  return (
    <group position={[cx, cy, cz]}>
      {/* 1. Floor Polygon Surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(zone.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial
          color={statusColor}
          transparent
          opacity={fillOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Perimeter Outline */}
      {/* @ts-ignore */}
      <lineLoop geometry={lineGeo} position={[0, 0.005, 0]}>
        <lineBasicMaterial
          color={isSelected ? '#ffffff' : statusColor}
          linewidth={isSelected || hovered ? 3 : 1.5}
        />
      </lineLoop>

      {/* 3. Floating 3D Zone Tag / Badge */}
      <Html
        position={[0, 0.1, 0]}
        center
        distanceFactor={22}
        zIndexRange={[100, 0]}
      >
        <div
          className={`zone-tag ${status.toLowerCase()} ${isSelected ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(zone.id)
          }}
        >
          <div className="zone-tag-header">
            <span className="zone-code-pill" style={{ borderColor: statusColor, color: statusColor }}>
              {zone.code}
            </span>
            <span className="zone-name">{zone.name}</span>
          </div>

          <div className="zone-tag-body">
            <span className="zone-type">{zone.type}</span>
            <button
              className="zone-status-btn"
              onClick={(e) => {
                e.stopPropagation()
                onCycleStatus(zone.id)
              }}
              title="Click to cycle status: NORMAL -> CONGESTED -> BLOCKED"
            >
              {status === 'NORMAL' && '🟢 NORMAL'}
              {status === 'CONGESTED' && '🟠 CONGESTED'}
              {status === 'BLOCKED' && '🔴 BLOCKED'}
            </button>
          </div>
        </div>
      </Html>
    </group>
  )
}

export const ZoneOverlay: React.FC = () => {
  const layers = useStore((s) => s.layers)
  const zoneStatuses = useStore((s) => s.zoneStatuses)
  const selectedZoneId = useStore((s) => s.selectedZoneId)
  const setSelectedZoneId = useStore((s) => s.setSelectedZoneId)
  const cycleZoneStatus = useStore((s) => s.cycleZoneStatus)

  if (!layers.zones) return null

  return (
    <group name="WarehouseZoneOverlay">
      {WAREHOUSE_ZONES.map((zone) => (
        <SingleZone
          key={zone.id}
          zone={zone}
          status={zoneStatuses[zone.id] || 'NORMAL'}
          isSelected={selectedZoneId === zone.id}
          onSelect={setSelectedZoneId}
          onCycleStatus={cycleZoneStatus}
        />
      ))}
    </group>
  )
}
