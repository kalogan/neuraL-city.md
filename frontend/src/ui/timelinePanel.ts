import { useAppState } from '../state/appState';

export function createTimelinePanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'p-3 bg-slate-900/80 backdrop-blur-md border border-purple-500/20 rounded flex-1 transition-all duration-300 hover:border-purple-400/45';

  const render = (): void => {
    const layers = useAppState.getState().layers;
    panel.innerHTML = `<h3 class="font-semibold mb-2 text-purple-300">Timeline</h3>
      <div class="text-sm text-slate-300">Rendered Layers: ${layers.length}</div>
      <div class="text-sm text-slate-300">Mode: ${useAppState.getState().graphicsMode}</div>`;
  };

  useAppState.subscribe(render);
  render();
  return panel;
}
