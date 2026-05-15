import React, { useCallback, useRef, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";
import { useTheme } from "../../../utils/theme";
import { haptic } from "../../../utils/haptics";

interface DateStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDatesAround(center: Date, range: number): Date[] {
  const dates: Date[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const today = new Date();
  const dates = getDatesAround(today, 14);

  useEffect(() => {
    const idx = dates.findIndex((d) => formatDate(d) === selectedDate);
    if (idx >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: idx * 52 - 150, animated: false });
    }
  }, [selectedDate]);

  return (
    <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 8, gap: 4 }}>
      {dates.map((date) => {
        const dateStr = formatDate(date);
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === formatDate(today);
        return (
          <PressableScale key={dateStr} onPress={() => { haptic.light(); onSelectDate(dateStr); }}
            accessibilityRole="button" accessibilityLabel={`${DAY_NAMES[date.getDay()]} ${date.getDate()}`}
            style={{ width: 52, alignItems: "center", paddingVertical: 10, borderRadius: 14,
              backgroundColor: isSelected ? colors.primary : "transparent" }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: isSelected ? colors.primaryText : colors.textTertiary,
              letterSpacing: 1, textTransform: "uppercase" }}>{DAY_NAMES[date.getDay()]}</Text>
            <Text style={{ fontSize: 16, fontWeight: "700",
              color: isSelected ? colors.primaryText : (isToday ? colors.primary : colors.text), marginTop: 4 }}>
              {date.getDate()}
            </Text>
            {isToday && !isSelected && (
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 4 }} />
            )}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
