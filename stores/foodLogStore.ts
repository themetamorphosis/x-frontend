import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware/persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ParsedFood, AIParseResponse, MealType, FoodSource } from "../types/food";
import { detectMealType } from "../utils/mealType";

interface FoodLogState {
  aiResult: AIParseResponse | null;
  editedFoods: ParsedFood[];
  mealType: MealType;
  source: Extract<FoodSource, "ai_text" | "ai_photo">;
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

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, _get) => ({
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
    }),
    {
      name: "nutrilog-food-log",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mealType: state.mealType,
        source: state.source,
      }),
    }
  )
);
