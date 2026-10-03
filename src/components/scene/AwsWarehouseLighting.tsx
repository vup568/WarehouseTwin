import React, { useMemo } from 'react'
import * as THREE from 'three'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import { useStore } from '../../state/store'

const warehouse = DENSO_LAYOUT_V1.warehouse

export const AwsWarehouseLighting: React.FC = () => {
  const day = useStore(state => state.lightingMode === 'day')
  const target = useMemo(() => {
    const object = new THREE.Object3D()
    object.position.set(warehouse.widthM / 2, 0, warehouse.depthM / 2)
    return object
  }, [])
  const shadowExtent = Math.hypot(warehouse.widthM, warehouse.depthM) / 2
  return <group name="AwsWarehouseLighting">
    {/* Base fill stays distance-independent for a readable review in both modes. */}
    <ambientLight color={day ? '#ffffff' : '#dce5ef'} intensity={day ? 1.1 : 0.85} />
    <hemisphereLight color="#edf4ff" groundColor="#87877d" intensity={day ? 1.2 : 0.85} />
    <primitive object={target} />
    {/* One shadow map covers the warehouse. Roof uses no shadows so toggling it
        cannot black out the environment when the user is inspecting inside. */}
    <directionalLight position={[warehouse.widthM / 2 + 30, 100, warehouse.depthM / 2 + 30]}
      target={target} color={day ? '#fff9ec' : '#d6e4f3'} intensity={day ? 1.6 : 0.85}
      castShadow shadow-mapSize={[2048, 2048]} shadow-camera-near={0.5}
      shadow-camera-far={200} shadow-camera-left={-shadowExtent} shadow-camera-right={shadowExtent}
      shadow-camera-top={shadowExtent} shadow-camera-bottom={-shadowExtent}
      shadow-bias={-0.0002} shadow-normalBias={0.04} />
  </group>
}
