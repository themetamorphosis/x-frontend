import { Stack } from "expo-router";
import { ErrorBoundary } from "../../components/ErrorBoundary";

export default function LogLayout() {
  return (
    <ErrorBoundary>
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
        animation: "slide_from_right",
      }}
    />
    </ErrorBoundary>
  );
}
