import React from "react";
import { View, ViewStyle } from "react-native";
import { Text } from "./Text";
import { useTheme } from "../../../utils/theme";

interface ChatBubbleProps {
  message: string;
  variant: "user" | "ai";
  timestamp?: string;
}

export const ChatBubble = React.memo(function ChatBubble({ message, variant, timestamp }: ChatBubbleProps) {
  const { colors } = useTheme();
  const isUser = variant === "user";

  const bubbleStyle: ViewStyle = {
    maxWidth: "80%", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16,
    borderBottomRightRadius: isUser ? 4 : 16, borderBottomLeftRadius: isUser ? 16 : 4,
    backgroundColor: isUser ? colors.primary : colors.surface,
    borderWidth: isUser ? 0 : 1, borderColor: colors.border,
    alignSelf: isUser ? "flex-end" : "flex-start", marginVertical: 4,
  };

  return (
    <View style={bubbleStyle}>
      <Text style={{ color: isUser ? colors.primaryText : colors.text, fontSize: 14, lineHeight: 20 }}>{message}</Text>
      {timestamp && (
        <Text preset="caption" style={{ marginTop: 4, fontSize: 10, color: isUser ? colors.primaryText : colors.textTertiary, opacity: 0.7 }}>
          {timestamp}
        </Text>
      )}
    </View>
  );
});
