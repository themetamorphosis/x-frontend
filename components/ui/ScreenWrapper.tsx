import { ReactNode } from "react";
import { View, SafeAreaView, StatusBar } from "react-native";
import { Colors } from "../../utils/colors";

interface ScreenWrapperProps {
  children: ReactNode;
  padded?: boolean;
}

export function ScreenWrapper({ children, padded = true }: ScreenWrapperProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={{ flex: 1, paddingHorizontal: padded ? 20 : 0 }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
