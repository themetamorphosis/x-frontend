import { useAuthStore } from "../../stores/authStore";
import * as SecureStore from "expo-secure-store";

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe("authStore — full auth flow", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      userId: null,
      email: null,
      name: null,
      avatarUrl: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  describe("login flow", () => {
    it("setAuth stores tokens and user info", () => {
      useAuthStore.getState().setAuth("access-tok", "refresh-tok", "uid1", "a@b.com", "Alice", "http://img");
      const s = useAuthStore.getState();
      expect(s.token).toBe("access-tok");
      expect(s.isAuthenticated).toBe(true);
      expect(s.isLoading).toBe(false);
      expect(s.userId).toBe("uid1");
      expect(s.email).toBe("a@b.com");
    });

    it("persists tokens to SecureStore", () => {
      useAuthStore.getState().setAuth("tok", "rtok", "uid", "e@e.com");
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("nutrilog_jwt", "tok");
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("nutrilog_refresh", "rtok");
    });
  });

  describe("logout flow", () => {
    it("clearAuth resets all fields and removes tokens", () => {
      useAuthStore.getState().setAuth("tok", "rtok", "uid", "e@e.com", "Name");
      useAuthStore.getState().clearAuth();
      const s = useAuthStore.getState();
      expect(s.token).toBeNull();
      expect(s.userId).toBeNull();
      expect(s.email).toBeNull();
      expect(s.isAuthenticated).toBe(false);
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("nutrilog_jwt");
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("nutrilog_refresh");
    });
  });

  describe("loadToken", () => {
    it("restores token from SecureStore on startup", async () => {
      (mockSecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === "nutrilog_jwt") return Promise.resolve("stored-tok");
        if (key === "nutrilog_refresh") return Promise.resolve("stored-rtok");
        return Promise.resolve(null);
      });
      const ok = await useAuthStore.getState().loadToken();
      expect(ok).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("returns false when no stored token", async () => {
      (mockSecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const ok = await useAuthStore.getState().loadToken();
      expect(ok).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
