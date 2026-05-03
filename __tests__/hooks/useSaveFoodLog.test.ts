import { renderHook, act } from "@testing-library/react-native";
import { useSaveFoodLog } from "../../hooks/useSaveFoodLog";

// Mock dependencies
jest.mock("../../services/food", () => ({
  saveFoodLog: jest.fn(),
}));

jest.mock("../../stores/dailyStore", () => ({
  useDailyStore: Object.assign(
    jest.fn((selector: any) => {
      const state = { addFoodLog: jest.fn() };
      return selector ? selector(state) : state;
    }),
    { getState: jest.fn() }
  ),
}));

jest.mock("../../utils/haptics", () => ({
  haptic: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

import { saveFoodLog } from "../../services/food";
import { haptic } from "../../utils/haptics";

describe("useSaveFoodLog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return saving=false initially", () => {
    const { result } = renderHook(() => useSaveFoodLog());
    expect(result.current.saving).toBe(false);
  });

  it("should save food log and return true on success", async () => {
    const mockLog = {
      id: "log-1",
      food_name: "Apple",
      portion: "1 medium",
      calories: 95,
      protein_g: 0.5,
      carbs_g: 25,
      fat_g: 0.3,
      fiber_g: 4.4,
      meal_type: "snack",
    };
    (saveFoodLog as jest.Mock).mockResolvedValue(mockLog);

    const { result } = renderHook(() => useSaveFoodLog());

    let success = false;
    await act(async () => {
      success = await result.current.save({
        meal_type: "snack",
        food_name: "Apple",
        calories: 95,
        protein_g: 0.5,
        carbs_g: 25,
        fat_g: 0.3,
        fiber_g: 4.4,
        source: "custom",
      });
    });

    expect(success).toBe(true);
    expect(haptic.success).toHaveBeenCalled();
    expect(result.current.saving).toBe(false);
  });

  it("should throw error and trigger haptic.error on failure", async () => {
    (saveFoodLog as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSaveFoodLog());

    await act(async () => {
      await expect(
        result.current.save({
          meal_type: "snack",
          food_name: "Apple",
          calories: 95,
          protein_g: 0.5,
          carbs_g: 25,
          fat_g: 0.3,
          fiber_g: 4.4,
          source: "custom",
        })
      ).rejects.toThrow("Network error");
    });

    expect(haptic.error).toHaveBeenCalled();
    expect(result.current.saving).toBe(false);
  });

  it("should preserve error cause chain", async () => {
    const originalError = new Error("Connection refused");
    (saveFoodLog as jest.Mock).mockRejectedValue(originalError);

    const { result } = renderHook(() => useSaveFoodLog());

    await act(async () => {
      try {
        await result.current.save({
          meal_type: "snack",
          food_name: "Apple",
          calories: 95,
          protein_g: 0.5,
          carbs_g: 25,
          fat_g: 0.3,
          fiber_g: 4.4,
          source: "custom",
        });
      } catch (e: any) {
        expect(e.message).toBe("Connection refused");
        expect(e.cause).toBe(originalError);
      }
    });
  });
});
