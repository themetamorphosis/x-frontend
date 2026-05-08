import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MotiPressable } from "moti/interactions";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Button } from "../../components/ui/v2/Button";
import { Card } from "../../components/ui/v2/Card";
import { Text } from "../../components/ui/v2/Text";
import { useProfileStore } from "../../stores/profileStore";
import { useTheme } from "../../utils/theme";

const GOALS = [
  { key: "lose_fat", label: "LOSE FAT", desc: "Reduce body fat while keeping muscle" },
  { key: "maintain", label: "MAINTAIN", desc: "Stay at your current weight" },
  { key: "gain_muscle", label: "GAIN MUSCLE", desc: "Build muscle with a lean surplus" },
  { key: "gain_weight", label: "GAIN WEIGHT", desc: "Increase overall body weight" },
];

export default function GoalScreen() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useProfileStore();
  const { colors } = useTheme();

  return (
    <ScreenWrapper noScroll>
      <View style={styles.container}>
        <Text preset="overline" style={styles.stepLabel}>Step 1 of 4</Text>
        <Text preset="h1">What's your goal?</Text>
        <Text preset="caption" style={styles.subtitle}>We'll personalize your targets based on your goal.</Text>

        <View style={styles.goalList}>
          {GOALS.map((g) => {
            const selected = onboarding.goal === g.key;
            return (
              <MotiPressable
                key={g.key}
                onPress={() => setOnboarding({ goal: g.key })}
                accessibilityRole="radio"
                accessibilityLabel={`${g.label}: ${g.desc}`}
                accessibilityState={{ selected }}
                animate={({ pressed }) => ({ scale: pressed ? 0.98 : 1 })}
              >
                <Card style={StyleSheet.flatten([styles.goalCard, selected && { backgroundColor: colors.primary }])}>
                  <Text preset="overline" style={[styles.goalLabel, selected && { color: colors.primaryText }]}>
                    {g.label}
                  </Text>
                  <Text preset="body" style={[styles.goalDesc, selected && { color: "rgba(255,255,255,0.7)" }]}>
                    {g.desc}
                  </Text>
                </Card>
              </MotiPressable>
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
  container: { flex: 1, paddingTop: 60 },
  stepLabel: { fontSize: 11, marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 32 },
  goalList: { gap: 12 },
  goalCard: { borderRadius: 16, padding: 20 },
  goalLabel: { fontSize: 15, letterSpacing: 0.5 },
  goalDesc: { fontSize: 13, marginTop: 4 },
  spacer: { flex: 1 },
  continueButton: { marginBottom: 40 },
});
