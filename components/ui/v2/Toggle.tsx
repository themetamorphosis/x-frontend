import React from "react";
import { MotiPressable } from "moti/interactions";
import { Sun, Moon } from "lucide-react-native";
import { useTheme } from "../../../utils/theme";
import { haptic } from "../../../utils/haptics";

interface ToggleProps { size?: number; }

export const Toggle = React.memo(function Toggle({ size = 28 }: ToggleProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  return (
    <MotiPressable onPress={() => { haptic.light(); toggleTheme(); }} accessibilityRole="switch"
      accessibilityLabel="Toggle dark mode" accessibilityState={{ checked: isDark }}
      animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center",
        backgroundColor: isDark ? colors.primary : colors.border }}>
      {isDark ? <Sun size={size * 0.55} color={colors.primaryText} /> : <Moon size={size * 0.55} color={colors.textSecondary} />}
    </MotiPressable>
  );
});
