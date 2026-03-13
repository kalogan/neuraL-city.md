import { describe, expect, it } from 'vitest';
import { useAppState } from '../state/appState';

describe('app state', () => {
  it('toggles feature flags', () => {
    useAppState.setState({ showAttention: true, showTokens: true, layerViewOnly: false });
    useAppState.getState().toggleAttention();
    useAppState.getState().toggleTokens();
    useAppState.getState().toggleLayerView();

    expect(useAppState.getState().showAttention).toBe(false);
    expect(useAppState.getState().showTokens).toBe(false);
    expect(useAppState.getState().layerViewOnly).toBe(true);
  });
});
