import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Shadow } from "react-native-shadow-2";
import { MotiPressable } from "moti/interactions";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";
import { label, heading, caption, buttonText, body } from "../../utils/typography";
import { raisedShadowProps, neuInset } from "../../utils/neumorphic";

export default function StatsScreen() {
  const router = useRouter();
  const { onboarding, setOnboarding } = useProfileStore();

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
    <ScreenWrapper>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepLabel}>Step 2 of 4</Text>
        <Text style={styles.title}>Your body</Text>
        <Text style={styles.subtitle}>Used to calculate your metabolic rate.</Text>

        <Text style={styles.fieldLabel}>Sex</Text>
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
              <Shadow
                {...(sex === s.key ? raisedShadowProps(5) : raisedShadowProps(3))}
                style={[styles.sexButton, sex === s.key && styles.sexButtonActive]}
              >
                <Text style={[styles.sexButtonText, sex === s.key && { color: Colors.white }]}>
                  {s.label}
                </Text>
              </Shadow>
            </MotiPressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Age</Text>
        <View style={neuInset({ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, marginBottom: 24 })}>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="25"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="number-pad"
            accessibilityLabel="Age in years"
            style={styles.textInput}
          />
        </View>

        <Text style={styles.fieldLabel}>Height (cm)</Text>
        <View style={neuInset({ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, marginBottom: 24 })}>
          <TextInput
            value={height}
            onChangeText={setHeight}
            placeholder="175"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="decimal-pad"
            accessibilityLabel="Height in centimeters"
            style={styles.textInput}
          />
        </View>

        <Text style={styles.fieldLabel}>Weight (kg)</Text>
        <View style={neuInset({ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, marginBottom: 24 })}>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="70"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="decimal-pad"
            accessibilityLabel="Weight in kilograms"
            style={styles.textInput}
          />
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          variant="accent"
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingBottom: 40 },
  stepLabel: { ...label, fontSize: 11, marginBottom: 4 },
  title: { ...heading, fontSize: 28, marginBottom: 8 },
  subtitle: { ...caption, fontSize: 14, marginBottom: 32 },
  fieldLabel: { ...label, marginBottom: 8 },
  sexRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  sexButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  sexButtonActive: { backgroundColor: Colors.accent },
  sexButtonText: { ...buttonText, fontSize: 14, color: Colors.text },
  textInput: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    padding: 0,
    margin: 0,
  },
});
