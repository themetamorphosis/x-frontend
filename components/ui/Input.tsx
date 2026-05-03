import { TextInput, Text, View, ViewStyle } from "react-native";

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

export function Input({
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
            color: "#555555",
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
          backgroundColor: "#111111",
          borderWidth: 1,
          borderColor: "#222222",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: "#FFFFFF",
          fontSize: 16,
          minHeight: multiline ? 100 : undefined,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#333333"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : undefined}
      />
    </View>
  );
}
