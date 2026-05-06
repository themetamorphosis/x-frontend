import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { Flame } from "lucide-react-native";
import { Colors } from "../utils/colors";
import { label, statNumber, caption } from "../utils/typography";
import { raisedShadowProps } from "../utils/neumorphic";

interface CaloriesWidgetProps {
  consumed: number;
  target: number;
}

export const CaloriesWidget = memo(function CaloriesWidget({ consumed, target }: CaloriesWidgetProps) {
  const remaining = Math.max(target - consumed, 0);
  const exercise = 0; // Placeholder for future exercise tracking

  return (
    <Shadow {...raisedShadowProps(5)} style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Flame size={14} color={Colors.accent} />
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
    color: Colors.text,
  },
  mainLabel: {
    ...caption,
    textAlign: "center",
    marginBottom: 12,
    color: Colors.textTertiary,
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceDark,
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
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  itemValue: {
    ...caption,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  remaining: {
    color: Colors.accent,
  },
  over: {
    color: Colors.error,
  },
  targetRow: {
    marginTop: 10,
    alignItems: "center",
  },
  targetText: {
    ...caption,
    fontSize: 10,
    color: Colors.textTertiary,
  },
});
