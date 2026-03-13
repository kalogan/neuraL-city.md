import { ApiClient } from '../data/apiClient';

export function createPromptPanel(onData: () => void): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'absolute top-0 left-0 right-0 p-3 bg-slate-950/70 backdrop-blur-md border-b border-cyan-500/20 flex gap-2 transition-all duration-300';
  panel.innerHTML = `
    <input id="prompt-input" class="flex-1 bg-slate-900/70 px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-cyan-400 transition" value="Explain transformer attention" />
    <button id="prompt-submit" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded transition">Run</button>
    <div id="prompt-error" class="text-red-400 text-sm"></div>
  `;

  const input = panel.querySelector<HTMLInputElement>('#prompt-input');
  const button = panel.querySelector<HTMLButtonElement>('#prompt-submit');
  const error = panel.querySelector<HTMLDivElement>('#prompt-error');

  const client = new ApiClient('/api');


  button?.addEventListener('click', async () => {
    if (!input) return;
    error!.textContent = '';
    try {
      await client.fetchActivation(input.value);
      onData();
    } catch (e) {
      error!.textContent = 'Failed to load activation data';
      console.error(e);
    }
  });

  return panel;
}
