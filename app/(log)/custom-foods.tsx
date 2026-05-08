import { useState, useCallback } from "react";
import { View, TouchableOpacity, FlatList, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Button } from "../../components/ui/v2/Button";
import { Text } from "../../components/ui/v2/Text";
import { Toast } from "../../components/ui/Toast";
import { FoodListItem } from "../../components/log/FoodListItem";
import { QuickLogModal } from "../../components/log/QuickLogModal";
import { AddFoodModal } from "../../components/log/AddFoodModal";
import { getCustomFoods, createCustomFood, deleteCustomFood, type FoodDbItem } from "../../services/foodDb";
import { useSaveFoodLog } from "../../hooks/useSaveFoodLog";
import { useTheme } from "../../utils/theme";
import { detectMealType } from "../../utils/mealType";

export default function CustomFoodsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { saving: hookSaving, save } = useSaveFoodLog();

  const [foods, setFoods] = useState<FoodDbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [quickLogFood, setQuickLogFood] = useState<FoodDbItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        try {
          const data = await getCustomFoods();
          if (!cancelled) setFoods(data);
        } catch (e: unknown) {
          if (!cancelled) setToast({ visible: true, message: "Failed to load foods", type: "error" });
        }
        if (!cancelled) setLoading(false);
      };
      load();
      return () => { cancelled = true; };
    }, [])
  );

  const handleDelete = (food: FoodDbItem) => {
    Alert.alert("Delete", `Remove "${food.name}" from your foods?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCustomFood(food.source_id);
            setFoods((prev) => prev.filter((f) => f.source_id !== food.source_id));
          } catch (e: unknown) {
            setToast({ visible: true, message: "Failed to delete", type: "error" });
          }
        },
      },
    ]);
  };

  const handleAdd = async (data: { name: string; portion: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }) => {
    if (!data.name) {
      setToast({ visible: true, message: "Name is required", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const created = await createCustomFood({
        name: data.name,
        portion: data.portion || undefined,
        calories: data.calories,
        protein_g: data.protein_g,
        carbs_g: data.carbs_g,
        fat_g: data.fat_g,
      });
      setFoods((prev) => [...prev, created]);
      setShowAdd(false);
    } catch (e: unknown) {
      setToast({ visible: true, message: "Failed to create custom food", type: "error" });
    }
    setSaving(false);
  };

  const handleQuickLog = async (quantity: number) => {
    if (!quickLogFood) return;
    setSaving(true);
    try {
      await save({
        meal_type: detectMealType(),
        food_name: quickLogFood.name,
        portion: quickLogFood.portion || `${quantity} serving${quantity !== 1 ? "s" : ""}`,
        calories: Math.round(quickLogFood.calories * quantity),
        protein_g: Math.round(quickLogFood.protein_g * quantity * 10) / 10,
        carbs_g: Math.round(quickLogFood.carbs_g * quantity * 10) / 10,
        fat_g: Math.round(quickLogFood.fat_g * quantity * 10) / 10,
        fiber_g: Math.round((quickLogFood.fiber_g || 0) * quantity * 10) / 10,
        source: "custom",
      });
      setQuickLogFood(null);
    } catch (e: unknown) {
      setToast({ visible: true, message: "Failed to log food", type: "error" });
    }
    setSaving(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getCustomFoods();
      setFoods(data);
    } catch (e: unknown) {
      setToast({ visible: true, message: "Failed to refresh", type: "error" });
    }
    setRefreshing(false);
  };

  return (
    <ScreenWrapper>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, visible: false })} />
      <View style={styles.header}>
        <Text preset="overline" style={{ flex: 1 }}>My Foods</Text>
        <Button title="+ Add" onPress={() => setShowAdd(true)} size="sm" variant="ghost" />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.text} style={styles.loader} />
      ) : foods.length === 0 ? (
        <View style={styles.empty}>
          <Text preset="overline" color="textTertiary">No saved foods</Text>
          <Text preset="caption" style={{ marginTop: 8 }}>Add foods you eat frequently for quick logging</Text>
        </View>
      ) : (
        <FlatList
          data={foods}
          renderItem={({ item }) => (
            <FoodListItem item={item} onPress={() => setQuickLogFood(item)} onDelete={() => handleDelete(item)} />
          )}
          keyExtractor={(item) => item.source_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <QuickLogModal visible={quickLogFood !== null} food={quickLogFood} saving={saving} onClose={() => setQuickLogFood(null)} onLog={handleQuickLog} />
      <AddFoodModal visible={showAdd} saving={saving} onClose={() => setShowAdd(false)} onSave={handleAdd} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingBottom: 16, flexDirection: "row", alignItems: "center" },
  loader: { marginTop: 48 },
  listContent: { paddingBottom: 16 },
  empty: { alignItems: "center", paddingTop: 64 },
});
