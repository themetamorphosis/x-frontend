import { memo, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, { useAnimatedStyle, withTiming, useSharedValue, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Target, BarChart3, TrendingUp, Bell, Droplets,
  Users, User, Gift, FileText, MessageCircle,
  Settings, LogOut, X,
} from "lucide-react-native";
import { Shadow } from "react-native-shadow-2";
import { MotiPressable } from "moti/interactions";
import { Colors } from "../utils/colors";
import { buttonText, label } from "../utils/typography";
import { neuCircle, raisedShadowProps } from "../utils/neumorphic";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

type MenuItem = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  action: () => void;
  isAccent?: boolean;
  isPlaceholder?: boolean;
};

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  activeRoute?: string;
  showToast: (msg: string) => void;
}

export const NavDrawer = memo(function NavDrawer({
  open,
  onClose,
  onNavigate,
  onLogout,
  activeRoute,
  showToast,
}: NavDrawerProps) {
  const translateX = useSharedValue(-DRAWER_WIDTH);

  const animateOpen = useCallback(() => {
    translateX.value = withTiming(0, { duration: 280 });
  }, [translateX]);

  const animateClose = useCallback(() => {
    translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  }, [translateX, onClose]);

  // Trigger open/close animations
  useEffect(() => {
    if (open && translateX.value === -DRAWER_WIDTH) {
      animateOpen();
    }
  }, [open, translateX, animateOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(open ? 1 : 0, { duration: 250 }),
    pointerEvents: open ? "auto" : "none",
  }));

  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationX < -50) {
        runOnJS(animateClose)();
      }
    });

  const menuItems: MenuItem[] = [
    { icon: Target, label: "Daily Goals", action: () => onNavigate("/(tabs)") },
    { icon: BarChart3, label: "Weekly Summary", action: () => onNavigate("/(tabs)/progress") },
    { icon: TrendingUp, label: "Weight Tracker", action: () => onNavigate("/(tabs)/progress") },
    { icon: Bell, label: "Reminders", action: () => onNavigate("/(settings)/notifications") },
    { icon: Droplets, label: "Water Tracker", action: () => onNavigate("/(tabs)") },
    { icon: Users, label: "Groups", action: () => showToast("Coming Soon"), isPlaceholder: true },
    { icon: User, label: "Account", action: () => onNavigate("/(tabs)/profile") },
    { icon: Gift, label: "Referral Code", action: () => showToast("Coming Soon"), isPlaceholder: true },
    { icon: FileText, label: "Terms & Privacy", action: () => showToast("Coming Soon"), isPlaceholder: true },
    { icon: MessageCircle, label: "Feedback & Support", action: () => showToast("Coming Soon"), isPlaceholder: true },
    { icon: Settings, label: "Settings", action: () => onNavigate("/(tabs)/profile") },
    { icon: LogOut, label: "Logout", action: onLogout, isAccent: true },
  ];

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, overlayStyle]}
        onTouchEnd={animateClose}
        accessibilityLabel="Close menu overlay"
      />

      {/* Drawer */}
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.drawer, drawerStyle]}>
          <View style={styles.drawerInner}>
            {/* Header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.brandText}>NutriLog</Text>
              <MotiPressable
                onPress={animateClose}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
                style={styles.closeButton}
              >
                <X size={20} color={Colors.textSecondary} />
              </MotiPressable>
            </View>

            {/* Menu items */}
            <View style={styles.menuList}>
              {menuItems.map((item) => {
                const isActive = activeRoute === item.label;
                const Icon = item.icon;
                return (
                  <MotiPressable
                    key={item.label}
                    onPress={() => {
                      item.action();
                      if (!item.isPlaceholder) animateClose();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
                    style={styles.menuItem}
                  >
                    <Shadow
                      {...raisedShadowProps(2)}
                      style={[
                        neuCircle(36),
                        isActive && { backgroundColor: Colors.accent },
                      ]}
                    >
                      <Icon
                        size={18}
                        color={isActive ? Colors.white : (item.isAccent ? Colors.error : Colors.textSecondary)}
                      />
                    </Shadow>
                    <Text
                      style={[
                        styles.menuLabel,
                        isActive && { color: Colors.accent },
                        item.isAccent && { color: Colors.error },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </MotiPressable>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    zIndex: 998,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.background,
    zIndex: 999,
    // Neumorphic edge shadow
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  drawerInner: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  brandText: {
    ...label,
    fontSize: 14,
    color: Colors.accent,
    letterSpacing: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  menuList: {
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  menuLabel: {
    ...buttonText,
    fontSize: 14,
    color: Colors.text,
    fontWeight: "400",
  },
});
