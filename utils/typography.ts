/**
 * Typography presets for NutriLog using Nunito font family.
 *
 * Font weights: 300 (Light), 400 (Regular), 600 (SemiBold), 700 (Bold)
 */

import { TextStyle } from "react-native";
import { Colors } from "./colors";

export const fonts = {
  light: "Nunito_300Light",
  regular: "Nunito_400Regular",
  semiBold: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
} as const;

/** Large screen headings (e.g., widget titles). */
export const heading: TextStyle = {
  fontFamily: fonts.bold,
  fontSize: 28,
  fontWeight: "700",
  color: Colors.text,
  letterSpacing: -0.5,
};

/** Section subheadings (e.g., "Calories", "Macros"). */
export const subheading: TextStyle = {
  fontFamily: fonts.semiBold,
  fontSize: 18,
  fontWeight: "600",
  color: Colors.text,
  letterSpacing: 0,
};

/** Body text — lightweight for readability. */
export const body: TextStyle = {
  fontFamily: fonts.light,
  fontSize: 15,
  fontWeight: "300",
  color: Colors.text,
  lineHeight: 22,
};

/** Uppercase labels (section headers, macro labels). */
export const label: TextStyle = {
  fontFamily: fonts.semiBold,
  fontSize: 11,
  fontWeight: "600",
  color: Colors.textSecondary,
  letterSpacing: 1,
  textTransform: "uppercase",
};

/** Small caption text (secondary info). */
export const caption: TextStyle = {
  fontFamily: fonts.regular,
  fontSize: 12,
  fontWeight: "400",
  color: Colors.textSecondary,
};

/** Large stat number (e.g., calorie count). */
export const statNumber: TextStyle = {
  fontFamily: fonts.bold,
  fontSize: 32,
  fontWeight: "700",
  color: Colors.text,
  letterSpacing: -1,
};

/** Medium stat number (e.g., macro values). */
export const statMedium: TextStyle = {
  fontFamily: fonts.semiBold,
  fontSize: 20,
  fontWeight: "600",
  color: Colors.text,
};

/** Button text. */
export const buttonText: TextStyle = {
  fontFamily: fonts.semiBold,
  fontSize: 16,
  fontWeight: "600",
  letterSpacing: 0.2,
};

/** Small button text. */
export const buttonTextSmall: TextStyle = {
  fontFamily: fonts.semiBold,
  fontSize: 13,
  fontWeight: "600",
  letterSpacing: 0.2,
};
