import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Shadow } from "react-native-shadow-2";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";
import { label, heading, caption, buttonText, statNumber } from "../../utils/typography";
import { raisedShadowProps } from "../../utils/neumorphic";

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

        <Shadow {...raisedShadowProps(5)} style={styles.card}>
          <View style={styles.cardInner}>
            {items.map((item, i) => (
              <View key={item.label} style={[styles.row, i < items.length - 1 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.rowValue}>{item.value}</Text>
                  <Text style={styles.rowUnit}>{item.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </Shadow>

        <View style={styles.spacer} />

        <Button
          title="Start Logging"
          onPress={() => router.replace("/(tabs)")}
          variant="accent"
          style={styles.startButton}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  stepLabel: { ...label, fontSize: 11, marginBottom: 4 },
  title: { ...heading, fontSize: 28, marginBottom: 8 },
  subtitle: { ...caption, fontSize: 14, marginBottom: 32 },
  card: { marginBottom: 24, borderRadius: 20, backgroundColor: Colors.background },
  cardInner: { padding: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceDark },
  rowLabel: { ...label, fontSize: 12 },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  rowValue: { ...statNumber, fontSize: 22 },
  rowUnit: { ...caption, fontSize: 13 },
  spacer: { flex: 1 },
  startButton: { marginBottom: 40 },
});
