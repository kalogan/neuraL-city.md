import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ApiClient } from '../data/apiClient';
import { useAppState } from '../state/appState';

describe('ApiClient', () => {
  beforeEach(() => {
    useAppState.setState({ layers: [] });
  });

  it('fetches activation payload and updates store', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ layers: [{ layer: 1, neurons: [0.1], attention: [[0.2]], logits: ['a'] }] })
    }));

    const client = new ApiClient('http://localhost:8000');
    const data = await client.fetchActivation('hello');

    expect(data.layers).toHaveLength(1);
    expect(useAppState.getState().layers[0].layer).toBe(1);
  });
});
