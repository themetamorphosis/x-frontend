import { View, ScrollView, TextInput, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { MotiPressable } from "moti/interactions";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Card } from "../../components/ui/v2/Card";
import { Text } from "../../components/ui/v2/Text";
import { Button } from "../../components/ui/v2/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Toast } from "../../components/ui/Toast";
import { WeightChart } from "../../components/WeightChart";
import { WeeklyTrend } from "../../components/WeeklyTrend";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useTheme } from "../../utils/theme";
import { fonts } from "../../utils/typography-v2";
import { haptic } from "../../utils/haptics";
import { useProgressStore } from "../../stores/progressStore";
import { useProfileStore } from "../../stores/profileStore";

export default function ProgressScreen() {
  const { colors } = useTheme();
  const {
    weightLogs, weightRange, weekly, streaks, loading,
    setWeightRange, logWeight, fetchAll,
  } = useProgressStore();
  const { profile, targets } = useProfileStore();

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightValue, setWeightValue] = useState("");
  const [logging, setLogging] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchAll().finally(() => {
        if (!cancelled) setInitialLoad(false);
      });
      return () => { cancelled = true; };
    }, [fetchAll])
  );

  const handleLogWeight = async () => {
    const kg = parseFloat(weightValue);
    if (isNaN(kg) || kg < 20 || kg > 400) {
      setToast({ visible: true, message: "Enter a valid weight (20-400 kg)", type: "error" });
      return;
    }
    setLogging(true);
    try {
      await logWeight(kg);
      haptic.success();
      setWeightValue("");
      setShowWeightInput(false);
      setToast({ visible: true, message: "Weight logged", type: "success" });
    } catch (e: unknown) {
      haptic.error();
      setToast({ visible: true, message: "Failed to log weight", type: "error" });
    }
    setLogging(false);
  };

  const currentWeight = weightLogs.length > 0
    ? weightLogs[weightLogs.length - 1].weight_kg
    : profile?.weight_kg;

  const startWeight = profile?.weight_kg;

  const adherence = weekly?.goal_adherence;
  const adherenceItems = [
    { label: "Calories", days: adherence?.calories ?? 0 },
    { label: "Protein", days: adherence?.protein_g ?? 0 },
    { label: "Carbs", days: adherence?.carbs_g ?? 0 },
    { label: "Fat", days: adherence?.fat_g ?? 0 },
  ];

  return (
    <ErrorBoundary>
    <ScreenWrapper noScroll>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text preset="overline">Progress</Text>
        </View>

        {initialLoad ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={2} />
          </>
        ) : (
        <>
        {/* Streak Card */}
        <Card style={styles.streakCard as any}>
          <View style={styles.streakInner}>
            <Text preset="overline" style={styles.sectionLabel}>Current Streak</Text>
            <Text preset="display" style={styles.streakNumber}>{streaks?.current_streak ?? 0}</Text>
            <Text preset="caption">days</Text>
            <View style={styles.streakRow}>
              <View style={styles.streakItem}>
                <Text preset="caption" style={styles.overlineSmall}>Best</Text>
                <Text preset="h2">{streaks?.longest_streak ?? 0}</Text>
              </View>
              <View style={styles.streakItem}>
                <Text preset="caption" style={styles.overlineSmall}>Total</Text>
                <Text preset="h2">{streaks?.total_days_logged ?? 0}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Goal Adherence */}
        {weekly && (
          <Card style={styles.card as any}>
            <Text preset="overline" style={styles.sectionLabel}>This Week {"·"} Goal Adherence</Text>
            <View style={styles.adherenceRow}>
              {adherenceItems.map((item) => (
                <View key={item.label} style={styles.adherenceItem}>
                  <Text preset="h2" style={styles.adherenceValue}>{item.days}</Text>
                  <Text preset="overline" style={styles.overlineSmall}>{item.label}</Text>
                  <Text preset="caption" style={{ fontSize: 10 }}>/7</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Weekly Calories */}
        <Card style={styles.card as any}>
          <Text preset="overline" style={styles.sectionLabel}>Weekly Calories</Text>
          <WeeklyTrend
            dailyTotals={weekly?.daily_totals ?? []}
            calorieTarget={targets?.calories}
          />
        </Card>

        {/* Weight */}
        <Card style={styles.card as any}>
          <View style={styles.weightHeader}>
            <Text preset="overline" style={styles.sectionLabel}>Weight</Text>
            <View style={styles.rangeButtons}>
              {[7, 30, 90].map((r) => (
                <MotiPressable
                  key={r}
                  onPress={() => setWeightRange(r)}
                  accessibilityRole="button"
                  accessibilityLabel={`Show last ${r} days`}
                  animate={({ pressed }) => ({ scale: pressed ? 0.95 : 1 })}
                >
                  <Text
                    preset="caption"
                    style={[styles.rangeText, weightRange === r && { color: colors.primary, fontWeight: "700" }]}
                  >
                    {r}D
                  </Text>
                </MotiPressable>
              ))}
            </View>
          </View>

          {currentWeight && (
            <View style={styles.weightRow}>
              <View>
                <Text preset="caption" style={styles.overlineSmall}>Current</Text>
                <Text preset="h2">{currentWeight} kg</Text>
              </View>
              {startWeight && startWeight !== currentWeight && (
                <View style={styles.weightChange}>
                  <Text preset="caption" style={styles.overlineSmall}>Change</Text>
                  <Text preset="h2" style={{ color: currentWeight < startWeight ? colors.primary : colors.error }}>
                    {currentWeight < startWeight ? "-" : "+"}{Math.abs(currentWeight - startWeight).toFixed(1)} kg
                  </Text>
                </View>
              )}
            </View>
          )}

          <WeightChart
            data={weightLogs}
            goalWeight={profile?.goal === "lose_fat" ? (startWeight ?? 0) - 10 : null}
            startWeight={startWeight}
          />

          {showWeightInput ? (
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <View style={[styles.textInputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <TextInput
                    value={weightValue}
                    onChangeText={setWeightValue}
                    keyboardType="decimal-pad"
                    placeholder="Weight in kg"
                    placeholderTextColor={colors.textTertiary}
                    accessibilityLabel="Weight in kilograms"
                    style={[styles.textInput, { color: colors.text }]}
                  />
                </View>
                <Button title="Save" onPress={handleLogWeight} loading={logging} size="sm" />
              </View>
              <TouchableOpacity onPress={() => setShowWeightInput(false)} style={styles.cancelButton}>
                <Text preset="caption">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title="Log Weight"
              onPress={() => setShowWeightInput(true)}
              variant="ghost"
              style={styles.logWeightButton}
            />
          )}
        </Card>
        </>
        )}
      </ScrollView>
    </ScreenWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingBottom: 24 },
  card: { marginBottom: 16 },
  streakCard: { marginBottom: 16 },
  streakInner: { paddingVertical: 8, alignItems: "center" },
  sectionLabel: { marginBottom: 8 },
  streakNumber: { fontSize: 56, letterSpacing: -2 },
  streakRow: { flexDirection: "row", marginTop: 16, gap: 24 },
  streakItem: { alignItems: "center" },
  overlineSmall: { fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  adherenceRow: { flexDirection: "row", justifyContent: "space-between" },
  adherenceItem: { alignItems: "center" },
  adherenceValue: { fontSize: 20 },
  weightHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  rangeButtons: { flexDirection: "row", gap: 12 },
  rangeText: { fontSize: 11 },
  weightRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, paddingHorizontal: 4 },
  weightChange: { alignItems: "flex-end" },
  inputContainer: { marginTop: 12 },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  textInputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
    margin: 0,
  },
  cancelButton: { marginTop: 8, alignItems: "center" },
  logWeightButton: { marginTop: 12 },
});
