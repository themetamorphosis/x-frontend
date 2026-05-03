import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Toast } from "../../components/ui/Toast";
import { searchFoods, FoodDbItem } from "../../services/foodDb";
import { saveFoodLog } from "../../services/food";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { useDailyStore } from "../../stores/dailyStore";
import { Colors } from "../../utils/colors";

const DEBOUNCE_MS = 300;

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodDbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<FoodDbItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { mealType } = useFoodLogStore();
  const addFoodLog = useDailyStore((s) => s.addFoodLog);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQuery = useRef("");

  const doSearch = useCallback(async (q: string, p: number, append: boolean) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await searchFoods(q, p);
      if (append) {
        setResults((prev) => [...prev, ...data]);
      } else {
        setResults(data);
      }
      setHasMore(data.length > 0);
      setPage(p);
    } catch (e: any) {
      setToast({ message: e.message || "Search failed", type: "error" });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleQueryChange = useCallback((t: string) => {
    setQuery(t);
    currentQuery.current = t;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (t.length < 2) {
      setResults([]);
      setHasMore(true);
      setPage(1);
      return;
    }
    debounceRef.current = setTimeout(() => {
      doSearch(t, 1, false);
    }, DEBOUNCE_MS);
  }, [doSearch]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    const nextPage = page + 1;
    doSearch(currentQuery.current, nextPage, true);
  }, [loadingMore, hasMore, loading, page, doSearch]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSave = async () => {
    if (!selected) return;
    try {
      const log = await saveFoodLog({
        food_name: selected.name,
        portion: `${quantity} × ${selected.serving_size}`,
        calories: Math.round(selected.calories * quantity),
        protein_g: +(selected.protein_g * quantity).toFixed(1),
        carbs_g: +(selected.carbs_g * quantity).toFixed(1),
        fat_g: +(selected.fat_g * quantity).toFixed(1),
        fiber_g: +(selected.fiber_g * quantity).toFixed(1),
        meal_type: mealType,
        source: "search",
      });
      addFoodLog({ ...log, meal_type: mealType });
      router.replace("/(tabs)");
    } catch (e: any) {
      setToast({ message: e.message || "Failed to save", type: "error" });
    }
  };

  if (selected) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => { setSelected(null); setQuantity(1); }} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Back to results</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Selected Food</Text>
          <Card>
            <Text style={styles.selectedName}>{selected.name}</Text>
            {selected.brand ? <Text style={styles.selectedBrand}>{selected.brand}</Text> : null}
            <Text style={styles.servingLabel}>Per {selected.serving_size}</Text>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionCal}>{selected.calories} kcal</Text>
              <Text style={styles.nutritionMacros}>P{selected.protein_g} C{selected.carbs_g} F{selected.fat_g}</Text>
            </View>
          </Card>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(0.5, quantity - 0.5))}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text accessible accessibilityLabel={`Quantity: ${quantity}`} style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 0.5)}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              style={styles.qtyBtn}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <Card>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalCal}>{Math.round(selected.calories * quantity)} kcal</Text>
            <Text style={styles.totalMacros}>
              P{+(selected.protein_g * quantity).toFixed(1)} C{+(selected.carbs_g * quantity).toFixed(1)} F{+(selected.fat_g * quantity).toFixed(1)}
            </Text>
          </Card>

          <View style={styles.saveContainer}>
            <Button title="Save to Log" onPress={handleSave} />
          </View>
        </View>

        <Toast message={toast?.message || ""} type={toast?.type || "success"} visible={!!toast} onHide={() => setToast(null)} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.container}>
          <Text style={styles.sectionLabel}>Search Foods</Text>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name..."
              placeholderTextColor={Colors.gray400}
              value={query}
              onChangeText={handleQueryChange}
              autoFocus
              returnKeyType="search"
              accessibilityLabel="Search foods by name"
            />
          </View>

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={Colors.white} />
            </View>
          )}

          <FlatList
            data={results}
            keyExtractor={(item, i) => `${item.source}-${item.source_id}-${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelected(item)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}${item.brand ? `, ${item.brand}` : ""}, ${item.calories} calories`}
              >
                <Card style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.resultMeta}>{item.brand ? `${item.brand} · ` : ""}{item.serving_size}</Text>
                    </View>
                    <View style={styles.resultNumbers}>
                      <Text style={styles.resultCal}>{item.calories}</Text>
                      <Text style={styles.resultMacros}>P{item.protein_g} C{item.carbs_g} F{item.fat_g}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator color={Colors.gray500} size="small" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              !loading && query.length >= 2 ? (
                <Text style={styles.emptyText}>No results found</Text>
              ) : null
            }
          />
        </View>
      </KeyboardAvoidingView>

      <Toast message={toast?.message || ""} type={toast?.type || "success"} visible={!!toast} onHide={() => setToast(null)} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 },
  searchBox: { backgroundColor: Colors.gray200, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
  searchInput: { color: Colors.white, fontSize: 15 },
  loadingBox: { paddingVertical: 20, alignItems: "center" },
  resultCard: { marginBottom: 8 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultName: { color: Colors.white, fontSize: 14, fontWeight: "500" },
  resultMeta: { color: Colors.gray500, fontSize: 12, marginTop: 2 },
  resultCal: { color: Colors.white, fontSize: 14, fontWeight: "600" },
  resultMacros: { color: Colors.gray500, fontSize: 11 },
  emptyText: { color: Colors.gray500, fontSize: 13, textAlign: "center", marginTop: 20 },
  backLink: { marginBottom: 16 },
  backLinkText: { color: Colors.gray500, fontSize: 14 },
  resultInfo: { flex: 1, marginRight: 12 },
  resultNumbers: { alignItems: "flex-end" },
  footerLoader: { paddingVertical: 16, alignItems: "center" },
  saveContainer: { marginTop: 20 },
  selectedName: { color: Colors.white, fontSize: 18, fontWeight: "600", marginBottom: 4 },
  selectedBrand: { color: Colors.gray500, fontSize: 13, marginBottom: 8 },
  servingLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  nutritionRow: { flexDirection: "row", justifyContent: "space-between" },
  nutritionCal: { color: Colors.white, fontSize: 14 },
  nutritionMacros: { color: Colors.gray500, fontSize: 13 },
  quantityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 20, gap: 16 },
  qtyBtn: { width: 40, height: 40, backgroundColor: Colors.gray200, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  qtyBtnText: { color: Colors.white, fontSize: 20 },
  qtyValue: { color: Colors.white, fontSize: 20, fontWeight: "600", minWidth: 50, textAlign: "center" },
  totalLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 },
  totalCal: { color: Colors.white, fontSize: 24, fontWeight: "700" },
  totalMacros: { color: Colors.gray500, fontSize: 13, marginTop: 4 },
});
