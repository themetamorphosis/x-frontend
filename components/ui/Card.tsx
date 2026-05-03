import { ReactNode, memo } from "react";
import { View, ViewStyle, AccessibilityRole } from "react-native";
import { Colors } from "../../utils/colors";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}

export const Card = memo(function Card({ children, style, noPadding = false, ...accessibilityProps }: CardProps) {
  return (
    <View
      {...accessibilityProps}
      style={{
        backgroundColor: Colors.gray100,
        borderRadius: 12,
        padding: noPadding ? 0 : 16,
        borderWidth: 1,
        borderColor: Colors.gray200,
        ...style,
      }}
    >
      {children}
    </View>
  );
});
