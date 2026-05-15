import React, { memo, useCallback, useEffect, useState } from "react";
import { View, useWindowDimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Home, Plus, TrendingUp, Bell, LogOut, X, User } from "lucide-react-native";
import { PressableScale } from "./ui/v2/PressableScale";
import { useTheme } from "../utils/theme";
import { fonts } from "../utils/typography-v2";
import { MenuItem } from "./ui/v2/MenuItem";
import { Toggle } from "./ui/v2/Toggle";
import { Text } from "./ui/v2/Text";
import { haptic } from "../utils/haptics";

interface FullMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  activeRoute?: string;
}

export const FullMenu = memo(function FullMenu({ open, onClose, onNavigate, onLogout, activeRoute }: FullMenuProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (open) {
      setInteractive(true);
    } else {
      const timer = setTimeout(() => setInteractive(false), 250);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const translateX = useSharedValue(-SCREEN_WIDTH);

  const animateOpen = useCallback(() => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
  }, [translateX]);

  const animateClose = useCallback(() => {
    translateX.value = withTiming(-SCREEN_WIDTH, { duration: 250 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  }, [translateX, onClose]);

  useEffect(() => {
    if (open) {
      animateOpen();
    }
  }, [open, animateOpen]);

  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withTiming(open ? 0.5 : 0, { duration: 250 });
  }, [open, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const swipeGesture = Gesture.Pan().onEnd((event) => { if (event.translationX < -50) runOnJS(animateClose)(); });

  const menuItems = [
    { icon: Home, label: "Dashboard", route: "/(tabs)" },
    { icon: Plus, label: "Log Food", route: "/(tabs)/log" },
    { icon: TrendingUp, label: "Progress", route: "/(tabs)/progress" },
    { icon: Bell, label: "Reminders", route: "/(settings)/notifications" },
    { icon: User, label: "Account", route: "/(tabs)/profile" },
  ];

  return (
    <>
      <Animated.View
        style={[styles.overlay, overlayStyle, { backgroundColor: colors.overlay }]}
        pointerEvents={interactive ? "auto" : "none"}
        onTouchEnd={animateClose}
      />
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.panel, drawerStyle, { backgroundColor: colors.surface, paddingTop: insets.top + 16 }]}>
          <View style={styles.header}>
            <Text preset="overline" style={{ letterSpacing: 2 }}>NutriLog</Text>
            <PressableScale onPress={animateClose} accessibilityRole="button" accessibilityLabel="Close menu"
              style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <X size={20} color={colors.textSecondary} />
            </PressableScale>
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
  panel: { position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 999, paddingHorizontal: 24, justifyContent: "space-between" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 48 },
  menuList: { gap: 8 },
  footer: { paddingBottom: 40 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 },
});
