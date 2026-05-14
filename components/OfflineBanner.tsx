import { View, Text } from "react-native";
import { WifiOff } from "lucide-react-native";
import { useTheme } from "../utils/theme";

export function OfflineBanner() {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel="You are offline"
      style={{
        backgroundColor: colors.surface,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <WifiOff size={14} color={colors.primary} />
      <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.primary, letterSpacing: 1, textTransform: "uppercase" }}>
        Offline
      </Text>
    </View>
  );
}
