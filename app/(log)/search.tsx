import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Card } from "../../components/ui/v2/Card";
import { Button } from "../../components/ui/v2/Button";
import { Text } from "../../components/ui/v2/Text";
import { Toast } from "../../components/ui/v2/Toast";
import { searchFoods, FoodDbItem } from "../../services/foodDb";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { useSaveFoodLog } from "../../hooks/useSaveFoodLog";
import { useTheme } from "../../utils/theme";

const DEBOUNCE_MS = 300;

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Search failed";
      setToast({ message, type: "error" });
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

  const { saving, save } = useSaveFoodLog();

  const handleSave = async () => {
    if (!selected) return;
    try {
      await save({
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save";
      setToast({ message, type: "error" });
    }
  };

  if (selected) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => { setSelected(null); setQuantity(1); }} style={styles.backLink}>
            <Text preset="body" color="textSecondary">Back to results</Text>
          </TouchableOpacity>

          <Text preset="overline">Selected Food</Text>
          <Card>
            <Text preset="h2">{selected.name}</Text>
            {selected.brand ? <Text preset="caption">{selected.brand}</Text> : null}
            <Text preset="overline">Per {selected.serving_size}</Text>
            <View style={styles.nutritionRow}>
              <Text preset="body">{selected.calories} kcal</Text>
              <Text preset="caption">P{selected.protein_g} C{selected.carbs_g} F{selected.fat_g}</Text>
            </View>
          </Card>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(0.5, quantity - 0.5))}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              style={[styles.qtyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text preset="h2">-</Text>
            </TouchableOpacity>
            <Text accessible accessibilityLabel={`Quantity: ${quantity}`} preset="h2" style={{ minWidth: 50, textAlign: "center" }}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 0.5)}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              style={[styles.qtyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text preset="h2">+</Text>
            </TouchableOpacity>
          </View>

          <Card>
            <Text preset="overline">Total</Text>
            <Text preset="display" style={{ fontSize: 28 }}>{Math.round(selected.calories * quantity)} kcal</Text>
            <Text preset="caption">
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
          <Text preset="overline">Search Foods</Text>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by name..."
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={handleQueryChange}
              autoFocus
              returnKeyType="search"
              accessibilityLabel="Search foods by name"
            />
          </View>

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.text} />
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
                      <Text preset="body" numberOfLines={1} style={{ fontWeight: "500" }}>{item.name}</Text>
                      <Text preset="caption">{item.brand ? `${item.brand} · ` : ""}{item.serving_size}</Text>
                    </View>
                    <View style={styles.resultNumbers}>
                      <Text preset="body" style={{ fontWeight: "600" }}>{item.calories}</Text>
                      <Text preset="caption">P{item.protein_g} C{item.carbs_g} F{item.fat_g}</Text>
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
                  <ActivityIndicator color={colors.textSecondary} size="small" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              !loading && query.length >= 2 ? (
                <Text preset="caption" style={{ textAlign: "center", marginTop: 20 }}>No results found</Text>
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
  searchBox: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, borderWidth: 1 },
  searchInput: { fontSize: 15 },
  loadingBox: { paddingVertical: 20, alignItems: "center" },
  resultCard: { marginBottom: 8 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultInfo: { flex: 1, marginRight: 12 },
  resultNumbers: { alignItems: "flex-end" },
  backLink: { marginBottom: 16 },
  nutritionRow: { flexDirection: "row", justifyContent: "space-between" },
  quantityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 20, gap: 16 },
  qtyBtn: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  saveContainer: { marginTop: 20 },
  footerLoader: { paddingVertical: 16, alignItems: "center" },
});
