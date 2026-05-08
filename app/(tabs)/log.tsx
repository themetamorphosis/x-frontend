import { View } from "react-native";
import { useRouter } from "expo-router";
import { PenLine, Camera, Search, ScanBarcode, Star } from "lucide-react-native";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { MenuItem } from "../../components/ui/v2/MenuItem";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { haptic } from "../../utils/haptics";

export default function LogScreen() {
  const router = useRouter();
  const reset = useFoodLogStore((s) => s.reset);
  const goTo = (path: "/(log)/text" | "/(log)/photo" | "/(log)/search" | "/(log)/barcode" | "/(log)/custom-foods") => {
    haptic.light(); reset(); router.push(path);
  };
  return (
    <ErrorBoundary>
      <ScreenWrapper>
        <View style={{ gap: 4, marginTop: 8 }}>
          <MenuItem icon={PenLine} label="Describe it" onPress={() => goTo("/(log)/text")} />
          <MenuItem icon={Camera} label="Photo" onPress={() => goTo("/(log)/photo")} />
          <MenuItem icon={Search} label="Search" onPress={() => goTo("/(log)/search")} />
          <MenuItem icon={ScanBarcode} label="Barcode" onPress={() => goTo("/(log)/barcode")} />
          <MenuItem icon={Star} label="My Foods" onPress={() => goTo("/(log)/custom-foods")} />
        </View>
      </ScreenWrapper>
    </ErrorBoundary>
  );
}
