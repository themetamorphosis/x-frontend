import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { MotiPressable } from "moti/interactions";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Button } from "../../components/ui/v2/Button";
import { Card } from "../../components/ui/v2/Card";
import { Text } from "../../components/ui/v2/Text";
import { useProfileStore } from "../../stores/profileStore";
import { useTheme } from "../../utils/theme";

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
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const goal = onboarding.goal || "maintain";
  const options = PACES[goal] || PACES.maintain;

  const handleFinish = async () => {
    setLoading(true);
    try {
      await saveOnboarding();
      router.replace("/(onboarding)/targets");
    } catch (e: unknown) {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper noScroll>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text preset="overline" style={styles.stepLabel}>Step 4 of 4</Text>
        <Text preset="h1">Your pace</Text>
        <Text preset="caption" style={styles.subtitle}>
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
                <Card style={StyleSheet.flatten([styles.optionCard, selected && { backgroundColor: colors.primary }])}>
                  <Text preset="overline" style={[styles.optionLabel, selected && { color: colors.primaryText }]}>
                    {p.label}
                  </Text>
                  <Text preset="body" style={[styles.optionDesc, selected && { color: "rgba(255,255,255,0.7)" }]}>
                    {p.desc}
                  </Text>
                </Card>
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
          variant="primary"
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingTop: 60, paddingBottom: 40 },
  stepLabel: { fontSize: 11, marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 32 },
  optionList: { gap: 12 },
  optionCard: { borderRadius: 16, padding: 20 },
  optionLabel: { fontSize: 15, letterSpacing: 0.5 },
  optionDesc: { fontSize: 13, marginTop: 4 },
  spacer: { height: 40 },
});
