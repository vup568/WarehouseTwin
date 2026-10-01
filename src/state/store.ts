import { create } from 'zustand'

export interface AppLayers {
  roof: boolean;
  walls: boolean;
  racks: boolean;
  cargo: boolean; // Independent layer: toggle on/off to separate cargo from rack
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
  cargoSeed: number;

  // Actions
  toggleLayer: (layer: keyof AppLayers) => void;
  setLayer: (layer: keyof AppLayers, value: boolean) => void;
  setCameraMode: (mode: CameraMode) => void;
  setLightingMode: (mode: LightingMode) => void;
  setSelectedRackId: (id: string | null) => void;
  randomizeCargo: () => void;
}

export const useStore = create<AppState>((set) => ({
  layers: {
    roof: false,
    walls: true,
    racks: true,
    cargo: true, // cargo separate from racks
    amr: true,
    lights: true,
  },
  cameraMode: 'orbit',
  lightingMode: 'industrial',
  selectedRackId: null,
  cargoSeed: 42,

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
  randomizeCargo: () => set({ cargoSeed: Math.floor(Math.random() * 100000) })
}));
