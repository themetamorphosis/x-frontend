import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Shadow } from "react-native-shadow-2";
import { MotiPressable } from "moti/interactions";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";
import { label, heading, body, caption, buttonText } from "../../utils/typography";
import { raisedShadowProps, neuInset } from "../../utils/neumorphic";

const GOALS = [
  { key: "lose_fat", label: "LOSE FAT", desc: "Reduce body fat while keeping muscle" },
  { key: "maintain", label: "MAINTAIN", desc: "Stay at your current weight" },
  { key: "gain_muscle", label: "GAIN MUSCLE", desc: "Build muscle with a lean surplus" },
  { key: "gain_weight", label: "GAIN WEIGHT", desc: "Increase overall body weight" },
];

export default function GoalScreen() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useProfileStore();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.stepLabel}>Step 1 of 4</Text>
        <Text style={styles.title}>What's your goal?</Text>
        <Text style={styles.subtitle}>We'll personalize your targets based on your goal.</Text>

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
                <Shadow
                  {...(selected ? raisedShadowProps(6) : raisedShadowProps(3))}
                  style={[styles.goalCard, selected && styles.goalCardActive]}
                >
                  <Text style={[styles.goalLabel, selected && { color: Colors.white }]}>
                    {g.label}
                  </Text>
                  <Text style={[styles.goalDesc, selected && { color: "rgba(255,255,255,0.7)" }]}>
                    {g.desc}
                  </Text>
                </Shadow>
              </MotiPressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Button
          title="Continue"
          onPress={() => router.push("/(onboarding)/stats")}
          disabled={!onboarding.goal}
          variant="accent"
          style={styles.continueButton}
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
  goalList: { gap: 12 },
  goalCard: { borderRadius: 16, padding: 20, backgroundColor: Colors.background },
  goalCardActive: { backgroundColor: Colors.accent },
  goalLabel: { ...buttonText, fontSize: 15, letterSpacing: 0.5, color: Colors.text },
  goalDesc: { ...body, fontSize: 13, marginTop: 4, color: Colors.textSecondary },
  spacer: { flex: 1 },
  continueButton: { marginBottom: 40 },
});
