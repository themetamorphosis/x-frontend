import { memo, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { MotiPressable } from "moti/interactions";
import { Minus, Plus, Droplets } from "lucide-react-native";
import { api } from "../services/api";
import { useDailyStore } from "../stores/dailyStore";
import { Colors } from "../utils/colors";
import { label, caption, buttonTextSmall, statMedium } from "../utils/typography";
import { raisedShadowProps, neuCircle } from "../utils/neumorphic";
import { haptic } from "../utils/haptics";

interface WaterTrackerProps {
  current_ml: number;
  target_ml?: number;
}

const CUP_ML = 240; // 1 cup = 240ml

export const WaterTracker = memo(function WaterTracker({ current_ml, target_ml = 2400 }: WaterTrackerProps) {
  const setWater = useDailyStore((s) => s.setWater);
  const percent = Math.min(current_ml / target_ml, 1);
  const cupsCurrent = Math.round(current_ml / CUP_ML * 10) / 10;
  const cupsTarget = Math.round(target_ml / CUP_ML);
  const cupsRemaining = Math.max(Math.round((target_ml - current_ml) / CUP_ML), 0);

  const addWater = useCallback(async (amount: number) => {
    haptic.light();
    const newTotal = current_ml + amount;
    setWater(newTotal);
    try {
      await api.post("/logs/water", { amount_ml: amount });
    } catch {
      setWater(current_ml);
    }
  }, [current_ml, setWater]);

  const removeWater = useCallback(async () => {
    if (current_ml <= 0) return;
    haptic.light();
    const amount = CUP_ML;
    const newTotal = Math.max(current_ml - amount, 0);
    setWater(newTotal);
    try {
      await api.post("/logs/water", { amount_ml: -amount });
    } catch {
      setWater(current_ml);
    }
  }, [current_ml, setWater]);

  return (
    <Shadow {...raisedShadowProps(5)} style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Droplets size={14} color={Colors.accent} />
            <Text style={styles.title}>Water</Text>
          </View>
          <Text style={styles.cupsText}>
            {cupsCurrent} / {cupsTarget} cups
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${percent * 100}%` }]}
          />
        </View>

        <View style={styles.controls}>
          <MotiPressable
            onPress={removeWater}
            accessibilityRole="button"
            accessibilityLabel="Remove one cup of water"
            animate={({ pressed }) => ({
              scale: pressed ? 0.92 : 1,
            })}
            style={styles.circleButton}
          >
            <Shadow {...raisedShadowProps(3)} style={neuCircle(40)}>
              <Minus size={18} color={Colors.textSecondary} />
            </Shadow>
          </MotiPressable>

          <View style={styles.remainingContainer}>
            <Text style={styles.remainingNumber}>{cupsRemaining}</Text>
            <Text style={styles.remainingLabel}>cups remaining</Text>
          </View>

          <MotiPressable
            onPress={useCallback(() => addWater(CUP_ML), [addWater])}
            accessibilityRole="button"
            accessibilityLabel="Add one cup of water"
            animate={({ pressed }) => ({
              scale: pressed ? 0.92 : 1,
            })}
            style={styles.circleButton}
          >
            <Shadow {...raisedShadowProps(3)} style={neuCircle(40)}>
              <Plus size={18} color={Colors.accent} />
            </Shadow>
          </MotiPressable>
        </View>
      </View>
    </Shadow>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginBottom: 16,
  },
  inner: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    ...label,
    fontSize: 10,
    marginBottom: 0,
  },
  cupsText: {
    ...caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
    // Inset shadow effect
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  progressFill: {
    height: 8,
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circleButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  remainingContainer: {
    alignItems: "center",
  },
  remainingNumber: {
    ...statMedium,
    fontSize: 22,
    color: Colors.text,
  },
  remainingLabel: {
    ...caption,
    fontSize: 10,
    color: Colors.textTertiary,
  },
});
