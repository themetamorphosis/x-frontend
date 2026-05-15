import React, { useCallback, useState } from "react";
import { Pressable, Text, ActivityIndicator, ViewStyle, PressableProps } from "react-native";
import { useTheme } from "../../../utils/theme";
import { fonts } from "../../../utils/typography-v2";
import { haptic } from "../../../utils/haptics";
import type { LucideIcon } from "lucide-react-native";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconSize?: number;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const SIZES = {
  sm: { height: 40, paddingH: 18, fontSize: 13 },
  md: { height: 48, paddingH: 28, fontSize: 15 },
  lg: { height: 56, paddingH: 36, fontSize: 16 },
} as const;

export const Button = React.memo(function Button({
  title, onPress, variant = "primary", size = "md", disabled = false,
  loading = false, icon: Icon, iconSize = 18, style, accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const s = SIZES[size];
  const [pressed, setPressed] = useState(false);

  const handlePress = useCallback(() => {
    haptic.light();
    onPress();
  }, [onPress]);

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      height: s.height, paddingHorizontal: s.paddingH, borderRadius: 999,
      alignItems: "center", justifyContent: "center", flexDirection: "row",
      gap: 8, opacity: disabled ? 0.4 : 1,
      transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
    };
    if (variant === "primary") return { ...base, backgroundColor: pressed ? colors.textSecondary : colors.primary };
    if (variant === "secondary") return { ...base, backgroundColor: colors.bg };
    return { ...base, backgroundColor: "transparent" };
  };

  const getTextColor = () => {
    if (variant === "primary") return colors.primaryText;
    return colors.text;
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled || loading}
      onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
      accessibilityRole="button" accessibilityLabel={title || "Button"}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[getContainerStyle(), style]}>
      {Icon && <Icon size={iconSize} color={getTextColor()} />}
      {loading ? <ActivityIndicator color={getTextColor()} size="small" /> :
        title ? <Text style={{ fontFamily: fonts.medium, fontSize: s.fontSize, color: getTextColor() }}>{title}</Text> : null}
    </Pressable>
  );
});
