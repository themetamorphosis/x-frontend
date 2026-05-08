import React, { memo } from "react";
import { View, Text as RNText } from "react-native";
import { MotiPressable } from "moti/interactions";
import { Menu, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../utils/theme";
import { fonts } from "../utils/typography-v2";
import { haptic } from "../utils/haptics";

interface HeaderProps {
  title?: string;
  onMenuPress: () => void;
}

export const Header = memo(function Header({ title, onMenuPress }: HeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={{
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      height: 56, paddingHorizontal: 20,
    }}>
      <MotiPressable onPress={() => { haptic.light(); onMenuPress(); }}
        accessibilityRole="button" accessibilityLabel="Open menu"
        animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
        style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
        <Menu size={22} color={colors.text} />
      </MotiPressable>

      {title && (
        <RNText style={{
          fontFamily: fonts.semibold, fontSize: 14, fontWeight: "600",
          color: colors.textSecondary, letterSpacing: 1, textTransform: "uppercase",
        }}>{title}</RNText>
      )}

      <MotiPressable onPress={() => { haptic.light(); router.push("/(tabs)/profile"); }}
        accessibilityRole="button" accessibilityLabel="Go to profile"
        animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
        style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
        <User size={22} color={colors.text} />
      </MotiPressable>
    </View>
  );
});
