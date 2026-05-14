import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

jest.mock("expo-router", () => ({
  useFocusEffect: (cb: () => void) => { cb(); },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("../../services/api", () => ({
  api: { post: jest.fn(), get: jest.fn() },
}));

jest.mock("../../stores/progressStore", () => ({
  useProgressStore: jest.fn((selector: any) => {
    const store = {
      weightLogs: [
        { id: "1", weight_kg: 80, logged_at: "2026-05-01", log_date: "2026-05-01" },
        { id: "2", weight_kg: 79, logged_at: "2026-05-10", log_date: "2026-05-10" },
      ],
      weightRange: 30,
      weekly: {
        daily_totals: [],
        averages: { calories: 1800 },
        goal_adherence: { calories: 5, protein_g: 4, carbs_g: 3, fat_g: 5 },
      },
      streaks: { current_streak: 7, longest_streak: 14, total_days_logged: 30 },
      loading: false,
      setWeightRange: jest.fn(),
      logWeight: jest.fn().mockResolvedValue(undefined),
      fetchAll: jest.fn().mockResolvedValue(undefined),
    };
    return selector ? selector(store) : store;
  }),
}));

jest.mock("../../stores/profileStore", () => ({
  useProfileStore: jest.fn((selector: any) => {
    const store = {
      profile: { weight_kg: 82, goal: "lose_fat" },
      targets: { calories: 1800 },
    };
    return selector ? selector(store) : store;
  }),
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

jest.mock("../../utils/typography-v2", () => ({
  fonts: {
    light: "Inter_400Regular", regular: "Inter_400Regular",
    medium: "Inter_500Medium", semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold", extraBold: "Inter_800ExtraBold",
  },
}));

jest.mock("../../utils/haptics", () => ({
  haptic: { light: jest.fn(), success: jest.fn(), error: jest.fn() },
}));

jest.mock("../../components/ui/v2/ScreenWrapper", () => ({
  ScreenWrapper: ({ children }: any) => children,
}));

jest.mock("../../components/ui/v2/Card", () => ({
  Card: ({ children, style }: any) => children,
}));

jest.mock("../../components/ui/v2/Text", () => ({
  Text: ({ children, ...rest }: any) => {
    const React = require("react");
    return React.createElement("Text", rest, children);
  },
}));

jest.mock("../../components/ui/v2/Button", () => ({
  Button: ({ title, onPress, disabled }: any) => {
    const React = require("react");
    return React.createElement("Button", { onPress, disabled, "data-title": title }, title);
  },
}));

jest.mock("../../components/ui/v2/Skeleton", () => ({
  Skeleton: () => null,
  SkeletonCard: () => null,
}));

jest.mock("../../components/ui/v2/Toast", () => ({
  Toast: () => null,
}));

jest.mock("../../components/WeightChart", () => ({
  WeightChart: () => {
    const React = require("react");
    return React.createElement("WeightChart");
  },
}));

jest.mock("../../components/WeeklyTrend", () => ({
  WeeklyTrend: () => {
    const React = require("react");
    return React.createElement("WeeklyTrend");
  },
}));

jest.mock("../../components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: any) => children,
}));

jest.mock("moti/interactions", () => ({
  MotiPressable: ({ children, onPress, ...rest }: any) => {
    const React = require("react");
    return React.createElement("MotiPressable", { onPress, ...rest }, children);
  },
}));

import ProgressScreen from "../../app/(tabs)/progress";
import { useProgressStore } from "../../stores/progressStore";

describe("ProgressScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders streak information", () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText("7")).toBeTruthy(); // current streak
    expect(getByText("days")).toBeTruthy();
  });

  it("renders longest streak and total days", () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText("14")).toBeTruthy(); // longest streak
    expect(getByText("30")).toBeTruthy(); // total days logged
  });

  it("renders goal adherence section", () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText("Goal Adherence")).toBeTruthy();
  });

  it("renders current weight", () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText("79 kg")).toBeTruthy();
  });

  it("renders weight change", () => {
    const { getByText } = render(<ProgressScreen />);
    // 79 - 82 = -3 kg
    expect(getByText("-3.0 kg")).toBeTruthy();
  });

  it("shows weight input when Log Weight is pressed", () => {
    const { getByText, getByLabelText } = render(<ProgressScreen />);
    fireEvent.press(getByText("Log Weight"));
    expect(getByLabelText("Weight in kilograms")).toBeTruthy();
  });

  it("validates weight input range", async () => {
    const mockLogWeight = jest.fn().mockResolvedValue(undefined);
    (useProgressStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const store = {
        weightLogs: [{ id: "1", weight_kg: 80, logged_at: "2026-05-01", log_date: "2026-05-01" }],
        weightRange: 30,
        weekly: null,
        streaks: null,
        loading: false,
        setWeightRange: jest.fn(),
        logWeight: mockLogWeight,
        fetchAll: jest.fn().mockResolvedValue(undefined),
      };
      return selector ? selector(store) : store;
    });

    const { getByText, getByLabelText } = render(<ProgressScreen />);
    fireEvent.press(getByText("Log Weight"));

    const input = getByLabelText("Weight in kilograms");
    fireEvent.changeText(input, "10"); // below 20 kg minimum
    fireEvent.press(getByText("Save"));

    await waitFor(() => {
      expect(mockLogWeight).not.toHaveBeenCalled();
    });
  });
});
