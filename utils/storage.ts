import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

/**
 * Cookie helpers for web platform. Uses Secure+SameSite cookies
 * which are more resilient to XSS than sessionStorage.
 * On native, expo-secure-store handles storage.
 */
function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; Max-Age=0`;
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return getCookie(key);
    }
    const { getItemAsync } = await import("expo-secure-store");
    return getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      // 30 days for refresh token, 15 minutes for access token
      const maxAge = key.includes("refresh") ? 30 * 24 * 60 * 60 : 15 * 60;
      setCookie(key, value, maxAge);
      return;
    }
    const { setItemAsync } = await import("expo-secure-store");
    return setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      deleteCookie(key);
      return;
    }
    const { deleteItemAsync } = await import("expo-secure-store");
    return deleteItemAsync(key);
  },
};
