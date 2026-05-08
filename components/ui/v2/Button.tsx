import React, { useCallback } from "react";
import { Text, ActivityIndicator, ViewStyle } from "react-native";
import { MotiPressable } from "moti/interactions";
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
  sm: { height: 36, paddingH: 16, fontSize: 13 },
  md: { height: 44, paddingH: 24, fontSize: 15 },
  lg: { height: 52, paddingH: 32, fontSize: 16 },
} as const;

export const Button = React.memo(function Button({
  title, onPress, variant = "primary", size = "md", disabled = false,
  loading = false, icon: Icon, iconSize = 18, style, accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const s = SIZES[size];

  const handlePress = useCallback(() => {
    haptic.light();
    onPress();
  }, [onPress]);

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    const base: ViewStyle = {
      height: s.height, paddingHorizontal: s.paddingH, borderRadius: 999,
      alignItems: "center", justifyContent: "center", flexDirection: "row",
      gap: 8, opacity: disabled ? 0.4 : 1,
    };
    if (variant === "primary") return { ...base, backgroundColor: pressed ? colors.textSecondary : colors.primary };
    if (variant === "secondary") return { ...base, backgroundColor: "transparent", borderWidth: 1.5, borderColor: pressed ? colors.textSecondary : colors.border };
    return { ...base, backgroundColor: pressed ? colors.border : "transparent" };
  };

  const getTextColor = () => {
    if (variant === "primary") return colors.primaryText;
    return colors.text;
  };

  return (
    <MotiPressable onPress={handlePress} disabled={disabled || loading}
      accessibilityRole="button" accessibilityLabel={title || "Button"}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      animate={({ pressed }) => ({ scale: pressed && !disabled ? 0.97 : 1 })}
      style={[getContainerStyle(false), style]}>
      {({ pressed }) => (
        <>
          {Icon && <Icon size={iconSize} color={getTextColor()} />}
          {loading ? <ActivityIndicator color={getTextColor()} size="small" /> :
            title ? <Text style={{ fontFamily: fonts.medium, fontSize: s.fontSize, color: getTextColor() }}>{title}</Text> : null}
        </>
      )}
    </MotiPressable>
  );
});
