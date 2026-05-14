import { memo, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MotiPressable } from "moti/interactions";
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
    const newTotal = current_ml + amount;
    setWater(newTotal);
    try {
      await api.post("/logs/water", { amount_ml: amount });
    } catch (e: unknown) {
      setWater(current_ml);
      onError?.("Failed to log water. Please try again.");
    }
  }, [current_ml, setWater, onError]);

  const removeWater = useCallback(async () => {
    if (current_ml <= 0) return;
    haptic.light();
    const amount = CUP_ML;
    const newTotal = Math.max(current_ml - amount, 0);
    setWater(newTotal);
    try {
      await api.post("/logs/water", { amount_ml: -amount });
    } catch (e: unknown) {
      setWater(current_ml);
      onError?.("Failed to update water. Please try again.");
    }
  }, [current_ml, setWater, onError]);

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
          <MotiPressable
            onPress={removeWater}
            accessibilityRole="button"
            accessibilityLabel="Remove one cup of water"
            animate={({ pressed }) => ({
              scale: pressed ? 0.92 : 1,
            })}
            style={styles.circleButton}
          >
            <View style={styles.minusCircle}>
              <Minus size={18} color={colors.textSecondary} />
            </View>
          </MotiPressable>

          <View style={styles.remainingContainer}>
            <Text style={styles.remainingNumber}>{cupsRemaining}</Text>
            <Text style={styles.remainingLabel}>cups remaining</Text>
          </View>

          <MotiPressable
            onPress={() => addWater(CUP_ML)}
            accessibilityRole="button"
            accessibilityLabel="Add one cup of water"
            animate={({ pressed }) => ({
              scale: pressed ? 0.92 : 1,
            })}
            style={styles.circleButton}
          >
            <View style={styles.plusCircle}>
              <Plus size={18} color={colors.primary} />
            </View>
          </MotiPressable>
        </View>
      </View>
    </View>
  );
});

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    card: {
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
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
