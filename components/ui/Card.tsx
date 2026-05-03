import { ReactNode, memo } from "react";
import { View, ViewStyle } from "react-native";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: any;
}

export const Card = memo(function Card({ children, style, noPadding = false, ...accessibilityProps }: CardProps) {
  return (
    <View
      {...accessibilityProps}
      style={{
        backgroundColor: "#111111",
        borderRadius: 12,
        padding: noPadding ? 0 : 16,
        borderWidth: 1,
        borderColor: "#1A1A1A",
        ...style,
      }}
    >
      {children}
    </View>
  );
});
