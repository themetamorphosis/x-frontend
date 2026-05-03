import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Toast } from "../../components/ui/Toast";
import { useAuthStore } from "../../stores/authStore";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";

export default function ProfileScreen() {
  const { email, name, clearAuth } = useAuthStore();
  const { profile, targets, fetchProfile, saveProfile, calculateTargets } = useProfileStore();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [editWeight, setEditWeight] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editAge, setEditAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setEditWeight(profile.weight_kg?.toString() || "");
      setEditHeight(profile.height_cm?.toString() || "");
      setEditAge(profile.age?.toString() || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProfile({
        weight_kg: parseFloat(editWeight) || undefined,
        height_cm: parseFloat(editHeight) || undefined,
        age: parseInt(editAge) || undefined,
      });
      await calculateTargets();
      setEditing(false);
      setToast({ message: "Profile updated", type: "success" });
    } catch {
      setToast({ message: "Failed to update profile", type: "error" });
    }
    setSaving(false);
  };

  const macroItems = [
    { label: "Calories", value: targets?.calories?.toString() || "—", unit: "kcal" },
    { label: "Protein", value: Math.round(targets?.protein_g || 0).toString() || "—", unit: "g" },
    { label: "Carbs", value: Math.round(targets?.carbs_g || 0).toString() || "—", unit: "g" },
    { label: "Fat", value: Math.round(targets?.fat_g || 0).toString() || "—", unit: "g" },
  ];

  const statsItems = [
    { label: "Age", value: profile?.age?.toString() || "—" },
    { label: "Height", value: profile?.height_cm ? `${profile.height_cm} cm` : "—" },
    { label: "Weight", value: profile?.weight_kg ? `${profile.weight_kg} kg` : "—" },
    { label: "Sex", value: profile?.sex || "—" },
    { label: "Goal", value: profile?.goal?.replace("_", " ") || "—" },
    { label: "Activity", value: profile?.activity_level?.replace("_", " ") || "—" },
    { label: "Pace", value: profile?.pace || "—" },
  ];

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <Card style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(name || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{name || "User"}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>Body Stats</Text>
            <TouchableOpacity
              onPress={() => setEditing(!editing)}
              accessibilityRole="button"
              accessibilityLabel={editing ? "Cancel editing" : "Edit body stats"}
              accessibilityHint={editing ? "Discards changes and exits edit mode" : "Enables editing of weight, height, and age"}
            >
              <Text style={styles.editButton}>{editing ? "Cancel" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              {[
                { label: "Weight (kg)", value: editWeight, set: setEditWeight, kb: "decimal-pad" },
                { label: "Height (cm)", value: editHeight, set: setEditHeight, kb: "decimal-pad" },
                { label: "Age", value: editAge, set: setEditAge, kb: "number-pad" },
              ].map((field) => (
                <View key={field.label} style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <TextInput
                    value={field.value}
                    onChangeText={field.set}
                    keyboardType={field.kb as "decimal-pad" | "number-pad"}
                    accessibilityLabel={field.label}
                    style={styles.textInput}
                  />
                </View>
              ))}
              <Button title="Save & Recalculate" onPress={handleSave} loading={saving} style={styles.saveButton} />
            </>
          ) : (
            statsItems.map((item, i) => (
              <View key={item.label} style={[styles.row, i < statsItems.length - 1 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowValue}>{item.value}</Text>
              </View>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Daily Targets</Text>
          {macroItems.map((item, i) => (
            <View key={item.label} style={[styles.row, i < macroItems.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowValue}>{item.value} {item.unit}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <TouchableOpacity
            onPress={() => router.push("/(settings)/notifications")}
            accessibilityRole="button"
            accessibilityLabel="Notification Settings"
            style={styles.navRow}
          >
            <Text style={styles.navLabel}>Notification Settings</Text>
            <Text style={styles.navArrow}>{">"}</Text>
          </TouchableOpacity>
        </Card>

        <Button title="Sign Out" onPress={clearAuth} variant="ghost" />
      </ScrollView>

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
  header: { paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 13, color: Colors.gray500, letterSpacing: 0.5, textTransform: "uppercase" },
  card: { marginBottom: 16 },
  avatarCard: { marginBottom: 16, alignItems: "center", paddingVertical: 32 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gray200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: { fontSize: 24, color: Colors.gray500 },
  userName: { color: Colors.white, fontSize: 18, fontWeight: "600" },
  userEmail: { color: Colors.gray500, fontSize: 13, marginTop: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" },
  editButton: { color: Colors.white, fontSize: 13 },
  fieldContainer: { marginBottom: 12 },
  fieldLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 },
  textInput: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    padding: 12,
    color: Colors.white,
    fontSize: 15,
  },
  saveButton: { marginTop: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  rowLabel: { color: Colors.gray600, fontSize: 14, textTransform: "capitalize" },
  rowValue: { color: Colors.white, fontSize: 14, fontWeight: "500", textTransform: "capitalize" },
  navRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  navLabel: { color: Colors.white, fontSize: 15 },
  navArrow: { color: Colors.gray500, fontSize: 15 },
});
