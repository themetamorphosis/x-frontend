/**
 * Tests for the WaterTracker component.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

// Mock dependencies before import
jest.mock("../../services/api", () => ({
  api: { post: jest.fn() },
}));

jest.mock("../../stores/dailyStore", () => ({
  useDailyStore: jest.fn((selector: any) => {
    const store = { setWater: jest.fn() };
    return selector ? selector(store) : store;
  }),
}));

jest.mock("../../utils/haptics", () => ({
  haptic: { light: jest.fn() },
}));

jest.mock("../../utils/theme", () => ({
  useTheme: () => ({
    mode: "light",
    colors: {
      bg: "#F7F5F0",
      surface: "#FFFFFF",
      border: "#EDEBE6",
      text: "#1A1A1A",
      textSecondary: "#7A7A7A",
      textTertiary: "#B0B0B0",
      primary: "#1A1A1A",
      primaryText: "#FFFFFF",
      accent: "#FF6B35",
      error: "#E53935",
      overlay: "rgba(0, 0, 0, 0.3)",
    },
    isDark: false,
    toggleTheme: jest.fn(),
  }),
  lightShadow: {},
  darkShadow: {},
  radius: { sm: 12, md: 16, card: 20, modal: 24, pill: 999 },
}));

jest.mock("moti/interactions", () => ({
  MotiPressable: ({ children, onPress, ...rest }: any) => {
    const React = require("react");
    return React.createElement("MotiPressable", { onPress, ...rest }, children);
  },
}));

jest.mock("lucide-react-native", () => ({
  Minus: "Minus",
  Plus: "Plus",
  Droplets: "Droplets",
}));

import { WaterTracker } from "../../components/WaterTracker";
import { api } from "../../services/api";
import { useDailyStore } from "../../stores/dailyStore";

describe("WaterTracker", () => {
  const mockSetWater = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDailyStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const store = { setWater: mockSetWater };
      return selector ? selector(store) : store;
    });
    (api.post as jest.Mock).mockResolvedValue({});
  });

  it("renders current water amount", () => {
    const { getByText } = render(
      <WaterTracker current_ml={1200} target_ml={2400} />
    );
    expect(getByText("5 / 10 cups")).toBeTruthy();
  });

  it("calculates cups remaining", () => {
    const { getByText } = render(
      <WaterTracker current_ml={1200} target_ml={2400} />
    );
    expect(getByText("5")).toBeTruthy(); // cups remaining
  });

  it("calls API and updates store on add", async () => {
    const { getByLabelText } = render(
      <WaterTracker current_ml={1200} target_ml={2400} />
    );

    const addBtn = getByLabelText("Add one cup of water");
    fireEvent.press(addBtn);

    await waitFor(() => {
      expect(mockSetWater).toHaveBeenCalledWith(1440); // 1200 + 240
      expect(api.post).toHaveBeenCalledWith("/logs/water", { amount_ml: 240 });
    });
  });

  it("rolls back on API failure", async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { getByLabelText } = render(
      <WaterTracker current_ml={1200} target_ml={2400} />
    );

    const addBtn = getByLabelText("Add one cup of water");
    fireEvent.press(addBtn);

    await waitFor(() => {
      // First call sets optimistic value
      expect(mockSetWater).toHaveBeenCalledWith(1440);
      // Second call rolls back
      expect(mockSetWater).toHaveBeenCalledWith(1200);
    });
  });

  it("calls API on remove", async () => {
    const { getByLabelText } = render(
      <WaterTracker current_ml={1200} target_ml={2400} />
    );

    const removeBtn = getByLabelText("Remove one cup of water");
    fireEvent.press(removeBtn);

    await waitFor(() => {
      expect(mockSetWater).toHaveBeenCalledWith(960); // 1200 - 240
      expect(api.post).toHaveBeenCalledWith("/logs/water", { amount_ml: -240 });
    });
  });

  it("prevents negative amounts on remove", () => {
    const { getByLabelText } = render(
      <WaterTracker current_ml={0} target_ml={2400} />
    );

    const removeBtn = getByLabelText("Remove one cup of water");
    fireEvent.press(removeBtn);

    // Should not call API or setWater
    expect(mockSetWater).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("uses default target of 2400ml", () => {
    const { getByText } = render(
      <WaterTracker current_ml={240} />
    );
    expect(getByText("1 / 10 cups")).toBeTruthy();
  });
});
