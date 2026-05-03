import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../utils/colors";
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
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Reminders</Text>
          {toggleItems.map((item, i) => (
            <View key={item.key} style={[styles.toggleRow, i < toggleItems.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Switch
                value={settings[item.key] as boolean}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: Colors.gray100, true: Colors.white }}
                thumbColor={settings[item.key] ? Colors.black : Colors.gray500}
                accessibilityLabel={`${item.label} toggle`}
              />
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Reminder Times</Text>
          {timeItems.map((item, i) => (
            <View key={item.key} style={[styles.toggleRow, i < timeItems.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.timeValue}>{settings[item.key]}</Text>
            </View>
          ))}
          <Text style={styles.comingSoon}>Time editing coming soon</Text>
        </Card>

        <Button title="Save" onPress={handleSave} loading={saving} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: Colors.gray500, fontSize: 13 },
  header: { paddingTop: 16, paddingBottom: 24, flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 16 },
  backText: { color: Colors.white, fontSize: 15 },
  headerTitle: { fontSize: 13, color: Colors.gray500, letterSpacing: 0.5, textTransform: "uppercase" },
  card: { marginBottom: 16 },
  sectionLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  rowLabel: { color: Colors.white, fontSize: 15 },
  timeValue: { color: Colors.gray400, fontSize: 15 },
  comingSoon: { color: Colors.gray500, fontSize: 11, marginTop: 12 },
});
