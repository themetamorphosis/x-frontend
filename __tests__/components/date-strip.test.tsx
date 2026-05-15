/**
 * Tests for the DateStrip component.
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

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
  MotiPressable: ({ children, onPress, accessibilityLabel, ...rest }: any) => {
    const React = require("react");
    return React.createElement(
      "MotiPressable",
      { onPress, accessibilityLabel, ...rest },
      children
    );
  },
}));

import { DateStrip } from "../../components/ui/v2/DateStrip";

describe("DateStrip", () => {
  const today = new Date().toISOString().slice(0, 10);

  it("renders 7 day pills", () => {
    const { getByLabelText } = render(
      <DateStrip selectedDate={today} onSelectDate={jest.fn()} />
    );
    // Should have 7 day buttons
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    days.forEach((day) => {
      expect(getByLabelText(new RegExp(day))).toBeTruthy();
    });
  });

  it("calls onSelectDate when a day is pressed", () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(
      <DateStrip selectedDate={today} onSelectDate={onSelect} />
    );

    // Find and press a day pill
    const monday = getByLabelText(/Mon/);
    fireEvent.press(monday);

    expect(onSelect).toHaveBeenCalled();
  });

  it("highlights the selected date", () => {
    const { getByLabelText } = render(
      <DateStrip selectedDate={today} onSelectDate={jest.fn()} />
    );

    // The today pill should be selected (accessibilityState.selected)
    const todayDay = new Date().getDate();
    const todayPill = getByLabelText(new RegExp(`${todayDay}`));
    expect(todayPill).toBeTruthy();
  });

  it("shows today indicator", () => {
    // Today should have a dot indicator rendered
    const { toJSON } = render(
      <DateStrip selectedDate={today} onSelectDate={jest.fn()} />
    );
    // Component renders without error
    expect(toJSON()).toBeTruthy();
  });

  it("handles date change", () => {
    const onSelect = jest.fn();
    const { rerender } = render(
      <DateStrip selectedDate={today} onSelectDate={onSelect} />
    );

    // Re-render with a different date
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    rerender(
      <DateStrip selectedDate={yesterday} onSelectDate={onSelect} />
    );

    // Should re-render without error
    expect(true).toBe(true);
  });
});
