import { useState, useCallback, useRef } from "react";
import { View, TextInput, StyleSheet, Keyboard, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiPressable } from "moti/interactions";
import { Camera, Image as ImageIcon, Send } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme, ColorPalette } from "../utils/theme";
import { buttonTextSmall } from "../utils/typography";
import { parseText, parsePhoto, saveFoodLog } from "../services/food";
import { useDailyStore } from "../stores/dailyStore";
import { haptic } from "../utils/haptics";
import { imageToBase64 } from "../utils/imageCompression";
import { AIReplyBubble } from "./AIReplyBubble";
import type { AIParseResponse, MealType } from "../types/food";
import { detectMealType } from "../utils/mealType";

export function AIChatBar() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const addFoodLog = useDailyStore((s) => s.addFoodLog);

  const _saveFoods = useCallback(async (response: AIParseResponse, source: "ai_text" | "ai_photo") => {
    const mealType: MealType = detectMealType();
    const savedFoods = await Promise.all(
      response.foods.map((food) =>
        saveFoodLog({
          meal_type: mealType,
          food_name: food.name,
          portion: food.portion,
          calories: food.calories,
          protein_g: food.protein_g,
          carbs_g: food.carbs_g,
          fat_g: food.fat_g,
          fiber_g: food.fiber_g || 0,
          source,
        })
      )
    );
    for (const saved of savedFoods) {
      addFoodLog({ ...saved, meal_type: mealType });
    }
    const totalCalories = response.foods.reduce((sum, f) => sum + f.calories, 0);
    const foodNames = response.foods.map((f) => f.name).join(" + ");
    return { foodNames, totalCalories };
  }, [addFoodLog]);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    haptic.light();
    Keyboard.dismiss();
    setLoading(true);
    setText("");

    try {
      const response = await parseText(trimmed);
      const { foodNames, totalCalories } = await _saveFoods(response, "ai_text");
      setReply(`Logged: ${foodNames} — ${totalCalories} cal`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse food";
      setReply(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [text, loading, _saveFoods]);

  const handleCamera = useCallback(async () => {
    haptic.light();
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: false,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setLoading(true);
      const base64 = await imageToBase64(result.assets[0].uri);
      const response = await parsePhoto(base64);
      const { foodNames, totalCalories } = await _saveFoods(response, "ai_photo");
      setReply(`Photo logged: ${foodNames} — ${totalCalories} cal`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process photo";
      setReply(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [_saveFoods]);

  const handleImagePicker = useCallback(async () => {
    haptic.light();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: false,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setLoading(true);
      const base64 = await imageToBase64(result.assets[0].uri);
      const response = await parsePhoto(base64);
      const { foodNames, totalCalories } = await _saveFoods(response, "ai_photo");
      setReply(`Logged: ${foodNames} — ${totalCalories} cal`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process image";
      setReply(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [_saveFoods]);

  return (
    <>
      {/* AI Reply Bubble */}
      <AIReplyBubble message={reply} onDismiss={() => setReply(null)} />

      {/* Chat bar */}
      <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bar}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder="Log food... e.g. '2 eggs and toast'"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              editable={!loading}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              accessibilityLabel="Food logging input"
              accessibilityHint="Type what you ate and press send"
            />
          </View>

          <MotiPressable
            onPress={handleCamera}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Take photo of food"
            animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
            style={styles.iconButton}
          >
            <Camera size={20} color={loading ? colors.textTertiary : colors.textSecondary} />
          </MotiPressable>

          <MotiPressable
            onPress={handleImagePicker}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Pick food image from gallery"
            animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
            style={styles.iconButton}
          >
            <ImageIcon size={20} color={loading ? colors.textTertiary : colors.textSecondary} />
          </MotiPressable>

          <MotiPressable
            onPress={handleSubmit}
            disabled={!text.trim() || loading}
            accessibilityRole="button"
            accessibilityLabel="Send food log"
            animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
            style={styles.sendButton}
          >
            <View style={[styles.sendCircle, { backgroundColor: text.trim() ? colors.primary : colors.border }]}>
              <Send size={16} color={text.trim() ? colors.primaryText : colors.textTertiary} />
            </View>
          </MotiPressable>
        </View>
      </View>
    </>
  );
}

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingTop: 8,
      backgroundColor: "transparent",
    },
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      padding: 8,
      borderRadius: 24,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    inputContainer: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      minHeight: 42,
      backgroundColor: c.bg,
      borderWidth: 1,
      borderColor: c.border,
    },
    input: {
      fontSize: 14,
      fontFamily: "Nunito_400Regular",
      color: c.text,
      padding: 0,
      margin: 0,
      flex: 1,
    },
    iconButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    },
    sendButton: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
    },
    sendCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
