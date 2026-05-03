import { View, Text } from "react-native";
import { Colors } from "../utils/colors";

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
