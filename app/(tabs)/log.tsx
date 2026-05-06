import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { haptic } from "../../utils/haptics";
import { Colors } from "../../utils/colors";

function LogOption({ icon, title, subtitle, onPress }: { icon: string; title: string; subtitle: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => { haptic.light(); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${subtitle}`}
    >
      <Card style={styles.optionCard}>
        <View style={styles.optionRow}>
          <Text style={styles.optionIcon}>{icon}</Text>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionSubtitle}>{subtitle}</Text>
          </View>
          <Text style={styles.optionArrow}>›</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function LogScreen() {
  const router = useRouter();
  const reset = useFoodLogStore((s) => s.reset);

  const goTo = (path: "/(log)/text" | "/(log)/photo" | "/(log)/search" | "/(log)/barcode" | "/(log)/custom-foods") => {
    reset();
    router.push(path);
  };

  return (
    <ErrorBoundary>
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Food</Text>
      </View>

      <LogOption
        icon="✎"
        title="Describe it"
        subtitle="Type what you ate in plain English"
        onPress={() => goTo("/(log)/text")}
      />
      <LogOption
        icon="◉"
        title="Photo"
        subtitle="Snap a picture of your plate"
        onPress={() => goTo("/(log)/photo")}
      />
      <LogOption
        icon="⌕"
        title="Search"
        subtitle="Look up foods in the database"
        onPress={() => goTo("/(log)/search")}
      />
      <LogOption
        icon="⊞"
        title="Barcode"
        subtitle="Scan a product label"
        onPress={() => goTo("/(log)/barcode")}
      />
      <LogOption
        icon="★"
        title="My Foods"
        subtitle="Quick-log from your saved foods"
        onPress={() => goTo("/(log)/custom-foods")}
      />
    </ScreenWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 13, color: Colors.gray500, letterSpacing: 0.5, textTransform: "uppercase" },
  optionCard: { marginBottom: 8 },
  optionRow: { flexDirection: "row", alignItems: "center" },
  optionIcon: { fontSize: 20, marginRight: 16 },
  optionContent: { flex: 1 },
  optionTitle: { color: Colors.white, fontSize: 15, fontWeight: "500", marginBottom: 2 },
  optionSubtitle: { color: Colors.gray500, fontSize: 13 },
  optionArrow: { color: Colors.gray400, fontSize: 18 },
});
