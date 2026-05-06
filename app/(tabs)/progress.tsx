import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Toast } from "../../components/ui/Toast";
import { WeightChart } from "../../components/WeightChart";
import { WeeklyTrend } from "../../components/WeeklyTrend";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { Colors } from "../../utils/colors";
import { haptic } from "../../utils/haptics";
import { useProgressStore } from "../../stores/progressStore";
import { useProfileStore } from "../../stores/profileStore";

export default function ProgressScreen() {
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
    } catch {
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
    <ScreenWrapper>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={Colors.white} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress</Text>
        </View>

        {initialLoad ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={2} />
          </>
        ) : (
        <>
        <Card style={styles.streakCard}>
          <Text style={styles.sectionLabel}>Current Streak</Text>
          <Text style={styles.streakNumber}>{streaks?.current_streak ?? 0}</Text>
          <Text style={styles.streakUnit}>days</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={styles.streakMetaLabel}>Best</Text>
              <Text style={styles.streakMetaValue}>{streaks?.longest_streak ?? 0}</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakMetaLabel}>Total</Text>
              <Text style={styles.streakMetaValue}>{streaks?.total_days_logged ?? 0}</Text>
            </View>
          </View>
        </Card>

        {weekly && (
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>This Week · Goal Adherence</Text>
            <View style={styles.adherenceRow}>
              {adherenceItems.map((item) => (
                <View key={item.label} style={styles.adherenceItem}>
                  <Text style={styles.adherenceValue}>{item.days}</Text>
                  <Text style={styles.adherenceLabel}>{item.label}</Text>
                  <Text style={styles.adherenceDenom}>/7</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Weekly Calories</Text>
          <WeeklyTrend
            dailyTotals={weekly?.daily_totals ?? []}
            calorieTarget={targets?.calories}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.weightHeader}>
            <Text style={styles.sectionLabel}>Weight</Text>
            <View style={styles.rangeButtons}>
              {[7, 30, 90].map((r) => (
                <TouchableOpacity key={r} onPress={() => setWeightRange(r)} accessibilityRole="button" accessibilityLabel={`Show last ${r} days`}>
                  <Text style={[styles.rangeText, weightRange === r && styles.rangeTextActive]}>
                    {r}D
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {currentWeight && (
            <View style={styles.weightRow}>
              <View>
                <Text style={styles.weightMetaLabel}>Current</Text>
                <Text style={styles.weightValue}>{currentWeight} kg</Text>
              </View>
              {startWeight && startWeight !== currentWeight && (
                <View style={styles.weightChange}>
                  <Text style={styles.weightMetaLabel}>Change</Text>
                  <Text style={[styles.weightValue, { color: currentWeight < startWeight ? Colors.white : Colors.gray600 }]}>
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
                <TextInput
                  value={weightValue}
                  onChangeText={setWeightValue}
                  keyboardType="decimal-pad"
                  placeholder="Weight in kg"
                  placeholderTextColor={Colors.gray500}
                  accessibilityLabel="Weight in kilograms"
                  style={styles.textInput}
                />
                <Button title="Save" onPress={handleLogWeight} loading={logging} style={styles.saveButton} />
              </View>
              <TouchableOpacity onPress={() => setShowWeightInput(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
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
  headerTitle: { fontSize: 13, color: Colors.gray500, letterSpacing: 0.5, textTransform: "uppercase" },
  card: { marginBottom: 16 },
  streakCard: { marginBottom: 16, alignItems: "center", paddingVertical: 32 },
  sectionLabel: { color: Colors.gray500, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 },
  streakNumber: { color: Colors.white, fontSize: 56, fontWeight: "700", letterSpacing: -2 },
  streakUnit: { color: Colors.gray400, fontSize: 13 },
  streakRow: { flexDirection: "row", marginTop: 16, gap: 24 },
  streakItem: { alignItems: "center" },
  streakMetaLabel: { color: Colors.gray600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  streakMetaValue: { color: Colors.white, fontSize: 16, fontWeight: "600" },
  adherenceRow: { flexDirection: "row", justifyContent: "space-between" },
  adherenceItem: { alignItems: "center" },
  adherenceValue: { color: Colors.white, fontSize: 20, fontWeight: "700" },
  adherenceLabel: { color: Colors.gray500, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 },
  adherenceDenom: { color: Colors.gray400, fontSize: 10 },
  weightHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  rangeButtons: { flexDirection: "row", gap: 12 },
  rangeText: { color: Colors.gray500, fontSize: 11, fontWeight: "400", letterSpacing: 0.5 },
  rangeTextActive: { color: Colors.white, fontWeight: "700" },
  weightRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, paddingHorizontal: 4 },
  weightMetaLabel: { color: Colors.gray500, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  weightValue: { color: Colors.white, fontSize: 18, fontWeight: "700" },
  weightChange: { alignItems: "flex-end" },
  inputContainer: { marginTop: 12 },
  inputRow: { flexDirection: "row", gap: 8 },
  textInput: {
    flex: 1,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    padding: 12,
    color: Colors.white,
    fontSize: 15,
  },
  saveButton: { paddingHorizontal: 20 },
  cancelButton: { marginTop: 8, alignItems: "center" },
  cancelText: { color: Colors.gray500, fontSize: 13 },
  logWeightButton: { marginTop: 12 },
});
