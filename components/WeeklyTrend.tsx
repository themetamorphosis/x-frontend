import { useMemo } from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import { Colors } from "../utils/colors";
import type { DayTotals } from "../stores/progressStore";

const isWeb = Platform.OS === "web";

// Conditional import for victory-native (native only)
let VictoryNative: { CartesianChart: React.ComponentType<any>; Bar: React.ComponentType<any> } | null = null;
if (!isWeb) {
  try {
    VictoryNative = require("victory-native");
  } catch {
    // victory-native not available
  }
}

interface WeeklyTrendProps {
  dailyTotals: DayTotals[];
  calorieTarget?: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeeklyTrendWeb({ dailyTotals, calorieTarget }: WeeklyTrendProps) {
  const maxCal = Math.max(...dailyTotals.map((d) => d.calories), calorieTarget || 0, 1);

  return (
    <View>
      <View style={styles.chartArea}>
        <View style={styles.barRow}>
          {dailyTotals.map((d, i) => {
            const barH = maxCal > 0 ? (d.calories / maxCal) * 140 : 0;
            return (
              <View key={i} style={styles.barColumn}>
                <Text style={styles.barLabel}>
                  {d.calories > 0 ? d.calories : ""}
                </Text>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(barH, 2) },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      {calorieTarget && calorieTarget > 0 && (
        <View style={styles.targetRow}>
          <View style={styles.targetLine} />
          <Text style={styles.targetText}>
            TARGET: {calorieTarget} KCAL
          </Text>
        </View>
      )}

      <View style={styles.dayLabelsRow}>
        {dailyTotals.map((d, i) => (
          <View key={i} style={styles.barColumn}>
            <Text style={styles.dayLabelText}>{DAY_LABELS[i]}</Text>
            <Text style={styles.dayLabelValue}>
              {d.calories > 0 ? d.calories : "—"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function WeeklyTrendNative({ dailyTotals, calorieTarget }: WeeklyTrendProps) {
  if (!VictoryNative) return null;
  const { CartesianChart, Bar } = VictoryNative;
  const chartData = dailyTotals.map((d, i) => ({ x: i + 1, y: d.calories }));
  const maxCal = Math.max(...dailyTotals.map((d) => d.calories), calorieTarget || 0);

  return (
    <View>
      <View style={styles.nativeChartContainer}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={["y"]}
          domain={{
            y: [0, Math.max(maxCal * 1.15, 1000)],
            x: [0.5, 7.5],
          }}
        >
          {({ points, chartBounds }: { points: { y: Array<{ x: number; y: number }> }; chartBounds: { left: number; right: number; top: number; bottom: number } }) => (
            <Bar
              points={points.y}
              chartBounds={chartBounds}
              color={Colors.white}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              barWidth={20}
            />
          )}
        </CartesianChart>
      </View>

      {calorieTarget && calorieTarget > 0 && (
        <View style={styles.targetRow}>
          <View style={styles.targetLine} />
          <Text style={styles.targetText}>
            TARGET: {calorieTarget} KCAL
          </Text>
        </View>
      )}

      <View style={styles.dayLabelsRow}>
        {dailyTotals.map((d, i) => (
          <View key={i} style={styles.barColumn}>
            <Text style={styles.dayLabelText}>{DAY_LABELS[i]}</Text>
            <Text style={styles.dayLabelValue}>
              {d.calories > 0 ? d.calories : "—"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function WeeklyTrend({ dailyTotals, calorieTarget }: WeeklyTrendProps) {
  if (!dailyTotals || dailyTotals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data this week</Text>
      </View>
    );
  }

  if (isWeb) {
    return <WeeklyTrendWeb dailyTotals={dailyTotals} calorieTarget={calorieTarget} />;
  }
  return <WeeklyTrendNative dailyTotals={dailyTotals} calorieTarget={calorieTarget} />;
}

const styles = StyleSheet.create({
  chartArea: {
    height: 180,
    justifyContent: "flex-end",
    paddingHorizontal: 8,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 160,
  },
  barColumn: {
    alignItems: "center",
    gap: 4,
  },
  barLabel: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "600",
  },
  bar: {
    width: 20,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    gap: 6,
  },
  targetLine: {
    width: 16,
    height: 1,
    backgroundColor: Colors.gray600,
  },
  targetText: {
    color: Colors.gray500,
    fontSize: 10,
  },
  dayLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  dayLabelText: {
    color: Colors.gray500,
    fontSize: 10,
  },
  dayLabelValue: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  nativeChartContainer: {
    height: 180,
  },
  emptyContainer: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: Colors.gray500,
    fontSize: 13,
  },
});
