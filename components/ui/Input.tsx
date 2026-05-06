import React, { useState } from "react";
import { TextInput, Text, View, ViewStyle } from "react-native";
import { Colors } from "../../utils/colors";
import { label, body } from "../../utils/typography";
import { neuInset } from "../../utils/neumorphic";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "decimal-pad" | "number-pad";
  multiline?: boolean;
  style?: ViewStyle;
}

export const Input = React.memo(function Input({
  label: labelText,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  multiline = false,
  style,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {labelText && (
        <Text style={[label, { marginBottom: 8 }]}>
          {labelText}
        </Text>
      )}
      <View
        style={[
          neuInset({
            paddingHorizontal: 16,
            paddingVertical: 14,
            minHeight: multiline ? 100 : undefined,
          }),
          focused && {
            borderWidth: 1.5,
            borderColor: Colors.accent,
          },
        ]}
      >
        <TextInput
          style={[
            body,
            {
              color: Colors.text,
              fontSize: 16,
              padding: 0,
              margin: 0,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : undefined}
          accessibilityLabel={labelText || placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
});
