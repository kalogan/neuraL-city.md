import { describe, expect, it } from 'vitest';
import { NeuronSystem } from '../systems/neuronSystem';

describe('stress test', () => {
  it('builds 32 layers with up to 10k neurons', () => {
    const layers = Array.from({ length: 32 }, (_, layerIndex) => ({
      layer: layerIndex + 1,
      neurons: Array.from({ length: 10_000 }, () => Math.random()),
      attention: [[0.1, 0.2], [0.3, 0.4]],
      logits: ['a', 'b', 'c']
    }));

    const system = new NeuronSystem();
    const group = system.build(layers);

    expect(group.children).toHaveLength(32);
    system.dispose();
  });
});
