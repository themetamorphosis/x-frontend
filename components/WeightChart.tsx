import { useMemo } from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import { Colors } from "../utils/colors";
import type { WeightEntry } from "../stores/progressStore";

const isWeb = Platform.OS === "web";

// Conditional import for victory-native (native only)
let VictoryNative: { CartesianChart: React.ComponentType<any>; Line: React.ComponentType<any>; Scatter: React.ComponentType<any> } | null = null;
if (!isWeb) {
  try {
    VictoryNative = require("victory-native");
  } catch {
    // victory-native not available
  }
}

interface WeightChartProps {
  data: WeightEntry[];
  goalWeight?: number | null;
  startWeight?: number | null;
}

function WeightChartWeb({ data, goalWeight, sorted }: { data: WeightEntry[]; goalWeight?: number | null; sorted: WeightEntry[] }) {
  const latest = sorted[sorted.length - 1];
  const earliest = sorted[0];
  const change = latest && earliest ? (latest.weight_kg - earliest.weight_kg).toFixed(1) : "0";
  const isLoss = parseFloat(change) <= 0;

  return (
    <View style={styles.centeredContainer}>
      <Text style={styles.currentWeight}>
        {latest?.weight_kg} kg
      </Text>
      <Text style={{ color: isLoss ? Colors.success : Colors.error, fontSize: 14 }}>
        {isLoss ? "" : "+"}{change} kg
      </Text>
      {goalWeight && (
        <Text style={styles.labelText}>
          Goal: {goalWeight} kg
        </Text>
      )}
      <View style={styles.dateRow}>
        <Text style={styles.labelText}>{earliest?.log_date?.slice(5)}</Text>
        <Text style={styles.labelText}>{latest?.log_date?.slice(5)}</Text>
      </View>
    </View>
  );
}

function WeightChartNative({ data, goalWeight, sorted }: { data: WeightEntry[]; goalWeight?: number | null; sorted: WeightEntry[] }) {
  if (!VictoryNative) return null;
  const { CartesianChart, Line, Scatter } = VictoryNative;
  const chartData = sorted.map((entry: WeightEntry, i: number) => ({ x: i + 1, y: entry.weight_kg }));
  const weights = sorted.map((e: WeightEntry) => e.weight_kg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);

  return (
    <View>
      <View style={styles.chartContainer}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={["y"]}
          domain={{ y: [minW - 1, maxW + 1] }}
        >
          {({ points }: { points: { y: Array<{ x: number; y: number }> } }) => (
            <>
              <Line points={points.y} color={Colors.white} strokeWidth={2} curveType="natural" />
              <Scatter points={points.y} radius={3} color={Colors.white} />
            </>
          )}
        </CartesianChart>
      </View>
      <View style={styles.dateRow}>
        <Text style={styles.labelText}>{sorted[0]?.log_date?.slice(5)}</Text>
        {goalWeight && <Text style={styles.labelText}>GOAL: {goalWeight} KG</Text>}
        <Text style={styles.labelText}>{sorted[sorted.length - 1]?.log_date?.slice(5)}</Text>
      </View>
    </View>
  );
}

export function WeightChart({ data, goalWeight }: WeightChartProps) {
  const sorted = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
    );
  }, [data]);

  if (data.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.labelText}>No weight data</Text>
      </View>
    );
  }

  if (isWeb) {
    return <WeightChartWeb data={data} goalWeight={goalWeight} sorted={sorted} />;
  }
  return <WeightChartNative data={data} goalWeight={goalWeight} sorted={sorted} />;
}

const styles = StyleSheet.create({
  centeredContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  chartContainer: {
    height: 180,
  },
  currentWeight: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "700",
  },
  labelText: {
    color: Colors.gray500,
    fontSize: 11,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 4,
  },
});
