import { useAppState } from '../state/appState';
import type { LayerActivation } from '../types/model';

export class ActivationStream {
  private socket: WebSocket | null = null;

  connect(url: string): void {
    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { layer: LayerActivation };
      const current = useAppState.getState().layers;
      useAppState.getState().setLayers([...current, payload.layer]);
    };
    this.socket.onerror = (event) => console.error('WebSocket error', event);
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
  }
}
