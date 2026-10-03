import React, { useMemo } from 'react'
import * as THREE from 'three'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import { createDemoInventory, validateDemoInventory } from '../../data/denso-demo-inventory'
import { useStore } from '../../state/store'
import { INDUSTRIAL_RACK_SLOTS } from '../../data/denso-industrial-racks'
import type { RackMember, RackSlot } from './industrial-rack-geometry'
import { InstancedRackParts } from './InstancedRackParts'

export const DensoPalletInstances: React.FC = () => {
  const visible = useStore(state => state.layers.cargo)
  const seed = useStore(state => state.cargoSeed)
  const parts = useMemo(() => {
    const records = createDemoInventory(INDUSTRIAL_RACK_SLOTS, seed)
    const errors = validateDemoInventory(INDUSTRIAL_RACK_SLOTS, records)
    if (errors.length) throw new Error(errors.join('; '))
    const byId = new Map(INDUSTRIAL_RACK_SLOTS.map(slot => [slot.id, slot]))
    const wood: RackMember[] = [], boxes: RackMember[] = [], tape: RackMember[] = []
    function add(target: RackMember[], slot: RackSlot, position: [number, number, number], size: [number, number, number]) {
      const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), slot.rotationY)
      const point = new THREE.Vector3(...position).applyQuaternion(rotation).add(new THREE.Vector3(...slot.position))
      target.push({ position: point.toArray() as [number, number, number], size,
        quaternion: rotation.toArray() as [number, number, number, number] })
    }
    const { widthM: width, depthM: depth, lowHeightM: totalHeight } = DENSO_LAYOUT_V1.pallet
    for (const record of records) {
      const slot = byId.get(record.binId)!
      for (const x of [-width * 0.4, 0, width * 0.4]) {
        add(wood, slot, [x, 0.01, 0], [0.10, 0.02, depth])
        add(wood, slot, [x, 0.06, 0], [0.08, 0.08, depth])
      }
      for (let board = 0; board < 7; board++) {
        add(wood, slot, [0, 0.11, -depth / 2 + (board + 0.5) * depth / 7], [width, 0.02, depth / 7 - 0.012])
      }
      const boxHeight = totalHeight - 0.12
      add(boxes, slot, [0, 0.12 + boxHeight / 2, 0], [width - 0.08, boxHeight, depth - 0.08])
      add(tape, slot, [0, totalHeight + 0.002, 0], [0.045, 0.004, depth - 0.08])
    }
    return { wood, boxes, tape, count: records.length }
  }, [seed])
  return <group name="DensoPalletInstances" visible={visible} userData={{ occupiedBins: parts.count }}>
    <InstancedRackParts name="Cargo:woodenPallets" parts={parts.wood} color="#98744c" metalness={0} roughness={0.88} />
    <InstancedRackParts name="Cargo:boxes" parts={parts.boxes} color="#b89a70" metalness={0} roughness={0.9} />
    <InstancedRackParts name="Cargo:tape" parts={parts.tape} color="#d7bf92" metalness={0} castShadow={false} />
  </group>
}
