import React, { useState, useCallback } from "react";
import { TextInput, View, Text, ViewStyle, TextInputProps } from "react-native";
import { useTheme } from "../../../utils/theme";
import { fonts } from "../../../utils/typography-v2";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  containerStyle?: ViewStyle;
}

export const Input = React.memo(function Input({ label, containerStyle, onFocus, onBlur, ...props }: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback((e: any) => { setFocused(true); onFocus?.(e); }, [onFocus]);
  const handleBlur = useCallback((e: any) => { setFocused(false); onBlur?.(e); }, [onBlur]);

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={{
          fontFamily: fonts.semibold, fontSize: 11, fontWeight: "600",
          color: colors.textSecondary, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8,
        }}>{label}</Text>
      )}
      <TextInput {...props} onFocus={handleFocus} onBlur={handleBlur}
        placeholderTextColor={colors.textTertiary}
        style={{
          fontFamily: fonts.regular, fontSize: 15, color: colors.text,
          borderBottomWidth: 1.5, borderBottomColor: focused ? colors.primary : colors.border,
          paddingBottom: 8, paddingVertical: 4,
        }} />
    </View>
  );
});
