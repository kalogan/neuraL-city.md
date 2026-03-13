export type UiErrorReporter = (message: string) => void;

export function setupGlobalErrorHandling(report: UiErrorReporter): void {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('window.onerror', { message, source, lineno, colno, error });
    report('Unexpected runtime error occurred. See console for details.');
    return false;
  };

  window.onunhandledrejection = (event) => {
    console.error('window.unhandledrejection', event.reason);
    report('Unhandled async error occurred. Attempting graceful recovery.');
  };
}

export function withRenderGuard(callback: () => void, report: UiErrorReporter): void {
  try {
    callback();
  } catch (error) {
    console.error('Render loop failed', error);
    report('Render loop error. Rendering paused to keep app stable.');
  }
}
