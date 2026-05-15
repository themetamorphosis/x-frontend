import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "./ui/v2/PressableScale";
import { Text } from "./ui/v2/Text";
import { Menu, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../utils/theme";
import { haptic } from "../utils/haptics";

interface HeaderProps {
  title?: string;
  onMenuPress: () => void;
}

export const Header = memo(function Header({ title, onMenuPress }: HeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outer, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <PressableScale onPress={() => { haptic.light(); onMenuPress(); }}
            accessibilityRole="button" accessibilityLabel="Open menu"
            style={styles.iconBtn}>
            <Menu size={22} color={colors.text} />
          </PressableScale>
        </View>

        {title ? (
          <Text preset="overline" style={{ fontSize: 14, letterSpacing: 1, flex: 1, textAlign: "center" }}>{title}</Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <View style={styles.iconContainer}>
          <PressableScale onPress={() => { haptic.light(); router.push("/(tabs)/profile"); }}
            accessibilityRole="button" accessibilityLabel="Go to profile"
            style={styles.iconBtn}>
            <User size={22} color={colors.text} />
          </PressableScale>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {},
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 56, paddingHorizontal: 16 },
  iconContainer: { width: 48, alignItems: "center" },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
});