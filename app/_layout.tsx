import { useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Platform } from "react-native";

import * as Sentry from "@sentry/react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { ThemeProvider } from "../utils/theme";
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
import { lightColors } from "../utils/theme";

initSentry();

// Keep splash screen visible while loading fonts
try {
  SplashScreen.preventAutoHideAsync();
} catch {
  // May fail on web — non-critical
}

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadToken } = useAuthStore();
  const { profileLoaded, fetchProfile } = useProfileStore();
  const isConnected = useNetworkStatus();

  // Load Nunito font family
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // May fail on web
      }
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    mutationQueue.init((method, path, body) => api.rawRequest(method, path, body));
    loadToken().then((ok) => {
      if (ok) fetchProfile();
    });

    // Global unhandled rejection handler (native only)
    if (Platform.OS !== "web") {
      const ErrorUtils = require("react-native").ErrorUtils;
      if (ErrorUtils) {
        const defaultHandler = ErrorUtils.getGlobalHandler?.();
        ErrorUtils.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
          Sentry.captureException(error);
          if (defaultHandler) defaultHandler(error, isFatal);
        });
      }
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

  // Don't render until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={lightColors.primary} size="small" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <StatusBar style="dark-content" />
        {!isConnected && <OfflineBanner />}
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
        </View>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
