import { useEffect, memo } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { Colors } from "../utils/colors";
import { caption } from "../utils/typography";

interface AIReplyBubbleProps {
  message: string | null;
  onDismiss: () => void;
}

const DISPLAY_DURATION = 3000; // 3 seconds
const FADE_DURATION = 400;

export const AIReplyBubble = memo(function AIReplyBubble({ message, onDismiss }: AIReplyBubbleProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    if (message) {
      // Fade in
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withTiming(0, { duration: 250 });

      // Fade out after delay
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
        isError ? styles.bubbleError : styles.bubbleSuccess,
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
    >
      <Text style={[styles.text, isError && styles.textError]} numberOfLines={2}>
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
    // Inset neumorphic
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleSuccess: {
    backgroundColor: Colors.surfaceDark,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  bubbleError: {
    backgroundColor: "#FDECEA",
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  text: {
    ...caption,
    fontSize: 13,
    color: Colors.text,
  },
  textError: {
    color: Colors.error,
  },
});
