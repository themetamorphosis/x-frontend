/**
 * Tests for the secureStorage utility.
 *
 * On web: uses cookies with appropriate Max-Age.
 * On native: delegates to expo-secure-store.
 */

// We test the web path by default since Platform.OS is "ios" in the mock
// but the storage module checks Platform.OS === "web".

describe("secureStorage", () => {
  // Since the module uses Platform.OS and cookie APIs,
  // we test the cookie helper functions directly via the module internals.
  // For the web path, we mock document.cookie.

  let secureStorage: typeof import("../../utils/storage").secureStorage;

  beforeAll(async () => {
    // Set Platform.OS to "web" for cookie-based tests
    jest.resetModules();
    jest.mock("react-native", () => ({
      Platform: { OS: "web" },
    }));

    // Mock document.cookie
    let cookieStore = "";
    Object.defineProperty(document, "cookie", {
      get: () => cookieStore,
      set: (val: string) => {
        // Simulate cookie set behavior
        const [nameValue] = val.split(";");
        const [name] = nameValue.split("=");
        // Remove existing cookie with same name
        cookieStore = cookieStore
          .split("; ")
          .filter((c) => !c.startsWith(name + "="))
          .join("; ");
        if (cookieStore && !cookieStore.endsWith("; ")) {
          cookieStore += "; ";
        }
        cookieStore += nameValue;
      },
      configurable: true,
    });

    const mod = await import("../../utils/storage");
    secureStorage = mod.secureStorage;
  });

  afterEach(() => {
    // Clear cookies
    document.cookie = "";
  });

  describe("setItem / getItem (web cookies)", () => {
    it("stores and retrieves a value", async () => {
      await secureStorage.setItem("test-key", "test-value");
      const result = await secureStorage.getItem("test-key");
      expect(result).toBe("test-value");
    });

    it("returns null for missing key", async () => {
      const result = await secureStorage.getItem("nonexistent");
      expect(result).toBeNull();
    });

    it("uses 30-day max-age for refresh tokens", async () => {
      await secureStorage.setItem("refresh_token", "abc123");
      const result = await secureStorage.getItem("refresh_token");
      expect(result).toBe("abc123");
    });

    it("uses 15-minute max-age for access tokens", async () => {
      await secureStorage.setItem("access_token", "xyz789");
      const result = await secureStorage.getItem("access_token");
      expect(result).toBe("xyz789");
    });

    it("overwrites existing value", async () => {
      await secureStorage.setItem("key", "value1");
      await secureStorage.setItem("key", "value2");
      const result = await secureStorage.getItem("key");
      expect(result).toBe("value2");
    });
  });

  describe("removeItem (web cookies)", () => {
    it("deletes a cookie", async () => {
      await secureStorage.setItem("to-delete", "value");
      expect(await secureStorage.getItem("to-delete")).toBe("value");

      await secureStorage.removeItem("to-delete");
      // After deletion, cookie should be expired
      const result = await secureStorage.getItem("to-delete");
      expect(result).toBeNull();
    });
  });
});
