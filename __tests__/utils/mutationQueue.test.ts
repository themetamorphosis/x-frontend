import AsyncStorage from "@react-native-async-storage/async-storage";
import { mutationQueue } from "../../utils/mutationQueue";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn().mockReturnValue(() => {}),
}));

describe("MutationQueue", () => {
  let mockExecute: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockExecute = jest.fn().mockResolvedValue(undefined);
    mutationQueue.init(mockExecute);
    await mutationQueue.clear();
  });

  afterEach(() => {
    mutationQueue.destroy();
  });

  describe("enqueue", () => {
    it("should add a mutation to the queue", async () => {
      await mutationQueue.enqueue("POST", "/logs/food", { food_name: "Apple" });
      expect(mutationQueue.pendingCount).toBe(1);
    });

    it("should persist queue to AsyncStorage", async () => {
      await mutationQueue.enqueue("POST", "/logs/food", { food_name: "Apple" });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "nutrilog-mutation-queue",
        expect.any(String)
      );
    });

    it("should evict oldest when queue exceeds MAX_QUEUE_SIZE", async () => {
      // Fill queue to max (50)
      for (let i = 0; i < 51; i++) {
        await mutationQueue.enqueue("POST", `/logs/food`, { food_name: `Food ${i}` });
      }
      expect(mutationQueue.pendingCount).toBe(50);
    });
  });

  describe("flush", () => {
    it("should execute all queued mutations", async () => {
      await mutationQueue.enqueue("POST", "/logs/food", { food_name: "Apple" });
      await mutationQueue.enqueue("DELETE", "/logs/food/123");

      await mutationQueue.flush();

      expect(mockExecute).toHaveBeenCalledTimes(2);
      expect(mockExecute).toHaveBeenCalledWith("POST", "/logs/food", { food_name: "Apple" });
      expect(mockExecute).toHaveBeenCalledWith("DELETE", "/logs/food/123");
      expect(mutationQueue.pendingCount).toBe(0);
    });

    it("should retry failed mutations up to MAX_RETRIES", async () => {
      mockExecute
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValue(undefined);

      await mutationQueue.enqueue("POST", "/logs/food", { food_name: "Apple" });
      await mutationQueue.flush();

      // First attempt fails, mutation stays in queue with retryCount=1
      expect(mutationQueue.pendingCount).toBe(1);

      // Flush again — should retry
      mockExecute.mockResolvedValue(undefined);
      await mutationQueue.flush();
      expect(mutationQueue.pendingCount).toBe(0);
    });

    it("should drop mutations after MAX_RETRIES (5)", async () => {
      mockExecute.mockRejectedValue(new Error("Persistent error"));

      await mutationQueue.enqueue("POST", "/logs/food", { food_name: "Apple" });

      // Flush 5 times to exhaust retries
      for (let i = 0; i < 5; i++) {
        await mutationQueue.flush();
      }

      expect(mutationQueue.pendingCount).toBe(0);
    });

    it("should not flush if already flushing", async () => {
      await mutationQueue.enqueue("POST", "/logs/food", { food_name: "Apple" });

      // Start two flushes concurrently
      const flush1 = mutationQueue.flush();
      const flush2 = mutationQueue.flush();

      await Promise.all([flush1, flush2]);

      // Should only execute once (second flush is a no-op)
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });
  });

  describe("clear", () => {
    it("should clear the queue", async () => {
      await mutationQueue.enqueue("POST", "/logs/food", { food_name: "Apple" });
      await mutationQueue.enqueue("POST", "/logs/food", { food_name: "Banana" });
      expect(mutationQueue.pendingCount).toBe(2);

      await mutationQueue.clear();
      expect(mutationQueue.pendingCount).toBe(0);
    });
  });

  describe("loadQueue", () => {
    it("should restore queue from AsyncStorage on init", async () => {
      const savedQueue = JSON.stringify([
        { id: "1", method: "POST", path: "/logs/food", body: { food_name: "Apple" }, createdAt: Date.now(), retryCount: 0 },
      ]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(savedQueue);

      // Re-init to trigger loadQueue
      mutationQueue.destroy();
      mutationQueue.init(mockExecute);

      // Give async loadQueue time to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mutationQueue.pendingCount).toBe(1);
    });

    it("should handle corrupted AsyncStorage data gracefully", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("invalid-json{{{");

      mutationQueue.destroy();
      mutationQueue.init(mockExecute);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mutationQueue.pendingCount).toBe(0);
    });
  });
});
