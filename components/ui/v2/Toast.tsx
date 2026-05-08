import React, { useEffect } from "react";
import { View } from "react-native";
import { MotiView } from "moti";
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
  useEffect(() => {
    if (visible) { const timer = setTimeout(onHide, duration); return () => clearTimeout(timer); }
  }, [visible, duration, onHide]);
  if (!visible) return null;
  return (
    <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -20 }}
      style={{ position: "absolute", top: 60, left: 20, right: 20, zIndex: 9999,
        backgroundColor: colors.surface, borderWidth: 1, borderColor: type === "error" ? colors.error : colors.border,
        borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center" }}>
      <Text preset="body" style={{ flex: 1, color: type === "error" ? colors.error : colors.text }}>{message}</Text>
    </MotiView>
  );
});
