import { Stack } from "expo-router";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { Colors } from "../../utils/colors";

export default function OnboardingLayout() {
  return (
    <ErrorBoundary>
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: "slide_from_right",
      }}
    />
    </ErrorBoundary>
  );
}
