import { useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ScreenWrapper } from "../../components/ui/ScreenWrapper";
import { Card } from "../../components/ui/Card";
import { parsePhoto } from "../../services/food";
import { useFoodLogStore } from "../../stores/foodLogStore";
import { Colors } from "../../utils/colors";
import { compressImage } from "../../utils/imageCompression";

export default function PhotoLogScreen() {
  const router = useRouter();
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
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to analyze photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo</Text>
      </View>

      {imageUri ? (
        <Card style={styles.imageCard}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </Card>
      ) : (
        <Card style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>No image selected</Text>
        </Card>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => pickImage(true)}
          disabled={loading}
          style={styles.cameraButton}
        >
          <Text style={styles.cameraButtonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => pickImage(false)}
          disabled={loading}
          style={styles.galleryButton}
        >
          <Text style={styles.galleryButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleSubmit}
        disabled={!imageUri || loading}
        style={[styles.analyzeButton, { backgroundColor: imageUri && !loading ? Colors.white : Colors.gray100 }]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.black} />
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze</Text>
        )}
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 16, paddingBottom: 24, flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 16 },
  backArrow: { color: Colors.white, fontSize: 16 },
  headerTitle: { fontSize: 13, color: Colors.gray500, letterSpacing: 0.5, textTransform: "uppercase" },
  imageCard: { padding: 0, overflow: "hidden", marginBottom: 16 },
  image: { width: "100%", height: 240, resizeMode: "cover" },
  placeholderCard: { marginBottom: 16, minHeight: 200, justifyContent: "center", alignItems: "center" },
  placeholderText: { color: Colors.gray300, fontSize: 13 },
  buttonRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  cameraButton: { flex: 1, backgroundColor: Colors.white, paddingVertical: 14, alignItems: "center" },
  cameraButtonText: { color: Colors.black, fontSize: 13, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  galleryButton: { flex: 1, backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.gray300, paddingVertical: 14, alignItems: "center" },
  galleryButtonText: { color: Colors.white, fontSize: 13, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  analyzeButton: { paddingVertical: 16, alignItems: "center" },
  analyzeButtonText: { color: Colors.black, fontSize: 14, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
});
