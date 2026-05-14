import { Stack } from "expo-router";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useTheme } from "../../utils/theme";

export default function LogLayout() {
  const { colors } = useTheme();
  return (
    <ErrorBoundary>
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: "slide_from_right",
      }}
    />
    </ErrorBoundary>
  );
}
