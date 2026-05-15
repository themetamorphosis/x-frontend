import { api } from "./api";
import { mutationQueue } from "../utils/mutationQueue";
import type { AIParseResponse, FoodLogEntry, FoodLogCreate } from "../types/food";

export type { AIParseResponse, FoodLogEntry, FoodLogCreate };
export type { ParsedFood } from "../types/food";

export async function parseText(description: string): Promise<AIParseResponse> {
  return api.post<AIParseResponse>("/ai/parse-text", { description });
}

export async function parsePhoto(imageBase64: string): Promise<AIParseResponse> {
  return api.post<AIParseResponse>("/ai/parse-photo", { image_base64: imageBase64 });
}

export async function saveFoodLog(entry: FoodLogCreate): Promise<FoodLogEntry> {
  return api.post<FoodLogEntry>("/logs/food", entry);
}

/**
 * Save a food log with offline support. If the API call fails due to network,
 * the mutation is queued and retried on reconnect. Returns a temporary entry
 * for optimistic UI updates.
 */
export async function saveFoodLogWithOffline(entry: FoodLogCreate): Promise<FoodLogEntry> {
  try {
    return await api.post<FoodLogEntry>("/logs/food", entry);
  } catch (err) {
    if (err instanceof Error && err.message === "Request cancelled") throw err;
    // Queue for retry on reconnect
    await mutationQueue.enqueue("POST", "/logs/food", entry);
    // Return a temporary entry for optimistic store update
    return {
      id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      food_name: entry.food_name,
      portion: entry.portion ?? null,
      calories: entry.calories,
      protein_g: entry.protein_g,
      carbs_g: entry.carbs_g,
      fat_g: entry.fat_g,
      fiber_g: entry.fiber_g ?? 0,
      meal_type: entry.meal_type,
      source: entry.source ?? "manual",
      logged_at: new Date().toISOString(),
      log_date: new Date().toISOString().slice(0, 10),
    } as FoodLogEntry;
  }
}

export async function getFoodLogs(date?: string): Promise<FoodLogEntry[]> {
  const query = date ? `?date=${date}` : "";
  return api.get<FoodLogEntry[]>(`/logs/food${query}`);
}

export async function deleteFoodLog(id: string): Promise<void> {
  await api.delete(`/logs/food/${id}`);
}
