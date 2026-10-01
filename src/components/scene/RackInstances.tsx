import React, { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { RACK_LAYOUT, RackData } from '../../data/rack_layout'
import { mulberry32 } from '../../simulation/engine'
import { useStore } from '../../state/store'

export const RackInstances: React.FC = () => {
  const layers = useStore((s) => s.layers)
  const cargoSeed = useStore((s) => s.cargoSeed)

  const postMeshRef = useRef<THREE.InstancedMesh>(null!)
  const beamMeshRef = useRef<THREE.InstancedMesh>(null!)
  const boxMeshRef = useRef<THREE.InstancedMesh>(null!)

  // Compute transformation matrices for Posts, Beams, and Cargo Boxes
  const { postMatrices, beamMatrices, boxMatrices, boxColors, totalSlots, occupiedCount } = useMemo(() => {
    const postMats: THREE.Matrix4[] = []
    const beamMats: THREE.Matrix4[] = []
    const boxMats: THREE.Matrix4[] = []
    const colors: THREE.Color[] = []

    const rng = mulberry32(cargoSeed)
    const dummy = new THREE.Object3D()

    // Realistic warehouse box palette
    const boxPalette = [
      new THREE.Color('#d97706'), // Kraft amber
      new THREE.Color('#b45309'), // Deep cardboard
      new THREE.Color('#92400e'), // Dark carton
      new THREE.Color('#78350f'), // Wood pallet brown
      new THREE.Color('#0284c7'), // Logistics blue crate
    ]

    let slotsTotal = 0
    let occupied = 0

    RACK_LAYOUT.forEach((rack: RackData) => {
      const [rackLen, rackH, rackW] = rack.size
      const [rx, ry, rz] = rack.position
      const levels = rack.levels
      const bays = rack.bays
      const bayLen = rackLen / bays
      const tierH = (rackH - 0.2) / levels

      // 1. Upright Posts (4 corner columns + center uprights for each bay)
      const postThickness = 0.08
      for (let i = 0; i <= bays; i++) {
        const xOffset = -rackLen / 2 + i * bayLen
        for (const zSign of [-1, 1]) {
          const zOffset = (zSign * (rackW - postThickness)) / 2
          dummy.position.set(rx + xOffset, ry + rackH / 2, rz + zOffset)
          dummy.rotation.set(0, rack.rotation, 0)
          dummy.scale.set(postThickness, rackH, postThickness)
          dummy.updateMatrix()
          postMats.push(dummy.matrix.clone())
        }
      }

      // 2. Beams at each level (front + back longitudinal beams + cross braces)
      const beamHeight = 0.07
      const beamDepth = 0.05
      for (let l = 1; l <= levels; l++) {
        const yLevel = ry + l * tierH

        // Front & Back beams
        for (const zSign of [-1, 1]) {
          const zOffset = (zSign * (rackW - beamDepth)) / 2
          dummy.position.set(rx, yLevel, rz + zOffset)
          dummy.rotation.set(0, rack.rotation, 0)
          dummy.scale.set(rackLen, beamHeight, beamDepth)
          dummy.updateMatrix()
          beamMats.push(dummy.matrix.clone())
        }

        // Side cross bars at each upright
        for (let i = 0; i <= bays; i++) {
          const xOffset = -rackLen / 2 + i * bayLen
          dummy.position.set(rx + xOffset, yLevel, rz)
          dummy.rotation.set(0, rack.rotation, 0)
          dummy.scale.set(postThickness, beamHeight * 0.8, rackW - beamDepth * 2)
          dummy.updateMatrix()
          beamMats.push(dummy.matrix.clone())
        }

        // 3. Cargo Boxes on this level
        // Each bay holds 2 pallets
        for (let b = 0; b < bays; b++) {
          for (let p = 0; p < 2; p++) {
            slotsTotal++
            // ~75% chance slot is occupied with cargo
            const isOccupied = rng() < 0.75
            if (!isOccupied) continue

            occupied++
            const slotX = -rackLen / 2 + b * bayLen + (p + 0.5) * (bayLen / 2)
            const boxW = 0.7 + (rng() - 0.5) * 0.15
            const boxH = 0.45 + (rng() - 0.5) * 0.1
            const boxD = 0.85 + (rng() - 0.5) * 0.1

            dummy.position.set(rx + slotX, yLevel + boxH / 2 + beamHeight / 2, rz)
            dummy.rotation.set(0, rack.rotation + (rng() - 0.5) * 0.08, 0)
            dummy.scale.set(boxW, boxH, boxD)
            dummy.updateMatrix()

            boxMats.push(dummy.matrix.clone())
            const chosenColor = boxPalette[Math.floor(rng() * boxPalette.length)]
            colors.push(chosenColor)
          }
        }
      }
    })

    return {
      postMatrices: postMats,
      beamMatrices: beamMats,
      boxMatrices: boxMats,
      boxColors: colors,
      totalSlots: slotsTotal,
      occupiedCount: occupied,
    }
  }, [cargoSeed])

  // Apply instance matrices
  useLayoutEffect(() => {
    if (postMeshRef.current) {
      postMatrices.forEach((mat, i) => postMeshRef.current.setMatrixAt(i, mat))
      postMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (beamMeshRef.current) {
      beamMatrices.forEach((mat, i) => beamMeshRef.current.setMatrixAt(i, mat))
      beamMeshRef.current.instanceMatrix.needsUpdate = true
    }
    if (boxMeshRef.current) {
      boxMatrices.forEach((mat, i) => {
        boxMeshRef.current.setMatrixAt(i, mat)
        boxMeshRef.current.setColorAt(i, boxColors[i])
      })
      boxMeshRef.current.instanceMatrix.needsUpdate = true
      if (boxMeshRef.current.instanceColor) {
        boxMeshRef.current.instanceColor.needsUpdate = true
      }
    }
  }, [postMatrices, beamMatrices, boxMatrices, boxColors])

  if (!layers.racks) return null

  return (
    <group name="ProceduralRacks">
      {/* 1. Structural Upright Posts (Dark Industrial Steel) */}
      <instancedMesh
        ref={postMeshRef}
        args={[undefined, undefined, postMatrices.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.7}
          roughness={0.4}
        />
      </instancedMesh>

      {/* 2. Load-Bearing Beams (Safety Orange) */}
      <instancedMesh
        ref={beamMeshRef}
        args={[undefined, undefined, beamMatrices.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ea580c"
          metalness={0.4}
          roughness={0.3}
        />
      </instancedMesh>

      {/* 3. Independent Cargo Boxes (Toggled via layers.cargo) */}
      <instancedMesh
        ref={boxMeshRef}
        args={[undefined, undefined, boxMatrices.length]}
        visible={layers.cargo}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          metalness={0.1}
          roughness={0.8}
        />
      </instancedMesh>
    </group>
  )
}
