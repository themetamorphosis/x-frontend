import React from "react";
import { View, ViewStyle } from "react-native";
import { useTheme } from "../../../utils/theme";

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
  style?: ViewStyle;
}

export const ProgressBar = React.memo(function ProgressBar({
  totalSteps,
  currentStep,
  style,
}: ProgressBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[{ flexDirection: "row", gap: 6, alignItems: "center" }, style]}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 3,
            flex: 1,
            borderRadius: 2,
            backgroundColor: i < currentStep ? colors.primary : colors.border,
          }}
        />
      ))}
    </View>
  );
});
