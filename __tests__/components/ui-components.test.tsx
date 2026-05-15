import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { OfflineBanner } from "../../components/OfflineBanner";
import { TotalCard } from "../../components/log/TotalCard";
import { MealTypeSelector } from "../../components/log/MealTypeSelector";

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
  radius: { sm: 12, md: 16, card: 20, modal: 24, pill: 999 },
  lightShadow: {},
  darkShadow: {},
}));

describe("OfflineBanner", () => {
  it("renders Offline text", () => {
    render(<OfflineBanner />);
    expect(screen.getByText("Offline")).toBeTruthy();
  });
});

describe("TotalCard", () => {
  it("renders totals", () => {
    render(
      <TotalCard totals={{ calories: 1500, protein_g: 100, carbs_g: 150, fat_g: 50 }} />
    );
    expect(screen.getByText("Total")).toBeTruthy();
    expect(screen.getByText("1500 cal")).toBeTruthy();
  });

  it("renders macros with decimal", () => {
    render(
      <TotalCard totals={{ calories: 2000, protein_g: 120.5, carbs_g: 200.3, fat_g: 65.7 }} />
    );
    expect(screen.getByText("Protein 120.5g")).toBeTruthy();
    expect(screen.getByText("Carbs 200.3g")).toBeTruthy();
    expect(screen.getByText("Fat 65.7g")).toBeTruthy();
  });
});

describe("MealTypeSelector", () => {
  it("renders all 4 meal types", () => {
    render(<MealTypeSelector value="breakfast" onChange={() => {}} />);
    expect(screen.getByText("Breakfast")).toBeTruthy();
    expect(screen.getByText("Lunch")).toBeTruthy();
    expect(screen.getByText("Dinner")).toBeTruthy();
    expect(screen.getByText("Snack")).toBeTruthy();
  });

  it("calls onChange when meal type pressed", () => {
    const fn = jest.fn();
    render(<MealTypeSelector value="breakfast" onChange={fn} />);
    fireEvent.press(screen.getByText("Lunch"));
    expect(fn).toHaveBeenCalledWith("lunch");
  });

  it("calls onChange with dinner", () => {
    const fn = jest.fn();
    render(<MealTypeSelector value="lunch" onChange={fn} />);
    fireEvent.press(screen.getByText("Dinner"));
    expect(fn).toHaveBeenCalledWith("dinner");
  });
});
