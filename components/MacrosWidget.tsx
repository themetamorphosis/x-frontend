import { memo, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from "react-native-reanimated";
import { useTheme, ColorPalette } from "../utils/theme";
import { label, caption, buttonTextSmall } from "../utils/typography";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 44;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function SmallMacroRing({ label: lbl, current, target, unit = "" }: { label: string; current: number; target: number; unit?: string }) {
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
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={ringStyles.ringRow}>
      <View style={ringStyles.ringContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.border}
            strokeWidth={RING_STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={colors.primary}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={RING_CIRCUMFERENCE}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>
        <View style={ringStyles.ringCenter}>
          <Text style={[ringStyles.ringPercent, { color: colors.text }]}>{Math.round(percent * 100)}%</Text>
        </View>
      </View>
      <View style={ringStyles.ringInfo}>
        <Text style={[ringStyles.ringLabel, { color: colors.textTertiary }]}>{lbl}</Text>
        <Text style={[ringStyles.ringValue, { color: colors.text }]}>
          {Math.round(current)}<Text style={[ringStyles.ringTarget, { color: colors.textTertiary }]}> / {Math.round(target)}{unit}</Text>
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.inner}>
        <Text style={styles.title}>Macros</Text>
        <SmallMacroRing label="Carbs" current={carbs.current} target={carbs.target} unit="g" />
        <SmallMacroRing label="Protein" current={protein.current} target={protein.target} unit="g" />
        <SmallMacroRing label="Fat" current={fat.current} target={fat.target} unit="g" />
      </View>
    </View>
  );
});

const ringStyles = StyleSheet.create({
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
  },
  ringInfo: {
    flex: 1,
  },
  ringLabel: {
    ...caption,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ringValue: {
    ...buttonTextSmall,
    fontSize: 13,
  },
  ringTarget: {
    fontSize: 11,
    fontWeight: "400",
  },
});

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    inner: {
      padding: 16,
    },
    title: {
      ...label,
      fontSize: 10,
      marginBottom: 14,
    },
  });
}
