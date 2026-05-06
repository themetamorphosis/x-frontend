import { create } from "zustand";
import { secureStorage } from "../utils/storage";
import { api } from "../services/api";
import { Sentry } from "../utils/sentry";

const TOKEN_KEY = "nutrilog_jwt";
const REFRESH_KEY = "nutrilog_refresh";
const REFRESH_BUFFER_MS = 2 * 60 * 1000; // Refresh 2 minutes before expiry

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
  refreshToken: () => Promise<boolean>;
}

let _unauthorizedHandlerSet = false;
let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Decode a JWT payload without verification (client-side only).
 * The token is already verified by the server; we just need the expiry.
 */
function decodeJWTPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Schedule a proactive token refresh before the current token expires.
 */
function scheduleTokenRefresh(token: string, refreshFn: () => Promise<boolean>): void {
  if (_refreshTimer) {
    clearTimeout(_refreshTimer);
    _refreshTimer = null;
  }

  const payload = decodeJWTPayload(token);
  if (!payload?.exp) return;

  const expiresAt = payload.exp * 1000; // Convert to ms
  const refreshAt = expiresAt - Date.now() - REFRESH_BUFFER_MS;

  if (refreshAt <= 0) {
    // Token is already expired or about to expire — refresh immediately
    refreshFn();
    return;
  }

  _refreshTimer = setTimeout(() => {
    refreshFn();
  }, refreshAt);
}

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
    // Schedule proactive refresh
    scheduleTokenRefresh(token, () => get().refreshToken());
  },

  clearAuth: () => {
    if (_refreshTimer) {
      clearTimeout(_refreshTimer);
      _refreshTimer = null;
    }
    api.setToken(null);
    secureStorage.removeItem(TOKEN_KEY);
    secureStorage.removeItem(REFRESH_KEY);
    set({ token: null, userId: null, email: null, name: null, avatarUrl: null, isAuthenticated: false, isLoading: false });
  },

  refreshToken: async () => {
    try {
      const refreshTokenValue = await secureStorage.getItem(REFRESH_KEY);
      if (!refreshTokenValue) {
        get().clearAuth();
        return false;
      }
      const data = await api.post<{ access_token: string; refresh_token: string; user: UserProfile }>(
        "/auth/refresh",
        { refresh_token: refreshTokenValue }
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
    } catch (e) {
      Sentry.captureException(e, { tags: { context: "token_refresh" } });
      get().clearAuth();
      return false;
    }
  },

  loadToken: async () => {
    try {
      const refreshTokenValue = await secureStorage.getItem(REFRESH_KEY);
      if (!refreshTokenValue) {
        set({ isLoading: false });
        return false;
      }
      if (!_unauthorizedHandlerSet) {
        api.setOnUnauthorized(() => get().clearAuth());
        _unauthorizedHandlerSet = true;
      }
      const data = await api.post<{ access_token: string; refresh_token: string; user: UserProfile }>(
        "/auth/refresh",
        { refresh_token: refreshTokenValue }
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
