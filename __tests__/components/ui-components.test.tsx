import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { OfflineBanner } from "../../components/OfflineBanner";
import { TotalCard } from "../../components/log/TotalCard";
import { MealTypeSelector } from "../../components/log/MealTypeSelector";

describe("Card", () => {
  it("renders children", () => {
    const { toJSON } = render(<Card><span>hello</span></Card>);
    expect(toJSON()).toBeTruthy();
  });

  it("renders with noPadding", () => {
    const { toJSON } = render(<Card noPadding><span>test</span></Card>);
    expect(toJSON()).toBeTruthy();
  });

  it("applies accessibility props", () => {
    const { toJSON } = render(
      <Card accessible accessibilityLabel="Test card"><span>x</span></Card>
    );
    expect(toJSON()).toBeTruthy();
  });
});

describe("Button", () => {
  it("renders title", () => {
    render(<Button title="CLICK ME" onPress={() => {}} />);
    expect(screen.getByText("CLICK ME")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const fn = jest.fn();
    render(<Button title="Press" onPress={fn} />);
    fireEvent.press(screen.getByText("Press"));
    expect(fn).toHaveBeenCalled();
  });

  it("renders loading state (no title shown)", () => {
    render(<Button title="Save" onPress={() => {}} loading />);
    expect(screen.queryByText("Save")).toBeNull();
  });

  it("renders secondary variant", () => {
    render(<Button title="Cancel" onPress={() => {}} variant="secondary" />);
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  it("renders ghost variant", () => {
    render(<Button title="Skip" onPress={() => {}} variant="ghost" />);
    expect(screen.getByText("Skip")).toBeTruthy();
  });
});

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="NO DATA" />);
    expect(screen.getByText("NO DATA")).toBeTruthy();
  });

  it("renders description", () => {
    render(<EmptyState title="Empty" description="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  it("renders action button", () => {
    const fn = jest.fn();
    render(<EmptyState title="Empty" actionLabel="Add Item" onAction={fn} />);
    expect(screen.getByText("Add Item")).toBeTruthy();
  });

  it("does not render action when not provided", () => {
    render(<EmptyState title="No action" />);
    expect(screen.queryByText("Add Item")).toBeNull();
  });
});

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
