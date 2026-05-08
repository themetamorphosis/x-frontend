import { Platform } from "react-native";
import { api } from "./api";

type NotificationsModule = typeof import("expo-notifications");
type DeviceModule = typeof import("expo-device");

let _notifications: NotificationsModule | null = null;
let _device: DeviceModule | null = null;
let _initialized = false;

async function ensureNativeModules() {
  if (_initialized || Platform.OS === "web") return;
  _initialized = true;
  try {
    _notifications = await import("expo-notifications");
    _device = await import("expo-device");
    _notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e: unknown) {
    // modules not available
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  await ensureNativeModules();
  if (!_notifications || !_device || !_device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await _notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await _notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await _notifications.setNotificationChannelAsync("default", {
      name: "NutriLog",
      importance: _notifications.AndroidImportance.DEFAULT,
    });
  }

  const tokenData = await _notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export async function savePushToken(token: string) {
  try {
    const settings = await api.get<NotificationSettings>("/user/notifications");
    await api.put("/user/notifications", {
      ...settings,
      push_token: token,
    });
  } catch (e: unknown) {
    // silently fail
  }
}

export interface NotificationSettings {
  push_token: string | null;
  notify_breakfast: boolean;
  notify_lunch: boolean;
  notify_dinner: boolean;
  notify_evening_check: boolean;
  notify_weekly_summary: boolean;
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return api.get<NotificationSettings>("/user/notifications");
}

export async function updateNotificationSettings(
  settings: NotificationSettings
): Promise<NotificationSettings> {
  return api.put<NotificationSettings>("/user/notifications", settings);
}
