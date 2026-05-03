import { useMemo } from "react";
import { View, Text, Platform } from "react-native";
import { Colors } from "../utils/colors";
import type { DayTotals } from "../stores/progressStore";

const isWeb = Platform.OS === "web";

interface WeeklyTrendProps {
  dailyTotals: DayTotals[];
  calorieTarget?: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeeklyTrendWeb({ dailyTotals, calorieTarget }: WeeklyTrendProps) {
  const maxCal = Math.max(...dailyTotals.map((d) => d.calories), calorieTarget || 0, 1);

  return (
    <View>
      <View style={{ height: 180, justifyContent: "flex-end", paddingHorizontal: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", height: 160 }}>
          {dailyTotals.map((d, i) => {
            const barH = maxCal > 0 ? (d.calories / maxCal) * 140 : 0;
            return (
              <View key={i} style={{ alignItems: "center", gap: 4 }}>
                <Text style={{ color: Colors.white, fontSize: 9, fontWeight: "600" }}>
                  {d.calories > 0 ? d.calories : ""}
                </Text>
                <View
                  style={{
                    width: 20,
                    height: Math.max(barH, 2),
                    backgroundColor: Colors.white,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>

      {calorieTarget && calorieTarget > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 4, gap: 6 }}>
          <View style={{ width: 16, height: 1, backgroundColor: Colors.gray600 }} />
          <Text style={{ color: Colors.gray500, fontSize: 10 }}>
            TARGET: {calorieTarget} KCAL
          </Text>
        </View>
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 12, marginTop: 8 }}>
        {dailyTotals.map((d, i) => (
          <View key={i} style={{ alignItems: "center" }}>
            <Text style={{ color: Colors.gray500, fontSize: 10 }}>{DAY_LABELS[i]}</Text>
            <Text style={{ color: Colors.white, fontSize: 10, fontWeight: "600" }}>
              {d.calories > 0 ? d.calories : "—"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function WeeklyTrendNative({ dailyTotals, calorieTarget }: WeeklyTrendProps) {
  const { CartesianChart, Bar } = require("victory-native");
  const chartData = dailyTotals.map((d, i) => ({ x: i + 1, y: d.calories }));
  const maxCal = Math.max(...dailyTotals.map((d) => d.calories), calorieTarget || 0);

  return (
    <View>
      <View style={{ height: 180 }}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={["y"]}
          domain={{
            y: [0, Math.max(maxCal * 1.15, 1000)],
            x: [0.5, 7.5],
          }}
        >
          {({ points, chartBounds }: any) => (
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 4, gap: 6 }}>
          <View style={{ width: 16, height: 1, backgroundColor: Colors.gray600 }} />
          <Text style={{ color: Colors.gray500, fontSize: 10 }}>
            TARGET: {calorieTarget} KCAL
          </Text>
        </View>
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 12, marginTop: 8 }}>
        {dailyTotals.map((d, i) => (
          <View key={i} style={{ alignItems: "center" }}>
            <Text style={{ color: Colors.gray500, fontSize: 10 }}>{DAY_LABELS[i]}</Text>
            <Text style={{ color: Colors.white, fontSize: 10, fontWeight: "600" }}>
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
      <View style={{ height: 180, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: Colors.gray500, fontSize: 13 }}>No data this week</Text>
      </View>
    );
  }

  if (isWeb) {
    return <WeeklyTrendWeb dailyTotals={dailyTotals} calorieTarget={calorieTarget} />;
  }
  return <WeeklyTrendNative dailyTotals={dailyTotals} calorieTarget={calorieTarget} />;
}
