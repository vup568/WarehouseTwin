export type ZoneStatus = 'NORMAL' | 'CONGESTED' | 'BLOCKED';

export interface ZoneData {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string;
  center: [number, number, number]; // [x, y, z] in Three.js coords (y is floor level)
  size: [number, number];           // [width (X), depth (Z)]
  color: string;
  targetCamera: [number, number, number];
}

/**
 * Logistics Zones for AWS RoboMaker Small Warehouse World
 * Mapped to the ~14m x 20m floor plan
 */
export const WAREHOUSE_ZONES: ZoneData[] = [
  {
    id: 'zone-a',
    code: 'ZONE A',
    name: 'Inbound Dock',
    type: 'RECEIVING',
    description: 'Cargo unload, verification & inbound AMR buffer',
    center: [0, 0.02, -7.2],
    size: [11.6, 3.8],
    color: '#06b6d4', // Cyan
    targetCamera: [0, 8, -2.5]
  },
  {
    id: 'zone-b',
    code: 'ZONE B',
    name: 'Storage Aisle A (East)',
    type: 'HIGH_BAY_STORAGE',
    description: '6 heavy pallet racks, pallet replenishment lane',
    center: [4.7, 0.02, 3.5],
    size: [3.8, 11.2],
    color: '#3b82f6', // Royal Blue
    targetCamera: [4.7, 8, 8.5]
  },
  {
    id: 'zone-c',
    code: 'ZONE C',
    name: 'Storage Aisle B (West)',
    type: 'HIGH_BAY_STORAGE',
    description: '6 rapid-pick racks, high-turnover inventory',
    center: [-4.7, 0.02, 3.5],
    size: [3.8, 11.2],
    color: '#8b5cf6', // Violet
    targetCamera: [-4.7, 8, 8.5]
  },
  {
    id: 'zone-d',
    code: 'ZONE D',
    name: 'Outbound & Staging',
    type: 'DISPATCH',
    description: 'Sorting, order consolidation & dispatch staging',
    center: [0, 0.02, 8.2],
    size: [11.6, 2.6],
    color: '#10b981', // Emerald Green
    targetCamera: [0, 8, 3.5]
  }
];
