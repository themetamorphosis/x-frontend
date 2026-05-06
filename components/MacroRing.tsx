import { useEffect, memo } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "../utils/colors";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 80;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Animated circular progress ring for displaying macro nutrient progress.
 *
 * Uses react-native-reanimated for smooth 800ms animation with cubic easing.
 * Automatically clamps progress to 100% when current exceeds target.
 *
 * @param label - Display label (e.g., "Calories", "Protein")
 * @param current - Current consumed value
 * @param target - Target value
 * @param unit - Optional unit suffix (e.g., "g")
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
            stroke={Colors.gray200}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.white}
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
          <Text style={{ color: Colors.white, fontSize: 16, fontWeight: "700" }}>
            {Math.round(current)}
          </Text>
        </View>
      </View>
      <Text
        style={{
          color: Colors.gray500,
          fontSize: 10,
          fontWeight: "500",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text style={{ color: Colors.gray400, fontSize: 10, marginTop: 2 }}>
        / {target}
        {unit}
      </Text>
    </View>
  );
});
