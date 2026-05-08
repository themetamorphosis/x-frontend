import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Card } from "../ui/v2/Card";
import { useTheme, ColorPalette } from "../../utils/theme";
import type { ParsedFood } from "../../types/food";

interface Props {
  visible: boolean;
  food: ParsedFood | null;
  onClose: () => void;
  onSave: (food: ParsedFood) => void;
}

export function EditModal({ visible, food, onClose, onSave }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [name, setName] = useState("");
  const [portion, setPortion] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");

  useEffect(() => {
    if (food && visible) {
      setName(food.name);
      setPortion(food.portion || "");
      setCalories(String(food.calories));
      setProtein(String(food.protein_g));
      setCarbs(String(food.carbs_g));
      setFat(String(food.fat_g));
      setFiber(String(food.fiber_g ?? 0));
    }
  }, [food, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} accessibilityViewIsModal={true}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.overlay}>
        <View style={styles.backdrop}>
          <Card>
            <Text style={styles.title}>Edit Item</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} accessibilityLabel="Food name" />

            <Text style={styles.label}>Portion</Text>
            <TextInput style={styles.input} value={portion} onChangeText={setPortion} accessibilityLabel="Portion size" />

            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Calories</Text>
                <TextInput style={styles.input} value={calories} onChangeText={setCalories} keyboardType="number-pad" accessibilityLabel="Calories" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Protein (g)</Text>
                <TextInput style={styles.input} value={protein} onChangeText={setProtein} keyboardType="decimal-pad" accessibilityLabel="Protein in grams" />
              </View>
            </View>

            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={styles.field}>
                <Text style={styles.label}>Carbs (g)</Text>
                <TextInput style={styles.input} value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" accessibilityLabel="Carbs in grams" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Fat (g)</Text>
                <TextInput style={styles.input} value={fat} onChangeText={setFat} keyboardType="decimal-pad" accessibilityLabel="Fat in grams" />
              </View>
            </View>

            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={styles.field}>
                <Text style={styles.label}>Fiber (g)</Text>
                <TextInput style={styles.input} value={fiber} onChangeText={setFiber} keyboardType="decimal-pad" accessibilityLabel="Fiber in grams" />
              </View>
              <View style={styles.field} />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn} accessibilityRole="button" accessibilityLabel="Cancel editing">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  onSave({
                    name: name || "Unknown",
                    portion: portion || null,
                    calories: parseInt(calories) || 0,
                    protein_g: parseFloat(protein) || 0,
                    carbs_g: parseFloat(carbs) || 0,
                    fat_g: parseFloat(fat) || 0,
                    fiber_g: parseFloat(fiber) || 0,
                  })
                }
                style={styles.saveBtn}
                accessibilityRole="button"
                accessibilityLabel="Save changes"
              >
                <Text style={styles.saveText}>Save</Text>
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
    overlay: { flex: 1 },
    backdrop: { flex: 1, backgroundColor: c.overlay, justifyContent: "center", padding: 24 },
    title: { color: c.text, fontSize: 15, fontWeight: "600", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 },
    label: { color: c.textSecondary, fontSize: 11, marginBottom: 4, textTransform: "uppercase" },
    input: { color: c.text, fontSize: 14, borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 8, marginBottom: 12 },
    row: { flexDirection: "row", gap: 12 },
    field: { flex: 1 },
    buttonRow: { flexDirection: "row", gap: 8, marginTop: 20 },
    cancelBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: c.border, alignItems: "center" },
    cancelText: { color: c.textSecondary, fontSize: 13 },
    saveBtn: { flex: 1, paddingVertical: 12, backgroundColor: c.primary, alignItems: "center" },
    saveText: { color: c.primaryText, fontSize: 13, fontWeight: "600" },
  });
}
