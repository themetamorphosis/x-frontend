/**
 * Neumorphic design utilities for NutriLog.
 *
 * Provides cross-platform raised/inset shadow styles using react-native-shadow-2
 * and helper functions for consistent neumorphic appearance.
 */

import { ViewStyle } from "react-native";
import { Colors } from "./colors";

// ── Shadow presets ──────────────────────────────────────────────

/** Light shadow (top-left) — the "extruded" highlight */
export const LIGHT_SHADOW = {
  offset: [-4, -4],
  color: Colors.shadowLight,
  opacity: 0.7,
  radius: 6,
  distance: 6,
};

/** Dark shadow (bottom-right) — the "cast" shadow */
export const DARK_SHADOW = {
  offset: [4, 4],
  color: Colors.shadowDark,
  opacity: 0.5,
  radius: 6,
  distance: 6,
};

// ── Style helpers ───────────────────────────────────────────────

/** Neumorphic raised style — default state for all interactive elements. */
export function neuRaised(extra?: ViewStyle): ViewStyle {
  return {
    backgroundColor: Colors.background,
    borderRadius: 16,
    ...extra,
  };
}

/** Neumorphic inset style — pressed/active state. */
export function neuInset(extra?: ViewStyle): ViewStyle {
  return {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    // Subtle inner border to simulate inset depth
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...extra,
  };
}

/** Flat neumorphic style — minimal depth for secondary cards. */
export function neuFlat(extra?: ViewStyle): ViewStyle {
  return {
    backgroundColor: Colors.background,
    borderRadius: 16,
    ...extra,
  };
}

/** Neumorphic circle — for icon chips and circular buttons. */
export function neuCircle(size: number, extra?: ViewStyle): ViewStyle {
  return {
    backgroundColor: Colors.background,
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    ...extra,
  };
}

/** Accent neumorphic style — Slate Blue bg with adjusted shadows. */
export function neuAccent(extra?: ViewStyle): ViewStyle {
  return {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    ...extra,
  };
}

// ── Shadow prop helpers (for react-native-shadow-2) ────────────

/** Props for the light (top-left) shadow layer. */
export function lightShadowProps(distance = 6) {
  return {
    offset: [-distance, -distance] as [number, number],
    startColor: "rgba(255,255,255,0.7)",
    endColor: "rgba(255,255,255,0.1)",
    distance,
  };
}

/** Props for the dark (bottom-right) shadow layer. */
export function darkShadowProps(distance = 6) {
  return {
    offset: [distance, distance] as [number, number],
    startColor: "rgba(190,190,190,0.5)",
    endColor: "rgba(190,190,190,0.05)",
    distance,
  };
}

/** Combined shadow props for a neumorphic raised element. */
export function raisedShadowProps(distance = 6) {
  return {
    startColor: "rgba(255,255,255,0.7)",
    endColor: "rgba(190,190,190,0.3)",
    distance,
    offset: [0, 0] as [number, number],
    paintInside: false,
  };
}

/** Combined shadow props for a neumorphic inset element. */
export function insetShadowProps(distance = 4) {
  return {
    startColor: "rgba(190,190,190,0.4)",
    endColor: "rgba(255,255,255,0.2)",
    distance,
    offset: [0, 0] as [number, number],
    paintInside: true,
  };
}
