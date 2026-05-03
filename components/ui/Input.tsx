import React from "react";
import { TextInput, Text, View, ViewStyle } from "react-native";
import { Colors } from "../../utils/colors";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "numeric" | "email-address";
  multiline?: boolean;
  style?: ViewStyle;
}

export const Input = React.memo(function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  multiline = false,
  style,
}: InputProps) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && (
        <Text
          style={{
            color: Colors.gray500,
            fontSize: 11,
            fontWeight: "500",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={{
          backgroundColor: Colors.gray100,
          borderWidth: 1,
          borderColor: Colors.gray300,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: Colors.white,
          fontSize: 16,
          minHeight: multiline ? 100 : undefined,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray400}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : undefined}
        accessibilityLabel={label || placeholder}
      />
    </View>
  );
});
