import { View, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
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
import { fonts } from "../../utils/typography-v2";
import { X } from "lucide-react-native";

export default function StatsScreen() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useProfileStore();
  const { colors } = useTheme();

  const [age, setAge] = useState(onboarding.age?.toString() || "");
  const [height, setHeight] = useState(onboarding.height_cm?.toString() || "");
  const [weight, setWeight] = useState(onboarding.weight_kg?.toString() || "");
  const [sex, setSex] = useState<string | null>(onboarding.sex);

  const canContinue = age && height && weight && sex;

  const handleContinue = () => {
    setOnboarding({
      age: parseInt(age),
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      sex,
    });
    router.push("/(onboarding)/activity");
  };

  return (
    <ScreenWrapper noScroll>
      <DecorativeBlobs variant="circles" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Close button */}
        <PressableScale onPress={() => router.replace("/(auth)/login")} accessibilityRole="button" accessibilityLabel="Close onboarding"
          style={styles.closeButton}>
          <X size={20} color={colors.textSecondary} />
        </PressableScale>

        <ProgressBar totalSteps={4} currentStep={2} style={styles.progressBar} />

        <Text preset="h1" style={styles.title}>Your body</Text>
        <Text preset="caption" style={styles.subtitle}>Used to calculate your metabolic rate.</Text>

        <Text preset="overline" style={styles.fieldLabel}>Sex</Text>
        <View style={styles.sexRow}>
          {[
            { key: "male", label: "Male" },
            { key: "female", label: "Female" },
          ].map((s) => (
            <PressableScale
              key={s.key}
              onPress={() => setSex(s.key)}
              accessibilityRole="button"
              accessibilityLabel={`Sex: ${s.label}`}
              style={{ flex: 1 }}
            >
              <Card style={StyleSheet.flatten([styles.sexButton, sex === s.key && { backgroundColor: colors.primary }])}>
                <Text preset="body" style={[styles.sexButtonText, sex === s.key && { color: colors.primaryText }]}>
                  {s.label}
                </Text>
              </Card>
            </PressableScale>
          ))}
        </View>

        <Text preset="overline" style={styles.fieldLabel}>Age</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="25"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            accessibilityLabel="Age in years"
            style={[styles.textInput, { color: colors.text }]}
          />
        </View>

        <Text preset="overline" style={styles.fieldLabel}>Height (cm)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
          <TextInput
            value={height}
            onChangeText={setHeight}
            placeholder="175"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            accessibilityLabel="Height in centimeters"
            style={[styles.textInput, { color: colors.text }]}
          />
        </View>

        <Text preset="overline" style={styles.fieldLabel}>Weight (kg)</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface }]}>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="70"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            accessibilityLabel="Weight in kilograms"
            style={[styles.textInput, { color: colors.text }]}
          />
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          variant="primary"
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  progressBar: { marginBottom: 40, marginTop: 8 },
  title: { fontSize: 28, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, marginBottom: 36, textAlign: "center" },
  fieldLabel: { marginBottom: 8 },
  sexRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  sexButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
  },
  sexButtonText: { fontSize: 15 },
  inputWrapper: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  textInput: {
    fontSize: 16,
    fontFamily: fonts.regular,
    padding: 0,
    margin: 0,
  },
});
