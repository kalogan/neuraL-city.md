export interface LayerActivation {
  layer: number;
  neurons: number[];
  attention: number[][];
  logits: string[];
}

export interface ActivationResponse {
  layers: LayerActivation[];
}

export interface TokenInstance {
  id: string;
  text: string;
  position: [number, number, number];
  path: [number, number, number][];
  speed: number;
}

export type GraphicsMode = 'Ultra' | 'High' | 'Balanced' | 'Low';
