import { Colors, RADIUS } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import ThemedButton from "./themed-button";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";

export type SelectedFile = {
  name: string;
  uri: string;
  size?: number | null;
  mimeType?: string | null;
};

interface FileUploaderProps {
  selectedFile: SelectedFile | null;
  onFileSelect: (file: SelectedFile | null) => void;
  onPreview?: (file: SelectedFile) => void;
  allowCamera?: boolean;
  maxSizeMB?: number;
  allowedTypes?: string[];
  error?: string;
  textColor?: string;
}

export default function FileUploader({
  selectedFile,
  onFileSelect,
  onPreview,
  allowCamera = true,
  maxSizeMB = 2,
  allowedTypes = ["application/pdf", "image/*"],
  error,
  textColor,
}: FileUploaderProps) {
  const fontColor = useThemeColor({}, "text.primary");

  const handleImageResult = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) {
      return;
    }

    const file = result.assets[0];
    let fileUri = file.uri;
    let fileSize = file.fileSize;

    if (fileSize && fileSize > maxSizeMB * 1024 * 1024) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          fileUri,
          [{ resize: { width: 1024 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
        );
        fileUri = manipResult.uri;

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          fileSize = fileInfo.size;
        }
      } catch (error) {
        console.error("Gagal melakukan kompresi gambar:", error);
      }
    }

    const finalFile = {
      name: file.fileName ?? `photo_${Date.now()}.jpg`,
      uri: fileUri,
      size: fileSize,
      mimeType: file.mimeType ?? "image/jpeg",
    };

    onFileSelect(finalFile);
  };

  const takePhoto = async () => {
    Alert.alert(
      "Pilih Sumber Foto",
      "Silahkan pilih sumber foto yang ingin digunakan",
      [
        {
          text: "Kamera",
          onPress: async () => {
            const { status } =
              await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert(
                "Izin Kamera Diperlukan",
                "Silahkan izinkan penggunaan kamera untuk menggunakan fitur ini",
              );
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 0.5,
              base64: true,
            });

            await handleImageResult(result);
          },
        },
        {
          text: "Galeri",
          onPress: async () => {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert(
                "Izin Galeri Diperlukan",
                "Silahkan izinkan akses galeri untuk menggunakan fitur ini",
              );
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.5,
              base64: true,
            });

            await handleImageResult(result);
          },
        },
        {
          text: "Batal",
          style: "cancel",
        },
      ],
    );
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: allowedTypes,
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const file = result.assets[0];
    let fileUri = file.uri;
    let fileSize = file.size;

    if (
      file.mimeType?.startsWith("image/") &&
      fileSize &&
      fileSize > maxSizeMB * 1024 * 1024
    ) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          fileUri,
          [{ resize: { width: 1024 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
        );
        fileUri = manipResult.uri;

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          fileSize = fileInfo.size;
        }
      } catch (error) {
        console.error("Gagal melakukan kompresi gambar:", error);
      }
    }

    const finalFile = {
      name: file.name ?? "Berkas tidak bernama",
      uri: fileUri,
      size: fileSize,
      mimeType: file.mimeType,
    };

    onFileSelect(finalFile);
  };

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <ThemedButton
          variant="primary"
          size="small"
          icon={<IconSymbol name="doc.fill" size={18} color="white" />}
          onPress={pickDocument}
          style={{ flex: 1, justifyContent: "center" }}
        >
          Pilih file
        </ThemedButton>
        {allowCamera && (
          <ThemedButton
            variant="outlineSecondary"
            size="small"
            icon={
              <IconSymbol
                name="camera.fill"
                size={18}
                color={textColor ?? fontColor}
              />
            }
            onPress={takePhoto}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Ambil Foto
          </ThemedButton>
        )}
      </View>

      {!selectedFile ? (
        <View style={styles.fileCard}>
          <ThemedText type="defaultSemiBold">Belum ada file dipilih</ThemedText>
          <ThemedText
            type="caption"
            darkColor={Colors.dark.text.secondary}
            lightColor={Colors.light.text.secondary}
            style={{ marginTop: 4 }}
          >
            File akan tampil di sini setelah dipilih.
          </ThemedText>
        </View>
      ) : (
        <View>
          <Pressable
            style={({ pressed }) => [
              styles.fileCard,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              if (onPreview) onPreview(selectedFile);
            }}
          >
            {selectedFile.mimeType?.startsWith("image/") && (
              <Image
                source={{ uri: selectedFile.uri }}
                style={{
                  width: "100%",
                  height: 150,
                  borderRadius: 8,
                  marginBottom: 12,
                  backgroundColor: Colors.light.fill.secondary,
                }}
                contentFit="cover"
              />
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1, paddingRight: 16 }}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {selectedFile.name}
                </ThemedText>
                <ThemedText
                  type="caption"
                  darkColor={Colors.dark.text.secondary}
                  lightColor={Colors.light.text.secondary}
                  style={{ marginTop: 4 }}
                >
                  {`${selectedFile.mimeType ?? "Jenis file tidak terdeteksi"}${
                    selectedFile.size
                      ? ` · ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                      : ""
                  }`}
                </ThemedText>
              </View>
              {onPreview && (
                <View style={{ alignItems: "center" }}>
                  <IconSymbol
                    name="eye.fill"
                    size={20}
                    color={Colors.light.tint}
                  />
                  <ThemedText
                    type="caption"
                    style={{ color: Colors.light.tint, marginTop: 4 }}
                  >
                    Lihat
                  </ThemedText>
                </View>
              )}
            </View>
          </Pressable>
          {error && (
            <ThemedText
              type="caption"
              style={{ color: Colors.accentRed, marginTop: 8 }}
            >
              {error}
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fileCard: {
    borderRadius: RADIUS.DEFAULT,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
});
