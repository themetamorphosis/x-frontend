import { renderHook } from "@testing-library/react-native";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
  useSegments: jest.fn(() => ["(tabs)"]),
}));

jest.mock("../../stores/authStore", () => ({
  useAuthStore: jest.fn(() => ({ isAuthenticated: false, isLoading: true })),
}));

jest.mock("../../stores/profileStore", () => ({
  useProfileStore: jest.fn(() => ({
    profile: null,
    profileLoaded: false,
    isOnboardingComplete: jest.fn(() => false),
  })),
}));

import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useAuthStore } from "../../stores/authStore";
import { useProfileStore } from "../../stores/profileStore";
import { useSegments } from "expo-router";

describe("useAuthGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not redirect while loading", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderHook(() => useAuthGuard());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects to login when unauthenticated and not on auth screen", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    (useSegments as unknown as jest.Mock).mockReturnValue(["(tabs)"]);

    renderHook(() => useAuthGuard());
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
  });

  it("does not redirect when unauthenticated and already on auth screen", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    (useSegments as unknown as jest.Mock).mockReturnValue(["(auth)"]);

    renderHook(() => useAuthGuard());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects to tabs when authenticated and on auth screen", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    (useProfileStore as unknown as jest.Mock).mockReturnValue({
      profile: { goal: "lose_fat", age: 25 },
      profileLoaded: true,
      isOnboardingComplete: jest.fn(() => true),
    });
    (useSegments as unknown as jest.Mock).mockReturnValue(["(auth)"]);

    renderHook(() => useAuthGuard());
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("redirects to onboarding when profile is incomplete", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    (useProfileStore as unknown as jest.Mock).mockReturnValue({
      profile: { goal: null },
      profileLoaded: true,
      isOnboardingComplete: jest.fn(() => false),
    });
    (useSegments as unknown as jest.Mock).mockReturnValue(["(tabs)"]);

    renderHook(() => useAuthGuard());
    expect(mockReplace).toHaveBeenCalledWith("/(onboarding)/goal");
  });

  it("does not redirect when authenticated and on tabs with complete profile", () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    (useProfileStore as unknown as jest.Mock).mockReturnValue({
      profile: { goal: "lose_fat", age: 25 },
      profileLoaded: true,
      isOnboardingComplete: jest.fn(() => true),
    });
    (useSegments as unknown as jest.Mock).mockReturnValue(["(tabs)"]);

    renderHook(() => useAuthGuard());
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
