export function createTimeTravelPanel(): HTMLElement {
  const container = document.createElement("div");

  container.className =
    "absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-2 rounded shadow";

  container.textContent = "Timeline";

  return container;
}
