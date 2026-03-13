export function SetupGlobalErrorHandling() {
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error || event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });
}
