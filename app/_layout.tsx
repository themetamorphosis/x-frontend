import { useEffect, useRef, useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, ErrorUtils, Platform } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Nunito_300Light, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from "@expo-google-fonts/nunito";
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
import { Colors } from "../utils/colors";
import "../global.css";

initSentry();

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadToken } = useAuthStore();
  const { profileLoaded, fetchProfile } = useProfileStore();
  const isConnected = useNetworkStatus();

  // Load Nunito font family
  const [fontsLoaded, fontError] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      // Hide splash screen once fonts are loaded (or if there's an error)
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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

  // Don't render until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={Colors.accent} size="small" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
