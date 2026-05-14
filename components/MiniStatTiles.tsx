import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Target, BarChart3 } from "lucide-react-native";
import { useTheme, ColorPalette } from "../utils/theme";
import { label, statMedium, caption } from "../utils/typography-v2";

interface MiniStatTilesProps {
  remaining: number;
  weeklyAvg?: number;
}

export const MiniStatTiles = memo(function MiniStatTiles({ remaining, weeklyAvg }: MiniStatTilesProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.tile}>
        <View style={styles.tileInner}>
          <Target size={14} color={colors.primary} />
          <Text style={styles.tileLabel}>Remaining Today</Text>
          <Text style={[styles.tileValue, remaining < 0 && styles.overValue]}>
            {remaining > 0 ? remaining : 0}
          </Text>
          <Text style={styles.tileUnit}>kcal</Text>
        </View>
      </View>

      <View style={styles.tile}>
        <View style={styles.tileInner}>
          <BarChart3 size={14} color={colors.primary} />
          <Text style={styles.tileLabel}>Weekly Avg</Text>
          <Text style={styles.tileValue}>
            {weeklyAvg !== undefined ? Math.round(weeklyAvg) : "—"}
          </Text>
          <Text style={styles.tileUnit}>kcal / day</Text>
        </View>
      </View>
    </View>
  );
});

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 120, // Space for AI chat bar
    },
    tile: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    tileInner: {
      padding: 14,
      alignItems: "center",
      gap: 4,
    },
    tileLabel: {
      ...label,
      fontSize: 8,
      color: c.textTertiary,
      marginBottom: 4,
    },
    tileValue: {
      ...statMedium,
      fontSize: 24,
      color: c.text,
    },
    overValue: {
      color: c.error,
    },
    tileUnit: {
      ...caption,
      fontSize: 10,
      color: c.textTertiary,
    },
  });
}
