import * as Sentry from "@sentry/react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    environment: __DEV__ ? "development" : "production",
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    beforeSend(event) {
      if (__DEV__) return null;
      return event;
    },
  });
}

export { Sentry };
