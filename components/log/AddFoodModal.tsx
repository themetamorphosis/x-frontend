import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { Card } from "../ui/Card";
import { Colors } from "../../utils/colors";

interface AddFoodData {
  name: string;
  portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Props {
  visible: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (data: AddFoodData) => void;
}

export function AddFoodModal({ visible, saving, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [portion, setPortion] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const reset = () => {
    setName("");
    setPortion("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    onSave({
      name: name.trim(),
      portion: portion.trim(),
      calories: parseInt(calories) || 0,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose} accessibilityViewIsModal={true}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.backdrop}>
          <Card>
            <Text style={styles.title}>New Food</Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Chicken breast" placeholderTextColor={Colors.gray400} accessibilityLabel="Food name" />

            <Text style={styles.label}>Portion</Text>
            <TextInput style={styles.input} value={portion} onChangeText={setPortion} placeholder="e.g. 100g, 1 cup" placeholderTextColor={Colors.gray400} accessibilityLabel="Portion size" />

            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Calories</Text>
                <TextInput style={styles.input} value={calories} onChangeText={setCalories} keyboardType="number-pad" placeholder="0" placeholderTextColor={Colors.gray400} accessibilityLabel="Calories" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Protein (g)</Text>
                <TextInput style={styles.input} value={protein} onChangeText={setProtein} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={Colors.gray400} accessibilityLabel="Protein in grams" />
              </View>
            </View>

            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={styles.field}>
                <Text style={styles.label}>Carbs (g)</Text>
                <TextInput style={styles.input} value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={Colors.gray400} accessibilityLabel="Carbs in grams" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Fat (g)</Text>
                <TextInput style={styles.input} value={fat} onChangeText={setFat} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={Colors.gray400} accessibilityLabel="Fat in grams" />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={handleClose} style={styles.cancelBtn} accessibilityRole="button" accessibilityLabel="Cancel adding food">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn} accessibilityRole="button" accessibilityLabel="Save custom food">
                {saving ? <ActivityIndicator color={Colors.black} size="small" /> : <Text style={styles.saveText}>Save</Text>}
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
  title: { color: Colors.white, fontSize: 15, fontWeight: "600", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 },
  label: { color: Colors.gray500, fontSize: 11, marginBottom: 4, textTransform: "uppercase" },
  input: { color: Colors.white, fontSize: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray300, paddingVertical: 8, marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  field: { flex: 1 },
  buttonRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: Colors.gray400, alignItems: "center" },
  cancelText: { color: Colors.gray500, fontSize: 13 },
  saveBtn: { flex: 1, paddingVertical: 12, backgroundColor: Colors.white, alignItems: "center" },
  saveText: { color: Colors.black, fontSize: 13, fontWeight: "600" },
});
