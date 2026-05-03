import { api } from "./api";
import type { FoodDbItem } from "../types/food";

export type { FoodDbItem };

export interface SearchResult {
  results: FoodDbItem[];
  query: string;
  total: number;
}

export async function searchFoods(query: string, page: number = 1): Promise<FoodDbItem[]> {
  const data = await api.get<SearchResult>(`/food/search?q=${encodeURIComponent(query)}&page=${page}`);
  return data.results;
}

export async function getBarcodeProduct(code: string): Promise<FoodDbItem> {
  return api.get<FoodDbItem>(`/food/barcode/${encodeURIComponent(code)}`);
}

export async function getCustomFoods(): Promise<FoodDbItem[]> {
  return api.get<FoodDbItem[]>("/food/custom");
}

export async function createCustomFood(food: {
  name: string;
  portion?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
}): Promise<FoodDbItem> {
  return api.post<FoodDbItem>("/food/custom", food);
}

export async function deleteCustomFood(id: string): Promise<void> {
  await api.delete(`/food/custom/${id}`);
}
