import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Text";
import { useTheme } from "../../../utils/theme";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: "success" | "error";
  onHide: () => void;
  duration?: number;
}

export const Toast = React.memo(function Toast({ visible, message, type = "success", onHide, duration = 2500 }: ToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (visible) { const timer = setTimeout(onHide, duration); return () => clearTimeout(timer); }
  }, [visible, duration, onHide]);
  if (!visible) return null;
  return (
    <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOutUp.duration(200)}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{ position: "absolute", top: insets.top + 16, left: 20, right: 20, zIndex: 9999,
        backgroundColor: colors.surface, borderWidth: 1, borderColor: type === "error" ? colors.error : colors.border,
        borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center" }}>
      <Text preset="body" style={{ flex: 1, color: type === "error" ? colors.error : colors.text }}>{message}</Text>
    </Animated.View>
  );
});
