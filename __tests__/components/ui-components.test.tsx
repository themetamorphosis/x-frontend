import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { OfflineBanner } from "../../components/OfflineBanner";
import { TotalCard } from "../../components/log/TotalCard";
import { MealTypeSelector } from "../../components/log/MealTypeSelector";

jest.mock("../../utils/theme", () => ({
  useTheme: () => ({
    mode: "light",
    colors: {
      bg: "#F5F5F5",
      surface: "#FFFFFF",
      border: "#EBEBEB",
      text: "#111111",
      textSecondary: "#888888",
      textTertiary: "#AAAAAA",
      primary: "#111111",
      primaryText: "#FFFFFF",
      error: "#E53935",
      overlay: "rgba(0, 0, 0, 0.3)",
    },
    isDark: false,
    toggleTheme: jest.fn(),
  }),
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
