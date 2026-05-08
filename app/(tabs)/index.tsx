import { useCallback, useState, useRef } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "../../components/ui/v2/Text";
import { ProgressRing } from "../../components/ui/v2/ProgressRing";
import { StatBlock } from "../../components/ui/v2/StatBlock";
import { DateStrip } from "../../components/ui/v2/DateStrip";
import { ChatBubble } from "../../components/ui/v2/ChatBubble";
import { ChatInput } from "../../components/ui/v2/ChatInput";
import { Skeleton, SkeletonStat } from "../../components/ui/v2/Skeleton";
import { Toast } from "../../components/ui/v2/Toast";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useDailyStore } from "../../stores/dailyStore";
import { useProgressStore } from "../../stores/progressStore";
import { useAuthStore } from "../../stores/authStore";
import { useTheme } from "../../utils/theme";
import { haptic } from "../../utils/haptics";

interface ChatMessage {
  id: string;
  text: string;
  variant: "user" | "ai";
  timestamp: string;
}

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const summary = useDailyStore((s) => s.summary);
  const loading = useDailyStore((s) => s.loading);
  const fetchDaily = useDailyStore((s) => s.fetchDaily);
  const weekly = useProgressStore((s) => s.weekly);
  const fetchWeekly = useProgressStore((s) => s.fetchWeekly);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchDaily(selectedDate).finally(() => { if (!cancelled) setInitialLoad(false); });
      fetchWeekly();
      return () => { cancelled = true; };
    }, [fetchDaily, fetchWeekly, selectedDate])
  );

  const handleDateSelect = useCallback((date: string) => {
    haptic.light();
    setSelectedDate(date);
    fetchDaily(date);
  }, [fetchDaily]);

  const handleSend = useCallback((message: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      variant: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Logged: "${message}". I'll analyze the nutrition for you.`,
        variant: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  }, []);

  const targets = summary?.targets || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  const consumed = summary?.consumed || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  const calorieProgress = targets.calories > 0 ? consumed.calories / targets.calories : 0;

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg} />
        <Toast visible={toast.visible} message={toast.message} type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })} />

        {/* Top half: Stats */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <DateStrip selectedDate={selectedDate} onSelectDate={handleDateSelect} />
          {initialLoad ? (
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 16 }}>
              <Skeleton width={100} height={100} borderRadius={50} />
              <SkeletonStat /><SkeletonStat /><SkeletonStat />
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <ProgressRing progress={Math.min(calorieProgress, 1)} size={100} strokeWidth={3}>
                <View style={{ alignItems: "center" }}>
                  <Text preset="h2">{consumed.calories}</Text>
                  <Text preset="caption" style={{ fontSize: 10 }}>kcal</Text>
                </View>
              </ProgressRing>
              <StatBlock value={consumed.protein_g} label="Protein" />
              <StatBlock value={consumed.carbs_g} label="Carbs" />
              <StatBlock value={consumed.fat_g} label="Fat" />
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 20 }} />

        {/* Bottom half: AI Chat */}
        <View style={{ flex: 1 }}>
          <ScrollView ref={chatScrollRef} style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}
            onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}>
            {messages.length === 0 ? (
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Text preset="caption" style={{ textAlign: "center" }}>
                  Tell me what you ate and I'll log it for you.
                </Text>
              </View>
            ) : (
              messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg.text} variant={msg.variant} timestamp={msg.timestamp} />
              ))
            )}
          </ScrollView>
          <ChatInput onSend={handleSend}
            onCamera={() => setToast({ visible: true, message: "Camera coming soon", type: "success" })}
            onAttach={() => setToast({ visible: true, message: "Attachments coming soon", type: "success" })} />
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
