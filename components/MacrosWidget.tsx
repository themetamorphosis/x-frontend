import { memo, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Shadow } from "react-native-shadow-2";
import Svg, { Circle } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from "react-native-reanimated";
import { Colors } from "../utils/colors";
import { label, caption, buttonTextSmall } from "../utils/typography";
import { raisedShadowProps } from "../utils/neumorphic";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}

const RING_SIZE = 44;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function SmallMacroRing({ label: lbl, current, target, unit = "", color = Colors.accent }: MacroRingProps) {
  const progress = useSharedValue(0);
  const percent = target > 0 ? Math.min(current / target, 1) : 0;

  useEffect(() => {
    progress.value = withTiming(percent, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={styles.ringRow}>
      <View style={styles.ringContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={Colors.surfaceDark}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={color}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={RING_CIRCUMFERENCE}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringPercent}>{Math.round(percent * 100)}%</Text>
        </View>
      </View>
      <View style={styles.ringInfo}>
        <Text style={styles.ringLabel}>{lbl}</Text>
        <Text style={styles.ringValue}>
          {Math.round(current)}<Text style={styles.ringTarget}> / {Math.round(target)}{unit}</Text>
        </Text>
      </View>
    </View>
  );
}

interface MacrosWidgetProps {
  carbs: { current: number; target: number };
  protein: { current: number; target: number };
  fat: { current: number; target: number };
}

export const MacrosWidget = memo(function MacrosWidget({ carbs, protein, fat }: MacrosWidgetProps) {
  return (
    <Shadow {...raisedShadowProps(5)} style={styles.card}>
      <View style={styles.inner}>
        <Text style={styles.title}>Macros</Text>
        <SmallMacroRing label="Carbs" current={carbs.current} target={carbs.target} unit="g" />
        <SmallMacroRing label="Protein" current={protein.current} target={protein.target} unit="g" />
        <SmallMacroRing label="Fat" current={fat.current} target={fat.target} unit="g" />
      </View>
    </Shadow>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  inner: {
    padding: 16,
  },
  title: {
    ...label,
    fontSize: 10,
    marginBottom: 14,
  },
  ringRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  ringPercent: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.text,
  },
  ringInfo: {
    flex: 1,
  },
  ringLabel: {
    ...caption,
    fontSize: 10,
    color: Colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ringValue: {
    ...buttonTextSmall,
    fontSize: 13,
    color: Colors.text,
  },
  ringTarget: {
    fontSize: 11,
    fontWeight: "400",
    color: Colors.textTertiary,
  },
});
