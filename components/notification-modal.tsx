import { reuploadDocument, type ReuploadFileType } from "@/api/reapply-api";
import { uploadResearch } from "@/api/research-api";
import DocumentRow from "@/components/document-row";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, RADIUS } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { formatDateTime } from "@/services/format-date";
import { shortResearchType } from "@/services/format-text";
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
import ThemedButton from "./themed-button";

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

  const [docsExpanded, setDocsExpanded] = useState(true);
  const [profileExpanded, setProfileExpanded] = useState(false);

  const getTimelineStep = (progressStatus?: string | null): number => {
    if (!progressStatus) return 1;
    const status = progressStatus.toLowerCase();

    if (
      status.includes("selesai") ||
      status.includes("diterima") ||
      status.includes("hasil")
    ) {
      return 4;
    }
    if (status.includes("setuju") || status.includes("terbit")) {
      return 3;
    }
    if (
      status.includes("verifikasi") ||
      status.includes("revisi") ||
      status.includes("perbaikan") ||
      status.includes("disposisi") ||
      status.includes("review")
    ) {
      return 2;
    }
    if (status.includes("diajukan") || status.includes("submitted")) {
      return 1;
    }
    return 1;
  };

  // Reset accordion states when submission changes
  useEffect(() => {
    if (localSubmission) {
      const step = getTimelineStep(localSubmission.progress_status);
      setDocsExpanded(step < 3); // Expand by default if not approved
      setProfileExpanded(false);
    }
  }, [localSubmission?.id]);

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
      Alert.alert("Berhasil", `Dokumen berhasil diperbarui`);
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
      if (response.data) {
        setLocalSubmission(response.data);
      }
      researchForm.reset();
      onClose();
      setTimeout(() => {
        FullscreenAlert({
          title: "Berhasil Terkirim",
          description:
            "Hasil penelitian Anda telah berhasil dikirim. Selamat telah menyelesaikan penelitian Anda!",
          type: "success",
          buttonHref: "/",
          buttonText: "Kembali ke Beranda",
        });
        onReuploadSuccess?.();
      }, 500);
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

  // Expandable abstract state
  const [abstractExpanded, setAbstractExpanded] = useState(false);

  // Document row with re-upload wrapper
  const SubmissionDocumentRow = ({
    label,
    url,
    fileType,
  }: {
    label: string;
    url?: string | null;
    fileType?: ReuploadFileType;
  }) => {
    const isEditable = localSubmission?.editable === true && fileType;
    const pickedFile = fileType ? selectedFiles[fileType] : undefined;
    const isUploading = fileType ? (uploadingFiles[fileType] ?? false) : false;

    return (
      <View>
        <DocumentRow
          label={label}
          url={url}
          downloadProgressMap={downloadProgressMap}
          onPress={(u) => onOpenDocument(u)}
        />

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
                    style={({ pressed }) => [
                      styles.uploadConfirmButton,
                      pressed && { opacity: 0.8 },
                    ]}
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
                    style={({ pressed }) => [
                      styles.uploadCancelButton,
                      pressed && { opacity: 0.7 },
                    ]}
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
                style={({ pressed }) => [
                  styles.reuploadButton,
                  pressed && { opacity: 0.7 },
                ]}
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

  const currentStep = localSubmission
    ? getTimelineStep(localSubmission.progress_status)
    : 1;
  const steps = ["Diajukan", "Verifikasi", "Disetujui", "Selesai"];
  const isDataAwal = localSubmission
    ? localSubmission.research_type.toLowerCase().includes("data awal") ||
      localSubmission.research_type.toLowerCase().includes("studi pendahuluan")
    : false;
  const recommendationAvailable =
    localSubmission && isValidHttpUrl(localSubmission.recommendation_letter);

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
          {/* Refined Header */}
          <View
            style={[
              styles.modalTopBar,
              { borderBottomColor: Colors.light.fill.secondary },
            ]}
          >
            <View style={styles.headerTitleBlock}>
              <View style={styles.headerIconCircle}>
                <IconSymbol
                  name="document.fill"
                  size={14}
                  color={Colors.accentBlue}
                />
              </View>
              <ThemedText type="title4" style={{ fontWeight: "700" }}>
                Detail Pengajuan
              </ThemedText>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.6 },
              ]}
              onPress={onClose}
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={28}
                color={Colors.light.text.tertiary}
              />
            </Pressable>
          </View>

          {localSubmission && (
            <ScrollView
              contentContainerStyle={[
                styles.modalContent,
                { backgroundColor: defaultColor },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* Progress Step Timeline */}
              <View
                style={[
                  styles.timelineCard,
                  { backgroundColor: sectionBackground },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    name="circle.fill"
                    size={8}
                    color={Colors.accentBlue}
                  />
                  <ThemedText type="subheadline" style={styles.sectionLabel}>
                    Status Pengajuan
                  </ThemedText>
                </View>

                <View style={styles.timelineRow}>
                  {/* Connecting Lines (behind circles) */}
                  {steps.map((_, idx) => {
                    if (idx === steps.length - 1) return null;
                    const segmentCompleted = currentStep > idx + 1;
                    return (
                      <View
                        key={`line-${idx}`}
                        style={[
                          styles.timelineSegment,
                          {
                            left: `${((idx + 0.5) / steps.length) * 100}%`,
                            width: `${(1 / steps.length) * 100}%`,
                            backgroundColor: segmentCompleted
                              ? Colors.accentGreen
                              : Colors.light.fill.secondary,
                          },
                        ]}
                      />
                    );
                  })}
                  {steps.map((stepLabel, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = currentStep > stepNum;
                    const isActive = currentStep === stepNum;

                    return (
                      <View key={idx} style={styles.timelineNode}>
                        <View
                          style={[
                            styles.timelineCircle,
                            isCompleted && styles.timelineCircleCompleted,
                            isActive && styles.timelineCircleActive,
                          ]}
                        >
                          {isCompleted ? (
                            <IconSymbol
                              name="checkmark.shield.fill"
                              size={14}
                              color="#fff"
                            />
                          ) : (
                            <ThemedText
                              type="caption"
                              style={{
                                color: isActive ? "#fff" : secondaryText,
                                fontWeight: "800",
                                fontSize: 11,
                              }}
                            >
                              {stepNum}
                            </ThemedText>
                          )}
                        </View>
                        <ThemedText
                          type="caption"
                          numberOfLines={1}
                          style={[
                            styles.timelineLabel,
                            isActive && styles.timelineLabelActive,
                            isCompleted && styles.timelineLabelCompleted,
                          ]}
                        >
                          {stepLabel}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>

                {/* Visual Status Text badge */}
                <View style={styles.statusBadgeRow}>
                  <ThemedText
                    type="caption"
                    style={{ color: tertiaryText, fontWeight: "500" }}
                  >
                    Status saat ini
                  </ThemedText>
                  <View
                    style={[
                      styles.statusBadgeTextContainer,
                      {
                        backgroundColor:
                          currentStep === 4
                            ? Colors.notificationBadge.approved.background
                            : currentStep === 3
                              ? Colors.notificationBadge.approved.background
                              : localSubmission.editable
                                ? Colors.notificationBadge.revision.background
                                : Colors.notificationBadge.pending.background,
                      },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={{
                        fontWeight: "700",
                        color:
                          currentStep === 4
                            ? Colors.notificationBadge.approved.text
                            : currentStep === 3
                              ? Colors.notificationBadge.approved.text
                              : localSubmission.editable
                                ? Colors.notificationBadge.revision.text
                                : Colors.notificationBadge.pending.text,
                      }}
                    >
                      {localSubmission.progress_status}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Summary Card */}
              <ThemedView
                style={[
                  styles.modalCard,
                  { backgroundColor: sectionBackground },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    name="circle.fill"
                    size={8}
                    color={Colors.accentBlue}
                  />
                  <ThemedText type="subheadline" style={styles.sectionLabel}>
                    Ringkasan
                  </ThemedText>
                </View>

                <View style={styles.gridContainer}>
                  <View style={styles.gridRow}>
                    <DetailColumn
                      label="Nomor Permintaan"
                      value={localSubmission.request_number}
                      tertiaryText={tertiaryText}
                    />
                    <DetailColumn
                      label="Jenis Penelitian"
                      value={shortResearchType(localSubmission.research_type)}
                      tertiaryText={tertiaryText}
                    />
                  </View>
                  <View style={styles.gridDivider} />
                  <View style={styles.gridRow}>
                    <DetailColumn
                      label="Dibuat"
                      value={formatDateTime(localSubmission.created_at)}
                      tertiaryText={tertiaryText}
                    />
                    <DetailColumn
                      label="Terakhir Diperbarui"
                      value={formatDateTime(localSubmission.updated_at)}
                      tertiaryText={tertiaryText}
                    />
                  </View>
                </View>
              </ThemedView>

              {/* Revision Banner */}
              {localSubmission.editable && (
                <View style={styles.revisionBanner}>
                  <View style={styles.revisionContent}>
                    <IconSymbol
                      name="exclamationmark.triangle.fill"
                      size={22}
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
                          lineHeight: 16,
                          opacity: 0.85,
                        }}
                      >
                        Silakan unggah ulang dokumen di bawah ini sesuai
                        instruksi revisi yang diberikan.
                      </ThemedText>
                    </View>
                  </View>
                </View>
              )}

              {/* Surat Rekomendasi Section */}
              <ThemedView
                style={[
                  styles.modalCard,
                  { backgroundColor: sectionBackground },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    name="circle.fill"
                    size={8}
                    color={Colors.accentGreen}
                  />
                  <ThemedText type="subheadline" style={styles.sectionLabel}>
                    Surat Rekomendasi
                  </ThemedText>
                </View>

                {recommendationAvailable ? (
                  <View style={styles.recommendationBoxActive}>
                    <View style={styles.recommendationHeaderRow}>
                      <View style={styles.successIconCircle}>
                        <IconSymbol
                          name="checkmark.shield.fill"
                          size={20}
                          color={Colors.accentGreen}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          type="subheadline"
                          style={{ fontWeight: "700" }}
                        >
                          Surat Rekomendasi Terbit
                        </ThemedText>
                        <ThemedText
                          type="caption"
                          style={{ color: tertiaryText, marginTop: 2 }}
                        >
                          Ketuk tombol di bawah untuk membuka atau mengunduh
                          Surat Rekomendasi resmi Anda.
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedButton
                      onPress={() =>
                        onOpenDocument(localSubmission.recommendation_letter)
                      }
                      lightColor={Colors.accentGreen}
                      darkColor={Colors.accentGreen}
                      icon={
                        <IconSymbol
                          name="arrow.down.app.fill"
                          size={20}
                          color="#fff"
                        />
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ThemedText
                        style={{
                          color: "#fff",
                          fontWeight: "700",
                        }}
                      >
                        Surat Rekomendasi
                      </ThemedText>
                    </ThemedButton>
                  </View>
                ) : (
                  <View style={styles.recommendationBoxDisabled}>
                    <View style={styles.recommendationHeaderRow}>
                      <View style={styles.lockedIconCircle}>
                        <IconSymbol
                          name="lock.fill"
                          size={16}
                          color={Colors.light.text.secondary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          type="subheadline"
                          style={{ fontWeight: "600", color: secondaryText }}
                        >
                          Belum Diterbitkan
                        </ThemedText>
                        <ThemedText
                          type="caption"
                          style={{ color: tertiaryText, marginTop: 2 }}
                        >
                          Surat Rekomendasi akan aktif di sini setelah seluruh
                          proses verifikasi dan disposisi selesai.
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.disabledActionButton}>
                      <IconSymbol
                        name="lock.fill"
                        size={12}
                        color={Colors.light.text.secondary}
                      />
                      <ThemedText
                        type="caption"
                        style={{
                          color: Colors.light.text.secondary,
                          fontWeight: "600",
                        }}
                      >
                        Menunggu Penerbitan Surat
                      </ThemedText>
                    </View>
                  </View>
                )}
              </ThemedView>

              {/* Prerequisite Documents (Accordion) */}
              <ThemedView
                style={[
                  styles.accordionCard,
                  { backgroundColor: sectionBackground },
                ]}
              >
                <Pressable
                  onPress={() => setDocsExpanded(!docsExpanded)}
                  style={({ pressed }) => [
                    styles.accordionHeader,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <ThemedText type="headline" style={{ fontWeight: "700" }}>
                      Berkas Persyaratan
                    </ThemedText>
                    <View style={styles.accordionMeta}>
                      <View style={styles.countPill}>
                        <ThemedText type="caption" style={styles.countPillText}>
                          {isDataAwal ? "1" : "4"}
                        </ThemedText>
                      </View>
                      <ThemedText
                        type="caption"
                        style={{ color: tertiaryText }}
                      >
                        Dokumen Terlampir
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.chevronCircle}>
                    <IconSymbol
                      name={docsExpanded ? "chevron.up" : "chevron.down"}
                      size={14}
                      color={Colors.accentBlue}
                    />
                  </View>
                </Pressable>

                {docsExpanded && (
                  <View style={styles.accordionBody}>
                    <SubmissionDocumentRow
                      label="Surat Permohonan"
                      url={localSubmission.application_letter}
                      fileType="application_letter"
                    />
                    {!isDataAwal && (
                      <>
                        <SubmissionDocumentRow
                          label="Proposal Penelitian"
                          url={localSubmission.research_proposal}
                          fileType="research_proposal"
                        />
                        <SubmissionDocumentRow
                          label="Surat Keterangan Etik"
                          url={localSubmission.ethics_clearance_letter}
                          fileType="ethics_clearance_letter"
                        />
                        <SubmissionDocumentRow
                          label="Surat Pernyataan Laporan Akhir"
                          url={localSubmission.final_report_statement_letter}
                          fileType="final_report_statement_letter"
                        />
                      </>
                    )}
                  </View>
                )}
              </ThemedView>

              {/* Hasil Penelitian (Research Upload) Section */}
              {currentStep >= 3 && (
                <ThemedView
                  style={[
                    styles.modalCard,
                    { backgroundColor: sectionBackground },
                  ]}
                >
                  <View style={styles.sectionHeader}>
                    <IconSymbol
                      name="circle.fill"
                      size={8}
                      color={Colors.accentBlue}
                    />
                    <ThemedText type="subheadline" style={styles.sectionLabel}>
                      Hasil Penelitian
                    </ThemedText>
                  </View>

                  {localSubmission.research_upload != null ? (
                    /* Display existing research upload data */
                    <View style={{ gap: 10, marginTop: 4 }}>
                      <DetailRow
                        label="Judul Penelitian"
                        value={localSubmission.research_upload.title}
                        tertiaryText={tertiaryText}
                      />

                      {/* Compact expandable abstract */}
                      {localSubmission.research_upload.abstract ? (
                        <Pressable
                          onPress={() => setAbstractExpanded(!abstractExpanded)}
                          style={({ pressed }) => [
                            styles.abstractCard,
                            pressed && { opacity: 0.8 },
                          ]}
                        >
                          <View style={styles.abstractHeader}>
                            <IconSymbol
                              name="document.fill"
                              size={12}
                              color={Colors.accentBlue}
                            />
                            <ThemedText
                              type="caption"
                              style={styles.abstractHeaderLabel}
                            >
                              Abstrak Penelitian
                            </ThemedText>
                            <IconSymbol
                              name={
                                abstractExpanded ? "chevron.up" : "chevron.down"
                              }
                              size={12}
                              color={Colors.accentBlue}
                            />
                          </View>
                          <ThemedText
                            type="caption"
                            style={styles.abstractText}
                            numberOfLines={abstractExpanded ? undefined : 2}
                          >
                            {localSubmission.research_upload.abstract}
                          </ThemedText>
                          {!abstractExpanded && (
                            <ThemedText
                              type="caption"
                              style={styles.abstractReadMore}
                            >
                              Ketuk untuk selengkapnya
                            </ThemedText>
                          )}
                        </Pressable>
                      ) : null}

                      <SubmissionDocumentRow
                        label="Ringkasan Penelitian"
                        url={localSubmission.research_upload.research_summary}
                      />
                      <SubmissionDocumentRow
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
                    /* Research upload form */
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
                            lineHeight: 18,
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
                              style={styles.fieldLabel}
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
                                style={styles.fieldError}
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
                              style={styles.fieldLabel}
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
                                style={styles.fieldError}
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
                              style={styles.fieldLabel}
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
                                style={({ pressed }) => [
                                  styles.researchPickButton,
                                  pressed && { opacity: 0.7 },
                                ]}
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
                            <ThemedText type="caption" style={styles.fieldHint}>
                              File PDF, maks. 2 MB.
                            </ThemedText>
                            {fieldState.error?.message && (
                              <ThemedText
                                type="caption"
                                style={styles.fieldError}
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
                              style={styles.fieldLabel}
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
                                style={({ pressed }) => [
                                  styles.researchPickButton,
                                  pressed && { opacity: 0.7 },
                                ]}
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
                            <ThemedText type="caption" style={styles.fieldHint}>
                              Gambar PNG atau JPG, maks. 2 MB.
                            </ThemedText>
                            {fieldState.error?.message && (
                              <ThemedText
                                type="caption"
                                style={styles.fieldError}
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
                          style={({ pressed }) => [
                            styles.researchSubmitButton,
                            researchUploading && { opacity: 0.6 },
                            pressed && !researchUploading && { opacity: 0.8 },
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
                            {researchUploading ? "Mengirim..." : "Kirim Hasil"}
                          </ThemedText>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </ThemedView>
              )}

              {/* Applicant Information (Accordion) */}
              <ThemedView
                style={[
                  styles.accordionCard,
                  { backgroundColor: sectionBackground },
                ]}
              >
                <Pressable
                  onPress={() => setProfileExpanded(!profileExpanded)}
                  style={({ pressed }) => [
                    styles.accordionHeader,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <ThemedText type="headline" style={{ fontWeight: "700" }}>
                      Informasi Pemohon
                    </ThemedText>
                    <ThemedText type="caption" style={{ color: tertiaryText }}>
                      {localSubmission.name}
                    </ThemedText>
                  </View>
                  <View style={styles.chevronCircle}>
                    <IconSymbol
                      name={profileExpanded ? "chevron.up" : "chevron.down"}
                      size={14}
                      color={Colors.accentBlue}
                    />
                  </View>
                </Pressable>

                {profileExpanded && (
                  <View style={styles.accordionBody}>
                    <DetailRow
                      label="Nama Lengkap"
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
                      label="Jenis Kelamin"
                      value={
                        localSubmission.gender === "pria"
                          ? "Laki-laki"
                          : "Perempuan"
                      }
                      tertiaryText={tertiaryText}
                    />
                    <DetailRow
                      label="Pendidikan Terakhir"
                      value={
                        localSubmission.last_education
                          ? localSubmission.last_education.toUpperCase()
                          : "-"
                      }
                      tertiaryText={tertiaryText}
                    />
                    <DetailRow
                      label="Pekerjaan"
                      value={localSubmission.occupation}
                      tertiaryText={tertiaryText}
                    />
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

// Detail Row Component
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
        style={[styles.detailLabel, { color: tertiaryText }]}
      >
        {label}
      </ThemedText>
      <ThemedText type="subheadline" style={{ fontWeight: "700" }}>
        {value && value.trim().length > 0 ? value : "-"}
      </ThemedText>
    </View>
  );
}

// Detail Column Component
function DetailColumn({
  label,
  value,
  tertiaryText,
}: {
  label: string;
  value?: string | null;
  tertiaryText: string;
}) {
  return (
    <View style={styles.detailColumn}>
      <ThemedText
        type="caption"
        style={[styles.detailLabel, { color: tertiaryText }]}
      >
        {label}
      </ThemedText>
      <ThemedText type="subheadline" style={{ fontWeight: "700" }}>
        {value && value.trim().length > 0 ? value : "-"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Modal Container */
  modalContainer: {
    paddingTop: 14,
    flex: 1,
  },

  /* Header */
  modalTopBar: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  headerTitleBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 136, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    padding: 4,
  },

  /* Content */
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 14,
  },

  /* Section Header (icon + label) */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontWeight: "700",
  },

  /* Cards */
  modalCard: {
    borderRadius: RADIUS.DEFAULT,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },

  /* Detail Rows/Columns */
  detailRow: {
    marginBottom: 4,
  },
  detailLabel: {
    marginBottom: 2,
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  detailColumn: {
    flex: 1,
  },
  gridContainer: {
    gap: 4,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  gridDivider: {
    height: 1,
    backgroundColor: Colors.light.fill.secondary,
    marginVertical: 8,
  },

  /* Abstract Card */
  abstractCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
  abstractHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  abstractHeaderLabel: {
    flex: 1,
    fontWeight: "700",
    color: Colors.accentBlue,
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  abstractText: {
    lineHeight: 18,
    color: Colors.light.text.primary,
  },
  abstractReadMore: {
    color: Colors.accentBlue,
    fontWeight: "600",
    marginTop: 4,
  },

  /* Revision Banner */
  revisionBanner: {
    flexDirection: "row",
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: Colors.notificationBadge.revision.background,
    borderWidth: 1,
    borderColor: Colors.notificationBadge.revision.stripe,
    overflow: "hidden",
  },
  revisionStripe: {
    width: 5,
    backgroundColor: Colors.notificationBadge.revision.stripe,
  },
  revisionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
  },

  /* Re-upload */
  reuploadSection: {
    marginTop: 8,
    paddingLeft: 4,
  },
  reuploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
    alignSelf: "flex-start",
  },
  reuploadConfirmation: {
    gap: 10,
  },
  pickedFileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  reuploadActions: {
    flexDirection: "row",
    gap: 8,
  },
  uploadConfirmButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Colors.accentBlue,
  },
  uploadCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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

  /* Accordion */
  accordionCard: {
    borderRadius: RADIUS.DEFAULT,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accordionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  countPill: {
    backgroundColor: Colors.accentBlue,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  countPillText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 10,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 136, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  accordionBody: {
    marginTop: 14,
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.fill.secondary,
  },

  /* Timeline */
  timelineCard: {
    borderRadius: RADIUS.DEFAULT,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
  timelineRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    paddingVertical: 12,
    marginTop: 4,
  },
  timelineNode: {
    alignItems: "center",
    flex: 1,
    zIndex: 1,
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.fill.vibrant.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: Colors.light.fill.vibrant.secondary,
    marginBottom: 6,
  },
  timelineCircleActive: {
    backgroundColor: Colors.accentBlue,
    borderColor: "rgba(0, 136, 255, 0.25)",
  },
  timelineCircleCompleted: {
    backgroundColor: Colors.accentGreen,
    borderColor: "rgba(52, 199, 89, 0.25)",
  },
  timelineSegment: {
    position: "absolute",
    top: 26,
    height: 3,
    borderRadius: 1.5,
    zIndex: 0,
  },
  timelineLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.light.text.secondary,
    textAlign: "center",
  },
  timelineLabelActive: {
    color: Colors.accentBlue,
    fontWeight: "700",
  },
  timelineLabelCompleted: {
    color: Colors.accentGreen,
    fontWeight: "700",
  },

  /* Status Badge */
  statusBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 10,
  },
  statusBadgeTextContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  /* Recommendation */
  recommendationBoxActive: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(52, 199, 89, 0.25)",
    backgroundColor: "rgba(52, 199, 89, 0.04)",
    gap: 14,
  },
  recommendationBoxDisabled: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    gap: 14,
  },
  recommendationHeaderRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  successIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockedIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.fill.tertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledActionButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.fill.secondary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  /* Research Form */
  researchForm: {
    gap: 14,
    marginTop: 8,
  },
  researchFormNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.notificationBadge.pending.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.notificationBadge.pending.stripe,
  },
  researchFieldGroup: {
    gap: 0,
  },
  fieldLabel: {
    fontWeight: "600",
    color: Colors.light.text.secondary,
    marginBottom: 6,
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  fieldHint: {
    color: Colors.light.text.tertiary,
    marginTop: 4,
  },
  fieldError: {
    color: Colors.accentRed,
    marginTop: 3,
  },
  researchInput: {
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.light.text.primary,
    backgroundColor: Colors.backgroundSecondary,
  },
  researchTextarea: {
    minHeight: 100,
    maxHeight: 180,
  },
  researchInputError: {
    borderColor: Colors.accentRed,
    borderWidth: 1.5,
  },
  researchPickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.accentBlue,
    alignSelf: "flex-start",
  },
  researchFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  researchSubmitButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: Colors.accentBlue,
  },
});
