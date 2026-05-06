import { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "./ui/Card";
import { api } from "../services/api";
import { useDailyStore } from "../stores/dailyStore";
import { Colors } from "../utils/colors";

interface WaterTrackerProps {
  current_ml: number;
  target_ml?: number;
}

export const WaterTracker = memo(function WaterTracker({ current_ml, target_ml = 2000 }: WaterTrackerProps) {
  const setWater = useDailyStore((s) => s.setWater);
  const percent = Math.min(current_ml / target_ml, 1);

  const addWater = useCallback(async (amount: number) => {
    const newTotal = current_ml + amount;
    setWater(newTotal);
    try {
      await api.post("/logs/water", { amount_ml: amount });
    } catch {
      setWater(current_ml);
    }
  }, [current_ml, setWater]);

  return (
    <Card
      style={styles.card}
      accessible
      accessibilityLabel={`Water: ${current_ml} of ${target_ml} milliliters`}
    >
      <View style={styles.header}>
        <Text style={styles.label}>Water</Text>
        <Text style={styles.value}>
          {current_ml} / {target_ml} ml
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${percent * 100}%` }]}
        />
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          onPress={() => addWater(250)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add 250 milliliters of water"
          style={styles.button}
        >
          <Text style={styles.buttonText}>+250 ml</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => addWater(500)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add 500 milliliters of water"
          style={styles.button}
        >
          <Text style={styles.buttonText}>+500 ml</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    color: Colors.gray500,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: { color: Colors.white, fontSize: 14, fontWeight: "600" },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  buttonsRow: { flexDirection: "row", gap: 8 },
  button: {
    flex: 1,
    backgroundColor: Colors.gray200,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
});
