import { View, Text } from "react-native";
import { WifiOff } from "lucide-react-native";
import { Colors } from "../utils/colors";
import { label } from "../utils/typography";

/**
 * Banner displayed at the top of the screen when the device is offline.
 * Neumorphic inset style with Slate Blue accent.
 */
export function OfflineBanner() {
  return (
    <View
      accessible
      accessibilityLabel="You are offline"
      style={{
        backgroundColor: Colors.surfaceDark,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        // Inset neumorphic
        shadowColor: Colors.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <WifiOff size={14} color={Colors.accent} />
      <Text style={{ ...label, fontSize: 10, marginBottom: 0, color: Colors.accent }}>
        Offline
      </Text>
    </View>
  );
}
