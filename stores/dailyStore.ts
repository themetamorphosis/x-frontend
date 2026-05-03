import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";
import type { LoggedFood, DailyTargets, MealFoods, DailySummary } from "../types/food";

interface DailyState {
  summary: DailySummary | null;
  loading: boolean;
  error: string | null;
  fetchDaily: (date?: string) => Promise<void>;
  addFoodLog: (log: LoggedFood & { meal_type: string }) => void;
  removeFoodLog: (id: string) => void;
  setWater: (ml: number) => void;
  rollbackSummary: (prev: DailySummary) => void;
}

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      summary: null,
      loading: false,
      error: null,

      fetchDaily: async (date?: string) => {
        set({ loading: true, error: null });
        try {
          const params = date ? `?date=${date}` : "";
          const data = await api.get<DailySummary>(`/dashboard/daily${params}`);
          set({ summary: data, loading: false });
        } catch (e: any) {
          set({ error: e.message || "Failed to load dashboard", loading: false });
        }
      },

      addFoodLog: (log) => {
    const { summary } = get();
    if (!summary) return;
    const mealType = log.meal_type as keyof MealFoods;
    const byMeal = { ...summary.by_meal };
    byMeal[mealType] = [...byMeal[mealType], log];
    const consumed = {
      calories: summary.consumed.calories + log.calories,
      protein_g: summary.consumed.protein_g + log.protein_g,
      carbs_g: summary.consumed.carbs_g + log.carbs_g,
      fat_g: summary.consumed.fat_g + log.fat_g,
      fiber_g: summary.consumed.fiber_g + log.fiber_g,
    };
    const remaining = {
      calories: summary.targets.calories - consumed.calories,
      protein_g: summary.targets.protein_g - consumed.protein_g,
      carbs_g: summary.targets.carbs_g - consumed.carbs_g,
      fat_g: summary.targets.fat_g - consumed.fat_g,
      fiber_g: summary.targets.fiber_g - consumed.fiber_g,
    };
    set({ summary: { ...summary, by_meal: byMeal, consumed, remaining } });
  },

  removeFoodLog: (id) => {
    const { summary } = get();
    if (!summary) return;
    let removed: LoggedFood | null = null;
    const byMeal = {} as MealFoods;
    for (const [key, foods] of Object.entries(summary.by_meal)) {
      const found = foods.find((f: LoggedFood) => f.id === id);
      if (found) removed = found;
      byMeal[key as keyof MealFoods] = foods.filter((f: LoggedFood) => f.id !== id);
    }
    if (!removed) return;
    const consumed = {
      calories: summary.consumed.calories - removed.calories,
      protein_g: summary.consumed.protein_g - removed.protein_g,
      carbs_g: summary.consumed.carbs_g - removed.carbs_g,
      fat_g: summary.consumed.fat_g - removed.fat_g,
      fiber_g: summary.consumed.fiber_g - removed.fiber_g,
    };
    const remaining = {
      calories: summary.targets.calories - consumed.calories,
      protein_g: summary.targets.protein_g - consumed.protein_g,
      carbs_g: summary.targets.carbs_g - consumed.carbs_g,
      fat_g: summary.targets.fat_g - consumed.fat_g,
      fiber_g: summary.targets.fiber_g - consumed.fiber_g,
    };
    set({ summary: { ...summary, by_meal: byMeal, consumed, remaining } });
  },

  setWater: (ml) => {
    const { summary } = get();
    if (!summary) return;
    set({ summary: { ...summary, water_ml: ml } });
  },

  rollbackSummary: (prev) => {
    set({ summary: prev });
  },
  }),
  {
    name: "nutrilog-daily",
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({ summary: state.summary }),
    onRehydrateStorage: () => (_state, error) => {
      if (error) {
        console.error("[dailyStore] Failed to rehydrate:", error);
      }
    },
  }
  )
);

export type { LoggedFood, DailyTargets, MealFoods, DailySummary };
