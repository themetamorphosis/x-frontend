const mockFetch = jest.fn();
Object.defineProperty(globalThis, "fetch", { value: mockFetch, writable: true });

import { parseText, parsePhoto, saveFoodLog, getFoodLogs, deleteFoodLog } from "../../services/food";

describe("food service", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("parseText", () => {
    it("POSTs description to /ai/parse-text", async () => {
      const response = {
        foods: [{ name: "Chicken", portion: "150g", calories: 248, protein_g: 46.5, carbs_g: 0, fat_g: 5.4, fiber_g: 0 }],
        total: { name: "Total", portion: null, calories: 248, protein_g: 46.5, carbs_g: 0, fat_g: 5.4, fiber_g: 0 },
        confidence: "high",
        notes: null,
      };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, headers: { get: (k: string) => k === "content-type" ? "application/json" : null }, json: () => Promise.resolve(response) });
      const result = await parseText("150g grilled chicken");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/ai/parse-text"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ description: "150g grilled chicken" }),
        })
      );
      expect(result.foods).toHaveLength(1);
    });
  });

  describe("parsePhoto", () => {
    it("POSTs image_base64 to /ai/parse-photo", async () => {
      const response = {
        foods: [],
        total: { name: "Total", portion: null, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
        confidence: "low",
        notes: null,
      };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, headers: { get: (k: string) => k === "content-type" ? "application/json" : null }, json: () => Promise.resolve(response) });
      await parsePhoto("base64data");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/ai/parse-photo"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ image_base64: "base64data" }),
        })
      );
    });
  });

  describe("saveFoodLog", () => {
    it("POSTs food log entry", async () => {
      const entry = {
        meal_type: "lunch" as const,
        food_name: "Chicken",
        portion: "150g",
        calories: 248,
        protein_g: 46.5,
        carbs_g: 0,
        fat_g: 5.4,
        fiber_g: 0,
        source: "ai_text" as const,
      };
      const response = { ...entry, id: "log-1", user_id: "u1", logged_at: "", log_date: "" };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, headers: { get: (k: string) => k === "content-type" ? "application/json" : null }, json: () => Promise.resolve(response) });
      const result = await saveFoodLog(entry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/food"),
        expect.objectContaining({ method: "POST" })
      );
      expect(result.id).toBe("log-1");
    });
  });

  describe("getFoodLogs", () => {
    it("GETs food logs without date", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, headers: { get: (k: string) => k === "content-type" ? "application/json" : null }, json: () => Promise.resolve([]) });
      await getFoodLogs();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/food"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("GETs food logs with date", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, headers: { get: (k: string) => k === "content-type" ? "application/json" : null }, json: () => Promise.resolve([]) });
      await getFoodLogs("2025-01-15");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/food?date=2025-01-15"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("deleteFoodLog", () => {
    it("DELETEs food log", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, headers: { get: (k: string) => k === "content-type" ? "application/json" : null }, json: () => Promise.resolve({}) });
      await deleteFoodLog("log-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/logs/food/log-1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
