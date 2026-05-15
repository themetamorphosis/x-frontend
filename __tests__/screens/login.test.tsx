import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("expo-auth-session/providers/google", () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

jest.mock("../../services/api", () => ({
  api: { post: jest.fn() },
}));

jest.mock("../../stores/authStore", () => ({
  useAuthStore: jest.fn(() => ({ setAuth: jest.fn() })),
}));

jest.mock("../../stores/profileStore", () => ({
  useProfileStore: jest.fn(() => ({ fetchProfile: jest.fn() })),
}));

jest.mock("../../utils/theme", () => ({
  useTheme: () => ({
    mode: "light",
    colors: {
      bg: "#F7F5F0", surface: "#FFFFFF", border: "#EDEBE6",
      text: "#1A1A1A", textSecondary: "#7A7A7A", textTertiary: "#B0B0B0",
      primary: "#1A1A1A", primaryText: "#FFFFFF", error: "#E53935",
      accent: "#FF6B35",
      overlay: "rgba(0, 0, 0, 0.3)",
    },
    isDark: false,
    toggleTheme: jest.fn(),
  }),
  lightShadow: {},
  darkShadow: {},
  radius: { sm: 12, md: 16, card: 20, modal: 24, pill: 999 },
}));

jest.mock("../../components/ui/v2/ScreenWrapper", () => ({
  ScreenWrapper: ({ children }: any) => children,
}));

jest.mock("../../components/ui/v2/Button", () => ({
  Button: ({ title, onPress, disabled, ...rest }: any) => {
    const React = require("react");
    return React.createElement("Button", { onPress, disabled, "data-title": title, ...rest }, title);
  },
}));

jest.mock("../../components/ui/v2/Text", () => ({
  Text: ({ children, ...rest }: any) => {
    const React = require("react");
    return React.createElement("Text", rest, children);
  },
}));

jest.mock("../../components/ui/v2/Toast", () => ({
  Toast: ({ message, visible }: any) => {
    if (!visible) return null;
    const React = require("react");
    return React.createElement("Toast", { "data-message": message });
  },
}));

import LoginScreen from "../../app/(auth)/login";
import { api } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { useProfileStore } from "../../stores/profileStore";

describe("LoginScreen", () => {
  const mockSetAuth = jest.fn();
  const mockFetchProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({ setAuth: mockSetAuth });
    (useProfileStore as unknown as jest.Mock).mockReturnValue({ fetchProfile: mockFetchProfile });
  });

  it("renders NutriLog branding", () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText("NutriLog")).toBeTruthy();
    expect(getByText("AI-powered nutrition tracking")).toBeTruthy();
  });

  it("renders Google sign-in button", () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText("Continue with Google")).toBeTruthy();
  });

  it("shows Dev Login button in __DEV__ mode", () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;
    const { getByText } = render(<LoginScreen />);
    expect(getByText("Dev Login")).toBeTruthy();
    (global as any).__DEV__ = originalDev;
  });

  it("calls API and setAuth on successful dev login", async () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const mockResponse = {
      access_token: "atoken",
      refresh_token: "rtoken",
      user: { id: "u1", email: "test@test.com", name: "Test", avatar_url: null },
    };
    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText("Dev Login"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/dev-login");
      expect(mockSetAuth).toHaveBeenCalledWith("atoken", "rtoken", "u1", "test@test.com", "Test", null);
      expect(mockFetchProfile).toHaveBeenCalled();
    });

    (global as any).__DEV__ = originalDev;
  });

  it("shows error toast on dev login failure", async () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    (api.post as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText("Dev Login"));

    await waitFor(() => {
      expect(getByText("Dev login failed. Is DEV_MODE enabled on the backend?")).toBeTruthy();
    });

    (global as any).__DEV__ = originalDev;
  });
});
