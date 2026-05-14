import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  useFocusEffect: (cb: () => void) => { cb(); },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSegments: () => ["(tabs)"],
}));

jest.mock("../../services/api", () => ({
  api: { post: jest.fn(), get: jest.fn() },
}));

jest.mock("../../stores/dailyStore", () => ({
  useDailyStore: jest.fn((selector: any) => {
    const store = {
      summary: {
        targets: { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65 },
        consumed: { calories: 1500, protein_g: 100, carbs_g: 150, fat_g: 50 },
        water_ml: 1200,
        by_meal: {},
      },
      loading: false,
      fetchDaily: jest.fn().mockResolvedValue(undefined),
      addFoodLog: jest.fn(),
    };
    return selector ? selector(store) : store;
  }),
}));

jest.mock("../../stores/progressStore", () => ({
  useProgressStore: jest.fn((selector: any) => {
    const store = {
      weekly: { daily_totals: [], averages: {}, goal_adherence: {} },
      fetchWeekly: jest.fn().mockResolvedValue(undefined),
    };
    return selector ? selector(store) : store;
  }),
}));

jest.mock("../../stores/authStore", () => ({
  useAuthStore: jest.fn(() => ({ isAuthenticated: true, isLoading: false })),
}));

jest.mock("../../utils/theme", () => ({
  useTheme: () => ({
    mode: "light",
    colors: {
      bg: "#F5F5F5", surface: "#FFFFFF", border: "#EBEBEB",
      text: "#111111", textSecondary: "#888888", textTertiary: "#AAAAAA",
      primary: "#111111", primaryText: "#FFFFFF", error: "#E53935",
      overlay: "rgba(0, 0, 0, 0.3)",
    },
    isDark: false,
    toggleTheme: jest.fn(),
  }),
  lightShadow: {},
  darkShadow: {},
}));

jest.mock("../../utils/haptics", () => ({
  haptic: { light: jest.fn(), success: jest.fn(), error: jest.fn() },
}));

jest.mock("../../components/ui/v2/ScreenWrapper", () => ({
  ScreenWrapper: ({ children }: any) => children,
}));

jest.mock("../../components/ui/v2/Text", () => ({
  Text: ({ children, ...rest }: any) => {
    const React = require("react");
    return React.createElement("Text", rest, children);
  },
}));

jest.mock("../../components/ui/v2/ProgressRing", () => ({
  ProgressRing: ({ children }: any) => children,
}));

jest.mock("../../components/ui/v2/StatBlock", () => ({
  StatBlock: ({ value, label }: any) => {
    const React = require("react");
    return React.createElement("StatBlock", { "data-value": value, "data-label": label });
  },
}));

jest.mock("../../components/ui/v2/DateStrip", () => ({
  DateStrip: ({ onSelectDate }: any) => {
    const React = require("react");
    return React.createElement("DateStrip", { "data-testid": "date-strip" });
  },
}));

jest.mock("../../components/ui/v2/ChatBubble", () => ({
  ChatBubble: ({ message, variant }: any) => {
    const React = require("react");
    return React.createElement("ChatBubble", { "data-message": message, "data-variant": variant });
  },
}));

jest.mock("../../components/ui/v2/ChatInput", () => ({
  ChatInput: ({ onSend }: any) => {
    const React = require("react");
    return React.createElement("ChatInput", { "data-testid": "chat-input" });
  },
}));

jest.mock("../../components/ui/v2/Skeleton", () => ({
  Skeleton: () => {
    const React = require("react");
    return React.createElement("Skeleton");
  },
  SkeletonStat: () => {
    const React = require("react");
    return React.createElement("SkeletonStat");
  },
}));

jest.mock("../../components/ui/v2/Toast", () => ({
  Toast: () => null,
}));

jest.mock("../../components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: any) => children,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

import DashboardScreen from "../../app/(tabs)/index";
import { useDailyStore } from "../../stores/dailyStore";

describe("DashboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders progress ring with consumed calories", () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText("1500")).toBeTruthy();
    expect(getByText("kcal")).toBeTruthy();
  });

  it("renders macro stat blocks", () => {
    const { getAllByText } = render(<DashboardScreen />);
    expect(getAllByText("Protein").length).toBeGreaterThan(0);
    expect(getAllByText("Carbs").length).toBeGreaterThan(0);
    expect(getAllByText("Fat").length).toBeGreaterThan(0);
  });

  it("renders empty state chat message", () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText(/Tell me what you ate/)).toBeTruthy();
  });

  it("fetches daily data on mount", () => {
    const mockFetch = jest.fn().mockResolvedValue(undefined);
    (useDailyStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const store = {
        summary: { targets: { calories: 2000 }, consumed: { calories: 0 }, water_ml: 0, by_meal: {} },
        loading: false,
        fetchDaily: mockFetch,
        addFoodLog: jest.fn(),
      };
      return selector ? selector(store) : store;
    });

    render(<DashboardScreen />);
    expect(mockFetch).toHaveBeenCalled();
  });
});
