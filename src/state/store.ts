import { create } from 'zustand'
import { ZoneStatus, WAREHOUSE_ZONES } from '../data/zone_layout'

export interface AppLayers {
  roof: boolean;
  walls: boolean;
  racks: boolean;
  cargo: boolean; // Independent layer: toggle on/off to separate cargo from rack
  zones: boolean; // Zone Overlay layer
  amr: boolean;
  lights: boolean;
}

export type CameraMode = 'orbit' | 'top' | 'fps';
export type LightingMode = 'industrial' | 'day';

interface AppState {
  layers: AppLayers;
  cameraMode: CameraMode;
  lightingMode: LightingMode;
  selectedRackId: string | null;
  selectedZoneId: string | null;
  cargoSeed: number;

  // Zone Management
  zoneStatuses: Record<string, ZoneStatus>;
  focusTarget: [number, number, number] | null;

  // Actions
  toggleLayer: (layer: keyof AppLayers) => void;
  setLayer: (layer: keyof AppLayers, value: boolean) => void;
  setCameraMode: (mode: CameraMode) => void;
  setLightingMode: (mode: LightingMode) => void;
  setSelectedRackId: (id: string | null) => void;
  setSelectedZoneId: (id: string | null) => void;
  setZoneStatus: (zoneId: string, status: ZoneStatus) => void;
  cycleZoneStatus: (zoneId: string) => void;
  simulateCongestion: () => void;
  resetZones: () => void;
  setFocusTarget: (target: [number, number, number] | null) => void;
  randomizeCargo: () => void;
}

// Initial zone statuses
const initialZoneStatuses: Record<string, ZoneStatus> = {
  'zone-a': 'NORMAL',
  'zone-b': 'NORMAL',
  'zone-c': 'NORMAL',
  'zone-d': 'NORMAL',
};

export const useStore = create<AppState>((set) => ({
  layers: {
    roof: false,
    walls: true,
    racks: true,
    cargo: true, // cargo separate from racks
    zones: true, // Zone overlay enabled by default in Phase 2
    amr: true,
    lights: true,
  },
  cameraMode: 'orbit',
  lightingMode: 'industrial',
  selectedRackId: null,
  selectedZoneId: null,
  cargoSeed: 42,
  zoneStatuses: initialZoneStatuses,
  focusTarget: null,

  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] }
    })),

  setLayer: (layer, value) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: value }
    })),

  setCameraMode: (mode) => set({ cameraMode: mode }),
  setLightingMode: (mode) => set({ lightingMode: mode }),
  setSelectedRackId: (id) => set({ selectedRackId: id }),
  
  setSelectedZoneId: (id) => {
    set({ selectedZoneId: id })
    if (id) {
      const zone = WAREHOUSE_ZONES.find((z) => z.id === id)
      if (zone) {
        set({ focusTarget: zone.center })
      }
    }
  },

  setZoneStatus: (zoneId, status) =>
    set((state) => ({
      zoneStatuses: { ...state.zoneStatuses, [zoneId]: status }
    })),

  cycleZoneStatus: (zoneId) =>
    set((state) => {
      const current = state.zoneStatuses[zoneId] || 'NORMAL'
      const next: ZoneStatus =
        current === 'NORMAL' ? 'CONGESTED' : current === 'CONGESTED' ? 'BLOCKED' : 'NORMAL'
      return {
        zoneStatuses: { ...state.zoneStatuses, [zoneId]: next }
      }
    }),

  simulateCongestion: () =>
    set({
      zoneStatuses: {
        'zone-a': 'NORMAL',
        'zone-b': 'CONGESTED',
        'zone-c': 'NORMAL',
        'zone-d': 'BLOCKED',
      }
    }),

  resetZones: () =>
    set({
      zoneStatuses: initialZoneStatuses,
      selectedZoneId: null,
      focusTarget: null,
    }),

  setFocusTarget: (target) => set({ focusTarget: target }),
  randomizeCargo: () => set({ cargoSeed: Math.floor(Math.random() * 100000) })
}));
