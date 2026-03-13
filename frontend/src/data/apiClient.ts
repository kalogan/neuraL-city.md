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
      console.error('API failure', error);
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return this.fetchActivation(prompt, retries - 1);
      }
      throw error;
    }
  }
}
