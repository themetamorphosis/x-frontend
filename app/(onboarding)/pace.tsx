import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Shadow } from "react-native-shadow-2";
import { MotiPressable } from "moti/interactions";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";
import { label, heading, caption, buttonText, body } from "../../utils/typography";
import { raisedShadowProps } from "../../utils/neumorphic";

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
              <MotiPressable
                key={p.key}
                onPress={() => setOnboarding({ pace: p.key })}
                accessibilityRole="radio"
                accessibilityLabel={`${p.label}: ${p.desc}`}
                accessibilityState={{ selected }}
                animate={({ pressed }) => ({ scale: pressed ? 0.98 : 1 })}
              >
                <Shadow
                  {...(selected ? raisedShadowProps(6) : raisedShadowProps(3))}
                  style={[styles.optionCard, selected && styles.optionActive]}
                >
                  <Text style={[styles.optionLabel, selected && { color: Colors.white }]}>
                    {p.label}
                  </Text>
                  <Text style={[styles.optionDesc, selected && { color: "rgba(255,255,255,0.7)" }]}>
                    {p.desc}
                  </Text>
                </Shadow>
              </MotiPressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Button
          title="Calculate My Targets"
          onPress={handleFinish}
          disabled={!onboarding.pace}
          loading={loading}
          variant="accent"
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingTop: 60, paddingBottom: 40 },
  stepLabel: { ...label, fontSize: 11, marginBottom: 4 },
  title: { ...heading, fontSize: 28, marginBottom: 8 },
  subtitle: { ...caption, fontSize: 14, marginBottom: 32 },
  optionList: { gap: 12 },
  optionCard: { borderRadius: 16, padding: 20, backgroundColor: Colors.background },
  optionActive: { backgroundColor: Colors.accent },
  optionLabel: { ...buttonText, fontSize: 15, letterSpacing: 0.5, color: Colors.text },
  optionDesc: { ...body, fontSize: 13, marginTop: 4, color: Colors.textSecondary },
  spacer: { height: 40 },
});
