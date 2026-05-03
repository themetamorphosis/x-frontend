import * as ImageManipulator from "expo-image-manipulator";

const MAX_DIMENSION = 1024;
const COMPRESSION_QUALITY = 0.7;

export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION, height: MAX_DIMENSION } }],
    { compress: COMPRESSION_QUALITY, base64: true, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.base64 ?? "";
}
