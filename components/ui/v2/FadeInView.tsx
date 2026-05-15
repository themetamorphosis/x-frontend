import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}

export function FadeInView({ children, delay = 0, style }: FadeInViewProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(300)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export function SlideInView({ children, delay = 0, style }: FadeInViewProps) {
  return (
    <Animated.View
      entering={SlideInUp.delay(delay).duration(300)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
