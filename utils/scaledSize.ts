import { PixelRatio } from "react-native";

const fontScale = PixelRatio.getFontScale();

export function scaledSize(size: number): number {
  return Math.round(size / fontScale);
}
