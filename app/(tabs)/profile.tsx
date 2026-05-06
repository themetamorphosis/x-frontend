import { View, Text, ScrollView, TextInput, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Shadow } from "react-native-shadow-2";
import { MotiPressable } from "moti/interactions";
import { ChevronRight } from "lucide-react-native";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { Toast } from "../../components/ui/Toast";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useAuthStore } from "../../stores/authStore";
import { useProfileStore } from "../../stores/profileStore";
import { Colors } from "../../utils/colors";
import { label, heading, subheading, caption, buttonText, body } from "../../utils/typography";
import { raisedShadowProps, neuCircle, neuInset } from "../../utils/neumorphic";

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
    <ErrorBoundary>
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar Card */}
        <Shadow {...raisedShadowProps(5)} style={styles.avatarCard}>
          <View style={styles.avatarInner}>
            <Shadow {...raisedShadowProps(3)} style={neuCircle(64)}>
              <Text style={styles.avatarText}>
                {(name || "U").charAt(0).toUpperCase()}
              </Text>
            </Shadow>
            <Text style={styles.userName}>{name || "User"}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </Shadow>

        {/* Body Stats Card */}
        <Shadow {...raisedShadowProps(5)} style={styles.card}>
          <View style={styles.cardInner}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>Body Stats</Text>
              <MotiPressable
                onPress={() => setEditing(!editing)}
                accessibilityRole="button"
                accessibilityLabel={editing ? "Cancel editing" : "Edit body stats"}
                animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
              >
                <Text style={styles.editButton}>{editing ? "Cancel" : "Edit"}</Text>
              </MotiPressable>
            </View>

            {editing ? (
              <>
                {[
                  { label: "Weight (kg)", value: editWeight, set: setEditWeight, kb: "decimal-pad" as const },
                  { label: "Height (cm)", value: editHeight, set: setEditHeight, kb: "decimal-pad" as const },
                  { label: "Age", value: editAge, set: setEditAge, kb: "number-pad" as const },
                ].map((field) => (
                  <View key={field.label} style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <View style={neuInset({ paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14 })}>
                      <TextInput
                        value={field.value}
                        onChangeText={field.set}
                        keyboardType={field.kb}
                        accessibilityLabel={field.label}
                        style={styles.textInput}
                      />
                    </View>
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
          </View>
        </Shadow>

        {/* Daily Targets Card */}
        <Shadow {...raisedShadowProps(5)} style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.sectionLabel}>Daily Targets</Text>
            {macroItems.map((item, i) => (
              <View key={item.label} style={[styles.row, i < macroItems.length - 1 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowValue}>{item.value} {item.unit}</Text>
              </View>
            ))}
          </View>
        </Shadow>

        {/* Notifications Nav */}
        <Shadow {...raisedShadowProps(5)} style={styles.card}>
          <View style={styles.cardInner}>
            <MotiPressable
              onPress={() => router.push("/(settings)/notifications")}
              accessibilityRole="button"
              accessibilityLabel="Notification Settings"
              animate={({ pressed }) => ({ scale: pressed ? 0.98 : 1 })}
              style={styles.navRow}
            >
              <Text style={styles.navLabel}>Notification Settings</Text>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </MotiPressable>
          </View>
        </Shadow>

        {/* Sign Out */}
        <Button title="Sign Out" onPress={clearAuth} variant="ghost" style={{ marginTop: 8 }} />
      </ScrollView>

      <Toast
        message={toast?.message || ""}
        type={toast?.type || "success"}
        visible={!!toast}
        onHide={() => setToast(null)}
      />
    </ScreenWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingBottom: 24 },
  headerTitle: { ...label, fontSize: 13 },
  card: { marginBottom: 16, borderRadius: 20, backgroundColor: Colors.background },
  cardInner: { padding: 16 },
  avatarCard: { marginBottom: 16, borderRadius: 20, backgroundColor: Colors.background },
  avatarInner: { padding: 24, alignItems: "center" },
  avatarText: { ...heading, fontSize: 24, color: Colors.textSecondary },
  userName: { ...subheading, marginTop: 16 },
  userEmail: { ...caption, marginTop: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionLabel: { ...label, marginBottom: 8 },
  editButton: { ...buttonText, fontSize: 13, color: Colors.accent },
  fieldContainer: { marginBottom: 12 },
  fieldLabel: { ...label, marginBottom: 6 },
  textInput: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    padding: 0,
    margin: 0,
  },
  saveButton: { marginTop: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceDark },
  rowLabel: { ...body, color: Colors.textSecondary, textTransform: "capitalize" },
  rowValue: { ...body, fontWeight: "500", textTransform: "capitalize" },
  navRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  navLabel: { ...buttonText, fontSize: 15, fontWeight: "400" },
});
