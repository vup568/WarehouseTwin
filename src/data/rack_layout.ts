export interface RackData {
  id: string;
  zone: string;
  position: [number, number, number]; // [x, y, z] in Three.js coordinates
  size: [number, number, number];     // [length, height, width]
  rotation: number;                   // radians around Y
  levels: number;                     // vertical levels
  bays: number;                       // bays along rack length
}

/**
 * Procedural Rack Layout for AWS RoboMaker Warehouse
 * Accurately mapped to the 7 original Gazebo Shelf positions + extended racks along Aisle B
 */
export const RACK_LAYOUT: RackData[] = [
  // Aisle A (Right side: X ≈ 4.73m)
  {
    id: "RACK-A01",
    zone: "A",
    position: [4.73, 0, -0.58],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-A02",
    zone: "A",
    position: [4.73, 0, 1.24],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-A03",
    zone: "A",
    position: [4.73, 0, 3.04],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-A04",
    zone: "A",
    position: [4.73, 0, 4.83],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-A05",
    zone: "A",
    position: [4.73, 0, 6.75],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-A06",
    zone: "A",
    position: [4.73, 0, 8.67],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },

  // Aisle B (Left side: X ≈ -5.80m)
  {
    id: "RACK-B01",
    zone: "B",
    position: [-5.80, 0, -0.58],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-B02",
    zone: "B",
    position: [-5.80, 0, 0.96],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-B03",
    zone: "B",
    position: [-5.80, 0, 3.04],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-B04",
    zone: "B",
    position: [-5.80, 0, 4.83],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-B05",
    zone: "B",
    position: [-5.80, 0, 6.75],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  },
  {
    id: "RACK-B06",
    zone: "B",
    position: [-5.80, 0, 8.67],
    size: [2.5, 3.6, 1.1],
    rotation: 0,
    levels: 4,
    bays: 2
  }
];
