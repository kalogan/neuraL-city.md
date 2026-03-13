import { useAppState } from '../state/appState';
import type { ActivationResponse } from '../types/model';

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async fetchActivation(prompt: string, retries = 2): Promise<ActivationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/activation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as ActivationResponse;
      useAppState.getState().setLayers(data.layers);
      return data;
    } catch (error) {
  console.warn("Activation API failed, retrying gracefully", error);

  if (retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return this.fetchActivation(prompt, retries - 1);
  }

  const fallback: ActivationResponse = { layers: [] };
  useAppState.getState().setLayers(fallback.layers);
  return fallback;
}
  }

  async fetchGraph(query: string): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/graph?query=` + encodeURIComponent(query));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
        console.warn("Graph API failed, continuing without graph data", error);
        return null;
  }
      throw error;

    }
  }
}
