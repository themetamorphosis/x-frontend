import { useEffect, memo } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../utils/theme";

interface AIReplyBubbleProps {
  message: string | null;
  onDismiss: () => void;
}

const DISPLAY_DURATION = 3000;
const FADE_DURATION = 400;

export const AIReplyBubble = memo(function AIReplyBubble({ message, onDismiss }: AIReplyBubbleProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    if (message) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withTiming(0, { duration: 250 });
      opacity.value = withDelay(
        DISPLAY_DURATION,
        withTiming(0, { duration: FADE_DURATION }, (finished) => {
          if (finished) runOnJS(onDismiss)();
        })
      );
      translateY.value = withDelay(
        DISPLAY_DURATION,
        withTiming(10, { duration: FADE_DURATION })
      );
    } else {
      opacity.value = 0;
      translateY.value = 10;
    }
  }, [message, opacity, translateY, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) return null;

  const isError = message.startsWith("Error:");

  return (
    <Animated.View
      style={[
        styles.bubble,
        animatedStyle,
        {
          backgroundColor: isError ? "#FDECEA" : colors.surface,
          borderLeftColor: isError ? colors.error : colors.primary,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color: isError ? colors.error : colors.text }]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    zIndex: 997,
    borderLeftWidth: 3,
  },
  text: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
