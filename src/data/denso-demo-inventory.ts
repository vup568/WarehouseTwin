import type { RackSlot } from '../components/scene/industrial-rack-geometry.ts'
export interface DemoPalletRecord { id: string; binId: string; skuId: string }

// Repeatable local fixture, not WMS data or a PC classification algorithm.
export function createDemoInventory(slots: readonly RackSlot[], seed = 42): DemoPalletRecord[] {
  return slots.flatMap(slot => {
    let hash = seed >>> 0
    for (const character of slot.id) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
    return hash % 100 < 58 ? [{ id: `PAL-${slot.id}`, binId: slot.id, skuId: `DEMO-SKU-${hash % 24 + 1}` }] : []
  })
}
export function validateDemoInventory(slots: readonly RackSlot[], records: readonly DemoPalletRecord[]): string[] {
  const validBins = new Set(slots.map(slot => slot.id)), bins = new Set<string>(), pallets = new Set<string>()
  const errors: string[] = []
  for (const record of records) {
    if (!validBins.has(record.binId)) errors.push(`Orphan pallet bin: ${record.binId}`)
    if (bins.has(record.binId)) errors.push(`Only one pallet/SKU is allowed per bin: ${record.binId}`)
    if (!record.skuId.trim()) errors.push(`Pallet must have one SKU: ${record.id}`)
    if (!record.id.trim() || pallets.has(record.id)) errors.push(`Pallet ID must be unique and non-empty: ${record.id}`)
    bins.add(record.binId); pallets.add(record.id)
  }
  return errors
}
