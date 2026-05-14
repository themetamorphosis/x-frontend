import { useState } from "react";
import { View, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ScreenWrapper } from "../../components/ui/v2/ScreenWrapper";
import { Card } from "../../components/ui/v2/Card";
import { Button } from "../../components/ui/v2/Button";
import { Text } from "../../components/ui/v2/Text";
import { parsePhoto } from "../../services/food";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { useTheme } from "../../utils/theme";
import { compressImage } from "../../utils/imageCompression";

export default function PhotoLogScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAIResult = useFoodLogStore((s) => s.setAIResult);

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please grant camera/gallery access in settings.");
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: true });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      try {
        const compressed = await compressImage(asset.uri);
        setImageBase64(compressed || null);
      } catch (e: unknown) {
        setImageBase64(asset.base64 || null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!imageBase64) return;

    setLoading(true);
    try {
      const result = await parsePhoto(imageBase64);
      setAIResult(result, "ai_photo");
      router.push("/(log)/confirm");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to analyze photo";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text preset="overline">Photo</Text>
      </View>

      {imageUri ? (
        <Card noPadding style={styles.imageCard}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </Card>
      ) : (
        <Card style={styles.placeholderCard}>
          <Text preset="caption" color="textTertiary">No image selected</Text>
        </Card>
      )}

      <View style={styles.buttonRow}>
        <Button
          title="Camera"
          onPress={() => pickImage(true)}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <Button
          title="Gallery"
          onPress={() => pickImage(false)}
          disabled={loading}
          variant="secondary"
          style={{ flex: 1 }}
        />
      </View>

      <Button
        title="Analyze"
        onPress={handleSubmit}
        disabled={!imageUri || loading}
        loading={loading}
        style={{ marginTop: 16 }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingBottom: 24 },
  imageCard: { overflow: "hidden", marginBottom: 16 },
  image: { width: "100%", height: 240, resizeMode: "cover" },
  placeholderCard: { marginBottom: 16, minHeight: 200, justifyContent: "center", alignItems: "center" },
  buttonRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
});
