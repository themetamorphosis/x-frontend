import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { Colors } from "../../utils/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export const Button = React.memo(function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const base: ViewStyle = {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.4 : 1,
  };

  const variants: Record<string, ViewStyle> = {
    primary: { backgroundColor: Colors.white },
    secondary: { backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.gray300 },
    ghost: { backgroundColor: "transparent" },
  };

  const textColors: Record<string, string> = {
    primary: Colors.black,
    secondary: Colors.white,
    ghost: Colors.gray600,
  };

  return (
    <TouchableOpacity
      style={[base, variants[variant], style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <Text
          style={{
            color: textColors[variant],
            fontWeight: "600",
            fontSize: 16,
            letterSpacing: 0.2,
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});
