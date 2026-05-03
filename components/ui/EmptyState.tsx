import { View, Text, ViewStyle } from "react-native";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ title, description, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 48,
          paddingHorizontal: 24,
        },
        style,
      ]}
    >
      <Text style={{ color: "#555555", fontSize: 15, fontWeight: "600", textAlign: "center", marginBottom: 8 }}>
        {title}
      </Text>
      {description && (
        <Text style={{ color: "#333333", fontSize: 13, textAlign: "center", marginBottom: actionLabel ? 24 : 0 }}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="secondary" />
      )}
    </View>
  );
}
