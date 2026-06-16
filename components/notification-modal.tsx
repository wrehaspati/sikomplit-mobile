import { reuploadDocument, type ReuploadFileType } from "@/api/reapply-api";
import { uploadResearch } from "@/api/research-api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, RADIUS } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { formatDateTime } from "@/services/format-date";
import { ISubmissionData, ISubmissionUploadFile } from "@/types/submission";
import { zodResolver } from "@hookform/resolvers/zod";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { FullscreenAlert } from "./alert";

// Zod schema for research upload form
const selectedFileSchema = z.object({
  uri: z.string().min(1),
  name: z.string().min(1),
  mimeType: z.string().nullish(),
});

const researchFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Judul penelitian tidak boleh kosong" }),
  abstract: z
    .string()
    .trim()
    .min(1, { message: "Abstrak penelitian tidak boleh kosong" }),
  research_summary: selectedFileSchema.refine((f) => !!f?.uri, {
    message: "File ringkasan penelitian harus diisi",
  }),
  flyer: selectedFileSchema.refine((f) => !!f?.uri, {
    message: "File flyer penelitian harus diisi",
  }),
});

type ResearchFormData = z.infer<typeof researchFormSchema>;

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
    Record<string, ISubmissionUploadFile>
  >({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>(
    {},
  );

  // Research upload form
  const researchForm = useForm<ResearchFormData>({
    resolver: zodResolver(researchFormSchema),
    defaultValues: {
      title: "",
      abstract: "",
      research_summary: undefined,
      flyer: undefined,
    },
  });
  const [researchUploading, setResearchUploading] = useState(false);

  // Reset research form when modal opens with a different submission
  useEffect(() => {
    researchForm.reset();
  }, [submission?.id]);

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

  // pick PDF for research summary
  const pickResearchSummary = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;
    const file = result.assets[0];
    if (file.size && file.size > 2 * 1024 * 1024) {
      Alert.alert("Ukuran Berlebihan", "Ukuran file maksimal 2 MB.");
      return;
    }
    researchForm.setValue(
      "research_summary",
      {
        uri: file.uri,
        name: file.name ?? "ringkasan.pdf",
        mimeType: file.mimeType,
      },
      { shouldValidate: true, shouldDirty: true, shouldTouch: true },
    );
  };

  // pick image for flyer
  const pickFlyer = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
      Alert.alert("Ukuran Berlebihan", "Ukuran file maksimal 2 MB.");
      return;
    }
    const ext = asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
    researchForm.setValue(
      "flyer",
      {
        uri: asset.uri,
        name: asset.fileName ?? `flyer.${ext}`,
        mimeType: asset.mimeType ?? `image/${ext === "png" ? "png" : "jpeg"}`,
      },
      { shouldValidate: true, shouldDirty: true, shouldTouch: true },
    );
  };

  // Submit research upload
  const handleResearchSubmit = researchForm.handleSubmit(async (data) => {
    if (!localSubmission) return;
    Keyboard.dismiss();

    setResearchUploading(true);
    try {
      const response = await uploadResearch({
        recommendation_request_id: localSubmission.id,
        title: data.title.trim(),
        abstract: data.abstract.trim(),
        research_summary: data.research_summary,
        flyer: data.flyer,
      });
      console.log(
        "Research upload response:",
        JSON.stringify(response, null, 2),
      );
      if (response.data) {
        setLocalSubmission(response.data);
      }
      researchForm.reset();
      FullscreenAlert({
        title: "Berhasil Terkirim",
        description:
          "Hasil penelitian Anda telah berhasil dikirim. Selamat telah menyelesaikan penelitian Anda!",
        type: "success",
        buttonHref: "/",
        buttonText: "Kembali ke Beranda",
      });
      onReuploadSuccess?.();
    } catch (error: any) {
      const errData = error?.response?.data;
      console.error(
        "Research upload failed:",
        JSON.stringify(errData, null, 2),
      );
      console.error("Full error:", error);
      Alert.alert(
        "Gagal Mengunggah",
        errData?.message ??
          "Pastikan rekomendasi telah diterbitkan terlebih dahulu. Jika masalah tetap berlangsung, silakan hubungi layanan bantuan.",
      );
    } finally {
      setResearchUploading(false);
    }
  });

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

              {/* ─── Hasil Penelitian section ─── */}
              <ThemedView
                style={[
                  styles.modalCard,
                  { backgroundColor: sectionBackground },
                ]}
              >
                <ThemedText type="headline" style={{ marginBottom: 12 }}>
                  Hasil Penelitian
                </ThemedText>

                {localSubmission.research_upload != null ? (
                  /* ── Display existing research upload data ── */
                  <View>
                    <DetailRow
                      label="Judul Penelitian"
                      value={localSubmission.research_upload.title}
                      tertiaryText={tertiaryText}
                    />
                    <DocumentRow
                      label="Ringkasan Penelitian"
                      url={localSubmission.research_upload.research_summary}
                    />
                    <DocumentRow
                      label="Flyer Penelitian"
                      url={localSubmission.research_upload.flyer}
                    />
                    <DetailRow
                      label="Status Publikasi"
                      value={
                        localSubmission.research_upload.is_published ===
                        "Published"
                          ? "Dipublikasikan"
                          : "Belum Dipublikasikan"
                      }
                      tertiaryText={tertiaryText}
                    />
                  </View>
                ) : (
                  /* ── Research upload form ── */
                  <View style={styles.researchForm}>
                    <View style={styles.researchFormNotice}>
                      <IconSymbol
                        name="arrow.up.doc.fill"
                        size={16}
                        color={Colors.notificationBadge.pending.text}
                      />
                      <ThemedText
                        type="caption"
                        style={{
                          flex: 1,
                          color: Colors.notificationBadge.pending.text,
                        }}
                      >
                        Silakan unggah hasil penelitian Anda. Pastikan file
                        tidak melebihi batas ukuran 2 MB.
                      </ThemedText>
                    </View>

                    {/* Title */}
                    <Controller
                      control={researchForm.control}
                      name="title"
                      render={({ field, fieldState }) => (
                        <View style={styles.researchFieldGroup}>
                          <ThemedText
                            type="caption"
                            style={{
                              fontWeight: "600",
                              color: tertiaryText,
                              marginBottom: 4,
                            }}
                          >
                            Judul Penelitian
                          </ThemedText>
                          <TextInput
                            style={[
                              styles.researchInput,
                              fieldState.error
                                ? styles.researchInputError
                                : undefined,
                            ]}
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Masukkan judul penelitian"
                            placeholderTextColor={Colors.light.text.tertiary}
                          />
                          {fieldState.error?.message && (
                            <ThemedText
                              type="caption"
                              style={{ color: Colors.accentRed, marginTop: 2 }}
                            >
                              {fieldState.error.message}
                            </ThemedText>
                          )}
                        </View>
                      )}
                    />

                    {/* Abstract */}
                    <Controller
                      control={researchForm.control}
                      name="abstract"
                      render={({ field, fieldState }) => (
                        <View style={styles.researchFieldGroup}>
                          <ThemedText
                            type="caption"
                            style={{
                              fontWeight: "600",
                              color: tertiaryText,
                              marginBottom: 4,
                            }}
                          >
                            Abstrak Penelitian
                          </ThemedText>
                          <TextInput
                            style={[
                              styles.researchInput,
                              styles.researchTextarea,
                              fieldState.error
                                ? styles.researchInputError
                                : undefined,
                            ]}
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Masukkan abstrak penelitian"
                            placeholderTextColor={Colors.light.text.tertiary}
                            multiline
                            textAlignVertical="top"
                          />
                          {fieldState.error?.message && (
                            <ThemedText
                              type="caption"
                              style={{ color: Colors.accentRed, marginTop: 2 }}
                            >
                              {fieldState.error.message}
                            </ThemedText>
                          )}
                        </View>
                      )}
                    />

                    {/* Research summary PDF */}
                    <Controller
                      control={researchForm.control}
                      name="research_summary"
                      render={({ field, fieldState }) => (
                        <View style={styles.researchFieldGroup}>
                          <ThemedText
                            type="caption"
                            style={{
                              fontWeight: "600",
                              color: tertiaryText,
                              marginBottom: 4,
                            }}
                          >
                            Ringkasan / Abstrak Penelitian (PDF)
                          </ThemedText>
                          {field.value?.uri ? (
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
                                {field.value.name}
                              </ThemedText>
                              <Pressable
                                onPress={() =>
                                  researchForm.setValue(
                                    "research_summary",
                                    undefined as any,
                                    { shouldValidate: true },
                                  )
                                }
                                hitSlop={8}
                              >
                                <IconSymbol
                                  name="xmark.circle.fill"
                                  size={18}
                                  color={Colors.light.text.tertiary}
                                />
                              </Pressable>
                            </View>
                          ) : (
                            <Pressable
                              onPress={pickResearchSummary}
                              style={styles.researchPickButton}
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
                                Pilih File PDF
                              </ThemedText>
                            </Pressable>
                          )}
                          <ThemedText
                            type="caption"
                            style={{ color: tertiaryText, marginTop: 2 }}
                          >
                            File PDF, maks. 2 MB.
                          </ThemedText>
                          {fieldState.error?.message && (
                            <ThemedText
                              type="caption"
                              style={{ color: Colors.accentRed, marginTop: 2 }}
                            >
                              {fieldState.error.message}
                            </ThemedText>
                          )}
                        </View>
                      )}
                    />

                    {/* Flyer image */}
                    <Controller
                      control={researchForm.control}
                      name="flyer"
                      render={({ field, fieldState }) => (
                        <View style={styles.researchFieldGroup}>
                          <ThemedText
                            type="caption"
                            style={{
                              fontWeight: "600",
                              color: tertiaryText,
                              marginBottom: 4,
                            }}
                          >
                            Flyer Penelitian (JPG / PNG)
                          </ThemedText>
                          {field.value?.uri ? (
                            <View style={styles.pickedFileChip}>
                              <IconSymbol
                                name="photo.fill"
                                size={14}
                                color={Colors.accentGreen}
                              />
                              <ThemedText
                                type="caption"
                                style={{ flex: 1, fontWeight: "600" }}
                                numberOfLines={1}
                              >
                                {field.value.name}
                              </ThemedText>
                              <Pressable
                                onPress={() =>
                                  researchForm.setValue(
                                    "flyer",
                                    undefined as any,
                                    { shouldValidate: true },
                                  )
                                }
                                hitSlop={8}
                              >
                                <IconSymbol
                                  name="xmark.circle.fill"
                                  size={18}
                                  color={Colors.light.text.tertiary}
                                />
                              </Pressable>
                            </View>
                          ) : (
                            <Pressable
                              onPress={pickFlyer}
                              style={styles.researchPickButton}
                            >
                              <IconSymbol
                                name="photo.fill"
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
                                Pilih Gambar
                              </ThemedText>
                            </Pressable>
                          )}
                          <ThemedText
                            type="caption"
                            style={{ color: tertiaryText, marginTop: 2 }}
                          >
                            Gambar PNG atau JPG, maks. 2 MB.
                          </ThemedText>
                          {fieldState.error?.message && (
                            <ThemedText
                              type="caption"
                              style={{ color: Colors.accentRed, marginTop: 2 }}
                            >
                              {fieldState.error.message}
                            </ThemedText>
                          )}
                        </View>
                      )}
                    />

                    {/* Submit button */}
                    <View style={styles.researchFormActions}>
                      <Pressable
                        onPress={handleResearchSubmit}
                        disabled={researchUploading}
                        style={[
                          styles.researchSubmitButton,
                          researchUploading && { opacity: 0.6 },
                        ]}
                      >
                        {researchUploading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <IconSymbol
                            name="arrow.up.circle.fill"
                            size={16}
                            color="#fff"
                          />
                        )}
                        <ThemedText
                          type="subheadline"
                          style={{ color: "#fff", fontWeight: "700" }}
                        >
                          {researchUploading ? "Mengirim..." : "Kirim"}
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                )}
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
  // ─── Research upload form styles ───
  researchForm: {
    gap: 14,
  },
  researchFormNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.notificationBadge.pending.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.notificationBadge.pending.stripe,
  },
  researchFieldGroup: {
    gap: 0,
  },
  researchInput: {
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text.primary,
  },
  researchTextarea: {
    minHeight: 100,
    maxHeight: 180,
  },
  researchInputError: {
    borderColor: Colors.accentRed,
  },
  researchPickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
    alignSelf: "flex-start",
  },
  researchFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  researchSubmitButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: Colors.accentBlue,
  },
});
