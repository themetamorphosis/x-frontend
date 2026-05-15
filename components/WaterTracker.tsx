import { memo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./ui/v2/Text";
import { PressableScale } from "./ui/v2/PressableScale";
import { Minus, Plus, Droplets } from "lucide-react-native";
import { api } from "../services/api";
import { useDailyStore } from "../stores/dailyStore";
import { useTheme, ColorPalette } from "../utils/theme";
import { label, caption, buttonTextSmall, statMedium } from "../utils/typography-v2";
import { haptic } from "../utils/haptics";

interface WaterTrackerProps {
  current_ml: number;
  target_ml?: number;
  onError?: (message: string) => void;
}

const CUP_ML = 240; // 1 cup = 240ml

export const WaterTracker = memo(function WaterTracker({ current_ml, target_ml = 2400, onError }: WaterTrackerProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const setWater = useDailyStore((s) => s.setWater);
  const percent = Math.min(current_ml / target_ml, 1);
  const cupsCurrent = Math.round(current_ml / CUP_ML * 10) / 10;
  const cupsTarget = Math.round(target_ml / CUP_ML);
  const cupsRemaining = Math.max(Math.round((target_ml - current_ml) / CUP_ML), 0);

  const addWater = useCallback(async (amount: number) => {
    if (amount <= 0) return;
    haptic.light();
    const prev = useDailyStore.getState().summary?.water_ml ?? 0;
    setWater(prev + amount);
    try {
      await api.post("/logs/water", { amount_ml: amount });
    } catch (e: unknown) {
      setWater(prev);
      onError?.("Failed to log water. Please try again.");
    }
  }, [setWater, onError]);

  const removeWater = useCallback(async () => {
    const prev = useDailyStore.getState().summary?.water_ml ?? 0;
    if (prev <= 0) return;
    haptic.light();
    const amount = CUP_ML;
    setWater(Math.max(prev - amount, 0));
    try {
      await api.post("/logs/water", { amount_ml: -amount });
    } catch (e: unknown) {
      setWater(prev);
      onError?.("Failed to update water. Please try again.");
    }
  }, [setWater, onError]);

  return (
    <View style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Droplets size={14} color={colors.primary} />
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
          <PressableScale
            onPress={removeWater}
            accessibilityRole="button"
            accessibilityLabel="Remove one cup of water"
            style={styles.circleButton}
          >
            <View style={styles.minusCircle}>
              <Minus size={18} color={colors.textSecondary} />
            </View>
          </PressableScale>

          <View style={styles.remainingContainer}>
            <Text style={styles.remainingNumber}>{cupsRemaining}</Text>
            <Text style={styles.remainingLabel}>cups remaining</Text>
          </View>

          <PressableScale
            onPress={() => addWater(CUP_ML)}
            accessibilityRole="button"
            accessibilityLabel="Add one cup of water"
            style={styles.circleButton}
          >
            <View style={styles.plusCircle}>
              <Plus size={18} color={colors.primary} />
            </View>
          </PressableScale>
        </View>
      </View>
    </View>
  );
});

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    card: {
      borderRadius: 20,
      backgroundColor: c.surface,
      marginBottom: 16,
    },
    inner: {
      padding: 20,
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
      color: c.textSecondary,
    },
    progressTrack: {
      height: 8,
      backgroundColor: c.border,
      borderRadius: 4,
      marginBottom: 16,
      overflow: "hidden",
    },
    progressFill: {
      height: 8,
      backgroundColor: c.primary,
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
    minusCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surface,
    },
    plusCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surface,
    },
    remainingContainer: {
      alignItems: "center",
    },
    remainingNumber: {
      ...statMedium,
      fontSize: 22,
      color: c.text,
    },
    remainingLabel: {
      ...caption,
      fontSize: 10,
      color: c.textTertiary,
    },
  });
}
