export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export function detectMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 14) return "lunch";
  if (hour < 17) return "snack";
  return "dinner";
}
