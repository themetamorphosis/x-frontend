import { useMemo } from "react";
import { View, Text, Platform } from "react-native";
import { Colors } from "../utils/colors";
import type { WeightEntry } from "../stores/progressStore";

const isWeb = Platform.OS === "web";

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
    <View style={{ height: 180, justifyContent: "center", alignItems: "center", gap: 8 }}>
      <Text style={{ color: Colors.white, fontSize: 28, fontWeight: "700" }}>
        {latest?.weight_kg} kg
      </Text>
      <Text style={{ color: isLoss ? "#4ade80" : "#f87171", fontSize: 14 }}>
        {isLoss ? "" : "+"}{change} kg
      </Text>
      {goalWeight && (
        <Text style={{ color: Colors.gray500, fontSize: 12 }}>
          Goal: {goalWeight} kg
        </Text>
      )}
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 12, marginTop: 4 }}>
        <Text style={{ color: Colors.gray500, fontSize: 11 }}>{earliest?.log_date?.slice(5)}</Text>
        <Text style={{ color: Colors.gray500, fontSize: 11 }}>{latest?.log_date?.slice(5)}</Text>
      </View>
    </View>
  );
}

function WeightChartNative({ data, goalWeight, sorted }: { data: WeightEntry[]; goalWeight?: number | null; sorted: WeightEntry[] }) {
  const { CartesianChart, Line, Scatter } = require("victory-native");
  const chartData = sorted.map((entry: WeightEntry, i: number) => ({ x: i + 1, y: entry.weight_kg }));
  const weights = sorted.map((e: WeightEntry) => e.weight_kg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);

  return (
    <View>
      <View style={{ height: 180 }}>
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, marginTop: 4 }}>
        <Text style={{ color: Colors.gray500, fontSize: 11 }}>{sorted[0]?.log_date?.slice(5)}</Text>
        {goalWeight && <Text style={{ color: Colors.gray500, fontSize: 11 }}>GOAL: {goalWeight} KG</Text>}
        <Text style={{ color: Colors.gray500, fontSize: 11 }}>{sorted[sorted.length - 1]?.log_date?.slice(5)}</Text>
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
      <View style={{ height: 180, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: Colors.gray500, fontSize: 13 }}>No weight data</Text>
      </View>
    );
  }

  if (isWeb) {
    return <WeightChartWeb data={data} goalWeight={goalWeight} sorted={sorted} />;
  }
  return <WeightChartNative data={data} goalWeight={goalWeight} sorted={sorted} />;
}
