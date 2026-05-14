import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@nutrilog/theme";

export const lightColors = {
  bg: "#F5F5F5",
  surface: "#FFFFFF",
  border: "#EBEBEB",
  text: "#111111",
  textSecondary: "#888888",
  textTertiary: "#AAAAAA",
  primary: "#111111",
  primaryText: "#FFFFFF",
  error: "#E53935",
  overlay: "rgba(0, 0, 0, 0.3)",
} as const;

export const darkColors = {
  bg: "#000000",
  surface: "#1C1C1E",
  border: "#2C2C2E",
  text: "#FFFFFF",
  textSecondary: "#888888",
  textTertiary: "#555555",
  primary: "#FFFFFF",
  primaryText: "#000000",
  error: "#FF453A",
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

export type ColorPalette = typeof lightColors;

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  "2xl": 24, "3xl": 32, "4xl": 40, "5xl": 48, "6xl": 64,
} as const;

export const radius = {
  sm: 8, md: 12, card: 16, modal: 20, pill: 999,
} as const;

export const lightShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 3,
  elevation: 1,
};

export const darkShadow = {
  shadowColor: "transparent",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ColorPalette;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark") {
          setMode(saved);
        } else {
          setMode(systemScheme === "dark" ? "dark" : "light");
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [systemScheme]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const colors = mode === "dark" ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark: mode === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
