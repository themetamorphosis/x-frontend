import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "../ui/v2/Card";
import { useTheme, ColorPalette } from "../../utils/theme";
import type { FoodDbItem } from "../../services/foodDb";

interface Props {
  item: FoodDbItem;
  onPress: () => void;
  onDelete: () => void;
}

export const FoodListItem = React.memo(function FoodListItem({ item, onPress, onDelete }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${item.name}: ${item.calories} calories`}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            {item.portion ? <Text style={styles.portion}>{item.portion}</Text> : null}
            <View style={styles.macros}>
              <Text style={styles.cal}>{item.calories} cal</Text>
              <Text style={styles.macro}>P {item.protein_g}g</Text>
              <Text style={styles.macro}>C {item.carbs_g}g</Text>
              <Text style={styles.macro}>F {item.fat_g}g</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={`Delete ${item.name}`}>
            <Text style={styles.delete}>×</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
});

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    card: { marginBottom: 8 },
    row: { flexDirection: "row", alignItems: "center" },
    info: { flex: 1 },
    name: { color: c.text, fontSize: 15, fontWeight: "500" },
    portion: { color: c.textSecondary, fontSize: 12, marginTop: 2 },
    macros: { flexDirection: "row", marginTop: 6, gap: 12 },
    cal: { color: c.textSecondary, fontSize: 11 },
    macro: { color: c.textSecondary, fontSize: 11 },
    delete: { color: c.textSecondary, fontSize: 18 },
  });
}
