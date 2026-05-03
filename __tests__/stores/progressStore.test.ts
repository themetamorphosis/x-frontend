import { useProgressStore } from "../../stores/progressStore";
import { api } from "../../services/api";

describe("progressStore", () => {
  beforeEach(() => {
    useProgressStore.setState({
      weightLogs: [],
      weightRange: 30,
      weekly: null,
      streaks: null,
      loading: false,
    });
    jest.restoreAllMocks();
  });

  describe("setWeightRange", () => {
    it("updates range and fetches", async () => {
      jest.spyOn(api, "get").mockResolvedValueOnce([]);
      useProgressStore.getState().setWeightRange(7);
      expect(useProgressStore.getState().weightRange).toBe(7);
    });
  });

  describe("fetchWeightLogs", () => {
    it("sets weight logs on success", async () => {
      const logs = [
        { id: "1", weight_kg: 70, logged_at: "2025-01-01", log_date: "2025-01-01" },
        { id: "2", weight_kg: 69.5, logged_at: "2025-01-02", log_date: "2025-01-02" },
      ];
      jest.spyOn(api, "get").mockResolvedValueOnce(logs);
      await useProgressStore.getState().fetchWeightLogs();
      expect(useProgressStore.getState().weightLogs).toEqual(logs);
    });

    it("clears logs on failure", async () => {
      useProgressStore.setState({ weightLogs: [{ id: "1", weight_kg: 70, logged_at: "", log_date: "" }] });
      jest.spyOn(api, "get").mockRejectedValueOnce(new Error("fail"));
      await useProgressStore.getState().fetchWeightLogs();
      expect(useProgressStore.getState().weightLogs).toEqual([]);
    });

    it("uses provided range", async () => {
      jest.spyOn(api, "get").mockResolvedValueOnce([]);
      await useProgressStore.getState().fetchWeightLogs(90);
      expect(api.get).toHaveBeenCalledWith("/logs/weight?range=90&limit=500");
    });
  });

  describe("logWeight", () => {
    it("posts weight and refetches", async () => {
      jest.spyOn(api, "post").mockResolvedValueOnce({});
      jest.spyOn(api, "get").mockResolvedValueOnce([{ id: "1", weight_kg: 71, logged_at: "", log_date: "" }]);
      await useProgressStore.getState().logWeight(71);
      expect(api.post).toHaveBeenCalledWith("/logs/weight", { weight_kg: 71 });
      expect(useProgressStore.getState().weightLogs).toHaveLength(1);
    });
  });

  describe("fetchWeekly", () => {
    it("sets weekly data on success", async () => {
      const weekly = {
        start_date: "2025-01-06",
        end_date: "2025-01-12",
        daily_totals: [],
        averages: { calories: 1800, protein_g: 140, carbs_g: 200, fat_g: 60, fiber_g: 30 },
        goal_adherence: { calories: 5, protein_g: 5, carbs_g: 5, fat_g: 5 },
      };
      jest.spyOn(api, "get").mockResolvedValueOnce(weekly);
      await useProgressStore.getState().fetchWeekly();
      expect(useProgressStore.getState().weekly).toEqual(weekly);
    });

    it("clears weekly on failure", async () => {
      jest.spyOn(api, "get").mockRejectedValueOnce(new Error("fail"));
      await useProgressStore.getState().fetchWeekly();
      expect(useProgressStore.getState().weekly).toBeNull();
    });

    it("passes date param", async () => {
      jest.spyOn(api, "get").mockResolvedValueOnce({});
      await useProgressStore.getState().fetchWeekly("2025-01-15");
      expect(api.get).toHaveBeenCalledWith("/dashboard/weekly?date=2025-01-15");
    });
  });

  describe("fetchStreaks", () => {
    it("sets streaks on success", async () => {
      const streaks = { current_streak: 5, longest_streak: 12, total_days_logged: 30 };
      jest.spyOn(api, "get").mockResolvedValueOnce(streaks);
      await useProgressStore.getState().fetchStreaks();
      expect(useProgressStore.getState().streaks).toEqual(streaks);
    });

    it("clears streaks on failure", async () => {
      jest.spyOn(api, "get").mockRejectedValueOnce(new Error("fail"));
      await useProgressStore.getState().fetchStreaks();
      expect(useProgressStore.getState().streaks).toBeNull();
    });
  });

  describe("fetchAll", () => {
    it("sets loading and fetches all in parallel", async () => {
      jest.spyOn(api, "get")
        .mockResolvedValueOnce([])      // weightLogs
        .mockResolvedValueOnce({})      // weekly
        .mockResolvedValueOnce({});     // streaks

      await useProgressStore.getState().fetchAll();
      expect(useProgressStore.getState().loading).toBe(false);
      expect(api.get).toHaveBeenCalledTimes(3);
    });
  });
});
