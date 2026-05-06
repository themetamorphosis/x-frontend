import { useDailyStore } from "../../stores/dailyStore";

const makeSummary = () => ({
  date: new Date().toISOString().split("T")[0],
  targets: { calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65, fiber_g: 30, water_ml: 2500 },
  consumed: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
  remaining: { calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65, fiber_g: 30 },
  by_meal: { breakfast: [], lunch: [], dinner: [], snack: [] },
  water_ml: 0,
});

describe("dailyStore — food log CRUD", () => {
  beforeEach(() => {
    useDailyStore.setState({ summary: makeSummary(), loading: false, error: null });
  });

  describe("optimistic food log add", () => {
    it("adds a food entry to the correct meal", () => {
      const entry = {
        id: "temp-1",
        food_name: "Oatmeal",
        portion: "100g",
        calories: 300,
        protein_g: 10,
        carbs_g: 50,
        fat_g: 8,
        fiber_g: 5,
        meal_type: "breakfast" as const,
      };
      useDailyStore.getState().addFoodLog(entry as any);
      const s = useDailyStore.getState();
      expect(s.summary!.by_meal.breakfast).toHaveLength(1);
      expect(s.summary!.by_meal.breakfast[0].food_name).toBe("Oatmeal");
    });

    it("updates consumed totals on add", () => {
      const entry = {
        id: "temp-1",
        food_name: "Rice",
        portion: "200g",
        calories: 216,
        protein_g: 5,
        carbs_g: 45,
        fat_g: 2,
        fiber_g: 1,
        meal_type: "lunch" as const,
      };
      useDailyStore.getState().addFoodLog(entry as any);
      const s = useDailyStore.getState();
      expect(s.summary!.consumed.calories).toBe(216);
      expect(s.summary!.consumed.carbs_g).toBe(45);
    });
  });

  describe("optimistic food log remove", () => {
    it("removes a food entry by id", () => {
      const entry = {
        id: "log-123",
        food_name: "Eggs",
        portion: "2 eggs",
        calories: 140,
        protein_g: 12,
        carbs_g: 1,
        fat_g: 10,
        fiber_g: 0,
        meal_type: "breakfast" as const,
      };
      useDailyStore.getState().addFoodLog(entry as any);
      expect(useDailyStore.getState().summary!.by_meal.breakfast).toHaveLength(1);

      useDailyStore.getState().removeFoodLog("log-123");
      expect(useDailyStore.getState().summary!.by_meal.breakfast).toHaveLength(0);
    });

    it("reverts consumed totals on remove", () => {
      const entry = {
        id: "log-456",
        food_name: "Chicken",
        calories: 500,
        protein_g: 40,
        carbs_g: 0,
        fat_g: 10,
        fiber_g: 0,
        meal_type: "dinner" as const,
      };
      useDailyStore.getState().addFoodLog(entry as any);
      expect(useDailyStore.getState().summary!.consumed.calories).toBe(500);

      useDailyStore.getState().removeFoodLog("log-456");
      expect(useDailyStore.getState().summary!.consumed.calories).toBe(0);
    });
  });

  describe("water tracking", () => {
    it("sets water amount", () => {
      useDailyStore.getState().setWater(500);
      expect(useDailyStore.getState().summary!.water_ml).toBe(500);
    });
  });
});
