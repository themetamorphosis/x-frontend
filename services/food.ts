import { api } from "./api";
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

export async function getFoodLogs(date?: string): Promise<FoodLogEntry[]> {
  const query = date ? `?date=${date}` : "";
  return api.get<FoodLogEntry[]>(`/logs/food${query}`);
}

export async function deleteFoodLog(id: string): Promise<void> {
  await api.delete(`/logs/food/${id}`);
}
