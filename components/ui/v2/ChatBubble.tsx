import React from "react";
import { ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text } from "./Text";
import { useTheme, lightShadow, darkShadow } from "../../../utils/theme";

interface ChatBubbleProps {
  message: string;
  variant: "user" | "ai";
  timestamp?: string;
}

export const ChatBubble = React.memo(function ChatBubble({ message, variant, timestamp }: ChatBubbleProps) {
  const { colors, isDark } = useTheme();
  const isUser = variant === "user";

  const bubbleStyle: ViewStyle = {
    maxWidth: "80%", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20,
    borderBottomRightRadius: isUser ? 6 : 20, borderBottomLeftRadius: isUser ? 20 : 6,
    backgroundColor: isUser ? colors.primary : colors.surface,
    alignSelf: isUser ? "flex-end" : "flex-start", marginVertical: 4,
    ...(isUser ? {} : (isDark ? darkShadow : lightShadow)),
  };

  return (
    <Animated.View entering={FadeInDown.duration(250)} style={bubbleStyle}>
      <Text style={{ color: isUser ? colors.primaryText : colors.text, fontSize: 14, lineHeight: 21 }}>{message}</Text>
      {timestamp && (
        <Text preset="caption" style={{ marginTop: 4, fontSize: 10, color: isUser ? colors.primaryText : colors.textTertiary, opacity: 0.7 }}>
          {timestamp}
        </Text>
      )}
    </Animated.View>
  );
});
