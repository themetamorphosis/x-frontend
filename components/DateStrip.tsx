import { memo, useRef, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { MotiPressable } from "moti/interactions";
import { Colors } from "../utils/colors";
import { label, buttonTextSmall } from "../utils/typography";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DateStripProps {
  selectedDate: string; // ISO date string YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

function getWeekDates(referenceDate: Date): { date: string; day: number; dayName: string; isToday: boolean }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monday = new Date(referenceDate);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      date: iso,
      day: d.getDate(),
      dayName: DAY_NAMES[i],
      isToday: d.getTime() === today.getTime(),
    };
  });
}

function DatePill({ item, isSelected, onSelect }: { item: { date: string; day: number; dayName: string; isToday: boolean }; isSelected: boolean; onSelect: (date: string) => void }) {
  const handlePress = useCallback(() => onSelect(item.date), [item.date, onSelect]);
  return (
    <MotiPressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${item.dayName} ${item.day}`}
      accessibilityState={{ selected: isSelected }}
      animate={({ pressed }) => ({
        scale: pressed ? 0.95 : 1,
      })}
      style={[
        styles.pill,
        isSelected ? styles.pillSelected : styles.pillDefault,
      ]}
    >
      <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
        {item.dayName}
      </Text>
      <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
        {item.day}
      </Text>
      {item.isToday && !isSelected && <View style={styles.todayDot} />}
    </MotiPressable>
  );
}

export const DateStrip = memo(function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const scrollRef = useRef<ScrollView>(null);
  const weekDates = useMemo(() => getWeekDates(new Date(selectedDate)), [selectedDate]);

  useEffect(() => {
    // Auto-scroll to selected day
    const selectedIndex = weekDates.findIndex((d) => d.date === selectedDate);
    if (selectedIndex >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: selectedIndex * 62 - 60, animated: true });
    }
  }, [selectedDate, weekDates]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {weekDates.map((item) => (
          <DatePill
            key={item.date}
            item={item}
            isSelected={item.date === selectedDate}
            onSelect={onSelectDate}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  pill: {
    width: 54,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    // Neumorphic raised shadow
    shadowColor: "#000",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillDefault: {
    backgroundColor: Colors.background,
    // Light shadow (top-left)
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 2,
  },
  pillSelected: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accentDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayName: {
    ...label,
    fontSize: 9,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  dayNameSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  dayNumber: {
    ...buttonTextSmall,
    fontSize: 16,
    color: Colors.text,
  },
  dayNumberSelected: {
    color: Colors.white,
    fontWeight: "700",
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.accent,
    position: "absolute",
    bottom: 8,
  },
});
