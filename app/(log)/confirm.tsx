import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Toast } from "../../components/ui/Toast";
import { MealTypeSelector } from "../../components/log/MealTypeSelector";
import { FoodItemCard } from "../../components/log/FoodItemCard";
import { EditModal } from "../../components/log/EditModal";
import { TotalCard } from "../../components/log/TotalCard";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { saveFoodLog } from "../../services/food";
import type { ParsedFood } from "../../types/food";
import { useDailyStore } from "../../stores/dailyStore";
import { createCustomFood } from "../../services/foodDb";
import { haptic } from "../../utils/haptics";
import { Colors } from "../../utils/colors";
import type { MealType } from "../../utils/mealType";

export default function ConfirmScreen() {
  const router = useRouter();
  const {
    editedFoods,
    mealType,
    source,
    aiResult,
    setMealType,
    updateFood,
    removeFood,
    reset,
  } = useFoodLogStore();
  const addFoodLog = useDailyStore((s) => s.addFoodLog);
  const [saving, setSaving] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });

  const saveAsCustom = async (food: ParsedFood) => {
    haptic.light();
    try {
      await createCustomFood({
        name: food.name,
        portion: food.portion || undefined,
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
        fiber_g: food.fiber_g || 0,
      });
      setToast({ visible: true, message: `"${food.name}" saved to library`, type: "success" });
    } catch {
      setToast({ visible: true, message: "Failed to save custom food", type: "error" });
    }
  };

  const total = editedFoods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein_g: acc.protein_g + f.protein_g,
      carbs_g: acc.carbs_g + f.carbs_g,
      fat_g: acc.fat_g + f.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const handleSave = async () => {
    if (editedFoods.length === 0) {
      setToast({ visible: true, message: "Add at least one food item", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const results = await Promise.allSettled(
        editedFoods.map((food) =>
          saveFoodLog({
            meal_type: mealType,
            food_name: food.name,
            portion: food.portion,
            calories: food.calories,
            protein_g: food.protein_g,
            carbs_g: food.carbs_g,
            fat_g: food.fat_g,
            fiber_g: food.fiber_g,
            source,
          })
        )
      );

      const succeeded = results.filter((r): r is PromiseFulfilledResult<FoodLogEntry> => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      for (const result of succeeded) {
        const entry = result.value;
        addFoodLog({
          id: entry.id,
          food_name: entry.food_name,
          portion: entry.portion,
          calories: entry.calories,
          protein_g: entry.protein_g,
          carbs_g: entry.carbs_g,
          fat_g: entry.fat_g,
          fiber_g: entry.fiber_g,
          meal_type: entry.meal_type,
        });
      }

      if (failed.length > 0) {
        haptic.error();
        setToast({
          visible: true,
          message: `${succeeded.length} saved, ${failed.length} failed`,
          type: succeeded.length > 0 ? "success" : "error",
        });
      } else {
        haptic.success();
        reset();
        router.replace("/(tabs)");
      }
    } catch (e: unknown) {
      haptic.error();
      const message = e instanceof Error ? e.message : "Failed to save";
      setToast({ visible: true, message, type: "error" });
    } finally {
      setSaving(false);
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review</Text>
          <TouchableOpacity onPress={reset} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <MealTypeSelector value={mealType as MealType} onChange={setMealType} />

        {aiResult && (
          <View style={styles.aiInfo}>
            <Text style={styles.confidence}>Confidence: {aiResult.confidence}</Text>
            {aiResult.notes ? <Text style={styles.notes}>{aiResult.notes}</Text> : null}
          </View>
        )}

        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          {editedFoods.map((food, i) => (
            <FoodItemCard
              key={i}
              food={food}
              onEdit={() => setEditIndex(i)}
              onSaveToLibrary={() => saveAsCustom(food)}
              onRemove={() => removeFood(i)}
            />
          ))}

          <TouchableOpacity
            onPress={() => {
              const newFood: ParsedFood = { name: "New item", portion: "1 serving", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
              useFoodLogStore.getState().addFood(newFood);
              setEditIndex(editedFoods.length);
            }}
            style={styles.addItemBtn}
            accessibilityRole="button"
            accessibilityLabel="Add food item"
          >
            <Text style={styles.addItemText}>+ Add item</Text>
          </TouchableOpacity>

          <TotalCard totals={total} />
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSave}
          disabled={saving || editedFoods.length === 0}
          accessibilityRole="button"
          accessibilityLabel={`Save ${editedFoods.length} items`}
          accessibilityHint="Saves all food items to your daily log"
          style={[styles.saveBtn, editedFoods.length > 0 && !saving ? styles.saveBtnActive : styles.saveBtnInactive]}
        >
          {saving ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <Text style={styles.saveBtnText}>
              Save {editedFoods.length} {editedFoods.length === 1 ? "item" : "items"}
            </Text>
          )}
        </TouchableOpacity>

        <EditModal
          visible={editIndex !== null}
          food={editIndex !== null ? editedFoods[editIndex] : null}
          onClose={() => setEditIndex(null)}
          onSave={(updated) => {
            if (editIndex !== null) updateFood(editIndex, updated);
            setEditIndex(null);
          }}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: 16, paddingBottom: 16, flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 16 },
  backArrow: { color: Colors.white, fontSize: 16 },
  headerTitle: { fontSize: 13, color: Colors.gray500, letterSpacing: 0.5, textTransform: "uppercase", flex: 1 },
  clearButton: { marginLeft: 16 },
  clearText: { color: Colors.gray500, fontSize: 13 },
  aiInfo: { marginBottom: 12 },
  confidence: { color: Colors.gray500, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  notes: { color: Colors.gray400, fontSize: 12, marginTop: 4 },
  scrollContent: { paddingBottom: 16 },
  addItemBtn: { paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: Colors.gray300, marginBottom: 16 },
  addItemText: { color: Colors.gray500, fontSize: 13 },
  saveBtn: { paddingVertical: 16, alignItems: "center" },
  saveBtnActive: { backgroundColor: Colors.white },
  saveBtnInactive: { backgroundColor: Colors.gray300 },
  saveBtnText: { color: Colors.black, fontSize: 14, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
});
