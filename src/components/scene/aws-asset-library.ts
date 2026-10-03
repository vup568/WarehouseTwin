import * as THREE from 'three'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { AWS_ENVIRONMENT_ASSETS } from '../../data/aws-environment-layout'

type AssetKind = keyof typeof AWS_ENVIRONMENT_ASSETS
const cache = new Map<AssetKind, Promise<THREE.Group>>()

// Cache the parsed templates/materials/textures, not a placed small-world scene.
export function loadAwsEnvironmentAsset(kind: AssetKind): Promise<THREE.Group> {
  const existing = cache.get(kind)
  if (existing) return existing
  const modelId = AWS_ENVIRONMENT_ASSETS[kind]
  const promise = (async () => {
    const manager = new THREE.LoadingManager()
    const failures: string[] = []
    const texturesReady = new Promise<void>(resolve => { manager.onLoad = () => resolve() })
    manager.onError = url => { failures.push(url) }
    const loaded = await new ColladaLoader(manager).loadAsync(
      `${import.meta.env.BASE_URL}models/${modelId}/meshes/${modelId}_visual.DAE`,
    )
    await texturesReady
    if (failures.length) throw new Error(`AWS ${kind} asset could not load: ${failures.join(', ')}`)

    const root = new THREE.Group()
    root.name = `AWS:${kind}`
    root.userData.assetId = modelId
    root.add(loaded.scene)
    if (kind === 'ground') root.traverse(child => {
      if (!(child instanceof THREE.Mesh) || !Array.isArray(child.material)) return
      const groups = child.geometry.groups.filter(group => child.material[group.materialIndex].name === 'Material #946568')
      if (!groups.length) throw new Error('AWS concrete geometry group is missing')
      const geometry = child.geometry.clone()
      geometry.clearGroups()
      const position = geometry.getAttribute('position')
      const concreteBounds = new THREE.Box3()
      const vertex = new THREE.Vector3()
      for (const group of groups) {
        geometry.addGroup(group.start, group.count, group.materialIndex)
        for (let index = group.start; index < group.start + group.count; index++) {
          const vertexIndex = geometry.index ? geometry.index.getX(index) : index
          concreteBounds.expandByPoint(vertex.fromBufferAttribute(position, vertexIndex))
        }
      }
      geometry.boundingBox = concreteBounds
      child.geometry = geometry
    })
    // DAE contains local translations. Normalize
    // transformed world bounds after ColladaLoader's existing unit/up-axis adapter.
    const bounds = new THREE.Box3().setFromObject(root)
    const center = bounds.getCenter(new THREE.Vector3())
    loaded.scene.position.sub(new THREE.Vector3(center.x, kind === 'ground' ? bounds.max.y : bounds.min.y, center.z))

    root.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = false
      child.receiveShadow = true
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(material => {
        material.side = THREE.DoubleSide
        // Ground material 946569 is the old AWS painted small-world route.
        // Keep the concrete model/UVs; Denso markings are rendered independently.
        if (kind === 'ground' && material.name === 'Material #946569') material.visible = false
        const textured = material as THREE.MeshPhongMaterial
        if (textured.map) {
          textured.map.colorSpace = THREE.SRGBColorSpace
          textured.map.anisotropy = 4
        }
      })
    })
    root.updateMatrixWorld(true)
    return root
  })().catch(error => { cache.delete(kind); throw error })
  cache.set(kind, promise)
  return promise
}
