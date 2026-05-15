import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "../ui/v2/Card";
import { Text } from "../ui/v2/Text";
import { useTheme, ColorPalette } from "../../utils/theme";
import { haptic } from "../../utils/haptics";
import type { ParsedFood } from "../../types/food";

interface Props {
  food: ParsedFood;
  onEdit: () => void;
  onSaveToLibrary: () => void;
  onRemove: () => void;
}

export const FoodItemCard = React.memo(function FoodItemCard({ food, onEdit, onSaveToLibrary, onRemove }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{food.name}</Text>
          {food.portion ? <Text style={styles.portion}>{food.portion}</Text> : null}
          <View style={styles.macros}>
            <Text style={styles.cal}>{food.calories} cal</Text>
            <Text style={styles.macro}>P {food.protein_g}g</Text>
            <Text style={styles.macro}>C {food.carbs_g}g</Text>
            <Text style={styles.macro}>F {food.fat_g}g</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} accessibilityRole="button" accessibilityLabel={`Edit ${food.name}`} accessibilityHint="Opens editor for this food item">
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSaveToLibrary} accessibilityRole="button" accessibilityLabel={`Save ${food.name} to library`} accessibilityHint="Saves this food to your custom foods for quick logging">
            <Text style={styles.actionText}>★</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { haptic.light(); onRemove(); }} accessibilityRole="button" accessibilityLabel={`Remove ${food.name}`} accessibilityHint="Removes this food from the current log">
            <Text style={styles.actionText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
});

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    card: { marginBottom: 8 },
    row: { flexDirection: "row", alignItems: "flex-start" },
    info: { flex: 1 },
    name: { color: c.text, fontSize: 15, fontWeight: "500" },
    portion: { color: c.textSecondary, fontSize: 12, marginTop: 2 },
    macros: { flexDirection: "row", marginTop: 6, gap: 12 },
    cal: { color: c.textSecondary, fontSize: 11 },
    macro: { color: c.textSecondary, fontSize: 11 },
    actions: { flexDirection: "row", gap: 8 },
    actionText: { color: c.textSecondary, fontSize: 12 },
  });
}
