/** Theme colors for NutriLog. Supports dark and light modes. */

import { useColorScheme } from "react-native";

const darkColors = {
  black: "#000000",
  white: "#FFFFFF",
  gray100: "#111111",
  gray200: "#1A1A1A",
  gray300: "#222222",
  gray400: "#707070",
  gray500: "#8A8A8A",
  gray600: "#888888",
  gray700: "#AAAAAA",
  background: "#000000",
  surface: "#1A1A1A",
  text: "#FFFFFF",
  textSecondary: "#8A8A8A",
  accent: "#4ADE80",
  error: "#EF4444",
  success: "#22C55E",
};

const lightColors = {
  black: "#FFFFFF",
  white: "#000000",
  gray100: "#F5F5F5",
  gray200: "#E5E5E5",
  gray300: "#D4D4D4",
  gray400: "#737373",
  gray500: "#525252",
  gray600: "#404040",
  gray700: "#262626",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#000000",
  textSecondary: "#525252",
  accent: "#16A34A",
  error: "#DC2626",
  success: "#16A34A",
};

export type ThemeColors = typeof darkColors;

/** Default export for backward compatibility — dark theme. */
export const Colors = darkColors;

/** Hook to get theme-appropriate colors based on device color scheme. */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "light" ? lightColors : darkColors;
}

/** Get colors for a specific scheme without a hook. */
export function getColors(scheme: "light" | "dark" | null | undefined): ThemeColors {
  return scheme === "light" ? lightColors : darkColors;
}
