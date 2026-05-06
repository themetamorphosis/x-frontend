import { useCallback, useState } from "react";
import { View, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Menu } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import { Shadow } from "react-native-shadow-2";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { SkeletonMacroRings, SkeletonCard } from "../../components/ui/Skeleton";
import { Toast } from "../../components/ui/Toast";
import { DateStrip } from "../../components/DateStrip";
import { CaloriesWidget } from "../../components/CaloriesWidget";
import { MacrosWidget } from "../../components/MacrosWidget";
import { WaterTracker } from "../../components/WaterTracker";
import { DayProgressBar } from "../../components/DayProgressBar";
import { MiniStatTiles } from "../../components/MiniStatTiles";
import { AIChatBar } from "../../components/AIChatBar";
import { NavDrawer } from "../../components/NavDrawer";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useDailyStore } from "../../stores/dailyStore";
import { useProgressStore } from "../../stores/progressStore";
import { useAuthStore } from "../../stores/authStore";
import { Colors } from "../../utils/colors";
import { neuCircle, raisedShadowProps } from "../../utils/neumorphic";
import { haptic } from "../../utils/haptics";

export default function DashboardScreen() {
  const summary = useDailyStore((s) => s.summary);
  const loading = useDailyStore((s) => s.loading);
  const fetchDaily = useDailyStore((s) => s.fetchDaily);
  const weekly = useProgressStore((s) => s.weekly);
  const fetchWeekly = useProgressStore((s) => s.fetchWeekly);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchDaily(selectedDate).finally(() => {
        if (!cancelled) setInitialLoad(false);
      });
      fetchWeekly();
      return () => { cancelled = true; };
    }, [fetchDaily, fetchWeekly, selectedDate])
  );

  const handleDateSelect = useCallback((date: string) => {
    haptic.light();
    setSelectedDate(date);
    fetchDaily(date);
  }, [fetchDaily]);

  const targets = summary?.targets || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
  const consumed = summary?.consumed || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
  const remaining = summary?.remaining || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
  const weeklyAvg = weekly?.averages?.calories;

  return (
    <ErrorBoundary>
    <ScreenWrapper>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              fetchDaily(selectedDate);
              fetchWeekly();
            }}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Hamburger menu button */}
        <View style={styles.headerRow}>
          <MotiPressable
            onPress={() => {
              haptic.light();
              setDrawerOpen(!drawerOpen);
            }}
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
            animate={({ pressed }) => ({
              scale: pressed ? 0.92 : 1,
            })}
            style={styles.menuButton}
          >
            <Shadow {...raisedShadowProps(3)} style={neuCircle(40)}>
              <Menu size={20} color={Colors.text} />
            </Shadow>
          </MotiPressable>
        </View>

        {/* Date strip */}
        <DateStrip selectedDate={selectedDate} onSelectDate={handleDateSelect} />

        {initialLoad ? (
          <>
            <View style={styles.widgetRow}>
              <SkeletonCard lines={3} />
              <SkeletonCard lines={3} />
            </View>
            <SkeletonMacroRings />
            <SkeletonCard lines={2} />
          </>
        ) : (
          <>
            {/* Stats widgets */}
            <View style={styles.widgetRow}>
              <CaloriesWidget
                consumed={consumed.calories}
                target={targets.calories}
              />
              <MacrosWidget
                carbs={{ current: consumed.carbs_g, target: targets.carbs_g }}
                protein={{ current: consumed.protein_g, target: targets.protein_g }}
                fat={{ current: consumed.fat_g, target: targets.fat_g }}
              />
            </View>

            {/* Water tracker */}
            <WaterTracker
              current_ml={summary?.water_ml || 0}
              target_ml={targets.water_ml || 2400}
            />

            {/* Day progress bar */}
            <DayProgressBar />

            {/* Mini stat tiles */}
            <MiniStatTiles
              remaining={remaining.calories}
              weeklyAvg={weeklyAvg}
            />
          </>
        )}
      </ScrollView>

      {/* AI Chat Bar - floating at bottom */}
      <AIChatBar />

      {/* Navigation Drawer overlay */}
      <NavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(route) => {
          router.push(route as any);
        }}
        onLogout={clearAuth}
        showToast={(msg) => setToast({ visible: true, message: msg, type: "success" })}
      />
    </ScreenWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 12,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  widgetRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
});
