import { useState, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Button } from "../../components/ui/v2/Button";
import { Text } from "../../components/ui/v2/Text";
import { Toast } from "../../components/ui/v2/Toast";
import { useAuthStore } from "../../stores/authStore";
import { useProfileStore } from "../../stores/profileStore";
import { api } from "../../services/api";
import { useTheme } from "../../utils/theme";

WebBrowser.maybeCompleteAuthSession();

interface LoginUser {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: LoginUser;
}

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";

// Validate OAuth config at module load (fails fast in production builds)
if (!__DEV__) {
  for (const [name, value] of Object.entries({
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: WEB_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: IOS_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: ANDROID_CLIENT_ID,
  })) {
    if (!value) {
      throw new Error(`Missing OAuth config: ${name}. Set it in your .env file.`);
    }
  }
}

export default function LoginScreen() {
  const { colors } = useTheme();
  const { setAuth } = useAuthStore();
  const { fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
  });

  const exchangeToken = useCallback(async (googleIdToken: string) => {
    setLoading(true);
    try {
      const data = await api.post<LoginResponse>("/auth/google", {
        token: googleIdToken,
      });
      setAuth(
        data.access_token,
        data.refresh_token,
        data.user.id,
        data.user.email,
        data.user.name,
        data.user.avatar_url
      );
      fetchProfile();
    } catch (e: unknown) {
      setToast({ message: "Sign in failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [setAuth, fetchProfile]);

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.idToken) {
        exchangeToken(authentication.idToken);
      }
    }
  }, [response, exchangeToken]);

  const devLogin = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.post<LoginResponse>("/auth/dev-login", {
        secret: process.env.EXPO_PUBLIC_DEV_LOGIN_SECRET ?? "",
      });
      setAuth(
        data.access_token,
        data.refresh_token,
        data.user.id,
        data.user.email,
        data.user.name,
        data.user.avatar_url
      );
      fetchProfile();
    } catch (e: unknown) {
      setToast({ message: "Dev login failed. Is DEV_MODE enabled on the backend?", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [setAuth, fetchProfile]);

  return (
    <ScreenWrapper noScroll>
      <View style={styles.container}>
        {/* Decorative dots */}
        <View style={[styles.dot, { top: 80, right: 40, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, opacity: 0.5 }]} />
        <View style={[styles.dot, { top: 120, left: 50, width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.border, opacity: 0.3 }]} />
        <View style={[styles.dot, { bottom: 140, right: 60, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border, opacity: 0.4 }]} />

        {/* Brand */}
        <View style={styles.brand}>
          <Text preset="display" style={{ marginBottom: 12, letterSpacing: -1.5 }}>NutriLog</Text>
          <Text preset="caption" color="textSecondary" style={{ letterSpacing: 0.8, fontSize: 14 }}>AI-powered nutrition tracking</Text>
        </View>

        {/* Google Sign In */}
        <Button
          title="Continue with Google"
          onPress={() => promptAsync()}
          disabled={!request || loading}
          variant="primary"
          style={{ width: "100%" }}
        />

        {__DEV__ && (
          <Button
            title="Dev Login"
            onPress={devLogin}
            disabled={loading}
            variant="secondary"
            style={{ width: "100%" }}
          />
        )}

        {toast && (
          <Toast message={toast.message} type={toast.type} visible={true} onHide={() => setToast(null)} />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 20, paddingHorizontal: 32 },
  dot: { position: "absolute" },
  brand: { alignItems: "center", marginBottom: 48 },
});
