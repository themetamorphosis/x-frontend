import { useState } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Card } from "../../components/ui/v2/Card";
import { Button } from "../../components/ui/v2/Button";
import { Text } from "../../components/ui/v2/Text";
import { Toast } from "../../components/ui/v2/Toast";
import { getBarcodeProduct, FoodDbItem } from "../../services/foodDb";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { useSaveFoodLog } from "../../hooks/useSaveFoodLog";
import { useTheme } from "../../utils/theme";

export default function BarcodeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState<FoodDbItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { mealType } = useFoodLogStore();
  const { saving, save } = useSaveFoodLog();

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
    } catch (e: unknown) {
      setToast({ message: "Product not found in database", type: "error" });
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!product) return;
    try {
      await save({
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save";
      setToast({ message, type: "error" });
    }
  };

  if (hasPermission === null) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text preset="body" color="textSecondary" style={{ marginBottom: 16 }}>Camera permission needed for barcode scanning</Text>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
      </ScreenWrapper>
    );
  }

  if (hasPermission === false) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text preset="body" color="textSecondary">No camera access</Text>
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
            <Text preset="overline" style={{ marginBottom: 8 }}>Product Found</Text>
            <Card>
              <Text preset="h2">{product.name}</Text>
              {product.brand ? (
                <Text preset="caption">{product.brand}</Text>
              ) : null}
              <Text preset="overline">Per {product.serving_size}</Text>
              <View style={styles.nutritionRow}>
                <Text preset="body">{product.calories} kcal</Text>
                <Text preset="caption">
                  P{product.protein_g} C{product.carbs_g} F{product.fat_g}
                </Text>
              </View>
            </Card>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
                style={[styles.quantityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text preset="h2">-</Text>
              </TouchableOpacity>
              <Text
                accessible
                accessibilityLabel={`Quantity: ${quantity}`}
                preset="h2"
                style={{ minWidth: 50, textAlign: "center" }}
              >
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 0.5)}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
                style={[styles.quantityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text preset="h2">+</Text>
              </TouchableOpacity>
            </View>

            <Card>
              <Text preset="overline">Total</Text>
              <Text preset="display" style={{ fontSize: 28 }}>
                {Math.round(product.calories * quantity)} kcal
              </Text>
              <Text preset="caption">
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
    <ScreenWrapper noPadding>
      <View style={styles.flex}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.flex}
        />
        <View style={styles.overlay}>
          <View style={[styles.scanFrame, { borderColor: colors.text }]} />
        </View>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.text} />
            <Text preset="body" style={{ marginTop: 8 }}>Looking up product...</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backButton, { backgroundColor: colors.overlay }]}
        >
          <Text preset="body">Back</Text>
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
  scrollContent: { padding: 16 },
  nutritionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  quantityContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 20, gap: 16 },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
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
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
});
