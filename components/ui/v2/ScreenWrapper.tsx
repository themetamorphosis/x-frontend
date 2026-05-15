import React, { ReactNode } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../../utils/theme";

interface ScreenWrapperProps {
  children: ReactNode;
  noScroll?: boolean;
  noPadding?: boolean;
}

export function ScreenWrapper({ children, noScroll = false, noPadding = false }: ScreenWrapperProps) {
  const { colors, isDark } = useTheme();
  const content = <View style={{ flex: 1, paddingHorizontal: noPadding ? 0 : 20 }}>{children}</View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {noScroll ? content : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {content}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
