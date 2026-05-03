import { create } from "zustand";
import { secureStorage } from "../utils/storage";
import { api } from "../services/api";

const TOKEN_KEY = "nutrilog_jwt";

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
  setAuth: (token: string, userId: string, email: string, name?: string | null, avatarUrl?: string | null) => void;
  clearAuth: () => void;
  loadToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  userId: null,
  email: null,
  name: null,
  avatarUrl: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, userId, email, name = undefined, avatarUrl = undefined) => {
    api.setToken(token);
    secureStorage.setItem(TOKEN_KEY, token);
    set({ token, userId, email, name, avatarUrl, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    api.setToken(null);
    secureStorage.removeItem(TOKEN_KEY);
    set({ token: null, userId: null, email: null, name: null, avatarUrl: null, isAuthenticated: false, isLoading: false });
  },

  loadToken: async () => {
    try {
      const token = await secureStorage.getItem(TOKEN_KEY);
      if (!token) {
        set({ isLoading: false });
        return false;
      }
      api.setToken(token);
      api.setOnUnauthorized(() => get().clearAuth());
      const data = await api.post<{ access_token: string; user: UserProfile }>("/auth/refresh");
      get().setAuth(
        data.access_token,
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
