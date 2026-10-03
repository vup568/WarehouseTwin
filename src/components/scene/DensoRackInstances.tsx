import React, { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { INDUSTRIAL_RACK_PARTS, RACK_MEMBER_KINDS } from '../../data/denso-industrial-racks'
import { useStore } from '../../state/store'
import { InstancedRackParts } from './InstancedRackParts'

// One physical mesh deck shared by all bins. The unit mesh is scaled by the
// same geometry specification used for bearing-plane and capacity tests.
function createMeshDeck() {
  const pieces: THREE.BufferGeometry[] = []
  for (let index = 0; index <= 20; index++) {
    const wire = new THREE.BoxGeometry(0.006, 1, 1)
    wire.translate(-0.497 + index * 0.994 / 20, 0, 0)
    pieces.push(wire)
  }
  for (let index = 0; index <= 9; index++) {
    const wire = new THREE.BoxGeometry(1, 1, 0.014)
    wire.translate(0, 0, -0.493 + index * 0.986 / 9)
    pieces.push(wire)
  }
  const geometry = mergeGeometries(pieces)!
  pieces.forEach(piece => piece.dispose())
  return geometry
}

export const DensoRackInstances: React.FC = () => {
  const visible = useStore(state => state.layers.racks)
  const deck = useMemo(createMeshDeck, [])
  useEffect(() => () => deck.dispose(), [deck])
  return <group name="DensoDoubleRackInstances" visible={visible}>
    {RACK_MEMBER_KINDS.map(kind => <InstancedRackParts key={kind} name={`RackStructure:${kind}`} parts={INDUSTRIAL_RACK_PARTS[kind]}
      geometry={kind === 'decks' ? deck : undefined} castShadow={kind !== 'decks'}
      color={kind === 'beams' ? '#e77924' : kind === 'uprights' ? '#234c72' : '#99a6ad'} />)}
  </group>
}

export default DensoRackInstances
