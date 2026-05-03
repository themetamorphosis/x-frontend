import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";

const LEVELS = [
  { key: "sedentary", label: "SEDENTARY", desc: "Desk job, little to no exercise" },
  { key: "light", label: "LIGHT", desc: "Light exercise 1-3 days/week" },
  { key: "moderate", label: "MODERATE", desc: "Moderate exercise 3-5 days/week" },
  { key: "active", label: "ACTIVE", desc: "Hard exercise 6-7 days/week" },
  { key: "very_active", label: "VERY ACTIVE", desc: "Athlete, physical job, 2x/day" },
];

export default function ActivityScreen() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useProfileStore();

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepLabel}>Step 3 of 4</Text>
        <Text style={styles.title}>Activity level</Text>
        <Text style={styles.subtitle}>Be honest — this affects your calorie targets.</Text>

        <View style={styles.optionList}>
          {LEVELS.map((l) => {
            const selected = onboarding.activity_level === l.key;
            return (
              <TouchableOpacity
                key={l.key}
                onPress={() => setOnboarding({ activity_level: l.key })}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityLabel={`${l.label}: ${l.desc}`}
                accessibilityState={{ selected }}
                style={[styles.optionCard, selected ? styles.optionActive : styles.optionInactive]}
              >
                <Text style={[styles.optionLabel, { color: selected ? Colors.black : Colors.white }]}>
                  {l.label}
                </Text>
                <Text style={[styles.optionDesc, { color: selected ? Colors.gray300 : Colors.gray500 }]}>
                  {l.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Button
          title="Continue"
          onPress={() => router.push("/(onboarding)/pace")}
          disabled={!onboarding.activity_level}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingTop: 60, paddingBottom: 40 },
  stepLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  title: { color: Colors.white, fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: Colors.gray500, fontSize: 14, marginBottom: 32 },
  optionList: { gap: 12 },
  optionCard: { borderWidth: 1, borderRadius: 12, padding: 20 },
  optionActive: { backgroundColor: Colors.white, borderColor: Colors.white },
  optionInactive: { backgroundColor: Colors.gray100, borderColor: Colors.gray100 },
  optionLabel: { fontSize: 15, fontWeight: "600", letterSpacing: 0.5 },
  optionDesc: { fontSize: 13, marginTop: 4 },
  spacer: { height: 40 },
});
