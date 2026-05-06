/**
 * Neumorphic color palette for NutriLog.
 * Warm off-white (#E0E0E0) base with Slate Blue (#6C8EBF) accent.
 */

import { useColorScheme } from "react-native";

const neumorphicColors = {
  // Base surfaces — background IS the surface in neumorphism
  background: "#E0E0E0",
  surface: "#E0E0E0",
  surfaceDark: "#D6D6D6",

  // Shadows
  shadowLight: "#FFFFFF",
  shadowDark: "#BEBEBE",
  highlight: "#FFFFFF",
  shadow: "#BEBEBE",

  // Text
  text: "#333333",
  textSecondary: "#777777",
  textTertiary: "#999999",

  // Accent — Slate Blue, used sparingly
  accent: "#6C8EBF",
  accentLight: "#8BAAD4",
  accentDark: "#5A7AA6",

  // Semantic
  error: "#E53935",
  success: "#43A047",
  warning: "#FB8C00",

  // Utility
  black: "#333333",
  white: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.3)",

  // Legacy compatibility (for gradual migration)
  gray100: "#E0E0E0",
  gray200: "#D6D6D6",
  gray300: "#CCCCCC",
  gray400: "#999999",
  gray500: "#777777",
  gray600: "#555555",
  gray700: "#333333",
};

export type ThemeColors = typeof neumorphicColors;

/** Default export — neumorphic palette. */
export const Colors = neumorphicColors;

/** Hook to get theme colors. Currently returns neumorphic for all schemes. */
export function useThemeColors(): ThemeColors {
  const _scheme = useColorScheme();
  return neumorphicColors;
}

/** Get colors for a specific scheme. Currently always returns neumorphic. */
export function getColors(_scheme?: "light" | "dark" | null | undefined): ThemeColors {
  return neumorphicColors;
}
