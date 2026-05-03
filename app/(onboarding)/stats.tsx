import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";

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
            <TouchableOpacity
              key={s.key}
              onPress={() => setSex(s.key)}
              accessibilityRole="button"
              accessibilityLabel={`Sex: ${s.label}`}
              style={[styles.sexButton, sex === s.key ? styles.sexButtonActive : styles.sexButtonInactive]}
            >
              <Text style={[styles.sexButtonText, { color: sex === s.key ? Colors.black : Colors.white }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Age</Text>
        <TextInput
          value={age}
          onChangeText={setAge}
          placeholder="25"
          placeholderTextColor={Colors.gray400}
          keyboardType="number-pad"
          accessibilityLabel="Age in years"
          style={styles.textInput}
        />

        <Text style={styles.fieldLabel}>Height (cm)</Text>
        <TextInput
          value={height}
          onChangeText={setHeight}
          placeholder="175"
          placeholderTextColor={Colors.gray400}
          keyboardType="decimal-pad"
          accessibilityLabel="Height in centimeters"
          style={styles.textInput}
        />

        <Text style={styles.fieldLabel}>Weight (kg)</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          placeholder="70"
          placeholderTextColor={Colors.gray400}
          keyboardType="decimal-pad"
          accessibilityLabel="Weight in kilograms"
          style={styles.textInput}
        />

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingTop: 60, paddingBottom: 40 },
  stepLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  title: { color: Colors.white, fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: Colors.gray500, fontSize: 14, marginBottom: 32 },
  fieldLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 },
  sexRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  sexButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  sexButtonActive: { backgroundColor: Colors.white, borderColor: Colors.white },
  sexButtonInactive: { backgroundColor: Colors.gray100, borderColor: Colors.gray200 },
  sexButtonText: { fontWeight: "600", fontSize: 14 },
  textInput: {
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    padding: 16,
    color: Colors.white,
    fontSize: 16,
    marginBottom: 24,
  },
});
