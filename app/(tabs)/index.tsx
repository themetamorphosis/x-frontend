import { useCallback, useState } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity, RefreshControl, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import { SkeletonMacroRings, SkeletonCard } from "../../components/ui/Skeleton";
import { Toast } from "../../components/ui/Toast";
import { MacroRing } from "../../components/MacroRing";
import { WaterTracker } from "../../components/WaterTracker";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useDailyStore } from "../../stores/dailyStore";
import { MEAL_ORDER, MEAL_LABELS } from "../../constants/meals";
import type { LoggedFood } from "../../types/food";
import { api } from "../../services/api";
import { haptic } from "../../utils/haptics";
import { Colors } from "../../utils/colors";

function FoodRow({ food, idx, onDelete, deletingId }: { food: LoggedFood; idx: number; onDelete: (id: string) => void; deletingId: string | null }) {
  return (
    <View
      accessible
      accessibilityLabel={`${food.food_name}, ${food.calories} calories`}
      style={[styles.foodRow, idx > 0 && styles.foodRowBorder, deletingId === food.id && styles.foodRowDeleting]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.foodName}>{food.food_name}</Text>
        {food.portion && <Text style={styles.foodPortion}>{food.portion}</Text>}
      </View>
      <View style={styles.foodRight}>
        <Text style={styles.foodMacros}>
          P{Math.round(food.protein_g)} C{Math.round(food.carbs_g)} F{Math.round(food.fat_g)}
        </Text>
        <Text style={styles.foodCal}>{food.calories}</Text>
        <TouchableOpacity
          onPress={() => onDelete(food.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${food.food_name}`}
          accessibilityHint="Removes this food entry from your log"
        >
          <Text style={styles.deleteBtn}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MealSection({
  title,
  foods,
  onDelete,
  deletingId,
}: {
  title: string;
  foods: LoggedFood[];
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  const totalCals = foods.reduce((s, f) => s + f.calories, 0);

  return (
    <Card style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text accessibilityRole="header" style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealKcal}>{totalCals} kcal</Text>
      </View>
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <FoodRow food={item} idx={index} onDelete={onDelete} deletingId={deletingId} />
        )}
        ListEmptyComponent={<Text style={styles.emptyMeal}>No items logged</Text>}
      />
    </Card>
  );
}

export default function DashboardScreen() {
  const summary = useDailyStore((s) => s.summary);
  const loading = useDailyStore((s) => s.loading);
  const fetchDaily = useDailyStore((s) => s.fetchDaily);
  const removeFoodLog = useDailyStore((s) => s.removeFoodLog);
  const rollbackSummary = useDailyStore((s) => s.rollbackSummary);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [initialLoad, setInitialLoad] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchDaily().finally(() => {
        if (!cancelled) setInitialLoad(false);
      });
      return () => { cancelled = true; };
    }, [fetchDaily])
  );

  const handleDelete = (id: string) => {
    Alert.alert("Delete Food", "Remove this item from your log?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          haptic.light();
          setDeletingId(id);
          const prev = summary;
          removeFoodLog(id);
          setToast({ visible: true, message: "Removed", type: "success" });
          try {
            await api.delete(`/logs/food/${id}`);
          } catch {
            if (prev) rollbackSummary(prev);
            setToast({ visible: true, message: "Failed to delete, reverted", type: "error" });
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const targets = summary?.targets || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
  const consumed = summary?.consumed || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
  const byMeal = summary?.by_meal || { breakfast: [], lunch: [], dinner: [], snack: [] };

  return (
    <ErrorBoundary>
    <ScreenWrapper>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchDaily()} tintColor={Colors.white} />
        }
      >
        <View style={styles.todayHeader}>
          <Text style={styles.todayLabel}>Today</Text>
        </View>

        {initialLoad ? (
          <>
            <SkeletonMacroRings />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={3} />
          </>
        ) : (
          <>
            <View style={styles.ringsRow}>
              <MacroRing label="Calories" current={consumed.calories} target={targets.calories} />
              <MacroRing label="Protein" current={consumed.protein_g} target={targets.protein_g} unit="g" />
              <MacroRing label="Carbs" current={consumed.carbs_g} target={targets.carbs_g} unit="g" />
              <MacroRing label="Fat" current={consumed.fat_g} target={targets.fat_g} unit="g" />
            </View>

            <WaterTracker current_ml={summary?.water_ml || 0} />

            <View style={styles.mealsSection}>
              <Text style={styles.mealsLabel}>Meals</Text>
            </View>

            {MEAL_ORDER.map((meal) => (
              <MealSection
                key={meal}
                title={MEAL_LABELS[meal]}
                foods={byMeal[meal] || []}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  todayHeader: { paddingTop: 16, paddingBottom: 16 },
  todayLabel: { fontSize: 12, color: Colors.gray500, letterSpacing: 0.5, textTransform: "uppercase" },
  ringsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 },
  mealsSection: { marginBottom: 12 },
  mealsLabel: { color: Colors.gray500, fontSize: 11, fontWeight: "500", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 },
  mealCard: { marginBottom: 8 },
  mealHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  mealTitle: { color: Colors.white, fontSize: 14, fontWeight: "600" },
  mealKcal: { color: Colors.gray500, fontSize: 13 },
  foodRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  foodRowBorder: { borderTopWidth: 1, borderTopColor: Colors.gray200 },
  foodRowDeleting: { opacity: 0.5 },
  foodName: { color: Colors.white, fontSize: 13 },
  foodPortion: { color: Colors.gray500, fontSize: 11, marginTop: 2 },
  foodRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  foodMacros: { color: Colors.gray500, fontSize: 12 },
  foodCal: { color: Colors.white, fontSize: 13, fontWeight: "500", width: 50, textAlign: "right" },
  deleteBtn: { color: Colors.gray400, fontSize: 16 },
  emptyMeal: { color: Colors.gray400, fontSize: 12, fontStyle: "italic" },
});
