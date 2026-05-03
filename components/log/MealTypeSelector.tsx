import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { haptic } from "../../utils/haptics";
import { Colors } from "../../utils/colors";
import type { MealType } from "../../utils/mealType";

const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snack", label: "Snack" },
];

interface Props {
  value: MealType;
  onChange: (mealType: MealType) => void;
}

export function MealTypeSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {MEAL_TYPES.map((m) => (
        <TouchableOpacity
          key={m.key}
          onPress={() => { haptic.selection(); onChange(m.key); }}
          accessibilityRole="button"
          accessibilityLabel={`${m.label} meal type`}
          style={[
            styles.chip,
            value === m.key ? styles.chipActive : styles.chipInactive,
          ]}
        >
          <Text style={[styles.chipText, value === m.key ? styles.chipTextActive : styles.chipTextInactive]}>
            {m.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, marginBottom: 16 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  chipInactive: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray300,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  chipTextActive: { color: Colors.black },
  chipTextInactive: { color: Colors.gray500 },
});
