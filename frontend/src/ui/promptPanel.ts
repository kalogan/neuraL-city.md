import { useAppState } from "../state/appState";

export function createPromptPanel(): HTMLElement {
  const container = document.createElement("div");
  container.className =
    "absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 p-3 rounded-lg flex gap-2";

  const input = document.createElement("input");
  input.className = "px-3 py-2 rounded bg-neutral-900 text-white";
  input.placeholder = "Enter prompt...";

  const button = document.createElement("button");
  button.textContent = "Run";
  button.className =
    "px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white";

  button.onclick = () => {
    const prompt = input.value.trim();
    if (!prompt) return;

    useAppState.getState().setPrompt(prompt);
  };

  container.appendChild(input);
  container.appendChild(button);

  return container;
}