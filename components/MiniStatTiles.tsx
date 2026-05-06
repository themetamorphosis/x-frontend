import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { Target, BarChart3 } from "lucide-react-native";
import { Colors } from "../utils/colors";
import { label, statMedium, caption } from "../utils/typography";
import { insetShadowProps } from "../utils/neumorphic";

interface MiniStatTilesProps {
  remaining: number;
  weeklyAvg?: number;
}

export const MiniStatTiles = memo(function MiniStatTiles({ remaining, weeklyAvg }: MiniStatTilesProps) {
  return (
    <View style={styles.container}>
      <Shadow {...insetShadowProps(3)} style={styles.tile}>
        <View style={styles.tileInner}>
          <Target size={14} color={Colors.accent} />
          <Text style={styles.tileLabel}>Remaining Today</Text>
          <Text style={[styles.tileValue, remaining < 0 && styles.overValue]}>
            {remaining > 0 ? remaining : 0}
          </Text>
          <Text style={styles.tileUnit}>kcal</Text>
        </View>
      </Shadow>

      <Shadow {...insetShadowProps(3)} style={styles.tile}>
        <View style={styles.tileInner}>
          <BarChart3 size={14} color={Colors.accent} />
          <Text style={styles.tileLabel}>Weekly Avg</Text>
          <Text style={styles.tileValue}>
            {weeklyAvg !== undefined ? Math.round(weeklyAvg) : "—"}
          </Text>
          <Text style={styles.tileUnit}>kcal / day</Text>
        </View>
      </Shadow>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 120, // Space for AI chat bar
  },
  tile: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: Colors.surfaceDark,
  },
  tileInner: {
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  tileLabel: {
    ...label,
    fontSize: 8,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  tileValue: {
    ...statMedium,
    fontSize: 24,
    color: Colors.text,
  },
  overValue: {
    color: Colors.error,
  },
  tileUnit: {
    ...caption,
    fontSize: 10,
    color: Colors.textTertiary,
  },
});
