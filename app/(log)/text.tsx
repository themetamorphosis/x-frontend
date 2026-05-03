import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import { Toast } from "../../components/ui/Toast";
import { parseText } from "../../services/food";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { Colors } from "../../utils/colors";

export default function TextLogScreen() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const setAIResult = useFoodLogStore((s) => s.setAIResult);

  const handleSubmit = async () => {
    const trimmed = description.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const result = await parseText(trimmed);
      setAIResult(result, "ai_text");
      router.push("/(log)/confirm");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to parse food description";
      setToast({ visible: true, message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Describe Your Food</Text>
      </View>

      <Card>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 2 scrambled eggs with toast and butter"
          placeholderTextColor={Colors.gray500}
          value={description}
          onChangeText={setDescription}
          multiline
          autoFocus
          editable={!loading}
          accessibilityLabel="Food description"
        />
      </Card>

      <Text style={styles.hint}>
        Be as specific as possible — include portions, cooking methods, and brands if known.
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleSubmit}
        disabled={!description.trim() || loading}
        accessibilityRole="button"
        accessibilityLabel="Analyze food description"
        style={[styles.analyzeButton, { backgroundColor: description.trim() && !loading ? Colors.white : Colors.gray300 }]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.black} />
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze</Text>
        )}
      </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: 16, paddingBottom: 24, flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 16 },
  backArrow: { color: Colors.white, fontSize: 16 },
  headerTitle: { fontSize: 13, color: Colors.gray500, letterSpacing: 0.5, textTransform: "uppercase" },
  textInput: { color: Colors.white, fontSize: 16, minHeight: 120, textAlignVertical: "top" },
  hint: { color: Colors.gray400, fontSize: 12, marginTop: 8, marginBottom: 24 },
  analyzeButton: { paddingVertical: 16, alignItems: "center" },
  analyzeButtonText: { color: Colors.black, fontSize: 14, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
});
