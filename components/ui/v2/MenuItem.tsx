import React from "react";
import { ViewStyle } from "react-native";
import { MotiPressable } from "moti/interactions";
import { Text } from "./Text";
import { useTheme } from "../../../utils/theme";
import { haptic } from "../../../utils/haptics";
import type { LucideIcon } from "lucide-react-native";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  isActive?: boolean;
  isDestructive?: boolean;
  style?: ViewStyle;
}

export const MenuItem = React.memo(function MenuItem({
  icon: Icon, label, onPress, isActive = false, isDestructive = false, style,
}: MenuItemProps) {
  const { colors } = useTheme();
  return (
    <MotiPressable onPress={() => { haptic.light(); onPress(); }} accessibilityRole="button" accessibilityLabel={label}
      animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
      style={[{ flexDirection: "row", alignItems: "center", height: 48, paddingHorizontal: 16, borderRadius: 12,
        backgroundColor: isActive ? colors.primary : "transparent", gap: 14 }, style]}>
      <Icon size={20} color={isDestructive ? colors.error : (isActive ? colors.primaryText : colors.textSecondary)} />
      <Text style={{ fontSize: 16, fontWeight: isActive ? "600" : "400",
        color: isDestructive ? colors.error : (isActive ? colors.primaryText : colors.text) }}>{label}</Text>
    </MotiPressable>
  );
});
