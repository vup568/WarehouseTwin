import React, { useEffect, useState } from 'react'
import * as THREE from 'three'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { useStore } from '../../state/store'

interface WorldInstance {
  name: string;
  model_id: string;
  category: string;
  pose: {
    x: number;
    y: number;
    z: number;
    roll: number;
    pitch: number;
    yaw: number;
  };
}

interface WorldData {
  catalog: Record<string, {
    id: string;
    name: string;
    dae_path: string;
    textures: string[];
  }>;
  instances: WorldInstance[];
}

export const ColladaModels: React.FC = () => {
  const layers = useStore((s) => s.layers)
  const [worldRoot, setWorldRoot] = useState<THREE.Group | null>(null)
  const [loadStatus, setLoadStatus] = useState<string>('Loading environment...')

  useEffect(() => {
    let isMounted = true

    async function loadWarehouse() {
      try {
        const resp = await fetch('/warehouse_data.json')
        const data: WorldData = await resp.json()
        const loader = new ColladaLoader()
        const group = new THREE.Group()
        group.name = 'AWS_Warehouse_DAE_Root'

        // Cache for loaded base models
        const cache = new Map<string, THREE.Object3D>()

        // Exclude 'rack' instances because we use procedural separate racks!
        const nonRackInstances = data.instances.filter((inst) => inst.category !== 'rack')
        const uniqueModelIds = [...new Set(nonRackInstances.map((i) => i.model_id))]

        for (const modelId of uniqueModelIds) {
          const cat = data.catalog[modelId]
          if (!cat) continue

          const daeUrl = '/' + cat.dae_path.replace(/^\/+/, '')
          try {
            const collada = await new Promise<any>((resolve) => {
              loader.load(
                daeUrl,
                (res) => resolve(res),
                undefined,
                () => resolve(null)
              )
            })

            if (collada && collada.scene) {
              const modelScene = collada.scene
              modelScene.traverse((child: any) => {
                if (child.isMesh) {
                  child.castShadow = true
                  child.receiveShadow = true
                  if (child.material) {
                    child.material.side = THREE.DoubleSide
                    if (child.material.map) {
                      child.material.map.colorSpace = THREE.SRGBColorSpace
                    }
                  }
                }
              })
              cache.set(modelId, modelScene)
            }
          } catch (err) {
            console.warn(`Could not load DAE model: ${modelId}`, err)
          }
        }

        // Place instances
        nonRackInstances.forEach((inst) => {
          const base = cache.get(inst.model_id)
          if (!base) return

          const clone = base.clone(true)
          clone.name = inst.name

          // Gazebo X -> Three.js X
          // Gazebo Z -> Three.js Y (height)
          // Gazebo Y -> Three.js -Z
          clone.position.set(inst.pose.x, inst.pose.z, -inst.pose.y)
          clone.rotation.y = inst.pose.yaw
          clone.userData = { category: inst.category }

          group.add(clone)
        })

        if (isMounted) {
          setWorldRoot(group)
          setLoadStatus('Ready')
        }
      } catch (err) {
        console.error('Failed to load warehouse data', err)
      }
    }

    loadWarehouse()

    return () => {
      isMounted = false
    }
  }, [])

  // Update visibility according to layer toggles
  useEffect(() => {
    if (!worldRoot) return

    worldRoot.traverse((child) => {
      const cat = child.userData?.category
      if (cat === 'roof') {
        child.visible = layers.roof
      } else if (cat === 'wall') {
        child.visible = layers.walls
      }
    })
  }, [worldRoot, layers.roof, layers.walls])

  if (!worldRoot) return null

  return <primitive object={worldRoot} />
}
