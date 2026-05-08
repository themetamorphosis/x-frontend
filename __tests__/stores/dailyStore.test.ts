import { useDailyStore } from "../../stores/dailyStore";
import type { DailySummary, LoggedFood } from "../../types/food";

const mockSummary: DailySummary = {
  date: "2026-05-03",
  targets: { calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65, fiber_g: 30 },
  consumed: { calories: 500, protein_g: 40, carbs_g: 50, fat_g: 15, fiber_g: 5 },
  remaining: { calories: 1500, protein_g: 110, carbs_g: 150, fat_g: 50, fiber_g: 25 },
  by_meal: {
    breakfast: [
      { id: "f1", food_name: "Oats", portion: "100g", calories: 300, protein_g: 10, carbs_g: 40, fat_g: 5, fiber_g: 3 },
    ],
    lunch: [
      { id: "f2", food_name: "Chicken", portion: "200g", calories: 200, protein_g: 30, carbs_g: 10, fat_g: 10, fiber_g: 2 },
    ],
    dinner: [],
    snack: [],
  },
  water_ml: 500,
};

describe("dailyStore", () => {
  beforeEach(() => {
    useDailyStore.setState({ summary: null, loading: false, error: null });
  });

  describe("addFoodLog", () => {
    it("adds food to the correct meal", () => {
      useDailyStore.setState({ summary: { ...mockSummary } });
      const newFood: LoggedFood & { meal_type: import("../../types/food").MealType } = {
        id: "f3", food_name: "Rice", portion: "150g", calories: 200, protein_g: 5, carbs_g: 40, fat_g: 2, fiber_g: 1, meal_type: "dinner",
      };
      useDailyStore.getState().addFoodLog(newFood);
      expect(useDailyStore.getState().summary!.by_meal.dinner).toHaveLength(1);
      expect(useDailyStore.getState().summary!.by_meal.dinner[0].food_name).toBe("Rice");
    });

    it("updates consumed totals", () => {
      useDailyStore.setState({ summary: { ...mockSummary } });
      const newFood: LoggedFood & { meal_type: import("../../types/food").MealType } = {
        id: "f3", food_name: "Rice", portion: "150g", calories: 200, protein_g: 5, carbs_g: 40, fat_g: 2, fiber_g: 1, meal_type: "dinner",
      };
      useDailyStore.getState().addFoodLog(newFood);
      expect(useDailyStore.getState().summary!.consumed.calories).toBe(700);
      expect(useDailyStore.getState().summary!.consumed.protein_g).toBe(45);
    });

    it("updates remaining totals", () => {
      useDailyStore.setState({ summary: { ...mockSummary } });
      const newFood: LoggedFood & { meal_type: import("../../types/food").MealType } = {
        id: "f3", food_name: "Rice", portion: "150g", calories: 200, protein_g: 5, carbs_g: 40, fat_g: 2, fiber_g: 1, meal_type: "dinner",
      };
      useDailyStore.getState().addFoodLog(newFood);
      expect(useDailyStore.getState().summary!.remaining.calories).toBe(1300);
    });

    it("does nothing when summary is null", () => {
      useDailyStore.getState().addFoodLog({ id: "f3", food_name: "X", portion: null, calories: 100, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, meal_type: "dinner" } as LoggedFood & { meal_type: import("../../types/food").MealType });
      expect(useDailyStore.getState().summary).toBeNull();
    });
  });

  describe("removeFoodLog", () => {
    it("removes food by id", () => {
      useDailyStore.setState({ summary: { ...mockSummary } });
      useDailyStore.getState().removeFoodLog("f1");
      expect(useDailyStore.getState().summary!.by_meal.breakfast).toHaveLength(0);
    });

    it("subtracts removed food from consumed", () => {
      useDailyStore.setState({ summary: { ...mockSummary } });
      useDailyStore.getState().removeFoodLog("f1");
      expect(useDailyStore.getState().summary!.consumed.calories).toBe(200);
      expect(useDailyStore.getState().summary!.consumed.protein_g).toBe(30);
    });

    it("does nothing for non-existent id", () => {
      useDailyStore.setState({ summary: { ...mockSummary } });
      useDailyStore.getState().removeFoodLog("nonexistent");
      expect(useDailyStore.getState().summary!.consumed.calories).toBe(500);
    });

    it("does nothing when summary is null", () => {
      useDailyStore.getState().removeFoodLog("f1");
      expect(useDailyStore.getState().summary).toBeNull();
    });
  });

  describe("setWater", () => {
    it("updates water_ml", () => {
      useDailyStore.setState({ summary: { ...mockSummary } });
      useDailyStore.getState().setWater(1000);
      expect(useDailyStore.getState().summary!.water_ml).toBe(1000);
    });

    it("does nothing when summary is null", () => {
      useDailyStore.getState().setWater(1000);
      expect(useDailyStore.getState().summary).toBeNull();
    });
  });

  describe("rollbackSummary", () => {
    it("restores previous summary", () => {
      useDailyStore.setState({ summary: { ...mockSummary } });
      const prev = { ...mockSummary, water_ml: 999 };
      useDailyStore.getState().rollbackSummary(prev);
      expect(useDailyStore.getState().summary!.water_ml).toBe(999);
    });
  });
});
