import { View, Text } from "react-native";
import { Colors } from "../utils/colors";

/**
 * Banner displayed at the top of the screen when the device is offline.
 * Renders nothing when connected. Used in root layout alongside useNetworkStatus.
 */
export function OfflineBanner() {
  return (
    <View
      accessible
      accessibilityLabel="You are offline"
      style={{
        backgroundColor: Colors.gray700,
        paddingVertical: 6,
        alignItems: "center",
      }}
    >
      <Text style={{ color: Colors.white, fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" }}>
        Offline
      </Text>
    </View>
  );
}
