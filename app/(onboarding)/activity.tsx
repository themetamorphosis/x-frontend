import { View, ScrollView, StyleSheet } from "react-native";
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

const LEVELS = [
  { key: "sedentary", label: "Sedentary", desc: "Desk job, little to no exercise" },
  { key: "light", label: "Light", desc: "Light exercise 1-3 days/week" },
  { key: "moderate", label: "Moderate", desc: "Moderate exercise 3-5 days/week" },
  { key: "active", label: "Active", desc: "Hard exercise 6-7 days/week" },
  { key: "very_active", label: "Very Active", desc: "Athlete, physical job, 2x/day" },
];

export default function ActivityScreen() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useProfileStore();
  const { colors } = useTheme();

  return (
    <ScreenWrapper noScroll>
      <DecorativeBlobs variant="circles" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Close button */}
        <PressableScale onPress={() => router.replace("/(auth)/login")} accessibilityRole="button" accessibilityLabel="Close onboarding"
          style={styles.closeButton}>
          <X size={20} color={colors.textSecondary} />
        </PressableScale>

        <ProgressBar totalSteps={4} currentStep={3} style={styles.progressBar} />

        <Text preset="h1" style={styles.title}>Activity level</Text>
        <Text preset="caption" style={styles.subtitle}>Be honest — this affects your calorie targets.</Text>

        <View style={styles.optionList}>
          {LEVELS.map((l) => {
            const selected = onboarding.activity_level === l.key;
            return (
              <PressableScale
                key={l.key}
                onPress={() => setOnboarding({ activity_level: l.key })}
                accessibilityRole="radio"
                accessibilityLabel={`${l.label}: ${l.desc}`}
                accessibilityState={{ selected }}
              >
                <Card style={StyleSheet.flatten([styles.optionCard, selected && { backgroundColor: colors.primary }])}>
                  <Text preset="body" style={[styles.optionLabel, selected && { color: colors.primaryText }]}>
                    {l.label}
                  </Text>
                  <Text style={[styles.optionDesc, selected && { color: "rgba(255,255,255,0.7)" }]}>
                    {l.desc}
                  </Text>
                </Card>
              </PressableScale>
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
