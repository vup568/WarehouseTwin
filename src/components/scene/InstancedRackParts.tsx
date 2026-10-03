import React, { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { RackMember } from './industrial-rack-geometry'

export const InstancedRackParts: React.FC<{
  name: string; parts: readonly RackMember[]; color: string; geometry?: THREE.BufferGeometry;
  metalness?: number; roughness?: number; castShadow?: boolean;
}> = ({ name, parts, color, geometry, metalness = 0.65, roughness = 0.55, castShadow = true }) => {
  const mesh = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4()
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index]
      matrix.compose(new THREE.Vector3(...part.position), new THREE.Quaternion(...part.quaternion), new THREE.Vector3(...part.size))
      mesh.current.setMatrixAt(index, matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingBox()
    mesh.current.computeBoundingSphere()
  }, [parts])
  return <instancedMesh name={name} ref={mesh} args={[geometry, undefined, parts.length]} castShadow={castShadow} receiveShadow>
    {!geometry && <boxGeometry args={[1, 1, 1]} />}
    <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
  </instancedMesh>
}
