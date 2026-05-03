import { useAuthStore } from "../../stores/authStore";
import * as SecureStore from "expo-secure-store";
import { api } from "../../services/api";

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe("authStore", () => {
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

  describe("setAuth", () => {
    it("sets all auth fields", () => {
      useAuthStore.getState().setAuth("tok", "refresh_tok", "uid1", "a@b.com", "Alice", "http://img");
      const s = useAuthStore.getState();
      expect(s.token).toBe("tok");
      expect(s.userId).toBe("uid1");
      expect(s.email).toBe("a@b.com");
      expect(s.name).toBe("Alice");
      expect(s.avatarUrl).toBe("http://img");
      expect(s.isAuthenticated).toBe(true);
      expect(s.isLoading).toBe(false);
    });

    it("saves token and refresh token to SecureStore", () => {
      useAuthStore.getState().setAuth("tok", "refresh_tok", "uid1", "a@b.com");
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("nutrilog_jwt", "tok");
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("nutrilog_refresh", "refresh_tok");
    });

    it("sets token on api client", () => {
      const spy = jest.spyOn(api, "setToken");
      useAuthStore.getState().setAuth("tok", "refresh_tok", "uid1", "a@b.com");
      expect(spy).toHaveBeenCalledWith("tok");
    });

    it("defaults name and avatarUrl to undefined", () => {
      useAuthStore.getState().setAuth("tok", "refresh_tok", "uid1", "a@b.com");
      const s = useAuthStore.getState();
      expect(s.name).toBeUndefined();
      expect(s.avatarUrl).toBeUndefined();
    });
  });

  describe("clearAuth", () => {
    it("resets all fields to null", () => {
      useAuthStore.getState().setAuth("tok", "refresh_tok", "uid1", "a@b.com", "Alice");
      useAuthStore.getState().clearAuth();
      const s = useAuthStore.getState();
      expect(s.token).toBeNull();
      expect(s.userId).toBeNull();
      expect(s.email).toBeNull();
      expect(s.name).toBeNull();
      expect(s.avatarUrl).toBeNull();
      expect(s.isAuthenticated).toBe(false);
    });

    it("deletes token and refresh token from SecureStore", () => {
      useAuthStore.getState().clearAuth();
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("nutrilog_jwt");
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("nutrilog_refresh");
    });

    it("clears token on api client", () => {
      const spy = jest.spyOn(api, "setToken");
      useAuthStore.getState().clearAuth();
      expect(spy).toHaveBeenCalledWith(null);
    });
  });

  describe("loadToken", () => {
    it("returns false when no refresh token in SecureStore", async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce(null);
      const result = await useAuthStore.getState().loadToken();
      expect(result).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("returns true and sets auth when refresh succeeds", async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce("old_refresh_tok");
      jest.spyOn(api, "post").mockResolvedValueOnce({
        access_token: "new_tok",
        refresh_token: "new_refresh_tok",
        user: { id: "u1", email: "a@b.com", name: "Alice", avatar_url: null },
      });
      const result = await useAuthStore.getState().loadToken();
      expect(result).toBe(true);
      expect(useAuthStore.getState().token).toBe("new_tok");
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("sends refresh token in request body", async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce("old_refresh_tok");
      const postSpy = jest.spyOn(api, "post").mockResolvedValueOnce({
        access_token: "new_tok",
        refresh_token: "new_refresh_tok",
        user: { id: "u1", email: "a@b.com" },
      });
      await useAuthStore.getState().loadToken();
      expect(postSpy).toHaveBeenCalledWith("/auth/refresh", { refresh_token: "old_refresh_tok" });
    });

    it("clears auth when refresh fails", async () => {
      mockSecureStore.getItemAsync.mockResolvedValueOnce("old_refresh_tok");
      jest.spyOn(api, "post").mockRejectedValueOnce(new Error("network"));
      const result = await useAuthStore.getState().loadToken();
      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
