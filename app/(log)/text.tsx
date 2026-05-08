import { useState } from "react";
import { View, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Card } from "../../components/ui/v2/Card";
import { Button } from "../../components/ui/v2/Button";
import { Text } from "../../components/ui/v2/Text";
import { Toast } from "../../components/ui/v2/Toast";
import { parseText } from "../../services/food";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { useTheme } from "../../utils/theme";

export default function TextLogScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
          <Text preset="overline">Describe Your Food</Text>
        </View>

        <Card>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="e.g. 2 scrambled eggs with toast and butter"
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            autoFocus
            editable={!loading}
            accessibilityLabel="Food description"
          />
        </Card>

        <Text preset="caption" style={styles.hint}>
          Be as specific as possible — include portions, cooking methods, and brands if known.
        </Text>

        <Button
          title="Analyze"
          onPress={handleSubmit}
          disabled={!description.trim() || loading}
          loading={loading}
          style={{ marginTop: 24 }}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: 16, paddingBottom: 24 },
  textInput: { fontSize: 16, minHeight: 120, textAlignVertical: "top" },
  hint: { marginTop: 8, marginBottom: 24 },
});
