import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { useTheme, ColorPalette } from "../utils/theme";
import { label, statNumber, caption } from "../utils/typography-v2";

interface CaloriesWidgetProps {
  consumed: number;
  target: number;
}

export const CaloriesWidget = memo(function CaloriesWidget({ consumed, target }: CaloriesWidgetProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const remaining = Math.max(target - consumed, 0);
  const exercise = 0; // Placeholder for future exercise tracking

  return (
    <View style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Flame size={14} color={colors.primary} />
          <Text style={styles.title}>Calories</Text>
        </View>

        <Text style={styles.mainValue}>
          {consumed}
        </Text>
        <Text style={styles.mainLabel}>consumed</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Food</Text>
            <Text style={styles.itemValue}>{consumed}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Exercise</Text>
            <Text style={styles.itemValue}>{exercise}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Remaining</Text>
            <Text style={[styles.itemValue, remaining > 0 ? styles.remaining : styles.over]}>
              {remaining}
            </Text>
          </View>
        </View>

        <View style={styles.targetRow}>
          <Text style={styles.targetText}>Target: {target} kcal</Text>
        </View>
      </View>
    </View>
  );
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    title: {
      ...label,
      fontSize: 10,
      marginBottom: 0,
    },
    mainValue: {
      ...statNumber,
      fontSize: 36,
      textAlign: "center",
      color: c.text,
    },
    mainLabel: {
      ...caption,
      textAlign: "center",
      marginBottom: 12,
      color: c.textTertiary,
      fontSize: 11,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    item: {
      alignItems: "center",
      flex: 1,
    },
    itemLabel: {
      ...caption,
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: c.textTertiary,
      marginBottom: 4,
    },
    itemValue: {
      ...caption,
      fontSize: 14,
      fontWeight: "600",
      color: c.text,
    },
    remaining: {
      color: c.primary,
    },
    over: {
      color: c.error,
    },
    targetRow: {
      marginTop: 10,
      alignItems: "center",
    },
    targetText: {
      ...caption,
      fontSize: 10,
      color: c.textTertiary,
    },
  });
}
