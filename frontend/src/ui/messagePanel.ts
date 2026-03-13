export function createMessagePanel(): HTMLElement {
  const container = document.createElement("div");

  container.className =
    "absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-2 rounded shadow hidden";

  container.id = "message-panel";

  container.textContent = "System ready.";

  return container;
}
