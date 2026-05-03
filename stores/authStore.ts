import { create } from "zustand";
import { secureStorage } from "../utils/storage";
import { api } from "../services/api";

const TOKEN_KEY = "nutrilog_jwt";
const REFRESH_KEY = "nutrilog_refresh";

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, refreshToken: string, userId: string, email: string, name?: string | null, avatarUrl?: string | null) => void;
  clearAuth: () => void;
  loadToken: () => Promise<boolean>;
}

let _unauthorizedHandlerSet = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  userId: null,
  email: null,
  name: null,
  avatarUrl: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, refreshToken, userId, email, name = undefined, avatarUrl = undefined) => {
    if (!_unauthorizedHandlerSet) {
      api.setOnUnauthorized(() => get().clearAuth());
      _unauthorizedHandlerSet = true;
    }
    api.setToken(token);
    secureStorage.setItem(TOKEN_KEY, token);
    secureStorage.setItem(REFRESH_KEY, refreshToken);
    set({ token, userId, email, name, avatarUrl, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    api.setToken(null);
    secureStorage.removeItem(TOKEN_KEY);
    secureStorage.removeItem(REFRESH_KEY);
    set({ token: null, userId: null, email: null, name: null, avatarUrl: null, isAuthenticated: false, isLoading: false });
  },

  loadToken: async () => {
    try {
      const refreshToken = await secureStorage.getItem(REFRESH_KEY);
      if (!refreshToken) {
        set({ isLoading: false });
        return false;
      }
      if (!_unauthorizedHandlerSet) {
        api.setOnUnauthorized(() => get().clearAuth());
        _unauthorizedHandlerSet = true;
      }
      const data = await api.post<{ access_token: string; refresh_token: string; user: UserProfile }>(
        "/auth/refresh",
        { refresh_token: refreshToken }
      );
      get().setAuth(
        data.access_token,
        data.refresh_token,
        data.user.id,
        data.user.email,
        data.user.name,
        data.user.avatar_url
      );
      return true;
    } catch {
      get().clearAuth();
      return false;
    }
  },
}));
