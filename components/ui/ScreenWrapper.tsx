import { ReactNode } from "react";
import { View, SafeAreaView, StatusBar } from "react-native";

interface ScreenWrapperProps {
  children: ReactNode;
  padded?: boolean;
}

export function ScreenWrapper({ children, padded = true }: ScreenWrapperProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={{ flex: 1, paddingHorizontal: padded ? 20 : 0 }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
