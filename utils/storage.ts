import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    const { getItemAsync } = await import("expo-secure-store");
    return getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    const { setItemAsync } = await import("expo-secure-store");
    return setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    const { deleteItemAsync } = await import("expo-secure-store");
    return deleteItemAsync(key);
  },
};
