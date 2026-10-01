import React, { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { ColladaModels } from './ColladaModels'
import { RackInstances } from './RackInstances'
import { ZoneOverlay } from './ZoneOverlay'
import { useStore } from '../../state/store'

function CameraController() {
  const focusTarget = useStore((s) => s.focusTarget)
  const { controls } = useThree()

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
  const layers = useStore((s) => s.layers)

  const isDay = lightingMode === 'day'

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [16, 14, 18], fov: 55, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isDay ? 1.3 : 1.15
        }}
        style={{ width: '100%', height: '100%', background: isDay ? '#0f172a' : '#070b14' }}
      >
        {/* Atmosphere & Fog */}
        <color attach="background" args={[isDay ? '#0f172a' : '#070b14']} />
        <fogExp2 attach="fog" args={[isDay ? '#0f172a' : '#070b14', 0.015]} />

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.02}
          minDistance={2}
          maxDistance={70}
          target={[0, 1.5, 0]}
        />

        <CameraController />

        {/* Lighting Setup */}
        <ambientLight intensity={isDay ? 1.0 : 0.7} />
        
        <directionalLight
          position={[15, 25, 12]}
          intensity={isDay ? 2.2 : 1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={60}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0005}
        />

        {/* Overhead Warehouse High-Bay Lights */}
        {layers.lights && (
          <group name="HighBayFixtures">
            <pointLight position={[0, 7.5, 0]} color="#ffedd5" intensity={2.2} distance={22} decay={1.2} />
            <pointLight position={[4.5, 7.0, -5.0]} color="#38bdf8" intensity={1.4} distance={22} decay={1.2} />
            <pointLight position={[-4.5, 7.0, 5.0]} color="#38bdf8" intensity={1.4} distance={22} decay={1.2} />
            <pointLight position={[0, 6.5, -8.0]} color="#ffaa00" intensity={1.2} distance={22} decay={1.2} />
          </group>
        )}

        {/* Logistics Floor Grid */}
        <gridHelper args={[40, 40, '#0284c7', '#1e293b']} position={[0, -0.02, 0]} />

        {/* 1. AWS Warehouse Architecture (DAE models: Walls, Floor, Decor) */}
        <ColladaModels />

        {/* 2. WareTwin Separated Racks + Cargo Layers */}
        <RackInstances />

        {/* 3. Phase 2: Logistics Zone Overlay */}
        <ZoneOverlay />
      </Canvas>
    </div>
  )
}
