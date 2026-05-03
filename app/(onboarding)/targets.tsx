import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";

export default function TargetsScreen() {
  const router = useRouter();
  const { targets } = useProfileStore();

  const items = [
    { label: "CALORIES", value: targets?.calories?.toString() || "0", unit: "kcal" },
    { label: "PROTEIN", value: Math.round(targets?.protein_g || 0).toString(), unit: "g" },
    { label: "CARBS", value: Math.round(targets?.carbs_g || 0).toString(), unit: "g" },
    { label: "FAT", value: Math.round(targets?.fat_g || 0).toString(), unit: "g" },
    { label: "FIBER", value: Math.round(targets?.fiber_g || 0).toString(), unit: "g" },
    { label: "WATER", value: (targets?.water_ml || 0).toString(), unit: "ml" },
  ];

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.stepLabel}>Your targets</Text>
        <Text style={styles.title}>Personalized for you</Text>
        <Text style={styles.subtitle}>Based on your body, activity level, and goals.</Text>

        <Card style={styles.card}>
          {items.map((item, i) => (
            <View key={item.label} style={[styles.row, i < items.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <View style={styles.valueRow}>
                <Text style={styles.rowValue}>{item.value}</Text>
                <Text style={styles.rowUnit}>{item.unit}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.spacer} />

        <Button
          title="Start Logging"
          onPress={() => router.replace("/(tabs)")}
          style={styles.startButton}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  stepLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  title: { color: Colors.white, fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: Colors.gray500, fontSize: 14, marginBottom: 32 },
  card: { marginBottom: 24 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  rowLabel: { color: Colors.gray500, fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase" },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  rowValue: { color: Colors.white, fontSize: 22, fontWeight: "700" },
  rowUnit: { color: Colors.gray500, fontSize: 13 },
  spacer: { flex: 1 },
  startButton: { marginBottom: 40 },
});
