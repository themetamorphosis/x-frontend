import { useFoodLogStore } from "../../stores/foodLogStore";
import type { ParsedFood, AIParseResponse } from "../../types/food";

const mockAIResult: AIParseResponse = {
  foods: [
    { name: "Chicken breast", portion: "200g", calories: 330, protein_g: 62, carbs_g: 0, fat_g: 7, fiber_g: 0 },
    { name: "Rice", portion: "150g", calories: 195, protein_g: 4, carbs_g: 42, fat_g: 0.5, fiber_g: 0.5 },
  ],
  total: { name: "Total", portion: null, calories: 525, protein_g: 66, carbs_g: 42, fat_g: 7.5, fiber_g: 0.5 },
  confidence: "high",
  notes: "High protein meal",
};

describe("foodLogStore", () => {
  beforeEach(() => {
    useFoodLogStore.setState({
      aiResult: null,
      editedFoods: [],
      mealType: "breakfast",
      source: "ai_text",
      loading: false,
      error: null,
    });
  });

  describe("setAIResult", () => {
    it("sets aiResult and copies foods to editedFoods", () => {
      useFoodLogStore.getState().setAIResult(mockAIResult, "ai_text");
      const s = useFoodLogStore.getState();
      expect(s.aiResult).toBe(mockAIResult);
      expect(s.editedFoods).toHaveLength(2);
      expect(s.editedFoods[0].name).toBe("Chicken breast");
    });

    it("creates independent copies of foods", () => {
      useFoodLogStore.getState().setAIResult(mockAIResult, "ai_photo");
      const s = useFoodLogStore.getState();
      expect(s.editedFoods[0]).not.toBe(mockAIResult.foods[0]);
      expect(s.editedFoods[0].name).toBe(mockAIResult.foods[0].name);
    });

    it("sets source correctly", () => {
      useFoodLogStore.getState().setAIResult(mockAIResult, "ai_photo");
      expect(useFoodLogStore.getState().source).toBe("ai_photo");
    });

    it("clears error", () => {
      useFoodLogStore.setState({ error: "prev error" });
      useFoodLogStore.getState().setAIResult(mockAIResult, "ai_text");
      expect(useFoodLogStore.getState().error).toBeNull();
    });
  });

  describe("updateFood", () => {
    it("updates food at index", () => {
      useFoodLogStore.getState().setAIResult(mockAIResult, "ai_text");
      const updated: ParsedFood = { name: "Turkey breast", portion: "200g", calories: 300, protein_g: 55, carbs_g: 0, fat_g: 5, fiber_g: 0 };
      useFoodLogStore.getState().updateFood(0, updated);
      expect(useFoodLogStore.getState().editedFoods[0].name).toBe("Turkey breast");
    });
  });

  describe("removeFood", () => {
    it("removes food at index", () => {
      useFoodLogStore.getState().setAIResult(mockAIResult, "ai_text");
      useFoodLogStore.getState().removeFood(0);
      expect(useFoodLogStore.getState().editedFoods).toHaveLength(1);
      expect(useFoodLogStore.getState().editedFoods[0].name).toBe("Rice");
    });
  });

  describe("addFood", () => {
    it("appends food", () => {
      useFoodLogStore.getState().setAIResult(mockAIResult, "ai_text");
      const newFood: ParsedFood = { name: "Salad", portion: "100g", calories: 50, protein_g: 2, carbs_g: 5, fat_g: 2, fiber_g: 3 };
      useFoodLogStore.getState().addFood(newFood);
      expect(useFoodLogStore.getState().editedFoods).toHaveLength(3);
    });
  });

  describe("reset", () => {
    it("resets all state to defaults", () => {
      useFoodLogStore.getState().setAIResult(mockAIResult, "ai_photo");
      useFoodLogStore.getState().setLoading(true);
      useFoodLogStore.getState().setError("err");
      useFoodLogStore.getState().reset();
      const s = useFoodLogStore.getState();
      expect(s.aiResult).toBeNull();
      expect(s.editedFoods).toHaveLength(0);
      expect(s.loading).toBe(false);
      expect(s.error).toBeNull();
      expect(s.source).toBe("ai_text");
    });
  });

  describe("setMealType", () => {
    it("updates meal type", () => {
      useFoodLogStore.getState().setMealType("dinner");
      expect(useFoodLogStore.getState().mealType).toBe("dinner");
    });
  });
});
