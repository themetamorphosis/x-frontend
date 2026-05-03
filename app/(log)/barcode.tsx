import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Toast } from "../../components/ui/Toast";
import { getBarcodeProduct, FoodDbItem } from "../../services/foodDb";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { saveFoodLog } from "../../services/food";
import { useDailyStore } from "../../stores/dailyStore";
import { Colors } from "../../utils/colors";

export default function BarcodeScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState<FoodDbItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { mealType } = useFoodLogStore();
  const addFoodLog = useDailyStore((s) => s.addFoodLog);

  const requestPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    try {
      const result = await getBarcodeProduct(data);
      setProduct(result);
    } catch {
      setToast({ message: "Product not found in database", type: "error" });
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!product) return;
    try {
      const log = await saveFoodLog({
        food_name: product.name,
        portion: `${quantity} × ${product.serving_size}`,
        calories: Math.round(product.calories * quantity),
        protein_g: +(product.protein_g * quantity).toFixed(1),
        carbs_g: +(product.carbs_g * quantity).toFixed(1),
        fat_g: +(product.fat_g * quantity).toFixed(1),
        fiber_g: +(product.fiber_g * quantity).toFixed(1),
        meal_type: mealType,
        source: "barcode",
      });
      addFoodLog({ ...log, meal_type: mealType });
      router.replace("/(tabs)");
    } catch (e: any) {
      setToast({ message: e.message || "Failed to save", type: "error" });
    }
  };

  if (hasPermission === null) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text style={styles.permText}>Camera permission needed for barcode scanning</Text>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
      </ScreenWrapper>
    );
  }

  if (hasPermission === false) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text style={styles.permText}>No camera access</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (product) {
    return (
      <ScreenWrapper>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionLabel}>Product Found</Text>
          <Card>
            <Text style={styles.productName}>{product.name}</Text>
            {product.brand ? (
              <Text style={styles.productBrand}>{product.brand}</Text>
            ) : null}
            <Text style={styles.sectionLabel}>Per {product.serving_size}</Text>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionCal}>{product.calories} kcal</Text>
              <Text style={styles.nutritionMacros}>
                P{product.protein_g} C{product.carbs_g} F{product.fat_g}
              </Text>
            </View>
          </Card>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(0.5, quantity - 0.5))}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              style={styles.quantityButton}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text
              accessible
              accessibilityLabel={`Quantity: ${quantity}`}
              style={styles.quantityValue}
            >
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 0.5)}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              style={styles.quantityButton}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Card>
            <Text style={styles.sectionLabel}>Total</Text>
            <Text style={styles.totalCalories}>
              {Math.round(product.calories * quantity)} kcal
            </Text>
            <Text style={styles.totalMacros}>
              P{+(product.protein_g * quantity).toFixed(1)} C{+(product.carbs_g * quantity).toFixed(1)} F{+(product.fat_g * quantity).toFixed(1)}
            </Text>
          </Card>

          <View style={styles.actions}>
            <Button title="Save to Log" onPress={handleSave} />
            <Button title="Scan Again" onPress={() => { setProduct(null); setScanned(false); setQuantity(1); }} variant="secondary" />
          </View>
        </ScrollView>
        </KeyboardAvoidingView>

        <Toast
          message={toast?.message || ""}
          type={toast?.type || "success"}
          visible={!!toast}
          onHide={() => setToast(null)}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.flex}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.flex}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={Colors.white} />
            <Text style={styles.loadingText}>Looking up product...</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Toast
        message={toast?.message || ""}
        type={toast?.type || "success"}
        visible={!!toast}
        onHide={() => setToast(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  permText: { color: Colors.gray500, fontSize: 14, marginBottom: 16 },
  scrollContent: { padding: 16 },
  sectionLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 },
  productName: { color: Colors.white, fontSize: 18, fontWeight: "600", marginBottom: 4 },
  productBrand: { color: Colors.gray500, fontSize: 13, marginBottom: 12 },
  nutritionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  nutritionCal: { color: Colors.white, fontSize: 14 },
  nutritionMacros: { color: Colors.gray500, fontSize: 13 },
  quantityContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 20, gap: 16 },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.gray200,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: { color: Colors.white, fontSize: 20 },
  quantityValue: { color: Colors.white, fontSize: 20, fontWeight: "600", minWidth: 50, textAlign: "center" },
  totalCalories: { color: Colors.white, fontSize: 24, fontWeight: "700" },
  totalMacros: { color: Colors.gray500, fontSize: 13, marginTop: 4 },
  actions: { marginTop: 20, gap: 8 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 8,
    opacity: 0.5,
  },
  loadingOverlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  loadingText: { color: Colors.white, fontSize: 14, marginTop: 8 },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backText: { color: Colors.white, fontSize: 14 },
});
