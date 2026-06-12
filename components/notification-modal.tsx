import {
  reuploadDocument,
  type ReuploadFile,
  type ReuploadFileType,
} from "@/api/reapply-api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, RADIUS } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { formatDateTime } from "@/services/format-date";
import { ISubmissionData } from "@/types/submission";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define interface for NotificationModal component
interface Props {
  visible: boolean;
  submission: ISubmissionData | null;
  sectionBackground: string;
  secondaryText: string;
  tertiaryText: string;
  onClose: () => void;
  onOpenDocument: (url?: string | null) => void;
  downloadProgressMap: Record<string, number>;
  onReuploadSuccess?: () => void;
}

/**
 * Renders a notification modal.
 * @param props
 * @returns NotificationModal component
 */
export default function NotificationModal({
  visible,
  submission,
  sectionBackground,
  secondaryText,
  tertiaryText,
  onClose,
  onOpenDocument,
  downloadProgressMap,
  onReuploadSuccess,
}: Props) {
  const defaultColor = useThemeColor({}, "default");
  const background = useThemeColor({}, "background");

  const isValidHttpUrl = (value?: string | null) =>
    !!value && /^https?:\/\//i.test(value);

  // Local submission state
  const [localSubmission, setLocalSubmission] =
    useState<ISubmissionData | null>(submission);

  useEffect(() => {
    setLocalSubmission(submission);
  }, [submission]);

  // Re-upload state
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, ReuploadFile>
  >({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>(
    {},
  );

  // Pick a document for re-upload
  const pickDocument = async (fileType: ReuploadFileType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const file = result.assets[0];
    setSelectedFiles((prev) => ({
      ...prev,
      [fileType]: {
        name: file.name ?? "Berkas tidak bernama",
        uri: file.uri,
        mimeType: file.mimeType,
      },
    }));
  };

  // Cancel a picked file
  const cancelPickedFile = (fileType: ReuploadFileType) => {
    setSelectedFiles((prev) => {
      const copy = { ...prev };
      delete copy[fileType];
      return copy;
    });
  };

  // Upload a picked file
  const handleUpload = async (fileType: ReuploadFileType) => {
    if (!localSubmission) return;
    const file = selectedFiles[fileType];
    if (!file) return;
    setUploadingFiles((prev) => ({ ...prev, [fileType]: true }));
    try {
      const response = await reuploadDocument(
        localSubmission.id,
        fileType,
        file,
      );
      if (response.data) {
        setLocalSubmission(response.data);
      }
      setSelectedFiles((prev) => {
        const copy = { ...prev };
        delete copy[fileType];
        return copy;
      });
      Alert.alert(
        "Berhasil",
        `Dokumen ${fileType.replaceAll("_", " ")} berhasil diperbarui`,
      );
      onReuploadSuccess?.();
    } catch (error) {
      console.error("Re-upload failed:", error);
      Alert.alert(
        "Gagal Mengunggah",
        "Terjadi kesalahan saat mengunggah dokumen. Silakan coba hubungi admin.",
      );
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fileType]: false }));
    }
  };

  // Document row component
  const DocumentRow = ({
    label,
    url,
    fileType,
  }: {
    label: string;
    url?: string | null;
    fileType?: ReuploadFileType;
  }) => {
    const available = isValidHttpUrl(url);
    const progress = url ? (downloadProgressMap[url] ?? null) : null;
    const isDownloading = progress !== null && progress >= 0 && progress < 1;
    const isEditable = localSubmission?.editable === true && fileType;
    const pickedFile = fileType ? selectedFiles[fileType] : undefined;
    const isUploading = fileType ? (uploadingFiles[fileType] ?? false) : false;

    return (
      <View style={styles.documentRowWrapper}>
        <Pressable
          onPress={() => onOpenDocument(url)}
          disabled={!available}
          style={[styles.documentRow, !available && styles.documentRowDisabled]}
        >
          <View style={styles.documentLabelBlock}>
            <IconSymbol
              name="document.fill"
              size={16}
              color={
                available ? Colors.accentBlue : Colors.light.text.secondary
              }
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <ThemedText
                type="subheadline"
                style={{ fontWeight: "600" }}
                numberOfLines={1}
              >
                {label}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: available ? Colors.accentBlue : secondaryText }}
              >
                {available ? "Buka / Unduh" : "Belum tersedia"}
              </ThemedText>
            </View>
          </View>
          {isDownloading ? (
            <ThemedText
              type="caption"
              style={{ color: Colors.accentBlue, fontWeight: "700" }}
            >
              {Math.round((progress ?? 0) * 100)}%
            </ThemedText>
          ) : (
            available && (
              <IconSymbol
                name="chevron.right"
                size={16}
                color={Colors.accentBlue}
              />
            )
          )}
        </Pressable>

        {/* Re-upload section — only when editable */}
        {isEditable && (
          <View style={styles.reuploadSection}>
            {isUploading ? (
              <View style={styles.reuploadUploading}>
                <ActivityIndicator size="small" color={Colors.accentBlue} />
                <ThemedText
                  type="caption"
                  style={{ color: Colors.accentBlue, fontWeight: "600" }}
                >
                  Mengunggah...
                </ThemedText>
              </View>
            ) : pickedFile ? (
              <View style={styles.reuploadConfirmation}>
                <View style={styles.pickedFileChip}>
                  <IconSymbol
                    name="document.fill"
                    size={14}
                    color={Colors.accentGreen}
                  />
                  <ThemedText
                    type="caption"
                    style={{ flex: 1, fontWeight: "600" }}
                    numberOfLines={1}
                  >
                    {pickedFile.name}
                  </ThemedText>
                  <Pressable
                    onPress={() => cancelPickedFile(fileType)}
                    hitSlop={8}
                  >
                    <IconSymbol
                      name="xmark.circle.fill"
                      size={18}
                      color={Colors.light.text.tertiary}
                    />
                  </Pressable>
                </View>
                <View style={styles.reuploadActions}>
                  <Pressable
                    onPress={() => handleUpload(fileType)}
                    style={styles.uploadConfirmButton}
                  >
                    <IconSymbol
                      name="arrow.up.circle.fill"
                      size={16}
                      color="#fff"
                    />
                    <ThemedText
                      type="caption"
                      style={{
                        color: "#fff",
                        fontWeight: "700",
                      }}
                    >
                      Unggah
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => cancelPickedFile(fileType)}
                    style={styles.uploadCancelButton}
                  >
                    <ThemedText
                      type="caption"
                      style={{
                        color: Colors.light.text.secondary,
                        fontWeight: "600",
                      }}
                    >
                      Batal
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => pickDocument(fileType)}
                style={styles.reuploadButton}
              >
                <IconSymbol
                  name="arrow.up.doc.fill"
                  size={14}
                  color={Colors.accentBlue}
                />
                <ThemedText
                  type="caption"
                  style={{
                    color: Colors.accentBlue,
                    fontWeight: "700",
                  }}
                >
                  Unggah Ulang
                </ThemedText>
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: background }]}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.modalTopBar}>
            <ThemedText type="title4">Detail Pengajuan</ThemedText>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <ThemedText
                type="subheadline"
                style={{ color: Colors.accentBlue, fontWeight: "700" }}
              >
                Tutup
              </ThemedText>
            </Pressable>
          </View>

          {localSubmission && (
            <ScrollView
              contentContainerStyle={[
                styles.modalContent,
                { backgroundColor: defaultColor },
              ]}
            >
              {/* Revision banner */}
              {localSubmission.editable && (
                <View style={styles.revisionBanner}>
                  <IconSymbol
                    name="exclamationmark.triangle.fill"
                    size={18}
                    color={Colors.notificationBadge.revision.text}
                  />
                  <View style={{ flex: 1 }}>
                    <ThemedText
                      type="subheadline"
                      style={{
                        fontWeight: "700",
                        color: Colors.notificationBadge.revision.text,
                      }}
                    >
                      Revisi Diperlukan
                    </ThemedText>
                    <ThemedText
                      type="caption"
                      style={{
                        color: Colors.notificationBadge.revision.text,
                        marginTop: 2,
                      }}
                    >
                      Silakan unggah ulang dokumen sesuai instruksi revisi yang
                      diberikan.
                    </ThemedText>
                  </View>
                </View>
              )}

              <ThemedView
                style={[
                  styles.modalCard,
                  { backgroundColor: sectionBackground },
                ]}
              >
                <ThemedText type="headline" style={{ marginBottom: 12 }}>
                  Ringkasan
                </ThemedText>
                <DetailRow
                  label="Nomor Permintaan"
                  value={localSubmission.request_number}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Status"
                  value={localSubmission.progress_status}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Jenis Penelitian"
                  value={
                    localSubmission.research_type.split("/")[0] ??
                    localSubmission.research_type
                  }
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Judul Penelitian"
                  value={localSubmission.research_upload?.title}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Dibuat"
                  value={formatDateTime(localSubmission.created_at)}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Terakhir Diperbarui"
                  value={formatDateTime(localSubmission.updated_at)}
                  tertiaryText={tertiaryText}
                />
              </ThemedView>

              <ThemedView
                style={[
                  styles.modalCard,
                  { backgroundColor: sectionBackground },
                ]}
              >
                <ThemedText type="headline" style={{ marginBottom: 12 }}>
                  Informasi Pemohon
                </ThemedText>
                <DetailRow
                  label="Nama"
                  value={localSubmission.name}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Email"
                  value={localSubmission.email}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="No. Telepon"
                  value={localSubmission.phone}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="NIK"
                  value={localSubmission.national_identity_number}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Tanggal Lahir"
                  value={localSubmission.date_of_birth}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Gender"
                  value={localSubmission.gender}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Pendidikan Terakhir"
                  value={localSubmission.last_education}
                  tertiaryText={tertiaryText}
                />
                <DetailRow
                  label="Pekerjaan"
                  value={localSubmission.occupation}
                  tertiaryText={tertiaryText}
                />
              </ThemedView>

              <ThemedView
                style={[
                  styles.modalCard,
                  { backgroundColor: sectionBackground },
                ]}
              >
                <ThemedText type="headline" style={{ marginBottom: 12 }}>
                  Dokumen
                </ThemedText>
                <DocumentRow
                  label="Surat Permohonan"
                  url={localSubmission.application_letter}
                  fileType="application_letter"
                />
                <DocumentRow
                  label="Proposal Penelitian"
                  url={localSubmission.research_proposal}
                  fileType="research_proposal"
                />
                <DocumentRow
                  label="Surat Keterangan Etik"
                  url={localSubmission.ethics_clearance_letter}
                  fileType="ethics_clearance_letter"
                />
                <DocumentRow
                  label="Surat Pernyataan Laporan Akhir"
                  url={localSubmission.final_report_statement_letter}
                  fileType="final_report_statement_letter"
                />
                <DocumentRow
                  label="Surat Rekomendasi"
                  url={localSubmission.recommendation_letter}
                />
              </ThemedView>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  tertiaryText,
}: {
  label: string;
  value?: string | null;
  tertiaryText: string;
}) {
  return (
    <View style={styles.detailRow}>
      <ThemedText
        type="caption"
        style={{ color: tertiaryText, marginBottom: 2 }}
      >
        {label}
      </ThemedText>
      <ThemedText type="subheadline" style={{ fontWeight: "600" }}>
        {value && value.trim().length > 0 ? value : "-"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    paddingTop: 14,
    flex: 1,
  },
  modalTopBar: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    paddingVertical: 4,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 12,
  },
  modalCard: {
    borderRadius: RADIUS.DEFAULT,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
  detailRow: {
    marginBottom: 10,
  },
  documentRowWrapper: {
    marginBottom: 8,
  },
  documentRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  documentRowDisabled: {
    opacity: 0.6,
  },
  documentLabelBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  // Re-upload styles
  revisionBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.notificationBadge.revision.background,
    borderRadius: RADIUS.DEFAULT,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.notificationBadge.revision.stripe,
  },
  reuploadSection: {
    marginTop: 6,
    paddingLeft: 4,
  },
  reuploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
    alignSelf: "flex-start",
  },
  reuploadConfirmation: {
    gap: 8,
  },
  pickedFileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  reuploadActions: {
    flexDirection: "row",
    gap: 8,
  },
  uploadConfirmButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.accentBlue,
  },
  uploadCancelButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
  reuploadUploading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
});
