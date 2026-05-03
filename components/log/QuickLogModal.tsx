import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { Card } from "../ui/Card";
import { Colors } from "../../utils/colors";
import type { FoodDbItem } from "../../services/foodDb";

interface Props {
  visible: boolean;
  food: FoodDbItem | null;
  saving: boolean;
  onClose: () => void;
  onLog: (quantity: number) => void;
}

export function QuickLogModal({ visible, food, saving, onClose, onLog }: Props) {
  const [quantity, setQuantity] = useState("1");

  const handleClose = () => {
    setQuantity("1");
    onClose();
  };

  const q = parseFloat(quantity) || 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
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
                {saving ? <ActivityIndicator color={Colors.black} size="small" /> : <Text style={styles.logText}>Log</Text>}
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 24 },
  foodName: { color: Colors.white, fontSize: 15, fontWeight: "600", marginBottom: 4 },
  portion: { color: Colors.gray500, fontSize: 12, marginBottom: 16 },
  label: { color: Colors.gray500, fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  quantityRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  qtyBtn: { width: 40, height: 40, backgroundColor: Colors.gray200, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { color: Colors.white, fontSize: 20 },
  qtyInput: { flex: 1, textAlign: "center", color: Colors.white, fontSize: 18, fontWeight: "600", borderBottomWidth: 1, borderBottomColor: Colors.gray300, paddingVertical: 8 },
  nutrition: { backgroundColor: Colors.gray100, padding: 12, marginBottom: 16 },
  nutritionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  nutritionLabel: { color: Colors.gray600, fontSize: 12 },
  nutritionValue: { color: Colors.white, fontSize: 12, fontWeight: "500" },
  nutritionSmall: { color: Colors.gray600, fontSize: 11 },
  buttonRow: { flexDirection: "row", gap: 8 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: Colors.gray400, alignItems: "center" },
  cancelText: { color: Colors.gray500, fontSize: 13 },
  logBtn: { flex: 1, paddingVertical: 12, backgroundColor: Colors.white, alignItems: "center" },
  logText: { color: Colors.black, fontSize: 13, fontWeight: "600" },
});
