import { View } from "react-native";
import { useRouter } from "expo-router";
import { PenLine, Camera, Search, ScanBarcode, Star } from "lucide-react-native";
import { FadeInView } from "../../components/ui/v2/FadeInView";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Text } from "../../components/ui/v2/Text";
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
        <View style={{ paddingTop: 16, paddingBottom: 24 }}>
          <Text preset="overline">Log Food</Text>
        </View>
        <View style={{ gap: 12 }}>
          {[
            { icon: PenLine, label: "Describe it", path: "/(log)/text" as const },
            { icon: Camera, label: "Photo", path: "/(log)/photo" as const },
            { icon: Search, label: "Search", path: "/(log)/search" as const },
            { icon: ScanBarcode, label: "Barcode", path: "/(log)/barcode" as const },
            { icon: Star, label: "My Foods", path: "/(log)/custom-foods" as const },
          ].map((item, index) => (
            <FadeInView key={item.label} delay={index * 50}>
              <MenuItem icon={item.icon} label={item.label} onPress={() => goTo(item.path)} />
            </FadeInView>
          ))}
        </View>
      </ScreenWrapper>
    </ErrorBoundary>
  );
}
