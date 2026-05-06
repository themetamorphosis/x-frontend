import { Stack } from "expo-router";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { Colors } from "../../utils/colors";

export default function TabsLayout() {
  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="log" options={{ animation: "slide_from_right" }} />
      </Stack>
    </ErrorBoundary>
  );
}
