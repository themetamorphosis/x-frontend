import { useState, useCallback } from "react";
import { View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
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

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com";

// Validate OAuth config at module load (fails fast in production builds)
if (!__DEV__) {
  for (const [name, value] of Object.entries({
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: WEB_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: IOS_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: ANDROID_CLIENT_ID,
  })) {
    if (value.startsWith("YOUR_")) {
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
      const data = await api.post<LoginResponse>("/auth/dev-login");
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 16 }}>
        {/* Brand */}
        <View style={{ width: "100%", marginBottom: 32, padding: 32, alignItems: "center", backgroundColor: colors.bg, borderRadius: 28 }}>
          <Text preset="display" style={{ marginBottom: 8 }}>NutriLog</Text>
          <Text preset="caption" color="textSecondary" style={{ letterSpacing: 0.5 }}>AI-powered nutrition tracking</Text>
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
