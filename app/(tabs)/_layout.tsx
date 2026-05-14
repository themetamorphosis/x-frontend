import { useState, useCallback } from "react";
import { Stack, useRouter, type Href } from "expo-router";
import { Header } from "../../components/Header";
import { FullMenu } from "../../components/FullMenu";
import { useAuthStore } from "../../stores/authStore";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { useTheme } from "../../utils/theme";

export default function TabsLayout() {
  const { colors } = useTheme();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = useCallback((route: string) => {
    router.push(route as Href);
  }, [router]);

  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          header: () => <Header onMenuPress={() => setMenuOpen(true)} />,
          contentStyle: { backgroundColor: colors.bg },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: true }} />
        <Stack.Screen name="progress" options={{ headerShown: true, header: () => <Header title="Progress" onMenuPress={() => setMenuOpen(true)} /> }} />
        <Stack.Screen name="profile" options={{ headerShown: true, header: () => <Header title="Account" onMenuPress={() => setMenuOpen(true)} /> }} />
        <Stack.Screen name="log" options={{ headerShown: true, header: () => <Header title="Log Food" onMenuPress={() => setMenuOpen(true)} />, animation: "slide_from_right" }} />
      </Stack>

      <FullMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
        onLogout={clearAuth}
      />
    </ErrorBoundary>
  );
}
