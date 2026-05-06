import { ReactNode, memo } from "react";
import { View, ViewStyle, AccessibilityRole, StyleSheet } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { Colors } from "../../utils/colors";
import { raisedShadowProps } from "../../utils/neumorphic";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  inset?: boolean;
}

export const Card = memo(function Card({
  children,
  style,
  noPadding = false,
  inset = false,
  ...accessibilityProps
}: CardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor: inset ? Colors.surfaceDark : Colors.background,
    borderRadius: 20,
    padding: noPadding ? 0 : 16,
  };

  return (
    <Shadow
      {...(inset
        ? { ...raisedShadowProps(3), paintInside: true }
        : raisedShadowProps(5))}
      style={[cardStyle, style]}
    >
      <View
        {...accessibilityProps}
        style={styles.inner}
      >
        {children}
      </View>
    </Shadow>
  );
});

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
});
