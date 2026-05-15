import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { FoodItemCard } from "../../components/log/FoodItemCard";
import type { ParsedFood } from "../../types/food";

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

jest.mock("../../utils/haptics", () => ({
  haptic: { light: jest.fn() },
}));

const mockFood: ParsedFood = {
  name: "Chicken Breast",
  portion: "100g",
  calories: 165,
  protein_g: 31,
  carbs_g: 0,
  fat_g: 3.6,
  fiber_g: 0,
};

describe("FoodItemCard", () => {
  it("renders food name", () => {
    render(
      <FoodItemCard food={mockFood} onEdit={() => {}} onSaveToLibrary={() => {}} onRemove={() => {}} />
    );
    expect(screen.getByText("Chicken Breast")).toBeTruthy();
  });

  it("renders portion", () => {
    render(
      <FoodItemCard food={mockFood} onEdit={() => {}} onSaveToLibrary={() => {}} onRemove={() => {}} />
    );
    expect(screen.getByText("100g")).toBeTruthy();
  });

  it("renders calories", () => {
    render(
      <FoodItemCard food={mockFood} onEdit={() => {}} onSaveToLibrary={() => {}} onRemove={() => {}} />
    );
    expect(screen.getByText("165 cal")).toBeTruthy();
  });

  it("renders macros", () => {
    render(
      <FoodItemCard food={mockFood} onEdit={() => {}} onSaveToLibrary={() => {}} onRemove={() => {}} />
    );
    expect(screen.getByText("P 31g")).toBeTruthy();
    expect(screen.getByText("C 0g")).toBeTruthy();
    expect(screen.getByText("F 3.6g")).toBeTruthy();
  });

  it("calls onEdit when Edit pressed", () => {
    const fn = jest.fn();
    render(
      <FoodItemCard food={mockFood} onEdit={fn} onSaveToLibrary={() => {}} onRemove={() => {}} />
    );
    fireEvent.press(screen.getByText("Edit"));
    expect(fn).toHaveBeenCalled();
  });

  it("calls onSaveToLibrary when star pressed", () => {
    const fn = jest.fn();
    render(
      <FoodItemCard food={mockFood} onEdit={() => {}} onSaveToLibrary={fn} onRemove={() => {}} />
    );
    fireEvent.press(screen.getByText("★"));
    expect(fn).toHaveBeenCalled();
  });

  it("calls onRemove when x pressed", () => {
    const fn = jest.fn();
    render(
      <FoodItemCard food={mockFood} onEdit={() => {}} onSaveToLibrary={() => {}} onRemove={fn} />
    );
    fireEvent.press(screen.getByText("×"));
    expect(fn).toHaveBeenCalled();
  });

  it("renders without portion", () => {
    const noPortion = { ...mockFood, portion: null };
    render(
      <FoodItemCard food={noPortion} onEdit={() => {}} onSaveToLibrary={() => {}} onRemove={() => {}} />
    );
    expect(screen.getByText("Chicken Breast")).toBeTruthy();
  });
});
