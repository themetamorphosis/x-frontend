import { create } from "zustand";
import { api } from "../services/api";

export interface WeightEntry {
  id: string;
  weight_kg: number;
  logged_at: string;
  log_date: string;
}

export interface DayTotals {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface WeeklyData {
  start_date: string;
  end_date: string;
  daily_totals: DayTotals[];
  averages: DayTotals;
  goal_adherence: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  total_days_logged: number;
}

interface ProgressState {
  weightLogs: WeightEntry[];
  weightRange: number;
  weekly: WeeklyData | null;
  streaks: StreakInfo | null;
  loading: boolean;

  setWeightRange: (range: number) => void;
  fetchWeightLogs: (range?: number) => Promise<void>;
  logWeight: (weightKg: number) => Promise<void>;
  fetchWeekly: (date?: string) => Promise<void>;
  fetchStreaks: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  weightLogs: [],
  weightRange: 30,
  weekly: null,
  streaks: null,
  loading: false,

  setWeightRange: (range) => {
    set({ weightRange: range });
    get().fetchWeightLogs(range);
  },

  fetchWeightLogs: async (range?: number) => {
    const r = range ?? get().weightRange;
    try {
      const data = await api.get<WeightEntry[]>(`/logs/weight?range=${r}&limit=500`);
      set({ weightLogs: data });
    } catch (e) {
      console.error("Failed to fetch weight logs:", e);
      set({ weightLogs: [] });
    }
  },

  logWeight: async (weightKg: number) => {
    await api.post("/logs/weight", { weight_kg: weightKg });
    await get().fetchWeightLogs();
  },

  fetchWeekly: async (date?: string) => {
    try {
      const params = date ? `?date=${date}` : "";
      const data = await api.get<WeeklyData>(`/dashboard/weekly${params}`);
      set({ weekly: data });
    } catch (e) {
      console.error("Failed to fetch weekly data:", e);
      set({ weekly: null });
    }
  },

  fetchStreaks: async () => {
    try {
      const data = await api.get<StreakInfo>("/dashboard/streaks");
      set({ streaks: data });
    } catch (e) {
      console.error("Failed to fetch streaks:", e);
      set({ streaks: null });
    }
  },

  fetchAll: async () => {
    set({ loading: true });
    await Promise.all([
      get().fetchWeightLogs(),
      get().fetchWeekly(),
      get().fetchStreaks(),
    ]);
    set({ loading: false });
  },
}));
