import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, ErrorUtils, Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";
import { registerForPushNotifications, savePushToken } from "../services/notifications";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { OfflineBanner } from "../components/OfflineBanner";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { mutationQueue } from "../utils/mutationQueue";
import { initSentry } from "../utils/sentry";
import { api } from "../services/api";
import { Colors } from "../utils/colors";
import "../global.css";

initSentry();

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadToken } = useAuthStore();
  const { profileLoaded, fetchProfile } = useProfileStore();
  const isConnected = useNetworkStatus();

  const queryClientRef = useRef(new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,        // 30 seconds
        retry: 2,
        refetchOnWindowFocus: true,
        networkMode: "offlineFirst",
      },
      mutations: {
        networkMode: "offlineFirst",
      },
    },
  }));
  const queryClient = queryClientRef.current;

  useEffect(() => {
    mutationQueue.init((method, path, body) => api.rawRequest(method, path, body));
    loadToken().then((ok) => {
      if (ok) fetchProfile();
    });

    // Global unhandled rejection handler
    if (Platform.OS !== "web") {
      const defaultHandler = ErrorUtils.getGlobalHandler?.();
      ErrorUtils.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
        Sentry.captureException(error);
        if (defaultHandler) defaultHandler(error, isFatal);
      });
    }

    return () => { mutationQueue.destroy(); };
  }, [loadToken, fetchProfile]);

  useEffect(() => {
    if (isAuthenticated && profileLoaded) {
      registerForPushNotifications().then((token) => {
        if (token) savePushToken(token);
      });
    }
  }, [isAuthenticated, profileLoaded]);

  // Centralized auth/onboarding navigation guard
  useAuthGuard();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.black, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={Colors.white} size="small" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <StatusBar style="light" />
        {!isConnected && <OfflineBanner />}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.black },
          }}
        />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
