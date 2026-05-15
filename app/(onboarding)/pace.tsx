import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { PressableScale } from "../../components/ui/v2/PressableScale";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Button } from "../../components/ui/v2/Button";
import { Card } from "../../components/ui/v2/Card";
import { Text } from "../../components/ui/v2/Text";
import { ProgressBar } from "../../components/ui/v2/ProgressBar";
import { DecorativeBlobs } from "../../components/ui/v2/DecorativeBlobs";
import { useProfileStore } from "../../stores/profileStore";
import { useTheme } from "../../utils/theme";
import { X } from "lucide-react-native";

const PACES: Record<string, { key: string; label: string; desc: string }[]> = {
  lose_fat: [
    { key: "mild", label: "Mild", desc: "0.25 kg/week — slower but easier" },
    { key: "moderate", label: "Moderate", desc: "0.5 kg/week — recommended" },
    { key: "aggressive", label: "Aggressive", desc: "0.75 kg/week — fast but harder" },
  ],
  maintain: [
    { key: "moderate", label: "Maintain", desc: "Stay at current weight" },
  ],
  gain_muscle: [
    { key: "mild", label: "Mild", desc: "Lean bulk — minimal fat gain" },
    { key: "moderate", label: "Moderate", desc: "Standard bulk — recommended" },
    { key: "aggressive", label: "Aggressive", desc: "Fast gains — some fat gain" },
  ],
  gain_weight: [
    { key: "mild", label: "Mild", desc: "Slow and steady" },
    { key: "moderate", label: "Moderate", desc: "Consistent gain — recommended" },
    { key: "aggressive", label: "Aggressive", desc: "Rapid gain" },
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
      <DecorativeBlobs variant="waves" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Close button */}
        <PressableScale onPress={() => router.replace("/(auth)/login")} accessibilityRole="button" accessibilityLabel="Close onboarding"
          style={styles.closeButton}>
          <X size={20} color={colors.textSecondary} />
        </PressableScale>

        <ProgressBar totalSteps={4} currentStep={4} style={styles.progressBar} />

        <Text preset="h1" style={styles.title}>Your pace</Text>
        <Text preset="caption" style={styles.subtitle}>
          {goal === "maintain"
            ? "No pace needed for maintenance."
            : "How fast do you want to reach your goal?"}
        </Text>

        <View style={styles.optionList}>
          {options.map((p) => {
            const selected = onboarding.pace === p.key;
            return (
              <PressableScale
                key={p.key}
                onPress={() => setOnboarding({ pace: p.key })}
                accessibilityRole="radio"
                accessibilityLabel={`${p.label}: ${p.desc}`}
                accessibilityState={{ selected }}
              >
                <Card style={StyleSheet.flatten([styles.optionCard, selected && { backgroundColor: colors.primary }])}>
                  <Text preset="body" style={[styles.optionLabel, selected && { color: colors.primaryText }]}>
                    {p.label}
                  </Text>
                  <Text style={[styles.optionDesc, selected && { color: "rgba(255,255,255,0.7)" }]}>
                    {p.desc}
                  </Text>
                </Card>
              </PressableScale>
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
  scrollContent: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  progressBar: { marginBottom: 40, marginTop: 8 },
  title: { fontSize: 28, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, marginBottom: 36, textAlign: "center" },
  optionList: { gap: 12 },
  optionCard: { borderRadius: 20, padding: 24 },
  optionLabel: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  optionDesc: { fontSize: 13, lineHeight: 18 },
  spacer: { height: 40 },
});
