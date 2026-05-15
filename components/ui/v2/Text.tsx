import React, { useMemo } from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { useTheme, type ColorPalette } from "../../../utils/theme";
import { createTextStyles, type TextStyles } from "../../../utils/typography-v2";

interface TextProps extends RNTextProps {
  preset?: keyof TextStyles;
  color?: keyof ColorPalette;
}

export const Text = React.memo(function Text({ preset = "body", color, style, ...props }: TextProps) {
  const { colors } = useTheme();
  const textStyles = useMemo(() => createTextStyles(colors), [colors]);
  const presetStyle = textStyles[preset];
  const colorStyle = color ? { color: colors[color] } : {};
  return <RNText style={[presetStyle, colorStyle, style]} {...props} />;
});
