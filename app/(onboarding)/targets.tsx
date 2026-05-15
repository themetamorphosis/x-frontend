import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Button } from "../../components/ui/v2/Button";
import { Card } from "../../components/ui/v2/Card";
import { Text } from "../../components/ui/v2/Text";
import { DecorativeBlobs } from "../../components/ui/v2/DecorativeBlobs";
import { useProfileStore } from "../../stores/profileStore";
import { useTheme } from "../../utils/theme";

export default function TargetsScreen() {
  const router = useRouter();
  const { targets } = useProfileStore();
  const { colors } = useTheme();

  const items = [
    { label: "Calories", value: targets?.calories?.toString() || "0", unit: "kcal" },
    { label: "Protein", value: Math.round(targets?.protein_g || 0).toString(), unit: "g" },
    { label: "Carbs", value: Math.round(targets?.carbs_g || 0).toString(), unit: "g" },
    { label: "Fat", value: Math.round(targets?.fat_g || 0).toString(), unit: "g" },
    { label: "Fiber", value: Math.round(targets?.fiber_g || 0).toString(), unit: "g" },
    { label: "Water", value: (targets?.water_ml || 0).toString(), unit: "ml" },
  ];

  return (
    <ScreenWrapper noScroll>
      <DecorativeBlobs variant="dots" />
      <View style={styles.container}>
        <Text preset="h1" style={styles.title}>Personalized for you</Text>
        <Text preset="caption" style={styles.subtitle}>Based on your body, activity level, and goals.</Text>

        <Card style={styles.card}>
          {items.map((item, i) => (
            <View key={item.label} style={[styles.row, i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Text preset="overline" style={styles.rowLabel}>{item.label}</Text>
              <View style={styles.valueRow}>
                <Text preset="h2" style={styles.rowValue}>{item.value}</Text>
                <Text preset="caption" style={styles.rowUnit}>{item.unit}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.spacer} />

        <Button
          title="Start Logging"
          onPress={() => router.replace("/(tabs)")}
          variant="primary"
          style={styles.startButton}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
  title: { fontSize: 28, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, marginBottom: 36, textAlign: "center" },
  card: { marginBottom: 24, borderRadius: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 18 },
  rowLabel: { fontSize: 12 },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  rowValue: { fontSize: 22 },
  rowUnit: { fontSize: 13 },
  spacer: { flex: 1 },
  startButton: { marginBottom: 40 },
});
