import { memo, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { useTheme, ColorPalette } from "../utils/theme";
import { caption, label } from "../utils/typography-v2";

export const DayProgressBar = memo(function DayProgressBar() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Update every 60 seconds for more accurate progress
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const dayPercent = Math.round(((hours * 60 + minutes) / (24 * 60)) * 100);

  // Year progress
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
  const yearPercent = Math.round(((now.getTime() - startOfYear.getTime()) / (endOfYear.getTime() - startOfYear.getTime())) * 100);
  const yearRemaining = 100 - yearPercent;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.titleRow}>
          <Clock size={12} color={colors.textTertiary} />
          <Text style={styles.title}>Day Progress</Text>
        </View>
        <Text style={styles.percentText}>{dayPercent}%</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${dayPercent}%` }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{hours}h {minutes}m elapsed</Text>
        <Text style={styles.footerText}>{yearRemaining}% of year remaining</Text>
      </View>
    </View>
  );
});

function createStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: {
      marginBottom: 16,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    title: {
      ...label,
      fontSize: 9,
      marginBottom: 0,
      color: c.textTertiary,
    },
    percentText: {
      ...caption,
      fontSize: 12,
      fontWeight: "600",
      color: c.primary,
    },
    track: {
      height: 6,
      backgroundColor: c.border,
      borderRadius: 3,
      overflow: "hidden",
      marginBottom: 8,
    },
    fill: {
      height: 6,
      backgroundColor: c.primary,
      borderRadius: 3,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerText: {
      ...caption,
      fontSize: 10,
      color: c.textTertiary,
    },
  });
}
