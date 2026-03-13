import { useAppState } from '../state/appState';

export function createInspectorPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'p-3 bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded min-w-[260px] transition-all duration-300 hover:border-cyan-400/45';

  const render = (): void => {
    const selected = useAppState.getState().selectedNeuron;
    panel.innerHTML = selected
      ? `<h3 class="font-semibold mb-2 text-cyan-300">Neuron Inspector</h3>
         <div>ID: L${selected.layer}-N${selected.index}</div>
         <div>Activation: ${selected.activation.toFixed(3)}</div>
         <div class="text-orange-300">Related Tokens: mock-token-a, mock-token-b</div>`
      : '<h3 class="font-semibold text-cyan-300">Neuron Inspector</h3><div class="text-slate-300">No neuron selected</div>';
  };

  useAppState.subscribe(render);
  render();
  return panel;
}
