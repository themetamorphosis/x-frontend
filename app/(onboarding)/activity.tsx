import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Shadow } from "react-native-shadow-2";
import { MotiPressable } from "moti/interactions";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";
import { label, heading, caption, buttonText, body } from "../../utils/typography";
import { raisedShadowProps } from "../../utils/neumorphic";

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
              <MotiPressable
                key={l.key}
                onPress={() => setOnboarding({ activity_level: l.key })}
                accessibilityRole="radio"
                accessibilityLabel={`${l.label}: ${l.desc}`}
                accessibilityState={{ selected }}
                animate={({ pressed }) => ({ scale: pressed ? 0.98 : 1 })}
              >
                <Shadow
                  {...(selected ? raisedShadowProps(6) : raisedShadowProps(3))}
                  style={[styles.optionCard, selected && styles.optionActive]}
                >
                  <Text style={[styles.optionLabel, selected && { color: Colors.white }]}>
                    {l.label}
                  </Text>
                  <Text style={[styles.optionDesc, selected && { color: "rgba(255,255,255,0.7)" }]}>
                    {l.desc}
                  </Text>
                </Shadow>
              </MotiPressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Button
          title="Continue"
          onPress={() => router.push("/(onboarding)/pace")}
          disabled={!onboarding.activity_level}
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
