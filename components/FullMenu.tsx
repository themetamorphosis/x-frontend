import React, { memo, useCallback, useEffect } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Home, Plus, TrendingUp, Droplets, Bell, Settings, LogOut, X, User } from "lucide-react-native";
import { MotiPressable } from "moti/interactions";
import { useTheme } from "../utils/theme";
import { fonts } from "../utils/typography-v2";
import { MenuItem } from "./ui/v2/MenuItem";
import { Toggle } from "./ui/v2/Toggle";
import { Text } from "./ui/v2/Text";
import { haptic } from "../utils/haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FullMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  activeRoute?: string;
}

export const FullMenu = memo(function FullMenu({ open, onClose, onNavigate, onLogout, activeRoute }: FullMenuProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(-SCREEN_WIDTH);

  const animateOpen = useCallback(() => { translateX.value = withSpring(0, { damping: 20, stiffness: 200 }); }, [translateX]);
  const animateClose = useCallback(() => {
    translateX.value = withTiming(-SCREEN_WIDTH, { duration: 250 }, (finished) => { if (finished) runOnJS(onClose)(); });
  }, [translateX, onClose]);

  useEffect(() => { if (open && translateX.value === -SCREEN_WIDTH) animateOpen(); }, [open, translateX, animateOpen]);

  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: withTiming(open ? 1 : 0, { duration: 250 }), pointerEvents: open ? "auto" : "none" }));
  const swipeGesture = Gesture.Pan().onEnd((event) => { if (event.translationX < -50) runOnJS(animateClose)(); });

  const menuItems = [
    { icon: Home, label: "Dashboard", route: "/(tabs)" },
    { icon: Plus, label: "Log Food", route: "/(tabs)/log" },
    { icon: TrendingUp, label: "Progress", route: "/(tabs)/progress" },
    { icon: Droplets, label: "Water Tracker", route: "/(tabs)" },
    { icon: Bell, label: "Reminders", route: "/(settings)/notifications" },
    { icon: User, label: "Account", route: "/(tabs)/profile" },
    { icon: Settings, label: "Settings", route: "/(tabs)/profile" },
  ];

  return (
    <>
      <Animated.View style={[styles.overlay, overlayStyle, { backgroundColor: colors.overlay }]} onTouchEnd={animateClose} />
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.panel, drawerStyle, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text preset="overline" style={{ letterSpacing: 2 }}>NutriLog</Text>
            <MotiPressable onPress={animateClose} accessibilityRole="button" accessibilityLabel="Close menu"
              animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
              style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <X size={20} color={colors.textSecondary} />
            </MotiPressable>
          </View>
          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <MenuItem key={item.label} icon={item.icon} label={item.label} isActive={activeRoute === item.route}
                onPress={() => { onNavigate(item.route); animateClose(); }} />
            ))}
          </View>
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text preset="caption">Dark mode</Text>
              <Toggle />
            </View>
            <MenuItem icon={LogOut} label="Logout" isDestructive
              onPress={() => { onLogout(); animateClose(); }} style={{ marginTop: 8 }} />
            <Text preset="caption" style={{ marginTop: 16, fontSize: 11 }}>v1.0.0</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
});

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 998 },
  panel: { position: "absolute", top: 0, left: 0, bottom: 0, width: SCREEN_WIDTH, zIndex: 999, paddingTop: 60, paddingHorizontal: 20, justifyContent: "space-between" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 40 },
  menuList: { gap: 4 },
  footer: { paddingBottom: 40 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 },
});
