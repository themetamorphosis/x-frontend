export interface ParsedFood {
  name: string;
  portion: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface AIParseResponse {
  foods: ParsedFood[];
  total: ParsedFood;
  confidence: string;
  notes: string | null;
}

export interface FoodLogEntry {
  id: string;
  user_id: string;
  meal_type: string;
  food_name: string;
  portion: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  source: string;
  logged_at: string;
  log_date: string;
}

export interface FoodLogCreate {
  meal_type: string;
  food_name: string;
  portion?: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  source: string;
}

export interface LoggedFood {
  id: string;
  food_name: string;
  portion: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface FoodDbItem {
  source: string;
  source_id: string;
  name: string;
  brand: string;
  image_url: string;
  serving_size: string;
  portion?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface DailyTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface MealFoods {
  breakfast: LoggedFood[];
  lunch: LoggedFood[];
  dinner: LoggedFood[];
  snack: LoggedFood[];
}

export interface DailySummary {
  date: string;
  targets: DailyTargets;
  consumed: DailyTargets;
  remaining: DailyTargets;
  by_meal: MealFoods;
  water_ml: number;
}
