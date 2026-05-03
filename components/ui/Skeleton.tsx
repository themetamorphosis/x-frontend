import { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#1A1A1A",
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <View style={styles.card}>
      <Skeleton width="40%" height={12} style={{ marginBottom: 16 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? "60%" : "100%"}
          height={14}
          style={{ marginBottom: 12 }}
        />
      ))}
    </View>
  );
}

export function SkeletonMacroRings() {
  return (
    <View style={styles.ringsRow}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.ringItem}>
          <Skeleton width={80} height={80} borderRadius={40} />
          <Skeleton width={40} height={10} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    marginBottom: 16,
  },
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  ringItem: {
    alignItems: "center",
  },
});
