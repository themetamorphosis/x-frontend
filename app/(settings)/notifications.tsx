import { View, Switch, Alert, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { PressableScale } from "../../components/ui/v2/PressableScale";
import { ChevronLeft } from "lucide-react-native";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Button } from "../../components/ui/v2/Button";
import { Text } from "../../components/ui/v2/Text";
import { useTheme } from "../../utils/theme";
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings,
} from "../../services/notifications";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNotificationSettings();
        setSettings(data);
      } catch (e: unknown) {
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
    } catch (e: unknown) {
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
      <ScreenWrapper noScroll>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text preset="caption" color="textSecondary">Loading...</Text>
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
      <View style={{ paddingTop: 16, paddingBottom: 24, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <PressableScale
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft size={24} color={colors.text} />
        </PressableScale>
        <Text preset="overline">Notifications</Text>
      </View>

      {/* Reminders Card */}
      <View style={{ marginBottom: 16, borderRadius: 20, backgroundColor: colors.surface, padding: 16 }}>
        <Text preset="overline" style={{ marginBottom: 16 }}>Reminders</Text>
        {toggleItems.map((item, i) => (
          <View key={item.key} style={[styles.toggleRow, i < toggleItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text preset="body" style={{ fontSize: 15 }}>{item.label}</Text>
            <Switch
              value={settings[item.key] as boolean}
              onValueChange={() => toggle(item.key)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings[item.key] ? colors.primaryText : colors.textTertiary}
              accessibilityLabel={`${item.label} toggle`}
            />
          </View>
        ))}
      </View>

      {/* Reminder Times Card */}
      <View style={{ marginBottom: 16, borderRadius: 20, backgroundColor: colors.surface, padding: 16 }}>
        <Text preset="overline" style={{ marginBottom: 16 }}>Reminder Times</Text>
        {timeItems.map((item, i) => (
          <View key={item.key} style={[styles.toggleRow, i < timeItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text preset="body" style={{ fontSize: 15 }}>{item.label}</Text>
            <Text preset="body" color="textSecondary" style={{ fontSize: 15 }}>{settings[item.key]}</Text>
          </View>
        ))}
        <Text preset="caption" style={{ fontSize: 11, marginTop: 12 }}>Time editing coming soon</Text>
      </View>

      <Button title="Save" onPress={handleSave} loading={saving} variant="primary" />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
});
