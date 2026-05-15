import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
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

const GOALS = [
  { key: "lose_fat", label: "Lose Fat", desc: "Reduce body fat while keeping muscle" },
  { key: "maintain", label: "Maintain", desc: "Stay at your current weight" },
  { key: "gain_muscle", label: "Gain Muscle", desc: "Build muscle with a lean surplus" },
  { key: "gain_weight", label: "Gain Weight", desc: "Increase overall body weight" },
];

export default function GoalScreen() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useProfileStore();
  const { colors } = useTheme();

  return (
    <ScreenWrapper noScroll>
      <DecorativeBlobs variant="dots" />
      <View style={styles.container}>
        {/* Close button */}
        <PressableScale onPress={() => router.replace("/(auth)/login")} accessibilityRole="button" accessibilityLabel="Close onboarding"
          style={styles.closeButton}>
          <X size={20} color={colors.textSecondary} />
        </PressableScale>

        <ProgressBar totalSteps={4} currentStep={1} style={styles.progressBar} />

        <Text preset="h1" style={styles.title}>What's your goal?</Text>
        <Text preset="caption" style={styles.subtitle}>We'll personalize your targets based on your goal.</Text>

        <View style={styles.goalList}>
          {GOALS.map((g) => {
            const selected = onboarding.goal === g.key;
            return (
              <PressableScale
                key={g.key}
                onPress={() => setOnboarding({ goal: g.key })}
                accessibilityRole="radio"
                accessibilityLabel={`${g.label}: ${g.desc}`}
                accessibilityState={{ selected }}
              >
                <Card style={StyleSheet.flatten([styles.goalCard, selected && { backgroundColor: colors.primary }])}>
                  <Text preset="body" style={[styles.goalLabel, selected && { color: colors.primaryText }]}>
                    {g.label}
                  </Text>
                  <Text style={[styles.goalDesc, selected && { color: "rgba(255,255,255,0.7)" }]}>
                    {g.desc}
                  </Text>
                </Card>
              </PressableScale>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Button
          title="Continue"
          onPress={() => router.push("/(onboarding)/stats")}
          disabled={!onboarding.goal}
          variant="primary"
          style={styles.continueButton}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
  closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  progressBar: { marginBottom: 40, marginTop: 8 },
  title: { fontSize: 28, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, marginBottom: 36, textAlign: "center" },
  goalList: { gap: 12 },
  goalCard: { borderRadius: 20, padding: 24 },
  goalLabel: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  goalDesc: { fontSize: 13, lineHeight: 18 },
  spacer: { flex: 1 },
  continueButton: { marginBottom: 40 },
});
