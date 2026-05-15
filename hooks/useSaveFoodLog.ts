import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { saveFoodLogWithOffline } from "../services/food";
import { useDailyStore } from "../stores/dailyStore";
import { haptic } from "../utils/haptics";
import type { FoodLogCreate } from "../types/food";

interface UseSaveFoodLogResult {
  saving: boolean;
  save: (entry: FoodLogCreate) => Promise<boolean>;
}

/**
 * Shared hook for saving a single food log entry.
 * Handles API call, store update, navigation, haptics, and error state.
 */
export function useSaveFoodLog(): UseSaveFoodLogResult {
  const [saving, setSaving] = useState(false);
  const addFoodLog = useDailyStore((s) => s.addFoodLog);
  const router = useRouter();

  const save = useCallback(
    async (entry: FoodLogCreate): Promise<boolean> => {
      setSaving(true);
      try {
        const log = await saveFoodLogWithOffline(entry);
        addFoodLog({
          id: log.id,
          food_name: log.food_name,
          portion: log.portion,
          calories: log.calories,
          protein_g: log.protein_g,
          carbs_g: log.carbs_g,
          fat_g: log.fat_g,
          fiber_g: log.fiber_g,
          meal_type: log.meal_type,
        });
        haptic.success();
        router.replace("/(tabs)");
        return true;
      } catch (e: unknown) {
        haptic.error();
        const message = e instanceof Error ? e.message : "Failed to save food log";
        throw new Error(message, { cause: e });
      } finally {
        setSaving(false);
      }
    },
    [addFoodLog, router]
  );

  return { saving, save };
}
