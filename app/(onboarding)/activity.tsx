import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MotiPressable } from "moti/interactions";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Button } from "../../components/ui/v2/Button";
import { Card } from "../../components/ui/v2/Card";
import { Text } from "../../components/ui/v2/Text";
import { useProfileStore } from "../../stores/profileStore";
import { useTheme } from "../../utils/theme";

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
  const { colors } = useTheme();

  return (
    <ScreenWrapper noScroll>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text preset="overline" style={styles.stepLabel}>Step 3 of 4</Text>
        <Text preset="h1">Activity level</Text>
        <Text preset="caption" style={styles.subtitle}>Be honest — this affects your calorie targets.</Text>

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
                <Card style={StyleSheet.flatten([styles.optionCard, selected && { backgroundColor: colors.primary }])}>
                  <Text preset="overline" style={[styles.optionLabel, selected && { color: colors.primaryText }]}>
                    {l.label}
                  </Text>
                  <Text preset="body" style={[styles.optionDesc, selected && { color: "rgba(255,255,255,0.7)" }]}>
                    {l.desc}
                  </Text>
                </Card>
              </MotiPressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Button
          title="Continue"
          onPress={() => router.push("/(onboarding)/pace")}
          disabled={!onboarding.activity_level}
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
