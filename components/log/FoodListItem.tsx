import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "../ui/Card";
import { Colors } from "../../utils/colors";
import type { FoodDbItem } from "../../services/foodDb";

interface Props {
  item: FoodDbItem;
  onPress: () => void;
  onDelete: () => void;
}

export function FoodListItem({ item, onPress, onDelete }: Props) {
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
}

const styles = StyleSheet.create({
  card: { marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1 },
  name: { color: Colors.white, fontSize: 15, fontWeight: "500" },
  portion: { color: Colors.gray500, fontSize: 12, marginTop: 2 },
  macros: { flexDirection: "row", marginTop: 6, gap: 12 },
  cal: { color: Colors.gray600, fontSize: 11 },
  macro: { color: Colors.gray500, fontSize: 11 },
  delete: { color: Colors.gray500, fontSize: 18 },
});
