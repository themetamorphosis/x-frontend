import React from "react";
import { View, ViewStyle } from "react-native";
import { useTheme } from "../../../utils/theme";

interface DotIndicatorProps {
  count: number;
  activeCount: number;
  size?: number;
  gap?: number;
  activeColor?: string;
  style?: ViewStyle;
}

export const DotIndicator = React.memo(function DotIndicator({
  count,
  activeCount,
  size = 8,
  gap = 6,
  activeColor,
  style,
}: DotIndicatorProps) {
  const { colors } = useTheme();
  const fill = activeColor || colors.accent;

  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: i < activeCount ? fill : colors.border,
          }}
        />
      ))}
    </View>
  );
});
