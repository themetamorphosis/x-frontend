import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../utils/colors";
import { buttonTextSmall } from "../../utils/typography";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  visible: boolean;
  onHide: () => void;
  onRetry?: () => void;
}

export function Toast({ message, type = "success", visible, onHide, onRetry }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      ]).start();

      const timeout = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
          onHideRef.current()
        );
      }, onRetry ? 5000 : 2000);

      return () => clearTimeout(timeout);
    } else {
      opacity.setValue(0);
      translateY.setValue(-20);
    }
  }, [visible, opacity, translateY, onRetry]);

  if (!visible) return null;

  const bgColor = type === "success" ? Colors.background : "#FDECEA";
  const textColor = type === "success" ? Colors.text : Colors.error;
  const accentBar = type === "success" ? Colors.accent : Colors.error;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          top: insets.top + 8,
          backgroundColor: bgColor,
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accentBar }]} />
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
      {onRetry && type === "error" && (
        <TouchableOpacity
          onPress={onRetry}
          style={styles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={[buttonTextSmall, { color: Colors.accent }]}>Retry</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    zIndex: 999,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    // Neumorphic raised shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  text: {
    ...buttonTextSmall,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(108, 142, 191, 0.1)",
  },
});
