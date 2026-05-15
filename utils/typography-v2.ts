import { TextStyle } from "react-native";
import type { ColorPalette } from "./theme";

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

export function createTextStyles(colors: ColorPalette) {
  return {
    display: {
      fontFamily: fonts.extrabold,
      fontSize: 48,
      fontWeight: "800",
      color: colors.text,
      lineHeight: 52,
      letterSpacing: -0.8,
    } as TextStyle,

    h1: {
      fontFamily: fonts.bold,
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 34,
      letterSpacing: -0.3,
    } as TextStyle,

    h2: {
      fontFamily: fonts.bold,
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 26,
      letterSpacing: -0.2,
    } as TextStyle,

    body: {
      fontFamily: fonts.regular,
      fontSize: 15,
      fontWeight: "400",
      color: colors.text,
      lineHeight: 22,
    } as TextStyle,

    caption: {
      fontFamily: fonts.regular,
      fontSize: 13,
      fontWeight: "400",
      color: colors.textSecondary,
      lineHeight: 18,
    } as TextStyle,

    overline: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      fontWeight: "600",
      color: colors.textSecondary,
      lineHeight: 16,
      letterSpacing: 1.5,
      textTransform: "uppercase" as const,
    } as TextStyle,
  };
}

export type TextStyles = ReturnType<typeof createTextStyles>;

// Static presets for components that don't use createTextStyles()
export const label = {
  fontFamily: fonts.semibold,
  fontSize: 11,
  fontWeight: "600" as const,
  letterSpacing: 1,
  textTransform: "uppercase" as const,
};

export const caption = {
  fontFamily: fonts.regular,
  fontSize: 13,
  fontWeight: "400" as const,
};

export const buttonTextSmall = {
  fontFamily: fonts.semibold,
  fontSize: 13,
  fontWeight: "600" as const,
  letterSpacing: 0.2,
};

export const statNumber = {
  fontFamily: fonts.bold,
  fontSize: 32,
  fontWeight: "700" as const,
  letterSpacing: -1,
};

export const statMedium = {
  fontFamily: fonts.semibold,
  fontSize: 20,
  fontWeight: "600" as const,
};
