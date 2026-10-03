import React, { useEffect, useMemo, useState } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import { AWS_GROUND_MODULE, createEnvironmentTiles } from '../../data/aws-environment-layout'
import { useStore } from '../../state/store'
import { loadAwsEnvironmentAsset } from './aws-asset-library'

const warehouse = DENSO_LAYOUT_V1.warehouse
const tiles = createEnvironmentTiles(warehouse)

function composeTiles(template: THREE.Group, kind: 'ground' | 'roof') {
  const group = new THREE.Group()
  group.name = kind === 'ground' ? 'AwsGroundTiles' : 'AwsRoofTiles'
  const size = new THREE.Box3().setFromObject(template).getSize(new THREE.Vector3())
  // Correct <0.1% authored ground/roof size differences so their seams align.
  // Last-row/column geometry is clipped, not stretched to fit the footprint.
  const scaleX = AWS_GROUND_MODULE.widthM / size.x
  const scaleZ = AWS_GROUND_MODULE.depthM / size.z
  for (const tile of tiles) {
    const clone = template.clone(true)
    clone.name = `${kind}:${tile.id}`
    clone.scale.set(scaleX, 1, scaleZ)
    clone.position.set(tile.center[0], kind === 'roof' ? warehouse.heightM : 0, tile.center[1])
    group.add(clone)
  }
  const clips = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), warehouse.widthM),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), warehouse.depthM),
  ]
  // Shared source templates stay immutable; one clipped material copy per source
  // material is shared by all tiles in this composition.
  const materialCopies = new Map<THREE.Material, THREE.Material>()
  group.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return
    const copy = (source: THREE.Material) => {
      let material = materialCopies.get(source)
      if (!material) {
        material = source.clone()
        material.clippingPlanes = clips
        materialCopies.set(source, material)
      }
      return material
    }
    child.material = Array.isArray(child.material) ? child.material.map(copy) : copy(child.material)
  })
  return group
}

export const AwsEnvironmentAssets: React.FC = () => {
  const roof = useStore(state => state.layers.roof)
  const [assets, setAssets] = useState<THREE.Group[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setError(null)
    Promise.all(['ground', 'roof'].map(kind => loadAwsEnvironmentAsset(kind as 'ground' | 'roof')))
      .then(result => { if (active) setAssets(result) })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : String(reason)) })
    return () => { active = false }
  }, [attempt])

  const environment = useMemo(() => {
    if (!assets) return null
    return { floor: composeTiles(assets[0], 'ground'), roof: composeTiles(assets[1], 'roof') }
  }, [assets])

  // Dispose only composition-owned material copies; cached asset templates are
  // shared across StrictMode remounts and must not be disposed by primitives.
  useEffect(() => () => {
    if (!environment) return
    const materials = new Set<THREE.Material>()
    for (const root of [environment.floor, environment.roof]) root.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const list = Array.isArray(child.material) ? child.material : [child.material]
        list.forEach(material => materials.add(material))
      }
    })
    materials.forEach(material => material.dispose())
  }, [environment])

  if (!environment) return (
    <Html center position={[warehouse.widthM / 2, 0, warehouse.depthM / 2]}>
      <div className="asset-status" role={error ? 'alert' : 'status'}>
        {error ? 'Không tải được môi trường AWS.' : 'Đang tải sàn và mái AWS…'}
        {error && <><small>{error}</small><button onClick={() => setAttempt(value => value + 1)}>Thử lại</button></>}
      </div>
    </Html>
  )
  return (
    <group name="AwsEnvironmentAssets" dispose={null}>
      <primitive object={environment.floor} />
      <primitive object={environment.roof} visible={roof} />
    </group>
  )
}
