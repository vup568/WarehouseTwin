import * as THREE from 'three'
import type { BinAddress, RackBlock } from '../../data/denso-layout.types.ts'

export type RackMemberKind = 'uprights' | 'footplates' | 'beams' | 'supports' | 'braces' | 'frameTies' | 'spacers' | 'decks'
export interface RackMember {
  position: [number, number, number]
  size: [number, number, number]
  quaternion: [number, number, number, number]
}
export interface RackSlot extends BinAddress {
  /** Deck TOP; all cargo uses this bearing plane, not an arbitrary centre. */
  position: [number, number, number]
  rotationY: number
  deckSize: [number, number]
}
// Visual demo sections, not a certified structural/load-rating specification.
export const RACK_STRUCTURE = {
  uprightWidthM: 0.10, beamHeightM: 0.12, beamDepthM: 0.10,
  deckThicknessM: 0.024, firstDeckTopM: 0.24, supportHeightM: 0.06,
  supportWidthM: 0.055, braceWidthM: 0.028, backToBackGapM: 0.12,
  footplateWidthM: 0.18, footplateThicknessM: 0.018,
} as const

export function createIndustrialRackGeometry(rack: RackBlock) {
  if (rack.faces !== 2 || ![6, 7].includes(rack.levels) || rack.binsPerLevel !== 10
    || ![rack.binWidthM, rack.levelPitchM, rack.rackDepthM].every(value => Number.isFinite(value) && value > 0)
    || !rack.center.every(Number.isFinite) || !['X', 'Z'].includes(rack.orientation)) {
    throw new Error(`Invalid industrial rack specification: ${rack.id}`)
  }
  const p = RACK_STRUCTURE
  const run = rack.binsPerLevel * rack.binWidthM
  const heightM = rack.levels * rack.levelPitchM
  const faceDepth = (rack.rackDepthM - p.backToBackGapM) / 2
  const deckWidth = rack.binWidthM - p.uprightWidthM - 0.02
  const deckDepth = faceDepth - 0.02
  if (deckWidth < 1.13 || deckDepth < 0.97 || rack.levelPitchM - p.beamHeightM - p.deckThicknessM < 0.5) {
    throw new Error(`Rack deck/level cannot hold the Denso pallet: ${rack.id}`)
  }
  const rotationY = rack.orientation === 'X' ? 0 : -Math.PI / 2
  const worldRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY)
  const worldPosition = (point: THREE.Vector3): [number, number, number] => {
    point.applyQuaternion(worldRotation).add(new THREE.Vector3(rack.center[0], 0, rack.center[1]))
    return point.toArray() as [number, number, number]
  }
  const members: Record<RackMemberKind, RackMember[]> = {
    uprights: [], footplates: [], beams: [], supports: [], braces: [], frameTies: [], spacers: [], decks: [],
  }
  function box(kind: RackMemberKind, position: [number, number, number], size: [number, number, number], rotation = new THREE.Quaternion()) {
    members[kind].push({ position: worldPosition(new THREE.Vector3(...position)), size,
      quaternion: worldRotation.clone().multiply(rotation).toArray() as [number, number, number, number] })
  }
  function brace(a: [number, number, number], b: [number, number, number]) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b)
    const direction = end.clone().sub(start)
    const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())
    box('braces', start.add(end).multiplyScalar(0.5).toArray() as [number, number, number],
      [p.braceWidthM, direction.length(), p.braceWidthM], orientation)
  }
  const slots: RackSlot[] = []
  for (let boundary = 0; boundary <= rack.binsPerLevel; boundary++) {
    const x = -run / 2 + boundary * rack.binWidthM
    for (const sign of [-1, 1]) {
      const front = sign * (rack.rackDepthM / 2 - p.uprightWidthM / 2)
      const rear = sign * (p.backToBackGapM / 2 + p.uprightWidthM / 2)
      for (const z of [front, rear]) {
        box('uprights', [x, heightM / 2, z], [p.uprightWidthM, heightM, p.uprightWidthM])
        box('footplates', [x, p.footplateThicknessM / 2, z], [p.footplateWidthM, p.footplateThicknessM, p.footplateWidthM])
      }
      // Triangulated frames in the DEPTH plane, never across picking openings.
      const braceBottom = 0.18, bracePitch = (heightM - 0.30) / rack.levels
      for (let band = 0; band <= rack.levels; band++) {
        const y = braceBottom + band * bracePitch
        box('frameTies', [x, y, (front + rear) / 2], [0.035, 0.035, Math.abs(front - rear)])
        if (band < rack.levels) brace([x, y, band % 2 ? front : rear], [x, y + bracePitch, band % 2 ? rear : front])
      }
    }
    for (const y of [0.42, heightM / 2, heightM - 0.18]) {
      box('spacers', [x, y, 0], [0.065, 0.055, p.backToBackGapM + 2 * p.uprightWidthM])
    }
  }
  for (let level = 1; level <= rack.levels; level++) {
    const deckTop = p.firstDeckTopM + (level - 1) * rack.levelPitchM
    for (const sign of [-1, 1]) {
      const face = sign < 0 ? 'FR' : 'BK'
      const z = sign * (p.backToBackGapM / 2 + faceDepth / 2)
      for (let bin = 1; bin <= rack.binsPerLevel; bin++) {
        const x = -run / 2 + (bin - 0.5) * rack.binWidthM
        const bearingY = deckTop - p.deckThicknessM
        for (const edge of [-1, 1]) {
          box('beams', [x, bearingY - p.beamHeightM / 2, z + edge * (faceDepth - p.beamDepthM) / 2],
            [rack.binWidthM - p.uprightWidthM, p.beamHeightM, p.beamDepthM])
        }
        for (const offset of [-0.35, 0, 0.35]) {
          box('supports', [x + offset * deckWidth, bearingY - p.supportHeightM / 2, z],
            [p.supportWidthM, p.supportHeightM, faceDepth])
        }
        box('decks', [x, deckTop - p.deckThicknessM / 2, z], [deckWidth, p.deckThicknessM, deckDepth])
        slots.push({ id: `${rack.id}-${face}-L${String(level).padStart(2, '0')}-B${String(bin).padStart(2, '0')}`,
          rackId: rack.id, face, level, bin, palletCapacity: 1, occupiedPallets: 0, skuId: null,
          movementClass: rack.movementClass, position: worldPosition(new THREE.Vector3(x, deckTop, z)),
          rotationY, deckSize: [deckWidth, deckDepth] })
      }
    }
  }
  return { members, slots, heightM }
}
