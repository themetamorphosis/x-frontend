import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";

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
              <TouchableOpacity
                key={g.key}
                onPress={() => setOnboarding({ goal: g.key })}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityLabel={`${g.label}: ${g.desc}`}
                accessibilityState={{ selected }}
                style={[styles.goalCard, selected ? styles.goalCardActive : styles.goalCardInactive]}
              >
                <Text style={[styles.goalLabel, { color: selected ? Colors.black : Colors.white }]}>
                  {g.label}
                </Text>
                <Text style={[styles.goalDesc, { color: selected ? Colors.gray300 : Colors.gray500 }]}>
                  {g.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Button
          title="Continue"
          onPress={() => router.push("/(onboarding)/stats")}
          disabled={!onboarding.goal}
          style={styles.continueButton}
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
  goalList: { gap: 12 },
  goalCard: { borderWidth: 1, borderRadius: 12, padding: 20 },
  goalCardActive: { backgroundColor: Colors.white, borderColor: Colors.white },
  goalCardInactive: { backgroundColor: Colors.gray100, borderColor: Colors.gray100 },
  goalLabel: { fontSize: 15, fontWeight: "600", letterSpacing: 0.5 },
  goalDesc: { fontSize: 13, marginTop: 4 },
  spacer: { flex: 1 },
  continueButton: { marginBottom: 40 },
});
