import { useEffect, memo } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../utils/theme";
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

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export const MacroRing = memo(function MacroRing({ label, current, target, unit = "" }: MacroRingProps) {
  const { colors } = useTheme();
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
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={colors.border} strokeWidth={STROKE_WIDTH} fill="none" />
          <AnimatedCircle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            stroke={colors.primary} strokeWidth={STROKE_WIDTH} fill="none"
            strokeDasharray={CIRCUMFERENCE} animatedProps={animatedProps} strokeLinecap="round"
          />
        </Svg>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>{Math.round(current)}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: colors.textTertiary, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.textSecondary, marginTop: 2 }}>
        / {target}{unit}
      </Text>
    </View>
  );
});
