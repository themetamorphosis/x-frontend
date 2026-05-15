import { useCallback, useState, useRef } from "react";
import { View, ScrollView, RefreshControl, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect, useRouter } from "expo-router";
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
import { useFoodLogStore } from "../../stores/foodLogStore";
import { parseText } from "../../services/food";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../utils/theme";
import { haptic } from "../../utils/haptics";
import { api } from "../../services/api";

interface ChatMessage {
  id: string;
  text: string;
  variant: "user" | "ai";
  timestamp: string;
}

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const summary = useDailyStore((s) => s.summary);
  const loading = useDailyStore((s) => s.loading);
  const fetchDaily = useDailyStore((s) => s.fetchDaily);
  const weekly = useProgressStore((s) => s.weekly);
  const fetchWeekly = useProgressStore((s) => s.fetchWeekly);
  const setAIResult = useFoodLogStore((s) => s.setAIResult);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);
  const idCounter = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchDaily(selectedDate).finally(() => { if (!cancelled) setInitialLoad(false); });
      fetchWeekly();
      return () => { cancelled = true; api.cancelAll(); };
    }, [fetchDaily, fetchWeekly])
  );

  const handleDateSelect = useCallback((date: string) => {
    haptic.light();
    setSelectedDate(date);
    fetchDaily(date);
  }, [fetchDaily]);

  const handleSend = useCallback(async (message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `msg-${++idCounter.current}`,
      text: message,
      variant: "user",
      timestamp,
    };
    setMessages((prev) => [...prev, userMsg]);
    setAiLoading(true);

    try {
      const result = await parseText(message);
      setAiLoading(false);

      const total = result.total;
      const items = result.foods.length > 1 ? `\n${result.foods.map((f) => `  - ${f.name}`).join("\n")}` : "";
      const aiText = `Found ${result.foods.length} item${result.foods.length > 1 ? "s" : ""}: ${total.calories} kcal${items}${result.notes ? `\n\n${result.notes}` : ""}`;

      const aiMsg: ChatMessage = {
        id: `msg-${++idCounter.current}`,
        text: aiText,
        variant: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);

      setAIResult(result, "ai_text");
      haptic.success();
      router.push("/(log)/confirm");
    } catch (e: unknown) {
      setAiLoading(false);
      haptic.error();
      const errMsg = e instanceof Error ? e.message : "Couldn't parse that. Try again.";
      const aiMsg: ChatMessage = {
        id: `msg-${++idCounter.current}`,
        text: errMsg,
        variant: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }
  }, [setAIResult, router]);

  const targets = summary?.targets || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  const consumed = summary?.consumed || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  const calorieProgress = targets.calories > 0 ? consumed.calories / targets.calories : 0;

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Toast visible={toast.visible} message={toast.message} type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })} />

        {/* Top half: Stats */}
        <View style={styles.statsSection}>
          <DateStrip selectedDate={selectedDate} onSelectDate={handleDateSelect} />
          {initialLoad ? (
            <View style={styles.skeletonRow}>
              <Skeleton width={100} height={100} borderRadius={50} />
              <SkeletonStat /><SkeletonStat /><SkeletonStat />
            </View>
          ) : (
            <View style={styles.statsRow}>
              <ProgressRing progress={Math.min(calorieProgress, 1)} size={100} strokeWidth={3}>
                <View style={styles.progressCenter}>
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
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Bottom half: AI Chat */}
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={56 + insets.top}
          style={{ flex: 1 }}>
          <ScrollView ref={chatScrollRef} style={{ flex: 1 }}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}>
            {messages.length === 0 && !aiLoading ? (
              <View style={styles.emptyState}>
                <Text preset="caption" style={{ textAlign: "center", fontSize: 15 }}>
                  Tell me what you ate and I'll log it for you.
                </Text>
              </View>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg.text} variant={msg.variant} timestamp={msg.timestamp} />
                ))}
                {aiLoading && (
                  <Animated.View entering={FadeInDown.duration(250)} style={{
                    alignSelf: "flex-start", backgroundColor: colors.surface, borderRadius: 20,
                    borderBottomLeftRadius: 6, paddingVertical: 12, paddingHorizontal: 16, marginVertical: 4,
                    flexDirection: "row", alignItems: "center", gap: 6,
                  }}>
                    <ActivityIndicator size="small" color={colors.textSecondary} />
                    <Text preset="caption" style={{ color: colors.textSecondary }}>Analyzing...</Text>
                  </Animated.View>
                )}
              </>
            )}
          </ScrollView>
          <ChatInput onSend={handleSend} disabled={aiLoading} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  statsSection: { paddingHorizontal: 24, paddingBottom: 16 },
  skeletonRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 },
  progressCenter: { alignItems: "center" },
  divider: { height: 1, marginHorizontal: 24 },
  chatContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  emptyState: { alignItems: "center", paddingTop: 60 },
});
