import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../utils/colors";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  visible: boolean;
  onHide: () => void;
  onRetry?: () => void;
}

export function Toast({ message, type = "success", visible, onHide, onRetry }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(onRetry ? 5000 : 2000),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => onHideRef.current());
    }
  }, [visible, opacity, onRetry]);

  if (!visible) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.container,
        { opacity, bottom: 100 + insets.bottom, backgroundColor: type === "success" ? Colors.white : Colors.gray200 },
      ]}
    >
      <Text style={[styles.text, { color: type === "success" ? Colors.black : Colors.white }]}>
        {message}
      </Text>
      {onRetry && type === "error" && (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 24,
    right: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 999,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  retryText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
