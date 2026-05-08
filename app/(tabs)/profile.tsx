import { View } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { ScreenWrapper, Card, Button, Text, Input, Toast, MenuItem } from "../../components/ui/v2";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useAuthStore } from "../../stores/authStore";
import { useProfileStore } from "../../stores/profileStore";
import { useTheme } from "../../utils/theme";
import { spacing } from "../../utils/theme";

export default function ProfileScreen() {
  const { email, name, clearAuth } = useAuthStore();
  const { profile, targets, fetchProfile, saveProfile, calculateTargets } = useProfileStore();
  const { colors } = useTheme();
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
    } catch (e: unknown) {
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
      <View style={{ paddingTop: spacing.lg, paddingBottom: spacing["2xl"] }}>
        <Text preset="overline">Profile</Text>
      </View>

      {/* Avatar Card */}
      <Card style={{ marginBottom: spacing.lg, paddingVertical: spacing["2xl"], alignItems: "center" }}>
        <View style={{
          width: 64, height: 64, borderRadius: 32, backgroundColor: colors.border,
          alignItems: "center", justifyContent: "center", marginBottom: spacing.lg,
        }}>
          <Text preset="h2" color="textSecondary">
            {(name || "U").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text preset="h2">{name || "User"}</Text>
        <Text preset="caption" style={{ marginTop: spacing.xs }}>{email}</Text>
      </Card>

      {/* Body Stats Card */}
      <Card style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
          <Text preset="overline">Body Stats</Text>
          <Text
            preset="overline"
            color="textSecondary"
            onPress={() => setEditing(!editing)}
            style={{ letterSpacing: 0, textTransform: "none", color: colors.textSecondary }}
          >
            {editing ? "Cancel" : "Edit"}
          </Text>
        </View>

        {editing ? (
          <>
            {[
              { label: "Weight (kg)", value: editWeight, set: setEditWeight, kb: "decimal-pad" as const },
              { label: "Height (cm)", value: editHeight, set: setEditHeight, kb: "decimal-pad" as const },
              { label: "Age", value: editAge, set: setEditAge, kb: "number-pad" as const },
            ].map((field) => (
              <Input
                key={field.label}
                label={field.label}
                value={field.value}
                onChangeText={field.set}
                keyboardType={field.kb}
                accessibilityLabel={field.label}
                containerStyle={{ marginBottom: spacing.md }}
              />
            ))}
            <Button title="Save & Recalculate" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
          </>
        ) : (
          statsItems.map((item, i) => (
            <View
              key={item.label}
              style={{
                flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.md,
                borderBottomWidth: i < statsItems.length - 1 ? 1 : 0, borderBottomColor: colors.border,
              }}
            >
              <Text preset="body" color="textSecondary" style={{ textTransform: "capitalize" }}>{item.label}</Text>
              <Text preset="body" style={{ fontWeight: "500", textTransform: "capitalize" }}>{item.value}</Text>
            </View>
          ))
        )}
      </Card>

      {/* Daily Targets Card */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Text preset="overline" style={{ marginBottom: spacing.sm }}>Daily Targets</Text>
        {macroItems.map((item, i) => (
          <View
            key={item.label}
            style={{
              flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.md,
              borderBottomWidth: i < macroItems.length - 1 ? 1 : 0, borderBottomColor: colors.border,
            }}
          >
            <Text preset="body" color="textSecondary" style={{ textTransform: "capitalize" }}>{item.label}</Text>
            <Text preset="body" style={{ fontWeight: "500" }}>{item.value} {item.unit}</Text>
          </View>
        ))}
      </Card>

      {/* Notifications Nav */}
      <Card style={{ marginBottom: spacing.lg, padding: 0 }}>
        <MenuItem
          icon={Bell}
          label="Notification Settings"
          onPress={() => router.push("/(settings)/notifications")}
        />
      </Card>

      {/* Sign Out */}
      <Button title="Sign Out" onPress={clearAuth} variant="ghost" style={{ marginTop: spacing.sm }} />

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
