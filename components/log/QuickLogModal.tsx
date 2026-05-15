import { useState } from "react";
import { View, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { Card } from "../ui/v2/Card";
import { Text } from "../ui/v2/Text";
import { useTheme, ColorPalette } from "../../utils/theme";
import type { FoodDbItem } from "../../services/foodDb";

interface Props {
  visible: boolean;
  food: FoodDbItem | null;
  saving: boolean;
  onClose: () => void;
  onLog: (quantity: number) => void;
}

export function QuickLogModal({ visible, food, saving, onClose, onLog }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [quantity, setQuantity] = useState("1");

  const handleClose = () => {
    setQuantity("1");
    onClose();
  };

  const q = parseFloat(quantity) || 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose} accessibilityViewIsModal={true}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.backdrop}>
          <Card>
            <Text style={styles.foodName}>{food?.name}</Text>
            {food?.portion ? <Text style={styles.portion}>{food.portion}</Text> : null}

            <Text style={styles.label}>Servings</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => setQuantity(String(Math.max(0.5, (parseFloat(quantity) || 1) - 0.5)))}
                style={styles.qtyBtn}
                accessibilityRole="button"
                accessibilityLabel="Decrease servings"
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                accessibilityLabel="Number of servings"
                style={styles.qtyInput}
              />
              <TouchableOpacity
                onPress={() => setQuantity(String((parseFloat(quantity) || 0) + 0.5))}
                style={styles.qtyBtn}
                accessibilityRole="button"
                accessibilityLabel="Increase servings"
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {food && (
              <View style={styles.nutrition}>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>{Math.round(food.calories * q)} cal</Text>
                </View>
                {(["protein_g", "carbs_g", "fat_g"] as const).map((k) => (
                  <View key={k} style={styles.nutritionRow}>
                    <Text style={styles.nutritionLabel}>
                      {k.replace("_g", "").replace("protein", "Protein").replace("carbs", "Carbs").replace("fat", "Fat")}
                    </Text>
                    <Text style={styles.nutritionSmall}>{Math.round(food[k] * q * 10) / 10}g</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={handleClose} style={styles.cancelBtn} accessibilityRole="button" accessibilityLabel="Cancel quick log">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onLog(q)}
                disabled={saving}
                style={styles.logBtn}
                accessibilityRole="button"
                accessibilityLabel="Log food"
              >
                {saving ? <ActivityIndicator color={colors.text} size="small" /> : <Text style={styles.logText}>Log</Text>}
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: c.overlay, justifyContent: "center", padding: 24 },
    foodName: { color: c.text, fontSize: 15, fontWeight: "600", marginBottom: 4 },
    portion: { color: c.textSecondary, fontSize: 12, marginBottom: 16 },
    label: { color: c.textSecondary, fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
    quantityRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
    qtyBtn: { width: 40, height: 40, backgroundColor: c.border, alignItems: "center", justifyContent: "center" },
    qtyBtnText: { color: c.text, fontSize: 20 },
    qtyInput: { flex: 1, textAlign: "center", color: c.text, fontSize: 18, fontWeight: "600", borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 8 },
    nutrition: { backgroundColor: c.surface, padding: 12, marginBottom: 16, borderRadius: 8 },
    nutritionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    nutritionLabel: { color: c.textSecondary, fontSize: 12 },
    nutritionValue: { color: c.text, fontSize: 12, fontWeight: "500" },
    nutritionSmall: { color: c.textSecondary, fontSize: 11 },
    buttonRow: { flexDirection: "row", gap: 8 },
    cancelBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: c.border, alignItems: "center" },
    cancelText: { color: c.textSecondary, fontSize: 13 },
    logBtn: { flex: 1, paddingVertical: 12, backgroundColor: c.primary, alignItems: "center" },
    logText: { color: c.primaryText, fontSize: 13, fontWeight: "600" },
  });
}
