import { create } from "zustand";
import type { ParsedFood, AIParseResponse } from "../types/food";
import { detectMealType, type MealType } from "../utils/mealType";

interface FoodLogState {
  aiResult: AIParseResponse | null;
  editedFoods: ParsedFood[];
  mealType: MealType;
  source: "ai_text" | "ai_photo";
  loading: boolean;
  error: string | null;

  setAIResult: (result: AIParseResponse, source: "ai_text" | "ai_photo") => void;
  setMealType: (mealType: MealType) => void;
  updateFood: (index: number, food: ParsedFood) => void;
  removeFood: (index: number) => void;
  addFood: (food: ParsedFood) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useFoodLogStore = create<FoodLogState>((set, _get) => ({
  aiResult: null,
  editedFoods: [],
  mealType: detectMealType(),
  source: "ai_text",
  loading: false,
  error: null,

  setAIResult: (result, source) =>
    set({
      aiResult: result,
      editedFoods: result.foods.map((f) => ({ ...f })),
      source,
      error: null,
    }),

  setMealType: (mealType) => set({ mealType }),

  updateFood: (index, food) =>
    set((state) => {
      const foods = [...state.editedFoods];
      foods[index] = food;
      return { editedFoods: foods };
    }),

  removeFood: (index) =>
    set((state) => ({
      editedFoods: state.editedFoods.filter((_, i) => i !== index),
    })),

  addFood: (food) =>
    set((state) => ({
      editedFoods: [...state.editedFoods, food],
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  reset: () =>
    set({
      aiResult: null,
      editedFoods: [],
      mealType: detectMealType(),
      source: "ai_text",
      loading: false,
      error: null,
    }),
}));
