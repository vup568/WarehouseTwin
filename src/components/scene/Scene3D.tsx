import React, { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { AwsEnvironmentAssets } from './AwsEnvironmentAssets'
import { AwsWarehouseLighting } from './AwsWarehouseLighting'
import { DensoFloorMarkings } from './DensoFloorMarkings'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import { createEnvironmentCamera } from '../../data/aws-environment-layout'
import { DensoRackInstances } from './DensoRackInstances'
import { DensoPalletInstances } from './DensoPalletInstances'
import { DensoOperationalCells } from './DensoOperationalCells'
import { SafetyBarrierComponent } from './DensoSafetyBarriers'
import { ForkliftWorkCellComponent } from './DensoForkliftWorkCells'
import { useStore } from '../../state/store'

function CameraController() {
  const focusTarget = useStore((s) => s.focusTarget)
  const presetId = useStore((s) => s.cameraPresetId)
  const { controls, camera } = useThree()

  useEffect(() => {
    const preset = DENSO_LAYOUT_V1.cameraPresets.find(item => item.id === presetId)
    if (!preset || !controls) return
    camera.position.set(...preset.position)
    // @ts-ignore OrbitControls extends the generic R3F controls contract.
    controls.target.set(...preset.target)
    // @ts-ignore
    controls.update()
    // Roof visibility remains entirely manual, regardless of preset.hideRoof.
  }, [presetId, controls, camera])

  useEffect(() => {
    if (focusTarget && controls) {
      // @ts-ignore
      controls.target.set(focusTarget[0], 0.5, focusTarget[2])
      // @ts-ignore
      controls.update()
    }
  }, [focusTarget, controls])

  return null
}

export const Scene3D: React.FC = () => {
  const lightingMode = useStore((s) => s.lightingMode)

  const isDay = lightingMode === 'day'
  const cameraConfig = createEnvironmentCamera(DENSO_LAYOUT_V1.warehouse)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: cameraConfig.position, fov: 48, near: 0.1, far: cameraConfig.far }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          localClippingEnabled: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isDay ? 1.05 : 1.1
        }}
        style={{ width: '100%', height: '100%', background: isDay ? '#0f172a' : '#070b14' }}
      >
        {/* No distance fog: readable overview is an explicit Step A requirement. */}
        <color attach="background" args={[isDay ? '#0f172a' : '#070b14']} />

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={2}
          maxDistance={cameraConfig.maxDistance}
          target={cameraConfig.target}
        />

        <CameraController />

        <AwsWarehouseLighting />
        <AwsEnvironmentAssets />
        <DensoFloorMarkings />
        <DensoRackInstances />
        <DensoPalletInstances />
        <DensoOperationalCells />
        <SafetyBarrierComponent />
        <ForkliftWorkCellComponent />
      </Canvas>
    </div>
  )
}
