import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";
import { registerForPushNotifications, savePushToken } from "../services/notifications";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { OfflineBanner } from "../components/OfflineBanner";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { mutationQueue } from "../utils/mutationQueue";
import { initSentry } from "../utils/sentry";
import { api } from "../services/api";
import "../global.css";

initSentry();

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadToken } = useAuthStore();
  const { profile, profileLoaded, fetchProfile, isOnboardingComplete } = useProfileStore();
  const segments = useSegments();
  const router = useRouter();
  const isConnected = useNetworkStatus();

  useEffect(() => {
    mutationQueue.init((method, path, body) => api.rawRequest(method, path, body));
    loadToken().then((ok) => {
      if (ok) fetchProfile();
    });
    return () => { mutationQueue.destroy(); };
  }, [loadToken, fetchProfile]);

  useEffect(() => {
    if (isAuthenticated && profileLoaded) {
      registerForPushNotifications().then((token) => {
        if (token) savePushToken(token);
      });
    }
  }, [isAuthenticated, profileLoaded]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      if (profileLoaded && profile && !isOnboardingComplete()) {
        router.replace("/(onboarding)/goal");
      } else if (profileLoaded) {
        router.replace("/(tabs)");
      }
      return;
    }

    if (isAuthenticated && profileLoaded && profile && !isOnboardingComplete() && !inOnboardingGroup) {
      router.replace("/(onboarding)/goal");
    }

    if (isAuthenticated && profileLoaded && profile && isOnboardingComplete() && inOnboardingGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, profile, profileLoaded, segments, router, isOnboardingComplete]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#FFFFFF" size="small" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      {!isConnected && <OfflineBanner />}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
        }}
      />
    </ErrorBoundary>
  );
}
