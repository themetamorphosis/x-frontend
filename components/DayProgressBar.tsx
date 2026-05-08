import { memo, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { Colors } from "../utils/colors";
import { caption, label } from "../utils/typography";

export const DayProgressBar = memo(function DayProgressBar() {
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
          <Clock size={12} color={Colors.textTertiary} />
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    // Subtle neumorphic
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    color: Colors.textTertiary,
  },
  percentText: {
    ...caption,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.accent,
  },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
    // Inset shadow
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  fill: {
    height: 6,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    ...caption,
    fontSize: 10,
    color: Colors.textTertiary,
  },
});
