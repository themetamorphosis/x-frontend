import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import { useTheme } from "../../../utils/theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = React.memo(function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);
  useEffect(() => { opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true); }, []);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ width: width as any, height, borderRadius, backgroundColor: colors.border }, animatedStyle, style]} />;
});

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <View style={{ gap: 10, padding: 16 }}>
      {Array.from({ length: lines }).map((_, i) => <Skeleton key={i} width={i === lines - 1 ? "60%" : "100%"} height={14} />)}
    </View>
  );
}

export function SkeletonStat() {
  return (
    <View style={{ gap: 6 }}>
      <Skeleton width={60} height={28} />
      <Skeleton width={40} height={12} />
    </View>
  );
}
