import { useEffect, useRef } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";

/**
 * Custom hook that encapsulates all authentication and onboarding navigation logic.
 * Extracts the complex navigation guard from _layout.tsx for better testability.
 */
export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { profile, profileLoaded, isOnboardingComplete } = useProfileStore();
  const segments = useSegments();
  const router = useRouter();
  const lastNavigation = useRef<string>("");

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    let target: string | null = null;

    if (!isAuthenticated && !inAuthGroup) {
      target = "/(auth)/login";
    } else if (isAuthenticated && inAuthGroup) {
      if (profileLoaded && profile && !isOnboardingComplete()) {
        target = "/(onboarding)/goal";
      } else if (profileLoaded) {
        target = "/(tabs)";
      }
    } else if (isAuthenticated && profileLoaded && profile && !isOnboardingComplete() && !inOnboardingGroup) {
      target = "/(onboarding)/goal";
    } else if (isAuthenticated && profileLoaded && profile && isOnboardingComplete() && inOnboardingGroup) {
      target = "/(tabs)";
    }

    // Avoid redundant navigations to the same target
    if (target && target !== lastNavigation.current) {
      lastNavigation.current = target;
      router.replace(target as any);
    }
  }, [isAuthenticated, isLoading, profile, profileLoaded, segments, router, isOnboardingComplete]);
}
