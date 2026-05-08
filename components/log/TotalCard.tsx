import { View, Text, StyleSheet } from "react-native";
import { Card } from "../ui/v2/Card";
import { useTheme, ColorPalette } from "../../utils/theme";

interface MacroTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Props {
  totals: MacroTotals;
}

export function TotalCard({ totals }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Total</Text>
        <Text style={styles.title}>{totals.calories} cal</Text>
      </View>
      <View style={styles.macros}>
        <Text style={styles.macro}>Protein {totals.protein_g.toFixed(1)}g</Text>
        <Text style={styles.macro}>Carbs {totals.carbs_g.toFixed(1)}g</Text>
        <Text style={styles.macro}>Fat {totals.fat_g.toFixed(1)}g</Text>
      </View>
    </Card>
  );
}

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { color: c.text, fontSize: 15, fontWeight: "600" },
    macros: { flexDirection: "row", marginTop: 6, gap: 16 },
    macro: { color: c.textSecondary, fontSize: 12 },
  });
}
