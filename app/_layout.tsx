import { useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as Sentry from "@sentry/react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
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

  // Load PlusJakartaSans font family
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
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
    mutationQueue.setFlushCallback((method, path, _body, result) => {
      if (method === "POST" && path === "/logs/food" && result) {
        const entry = result as { id: string; food_name: string; portion: string | null; calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number; meal_type: string };
        const { addFoodLog } = require("../stores/dailyStore").useDailyStore.getState();
        addFoodLog({ ...entry, meal_type: entry.meal_type as import("../types/food").MealType });
      }
    });
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ErrorBoundary>
          <StatusBar style="dark" />
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
    </GestureHandlerRootView>
  );
}
