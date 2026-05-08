import { View, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { MotiPressable } from "moti/interactions";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Button } from "../../components/ui/v2/Button";
import { Card } from "../../components/ui/v2/Card";
import { Text } from "../../components/ui/v2/Text";
import { useProfileStore } from "../../stores/profileStore";
import { useTheme } from "../../utils/theme";
import { fonts } from "../../utils/typography-v2";

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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text preset="overline" style={styles.stepLabel}>Step 2 of 4</Text>
        <Text preset="h1">Your body</Text>
        <Text preset="caption" style={styles.subtitle}>Used to calculate your metabolic rate.</Text>

        <Text preset="overline" style={styles.fieldLabel}>Sex</Text>
        <View style={styles.sexRow}>
          {[
            { key: "male", label: "MALE" },
            { key: "female", label: "FEMALE" },
          ].map((s) => (
            <MotiPressable
              key={s.key}
              onPress={() => setSex(s.key)}
              accessibilityRole="button"
              accessibilityLabel={`Sex: ${s.label}`}
              animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
              style={{ flex: 1 }}
            >
              <Card style={StyleSheet.flatten([styles.sexButton, sex === s.key && { backgroundColor: colors.primary }])}>
                <Text preset="overline" style={[styles.sexButtonText, sex === s.key && { color: colors.primaryText }]}>
                  {s.label}
                </Text>
              </Card>
            </MotiPressable>
          ))}
        </View>

        <Text preset="overline" style={styles.fieldLabel}>Age</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
  scrollContent: { paddingTop: 60, paddingBottom: 40 },
  stepLabel: { fontSize: 11, marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 32 },
  fieldLabel: { marginBottom: 8 },
  sexRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  sexButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  sexButtonText: { fontSize: 14 },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1,
  },
  textInput: {
    fontSize: 16,
    fontFamily: fonts.regular,
    padding: 0,
    margin: 0,
  },
});
