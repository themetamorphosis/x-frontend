import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";

const PACES: Record<string, { key: string; label: string; desc: string }[]> = {
  lose_fat: [
    { key: "mild", label: "MILD", desc: "0.25 kg/week — slower but easier" },
    { key: "moderate", label: "MODERATE", desc: "0.5 kg/week — recommended" },
    { key: "aggressive", label: "AGGRESSIVE", desc: "0.75 kg/week — fast but harder" },
  ],
  maintain: [
    { key: "moderate", label: "MAINTAIN", desc: "Stay at current weight" },
  ],
  gain_muscle: [
    { key: "mild", label: "MILD", desc: "Lean bulk — minimal fat gain" },
    { key: "moderate", label: "MODERATE", desc: "Standard bulk — recommended" },
    { key: "aggressive", label: "AGGRESSIVE", desc: "Fast gains — some fat gain" },
  ],
  gain_weight: [
    { key: "mild", label: "MILD", desc: "Slow and steady" },
    { key: "moderate", label: "MODERATE", desc: "Consistent gain — recommended" },
    { key: "aggressive", label: "AGGRESSIVE", desc: "Rapid gain" },
  ],
};

export default function PaceScreen() {
  const router = useRouter();
  const { onboarding, setOnboarding, saveOnboarding } = useProfileStore();
  const [loading, setLoading] = useState(false);

  const goal = onboarding.goal || "maintain";
  const options = PACES[goal] || PACES.maintain;

  const handleFinish = async () => {
    setLoading(true);
    try {
      await saveOnboarding();
      router.replace("/(onboarding)/targets");
    } catch {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepLabel}>Step 4 of 4</Text>
        <Text style={styles.title}>Your pace</Text>
        <Text style={styles.subtitle}>
          {goal === "maintain"
            ? "No pace needed for maintenance."
            : "How fast do you want to reach your goal?"}
        </Text>

        <View style={styles.optionList}>
          {options.map((p) => {
            const selected = onboarding.pace === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setOnboarding({ pace: p.key })}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityLabel={`${p.label}: ${p.desc}`}
                accessibilityState={{ selected }}
                style={[styles.optionCard, selected ? styles.optionActive : styles.optionInactive]}
              >
                <Text style={[styles.optionLabel, { color: selected ? Colors.black : Colors.white }]}>
                  {p.label}
                </Text>
                <Text style={[styles.optionDesc, { color: selected ? Colors.gray300 : Colors.gray500 }]}>
                  {p.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Button
          title="Calculate My Targets"
          onPress={handleFinish}
          disabled={!onboarding.pace}
          loading={loading}
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
