const mockFetch = jest.fn();
Object.defineProperty(globalThis, "fetch", { value: mockFetch, writable: true });

import { searchFoods, getBarcodeProduct, getCustomFoods, createCustomFood, deleteCustomFood } from "../../services/foodDb";

describe("foodDb service", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("searchFoods", () => {
    it("GETs search results and returns results array", async () => {
      const data = {
        results: [
          { source: "usda", source_id: "1", name: "Chicken", brand: "", image_url: "", serving_size: "100g", calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0 },
        ],
        query: "chicken",
        total: 1,
      };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(data) });
      const result = await searchFoods("chicken");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/food/search?q=chicken"),
        expect.objectContaining({ method: "GET" })
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Chicken");
    });

    it("encodes query parameter", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ results: [], query: "", total: 0 }) });
      await searchFoods("chicken breast");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("chicken%20breast"),
        expect.anything()
      );
    });
  });

  describe("getBarcodeProduct", () => {
    it("GETs barcode product", async () => {
      const product = { source: "openfoodfacts", source_id: "123", name: "Milk", brand: "Farm", image_url: "", serving_size: "250ml", calories: 42, protein_g: 3.4, carbs_g: 5, fat_g: 1, fiber_g: 0 };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(product) });
      const result = await getBarcodeProduct("123");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/food/barcode/123"),
        expect.objectContaining({ method: "GET" })
      );
      expect(result.name).toBe("Milk");
    });
  });

  describe("getCustomFoods", () => {
    it("GETs custom foods list", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
      await getCustomFoods();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/food/custom"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("createCustomFood", () => {
    it("POSTs custom food", async () => {
      const food = { name: "My Recipe", calories: 300, protein_g: 20, carbs_g: 30, fat_g: 10 };
      const response = { ...food, source: "custom", source_id: "", image_url: "", serving_size: "", fiber_g: 0 };
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(response) });
      const result = await createCustomFood(food);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/food/custom"),
        expect.objectContaining({ method: "POST", body: JSON.stringify(food) })
      );
      expect(result.name).toBe("My Recipe");
    });
  });

  describe("deleteCustomFood", () => {
    it("DELETEs custom food", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      await deleteCustomFood("cf-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/food/custom/cf-1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
