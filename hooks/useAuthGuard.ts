import { useEffect, useRef } from "react";
import { useRouter, useSegments } from "expo-router";
import type { Href } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";

type NavState = "loading" | "unauthenticated" | "needs_onboarding" | "authenticated";

function deriveState(
  isAuthenticated: boolean,
  isLoading: boolean,
  profileLoaded: boolean,
  profile: unknown,
  isOnboardingComplete: () => boolean,
): NavState {
  if (isLoading) return "loading";
  if (!isAuthenticated) return "unauthenticated";
  if (profileLoaded && profile && !isOnboardingComplete()) return "needs_onboarding";
  if (isAuthenticated) return "authenticated";
  return "loading";
}

const REDIRECTS: Record<NavState, Href | null> = {
  loading: null,
  unauthenticated: "/(auth)/login",
  needs_onboarding: "/(onboarding)/goal",
  authenticated: "/(tabs)",
};

export function useAuthGuard(): void {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { profile, profileLoaded, isOnboardingComplete } = useProfileStore();
  const segments = useSegments();
  const router = useRouter();
  const lastNav = useRef<string>("");

  useEffect(() => {
    const state = deriveState(isAuthenticated, isLoading, profileLoaded, profile, isOnboardingComplete);
    if (state === "loading") return;

    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    let target: Href | null = null;

    if (state === "unauthenticated" && !inAuth) {
      target = REDIRECTS.unauthenticated;
    } else if (state === "authenticated" && inAuth) {
      target = REDIRECTS.authenticated;
    } else if (state === "needs_onboarding" && !inOnboarding) {
      target = REDIRECTS.needs_onboarding;
    } else if (state === "authenticated" && inOnboarding) {
      target = REDIRECTS.authenticated;
    }

    if (target && target !== lastNav.current) {
      lastNav.current = target as string;
      router.replace(target);
    }
  }, [isAuthenticated, isLoading, profile, profileLoaded, segments, router, isOnboardingComplete]);
}
