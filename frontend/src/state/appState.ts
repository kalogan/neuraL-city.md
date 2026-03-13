import { create } from 'zustand';
import type { GraphicsMode, LayerActivation } from '../types/model';

interface AppState {
  layers: LayerActivation[];
  selectedNeuron: { layer: number; index: number; activation: number } | null;
  showAttention: boolean;
  showTokens: boolean;
  layerViewOnly: boolean;
  graphicsMode: GraphicsMode;
  setLayers: (layers: LayerActivation[]) => void;
  selectNeuron: (payload: AppState['selectedNeuron']) => void;
  toggleAttention: () => void;
  toggleTokens: () => void;
  toggleLayerView: () => void;
  setGraphicsMode: (mode: GraphicsMode) => void;
}

export const useAppState = create<AppState>((set) => ({
  layers: [],
  selectedNeuron: null,
  showAttention: true,
  showTokens: true,
  layerViewOnly: false,
  graphicsMode: 'High',
  setLayers: (layers) => set({ layers }),
  selectNeuron: (selectedNeuron) => set({ selectedNeuron }),
  toggleAttention: () => set((state) => ({ showAttention: !state.showAttention })),
  toggleTokens: () => set((state) => ({ showTokens: !state.showTokens })),
  toggleLayerView: () => set((state) => ({ layerViewOnly: !state.layerViewOnly })),
  setGraphicsMode: (graphicsMode) => set({ graphicsMode })
}));
