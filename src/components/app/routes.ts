/** Routes rendered inside the app shell (sidebar + panel). */
export const APP_SHELL_ROUTES = ["/agent", "/home", "/sessions", "/session/start", "/insights", "/goals", "/settings", "/premium"];

export const isShellRoute = (path: string | null) =>
  !!path && APP_SHELL_ROUTES.some((r) => path === r || path.startsWith(r + "/") || path.endsWith(r));

export const openFeedback = () => window.dispatchEvent(new Event("stride:feedback"));
