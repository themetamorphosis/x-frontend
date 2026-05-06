import React, { useCallback } from "react";
import { Text, ActivityIndicator, ViewStyle, StyleSheet } from "react-native";
import { MotiPressable } from "moti/interactions";
import { Shadow } from "react-native-shadow-2";
import { Colors } from "../../utils/colors";
import { buttonText, buttonTextSmall } from "../../utils/typography";
import { raisedShadowProps, insetShadowProps } from "../../utils/neumorphic";
import type { LucideIcon } from "lucide-react-native";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: "primary" | "accent" | "ghost" | "icon";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
  icon?: LucideIcon;
  iconSize?: number;
  small?: boolean;
}

export const Button = React.memo(function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  accessibilityHint,
  icon: Icon,
  iconSize = 20,
  small = false,
}: ButtonProps) {
  const isPressed = useCallback(() => false, []);

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      opacity: disabled ? 0.4 : 1,
    };

    if (variant === "icon") {
      return {
        ...base,
        width: 44,
        height: 44,
        borderRadius: 22,
        padding: 0,
        backgroundColor: pressed ? Colors.surfaceDark : Colors.background,
      };
    }

    const padding = small
      ? { paddingVertical: 10, paddingHorizontal: 16 }
      : { paddingVertical: 16, paddingHorizontal: 24 };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: pressed ? Colors.surfaceDark : Colors.background,
      },
      accent: {
        backgroundColor: pressed ? Colors.accentDark : Colors.accent,
      },
      ghost: {
        backgroundColor: "transparent",
      },
    };

    return {
      ...base,
      ...padding,
      ...variantStyles[variant],
    };
  };

  const getTextColor = () => {
    if (variant === "accent") return Colors.white;
    if (variant === "ghost") return Colors.accent;
    if (variant === "icon") return Colors.text;
    return Colors.accent;
  };

  const textStyles = small ? buttonTextSmall : buttonText;

  return (
    <MotiPressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title || "Button"}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      animate={useCallback(
        ({ pressed }: { pressed: boolean }) => ({
          scale: pressed && !disabled ? 0.97 : 1,
        }),
        [disabled]
      )}
      style={[getContainerStyle(false), style]}
    >
      {({ pressed }) => {
        const containerStyle = getContainerStyle(pressed);
        const shouldShadow = variant !== "ghost";
        const shadowProps = pressed ? insetShadowProps(3) : raisedShadowProps(4);

        const content = (
          <>
            {Icon && <Icon size={iconSize} color={getTextColor()} />}
            {loading ? (
              <ActivityIndicator color={getTextColor()} size="small" />
            ) : title ? (
              <Text style={[textStyles, { color: getTextColor() }]}>{title}</Text>
            ) : null}
          </>
        );

        if (!shouldShadow) {
          return <>{content}</>;
        }

        return (
          <Shadow {...shadowProps} style={containerStyle}>
            {content}
          </Shadow>
        );
      }}
    </MotiPressable>
  );
});
