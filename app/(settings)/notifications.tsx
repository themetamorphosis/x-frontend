import { View, Text, Switch, ScrollView, Alert, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Shadow } from "react-native-shadow-2";
import { MotiPressable } from "moti/interactions";
import { ChevronLeft } from "lucide-react-native";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../utils/colors";
import { label, body, caption, buttonText, heading } from "../../utils/typography";
import { raisedShadowProps, neuInset } from "../../utils/neumorphic";
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings,
} from "../../services/notifications";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNotificationSettings();
        setSettings(data);
      } catch {
        Alert.alert("Error", "Failed to load notification settings");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateNotificationSettings(settings);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save settings");
    }
    setSaving(false);
  };

  const toggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  if (loading || !settings) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const toggleItems = [
    { key: "notify_breakfast" as const, label: "Breakfast Reminder" },
    { key: "notify_lunch" as const, label: "Lunch Reminder" },
    { key: "notify_dinner" as const, label: "Dinner Reminder" },
    { key: "notify_evening_check" as const, label: "Evening Check-in" },
    { key: "notify_weekly_summary" as const, label: "Weekly Summary" },
  ];

  const timeItems = [
    { key: "breakfast_time" as const, label: "Breakfast Time" },
    { key: "lunch_time" as const, label: "Lunch Time" },
    { key: "dinner_time" as const, label: "Dinner Time" },
  ];

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MotiPressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={Colors.text} />
          </MotiPressable>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {/* Reminders Card */}
        <Shadow {...raisedShadowProps(5)} style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.sectionLabel}>Reminders</Text>
            {toggleItems.map((item, i) => (
              <View key={item.key} style={[styles.toggleRow, i < toggleItems.length - 1 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Switch
                  value={settings[item.key] as boolean}
                  onValueChange={() => toggle(item.key)}
                  trackColor={{ false: Colors.surfaceDark, true: Colors.accent }}
                  thumbColor={settings[item.key] ? Colors.white : Colors.textTertiary}
                  accessibilityLabel={`${item.label} toggle`}
                />
              </View>
            ))}
          </View>
        </Shadow>

        {/* Reminder Times Card */}
        <Shadow {...raisedShadowProps(5)} style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.sectionLabel}>Reminder Times</Text>
            {timeItems.map((item, i) => (
              <View key={item.key} style={[styles.toggleRow, i < timeItems.length - 1 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.timeValue}>{settings[item.key]}</Text>
              </View>
            ))}
            <Text style={styles.comingSoon}>Time editing coming soon</Text>
          </View>
        </Shadow>

        <Button title="Save" onPress={handleSave} loading={saving} variant="accent" />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { ...caption, color: Colors.textSecondary },
  header: { paddingTop: 16, paddingBottom: 24, flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...label, fontSize: 13 },
  card: { marginBottom: 16, borderRadius: 20, backgroundColor: Colors.background },
  cardInner: { padding: 16 },
  sectionLabel: { ...label, marginBottom: 16 },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceDark },
  rowLabel: { ...body, fontSize: 15, color: Colors.text },
  timeValue: { ...body, fontSize: 15, color: Colors.textSecondary },
  comingSoon: { ...caption, fontSize: 11, marginTop: 12 },
});
