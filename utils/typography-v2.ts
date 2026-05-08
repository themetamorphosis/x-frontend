import { TextStyle } from "react-native";
import type { ColorPalette } from "./theme";

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
} as const;

export function createTextStyles(colors: ColorPalette) {
  return {
    display: {
      fontFamily: fonts.extrabold,
      fontSize: 48,
      fontWeight: "800",
      color: colors.text,
      lineHeight: 52,
      letterSpacing: -1,
    } as TextStyle,

    h1: {
      fontFamily: fonts.bold,
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 34,
      letterSpacing: -0.5,
    } as TextStyle,

    h2: {
      fontFamily: fonts.bold,
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 26,
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
