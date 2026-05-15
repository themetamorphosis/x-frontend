import React, { ReactNode } from "react";
import { View, ViewStyle } from "react-native";
import { useTheme, lightShadow, darkShadow, radius } from "../../../utils/theme";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  noPadding?: boolean;
}

export const Card = React.memo(function Card({ children, style, noPadding = false }: CardProps) {
  const { colors, isDark } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: noPadding ? 0 : 20,
    ...(isDark ? darkShadow : lightShadow),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
});
