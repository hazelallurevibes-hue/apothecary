import * as Sentry from '@sentry/react';

export function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.15 : 1.0,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
  });

  return true;
}

export function setMonitoringUser(user) {
  if (!import.meta.env.VITE_SENTRY_DSN || !user) return;
  Sentry.setUser({ id: String(user.id || user.email), email: user.email, username: user.name });
}

export { Sentry };