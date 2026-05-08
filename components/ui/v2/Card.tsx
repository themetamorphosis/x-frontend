import React, { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { useTheme, lightShadow, darkShadow } from "../../../utils/theme";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export const Card = React.memo(function Card({ children, style, noPadding = false }: CardProps) {
  const { colors, isDark } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: noPadding ? 0 : 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...(isDark ? darkShadow : lightShadow),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
});
