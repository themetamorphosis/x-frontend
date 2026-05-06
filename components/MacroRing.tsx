import { useEffect, memo } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "../utils/colors";
import { caption, buttonTextSmall } from "../utils/typography";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 90;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Animated circular progress ring for displaying macro nutrient progress.
 * Neumorphic style with Slate Blue (#6C8EBF) accent rings.
 *
 * Uses react-native-reanimated for smooth 800ms animation with cubic easing.
 * Automatically clamps progress to 100% when current exceeds target.
 */
interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export const MacroRing = memo(function MacroRing({ label, current, target, unit = "" }: MacroRingProps) {
  const progress = useSharedValue(0);
  const percent = target > 0 ? Math.min(current / target, 1) : 0;

  useEffect(() => {
    progress.value = withTiming(percent, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${Math.round(current)} of ${Math.round(target)}${unit}`}
      style={{ alignItems: "center", width: "48%", marginBottom: 16 }}
    >
      <View style={{ width: SIZE, height: SIZE, marginBottom: 8 }}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.surfaceDark}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.accent}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: Colors.text, fontSize: 18, fontWeight: "700" }}>
            {Math.round(current)}
          </Text>
        </View>
      </View>
      <Text
        style={{
          ...caption,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          color: Colors.textTertiary,
        }}
      >
        {label}
      </Text>
      <Text style={{ ...buttonTextSmall, fontSize: 10, color: Colors.textSecondary, marginTop: 2 }}>
        / {target}{unit}
      </Text>
    </View>
  );
});
