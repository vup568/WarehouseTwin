import { DENSO_LAYOUT_V1 } from './denso-layout-v1'
import { createIndustrialRackGeometry } from '../components/scene/industrial-rack-geometry'
import type { RackMemberKind, RackMember } from '../components/scene/industrial-rack-geometry'

export const INDUSTRIAL_RACKS = DENSO_LAYOUT_V1.rackBlocks.map(createIndustrialRackGeometry)
export const INDUSTRIAL_RACK_SLOTS = INDUSTRIAL_RACKS.flatMap(rack => rack.slots)
export const RACK_MEMBER_KINDS: RackMemberKind[] = ['uprights', 'footplates', 'beams', 'supports', 'braces', 'frameTies', 'spacers', 'decks']
export const INDUSTRIAL_RACK_PARTS = Object.fromEntries(RACK_MEMBER_KINDS.map(kind => [kind,
  INDUSTRIAL_RACKS.flatMap(rack => rack.members[kind])])) as Record<RackMemberKind, RackMember[]>
