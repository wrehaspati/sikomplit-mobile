import { applySubmission } from "@/api/submission-api";
import { FullscreenAlert } from "@/components/alert";
import Combobox from "@/components/combobox";
import DocumentRow from "@/components/document-row";
import ImagePreviewModal from "@/components/image-preview-modal";
import BottomSheetModal from "@/components/modal";
import SelectCard from "@/components/select-card";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PHONE_NUMBER } from "@/constants/contact-person";
import { Colors, RADIUS } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useSubmissions } from "@/contexts/submission-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ISubmissionPost } from "@/types/submission";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerChangeEvent,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Checkbox } from "expo-checkbox";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

// Define the structure of a selected file
type SelectedFile = {
  name: string;
  uri: string;
  size?: number | null;
  mimeType?: string | null;
};

// Define the options for the "Pendidikan Terakhir" field
const LastEducationOption = [
  { label: "SMA/SMK", value: "sma" },
  { label: "Diploma", value: "diploma" },
  { label: "S1", value: "s1" },
  { label: "S2", value: "s2" },
  { label: "S3", value: "s3" },
];

// Define the options for the "Pekerjaan" field
const OccupationOption = [
  { label: "Pegawai Negeri", value: "pns" },
  { label: "Pegawai Swasta", value: "swasta" },
  { label: "Wiraswasta", value: "wiraswasta" },
  { label: "Pelajar/Mahasiswa", value: "pelajar" },
  { label: "Dosen", value: "dosen" },
  { label: "Dokter", value: "dokter" },
  { label: "Lainnya", value: "lainnya" },
];

// Define the possible file field names
type FileFieldName =
  | "application_letter"
  | "research_proposal"
  | "ethics_clearance_letter"
  | "final_report_statement_letter";

// Define a base schema for file uploads
const fileBaseSchema = z.object({
  research_type_id: z
    .string()
    .min(1, { message: "Jenis penelitian wajib dipilih." }),
  application_letter: z.any(),
  research_proposal: z.any(),
  ethics_clearance_letter: z.any(),
  final_report_statement_letter: z.any(),
});

// Define the validation schema for the personal information section
const personalInfoSchema = z.object({
  name: z.string().trim().min(1, { message: "Nama lengkap harus diisi." }),
  email: z
    .email({ message: "Periksa kembali email yang Anda masukkan." })
    .trim(),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Nomor telepon minimal terdiri dari 10 karakter." })
    .max(15, { message: "Nomor telepon tidak boleh lebih dari 15 karakter." })
    .refine((value) => /^[0-9]+$/.test(value), {
      message: "Nomor telepon tidak boleh mengandung huruf atau simbol.",
    }),
  date_of_birth: z.date({ error: "Tanggal lahir harus diisi." }),
  gender: z.enum(["pria", "wanita"], {
    error: () => ({ message: "Jenis kelamin harus dipilih." }),
  }),
  last_education: z
    .string()
    .trim()
    .min(1, { message: "Pendidikan terakhir harus dipilih." }),
  occupation: z.string().trim().min(1, { message: "Pekerjaan harus dipilih." }),
  research_type_id: z
    .string()
    .min(1, { message: "Jenis penelitian wajib dipilih." }),
});

// Define a custom validation schema for file uploads
const fileSchema = fileBaseSchema.superRefine((data, ctx) => {
  const fileValid = (file: SelectedFile | undefined, maxSizeMB: number) => {
    if (!file) {
      return false;
    }

    const mimeType = file.mimeType;
    const size = file.size ?? 0;

    return (
      (mimeType === "application/pdf" ||
        mimeType === "image/jpeg" ||
        mimeType === "image/png" ||
        mimeType === "image/jpg") &&
      size <= maxSizeMB * 1024 * 1024
    );
  };

  if (!fileValid(data.application_letter, 2)) {
    ctx.addIssue({
      path: ["application_letter"],
      message:
        "Surat permohonan wajib dan harus berupa PDF/JPG/PNG maksimal 2MB",
      code: "custom",
    });
  }

  if (data.research_type_id !== "1" && !fileValid(data.research_proposal, 10)) {
    ctx.addIssue({
      path: ["research_proposal"],
      message: "Proposal penelitian harus berupa PDF/JPG/PNG maksimal 10MB",
      code: "custom",
    });
  }

  if (
    data.research_type_id !== "1" &&
    !fileValid(data.ethics_clearance_letter, 2)
  ) {
    ctx.addIssue({
      path: ["ethics_clearance_letter"],
      message: "Surat etik wajib dan harus berupa PDF/JPG/PNG maksimal 2MB",
      code: "custom",
    });
  }

  if (
    data.research_type_id !== "1" &&
    !fileValid(data.final_report_statement_letter, 2)
  ) {
    ctx.addIssue({
      path: ["final_report_statement_letter"],
      message:
        "Surat pernyataan wajib dan harus berupa PDF/JPG/PNG maksimal 2MB",
      code: "custom",
    });
  }
});

// Define the validation schema for the agreement checkboxes
const agreementSchema = z.object({
  agree1: z.boolean().refine((val) => val === true, "Harus disetujui"),
  agree2: z.boolean().refine((val) => val === true, "Harus disetujui"),
});

// Combine all the individual schemas
const FormSchema = [personalInfoSchema, fileSchema, agreementSchema] as const;

// Create an intersection of all the schemas
const fullSchema = z.intersection(
  z.intersection(FormSchema[0], FormSchema[1]),
  FormSchema[2],
);

// Infer the TypeScript type for the form data
export type FormDataType = z.infer<typeof fullSchema>;

export default function FormScreen() {
  const auth = useAuth();
  const submissionContext = useSubmissions();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text.primary");
  const today = new Date();
  const defaultBirthDate = new Date(2000, 0, 1);
  const [isLoading, setIsLoading] = useState(false);
  const [draftBirthDate, setDraftBirthDate] = useState<Date>(defaultBirthDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState(1);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [selectedRequestLetter, setRequestLetter] =
    useState<SelectedFile | null>(null);
  const [selectedProposalLetter, setProposalLetter] =
    useState<SelectedFile | null>(null);
  const [selectedConductLetter, setConductLetter] =
    useState<SelectedFile | null>(null);
  const [selectedStatementLetter, setStatementLetter] =
    useState<SelectedFile | null>(null);
  const [previewFile, setPreviewFile] = useState<SelectedFile | null>(null);

  // Initialize the form with react-hook-form
  const form = useForm<FormDataType>({
    resolver: zodResolver(fullSchema),
    mode: "onTouched",
    defaultValues: {
      name: auth?.state.user?.name,
      email: auth?.state.user?.email,
      phone: auth?.state.user?.phone || "",
      last_education: "",
      occupation: "",
      gender: undefined,
      date_of_birth: undefined,
      research_type_id: "",
      application_letter: undefined,
      research_proposal: undefined,
      ethics_clearance_letter: undefined,
      final_report_statement_letter: undefined,
      agree1: false,
      agree2: false,
    },
  });

  // Watch the selected research type to conditionally require certain file uploads
  const selectedPurpose = form.watch("research_type_id");

  // Handles date formatting for display
  const formatBirthDate = (value: Date | null) => {
    if (!value) return "Pilih tanggal lahir";
    return value.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Handles birth date picking
  const openBirthDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: birthDate ?? defaultBirthDate,
        mode: "date",
        display: "calendar",
        maximumDate: today,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === "set" && selectedDate) {
            form.setValue("date_of_birth", selectedDate, {
              shouldTouch: true,
              shouldDirty: true,
            });
            setBirthDate(selectedDate);
          }
        },
      });
      return;
    }
    setDraftBirthDate(birthDate ?? defaultBirthDate);
    setShowDatePicker(true);
  };

  // Handles date changes on iOS, updating the draft birth date state
  const handleIOSDateChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate: Date,
  ) => {
    if (selectedDate) {
      setDraftBirthDate(selectedDate);
    }
  };

  // Handles document picking for a specific field
  const pickDocument = async (
    fieldName: FileFieldName,
    setSelectedFile: React.Dispatch<React.SetStateAction<SelectedFile | null>>,
  ) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const file = result.assets[0];
    let fileUri = file.uri;
    let fileSize = file.size;

    // Compress if it's an image and size > 2MB
    if (
      file.mimeType?.startsWith("image/") &&
      fileSize &&
      fileSize > 2 * 1024 * 1024
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

    const selectedFile = {
      name: file.name ?? "Berkas tidak bernama",
      uri: fileUri,
      size: fileSize,
      mimeType: file.mimeType,
    };

    setSelectedFile(selectedFile);
    form.setValue(fieldName, selectedFile, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Handles camera capture for a specific field
  const takePhoto = async (
    fieldName: FileFieldName,
    setSelectedFile: React.Dispatch<React.SetStateAction<SelectedFile | null>>,
  ) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
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

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const file = result.assets[0];
    let fileUri = file.uri;
    let fileSize = file.fileSize;

    // Compress if size > 2MB
    if (fileSize && fileSize > 2 * 1024 * 1024) {
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

    const selectedFile = {
      name: file.fileName ?? `photo_${Date.now()}.jpg`,
      uri: fileUri,
      size: fileSize,
      mimeType: file.mimeType ?? "image/jpeg",
    };

    setSelectedFile(selectedFile);
    form.setValue(fieldName, selectedFile, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Handles file card rendering
  const fileCard = (selectedFile: SelectedFile | null) => {
    if (!selectedFile) {
      return (
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
      );
    }

    return (
      <Pressable
        style={({ pressed }) => [
          styles.fileCard,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => setPreviewFile(selectedFile)}
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
              {`${selectedFile.mimeType ?? "Jenis file tidak terdeteksi"}${selectedFile.size ? ` · ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ""}`}
            </ThemedText>
          </View>
          <View style={{ alignItems: "center" }}>
            <IconSymbol name="eye.fill" size={20} color={Colors.light.tint} />
            <ThemedText
              type="caption"
              style={{ color: Colors.light.tint, marginTop: 4 }}
            >
              Lihat
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  const UploadActionButtons = ({
    onPickDocument,
    onTakePhoto,
  }: {
    onPickDocument: () => void;
    onTakePhoto?: () => void;
  }) => {
    return (
      <View style={{ flexDirection: "row", gap: 8 }}>
        <ThemedButton
          variant="primary"
          size="small"
          icon={<IconSymbol name="doc.fill" size={18} color="white" />}
          onPress={onPickDocument}
          style={{ flex: 1, justifyContent: "center" }}
        >
          Pilih file
        </ThemedButton>
        {onTakePhoto && (
          <ThemedButton
            variant="outlineSecondary"
            size="small"
            icon={
              <IconSymbol
                name="camera.fill"
                size={18}
                color={Colors.light.text.primary}
              />
            }
            onPress={onTakePhoto}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Ambil Foto
          </ThemedButton>
        )}
      </View>
    );
  };

  // Handles step navigation in the form
  const changeStep = async (newStep: number) => {
    if (newStep < step) {
      setStep(newStep);
      return;
    }

    const stepFields: Record<number, string[]> = {
      1: [
        "name",
        "email",
        "phone",
        "national_identity_number",
        "date_of_birth",
        "gender",
        "last_education",
        "occupation",
        "research_type_id",
      ],
      2: [
        "application_letter",
        "research_proposal",
        "ethics_clearance_letter",
        "final_report_statement_letter",
      ],
      3: ["agree1", "agree2"],
    };

    const currentFields = stepFields[step] ?? [];
    const isValid = await form.trigger(currentFields as any, {
      shouldFocus: true,
    });

    if (isValid && newStep !== step) {
      setStep(newStep);
    }

    return;
  };

  // Handling form submission
  const onSubmit = async (data: FormDataType) => {
    try {
      const payload: ISubmissionPost = {
        research_type_id: data.research_type_id,
        application_letter: data.application_letter,
        research_proposal: data.research_proposal,
        ethics_clearance_letter: data.ethics_clearance_letter,
        final_report_statement_letter: data.final_report_statement_letter,
        name: data.name,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.date_of_birth.toISOString().split("T")[0],
        gender: data.gender,
        last_education: data.last_education,
        occupation: data.occupation,
      };
      setIsLoading(true);
      applySubmission(payload);
      submissionContext?.refreshAllSubmissions();
      form.reset();
      FullscreenAlert({
        title: "Berhasil Terkirim",
        description:
          "Rekomendasi penelitian telah berhasil diajukan. Permohonan akan diproses selama 3 hari kerja. Silakan untuk selalu mengecek status pengajuan.",
        type: "success",
        buttonHref: "/",
        buttonText: "Kembali ke Beranda",
      });
    } catch (error) {
      console.error(
        "Submission failed:",
        (error as any).response?.data?.message || error,
      );
      Alert.alert(
        "Error",
        "Terjadi kesalahan saat mengajukan rekomendasi. Silakan coba lagi nanti.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        style={{ paddingVertical: 20, backgroundColor: backgroundColor }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ gap: 8, paddingHorizontal: 24, paddingBottom: 100 }}>
          {/* Header */}
          <ThemedView style={[styles.card, { gap: 8, marginBottom: 8 }]}>
            <ThemedText type="title4" style={{}}>
              Formulir Rekomendasi Penelitian
            </ThemedText>
            <ThemedText
              type="subheadline"
              darkColor={Colors.dark.text.secondary}
              lightColor={Colors.light.text.secondary}
              style={{ textAlign: "left" }}
            >
              Silakan isi formulir di bawah ini untuk mengajukan rekomendasi.
              Rekomendasi akan kami proses dalam waktu 1x24 jam, dan selesai
              dalam waktu 3 Hari Kerja. Pastikan semua informasi yang Anda
              berikan akurat dan lengkap untuk mempercepat proses pengajuan.
            </ThemedText>
            <ThemedText
              type="subheadline"
              darkColor={Colors.dark.text.secondary}
              lightColor={Colors.light.text.secondary}
              style={{ textAlign: "left" }}
            >
              Jika Anda memiliki pertanyaan atau membutuhkan bantuan, hubungi
              kami melalui tombol Whatsapp di bawah.
            </ThemedText>
            <ThemedButton
              variant="outlineSecondary"
              icon={
                <Image
                  source={require("@/assets/images/whatsapp.png")}
                  style={{
                    width: 20,
                    height: 20,
                    marginEnd: 4,
                    marginStart: -2,
                  }}
                />
              }
              size="small"
              style={{ alignSelf: "flex-start" }}
              onPress={() => {
                Linking.openURL(
                  `http://api.whatsapp.com/send?phone=${PHONE_NUMBER}`,
                );
              }}
            >
              Whatsapp
            </ThemedButton>
            <ThemedText
              type="caption"
              darkColor={Colors.accentRed}
              lightColor={Colors.accentRed}
            >
              Kolom *) wajib diisi
            </ThemedText>
          </ThemedView>

          {/* Step 1 Fields */}
          {step === 1 && (
            <View style={{ gap: 16 }}>
              {/* Email */}
              <ThemedView style={styles.card}>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <ThemedTextInput
                      title="Email"
                      variant="transparent"
                      placeholder="Masukan email"
                      value={field.value}
                      onChangeText={field.onChange}
                      errorMessage={fieldState.error?.message}
                      autoComplete="email"
                      keyboardType="email-address"
                      lightColor={backgroundColor}
                      darkColor={backgroundColor}
                      underline
                      required
                    />
                  )}
                />
              </ThemedView>
              {/* Nama Lengkap */}
              <ThemedView style={styles.card}>
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <ThemedTextInput
                      title="Nama Lengkap"
                      variant="transparent"
                      placeholder="Masukan nama lengkap"
                      value={field.value}
                      onChangeText={field.onChange}
                      autoComplete="name"
                      lightColor={backgroundColor}
                      darkColor={backgroundColor}
                      underline
                      errorMessage={fieldState.error?.message}
                      required
                    />
                  )}
                />
              </ThemedView>
              {/* Nomor Telepon */}
              <ThemedView style={styles.card}>
                <Controller
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <ThemedTextInput
                      title="Nomor Telepon"
                      variant="transparent"
                      placeholder="Masukan nomor telepon"
                      value={field.value}
                      onChangeText={field.onChange}
                      autoComplete="tel"
                      onBlur={() => {
                        field.onBlur();
                        form.trigger("phone");
                      }}
                      keyboardType="phone-pad"
                      lightColor={backgroundColor}
                      darkColor={backgroundColor}
                      errorMessage={fieldState.error?.message}
                      underline
                      required
                    />
                  )}
                />
              </ThemedView>
              {/* Tanggal Lahir */}
              <ThemedView style={styles.card}>
                <Controller
                  control={form.control}
                  name="date_of_birth"
                  render={({ field, fieldState }) => (
                    <>
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ marginBottom: 8 }}
                      >
                        Tanggal Lahir
                        <Text style={{ color: Colors.accentRed }}>{" *"}</Text>
                      </ThemedText>
                      <Pressable
                        accessibilityRole="button"
                        onPress={openBirthDatePicker}
                        style={({ pressed }) => [
                          styles.dateField,
                          fieldState.error
                            ? { borderColor: Colors.accentRed, borderWidth: 1 }
                            : null,
                          { backgroundColor },
                          pressed && styles.dateFieldPressed,
                        ]}
                      >
                        <View style={styles.dateFieldContent}>
                          <ThemedText
                            type={"default"}
                            lightColor={
                              field.value
                                ? undefined
                                : Colors.light.text.secondary
                            }
                            darkColor={
                              field.value
                                ? undefined
                                : Colors.dark.text.secondary
                            }
                          >
                            {formatBirthDate(field.value)}
                          </ThemedText>
                          <ThemedText
                            lightColor={Colors.light.text.secondary}
                            darkColor={Colors.dark.text.secondary}
                          >
                            ▾
                          </ThemedText>
                        </View>
                      </Pressable>
                      {fieldState.error?.message && (
                        <Text
                          style={{
                            marginTop: 4,
                            color: Colors.accentRed,
                            fontSize: 12,
                          }}
                        >
                          {fieldState.error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </ThemedView>
              {/* Jenis Kelamin */}
              <ThemedView style={styles.card}>
                <Controller
                  control={form.control}
                  name="gender"
                  render={({ field, fieldState }) => (
                    <>
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ marginBottom: 8 }}
                      >
                        Jenis Kelamin
                        <Text style={{ color: Colors.accentRed }}>{" *"}</Text>
                      </ThemedText>
                      <SelectCard
                        options={[
                          { label: "Laki-laki", value: "pria" },
                          { label: "Perempuan", value: "wanita" },
                        ]}
                        selectedValue={field.value}
                        onError={!!fieldState.error}
                        onValueChange={field.onChange}
                      />
                      {fieldState.error?.message && (
                        <Text
                          style={{
                            marginTop: 4,
                            color: Colors.accentRed,
                            fontSize: 12,
                          }}
                        >
                          {fieldState.error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </ThemedView>
              {/* Pendidikan Terakhir */}
              <ThemedView style={styles.card}>
                <Controller
                  control={form.control}
                  name="last_education"
                  render={({ field, fieldState }) => (
                    <>
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ marginBottom: 8 }}
                      >
                        Pendidikan Terakhir
                        <Text style={{ color: Colors.accentRed }}>{" *"}</Text>
                      </ThemedText>
                      <SelectCard
                        options={LastEducationOption}
                        onError={!!fieldState.error}
                        selectedValue={field.value}
                        onValueChange={field.onChange}
                      />
                    </>
                  )}
                />
              </ThemedView>
              {/* Pekerjaan */}
              <ThemedView style={styles.card}>
                <Controller
                  control={form.control}
                  name="occupation"
                  render={({ field, fieldState }) => (
                    <>
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ marginBottom: 8 }}
                      >
                        Pekerjaan
                        <Text style={{ color: Colors.accentRed }}>{" *"}</Text>
                      </ThemedText>
                      <Combobox
                        options={OccupationOption}
                        selectedValue={field.value}
                        onValueChange={field.onChange}
                        errorMessage={fieldState.error?.message}
                        placeholder="Pilih pekerjaan"
                        searchPlaceholder="Cari pekerjaan"
                        titlePlaceholder="Pilih Pekerjaan Anda"
                      />
                    </>
                  )}
                />
              </ThemedView>
              {/* Pekerjaan */}
              <ThemedView style={styles.card}>
                <Controller
                  control={form.control}
                  name="research_type_id"
                  render={({ field, fieldState }) => (
                    <>
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ marginBottom: 8 }}
                      >
                        Tujuan Pengajuan
                        <Text style={{ color: Colors.accentRed }}>{" *"}</Text>
                      </ThemedText>
                      <SelectCard
                        options={[
                          {
                            label: "Permohonan Data Awal/Studi Pendahuluan",
                            value: "1",
                          },
                          { label: "Penelitian Tugas Akhir", value: "2" },
                          {
                            label: "Penelitian dengan pendanaan APBD/APBN",
                            value: "3",
                          },
                          {
                            label: "Penelitian mendapatkan SKP dari DPMPTSP",
                            value: "4",
                          },
                        ]}
                        selectedValue={field.value}
                        column={1}
                        onError={!!fieldState.error}
                        textAlign="flex-start"
                        onValueChange={field.onChange}
                      />
                      {fieldState.error?.message && (
                        <Text
                          style={{
                            marginTop: 4,
                            color: Colors.accentRed,
                            fontSize: 12,
                          }}
                        >
                          {fieldState.error.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </ThemedView>
              {/* Birthdate Modal */}
              <Modal
                animationType="fade"
                transparent
                visible={showDatePicker}
                onRequestClose={() => setShowDatePicker(false)}
              >
                <Pressable
                  style={styles.modalBackdrop}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Pressable
                    style={[styles.modalSheet, { backgroundColor }]}
                    onPress={() => undefined}
                  >
                    <SafeAreaView>
                      <View style={styles.modalHeader}>
                        <Pressable
                          onPress={() => setShowDatePicker(false)}
                          hitSlop={10}
                        >
                          <ThemedText
                            type="defaultSemiBold"
                            lightColor={Colors.light.text.secondary}
                            darkColor={Colors.dark.text.secondary}
                          >
                            Batal
                          </ThemedText>
                        </Pressable>
                        <ThemedText type="defaultSemiBold">
                          Pilih tanggal lahir
                        </ThemedText>
                        <Pressable
                          onPress={() => {
                            form.setValue("date_of_birth", draftBirthDate, {
                              shouldTouch: true,
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                            setBirthDate(draftBirthDate);
                            setShowDatePicker(false);
                          }}
                          hitSlop={10}
                        >
                          <ThemedText
                            type="defaultSemiBold"
                            lightColor={Colors.accentBlue}
                            darkColor={Colors.accentBlue}
                          >
                            Simpan
                          </ThemedText>
                        </Pressable>
                      </View>
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <DateTimePicker
                          value={draftBirthDate}
                          mode="date"
                          display="spinner"
                          onValueChange={handleIOSDateChange}
                          maximumDate={today}
                          style={{ backgroundColor }}
                          textColor={textColor}
                        />
                      </View>
                    </SafeAreaView>
                  </Pressable>
                </Pressable>
              </Modal>
            </View>
          )}

          {/* Step 2 Fields */}
          {step === 2 && (
            <View style={{ gap: 8 }}>
              <ThemedView style={[styles.card, { gap: 14 }]}>
                <View style={{ gap: 4 }}>
                  <ThemedText type="defaultSemiBold">
                    Surat Permohonan Rekomendasi
                    <Text style={{ color: Colors.accentRed }}>{" *"}</Text>
                  </ThemedText>
                  <ThemedText
                    type="subheadline"
                    darkColor={Colors.dark.text.secondary}
                    lightColor={Colors.light.text.secondary}
                  >
                    Unggah berkas dalam format JPG/PDF, dengan ukuran maksimal 2
                    MB.
                  </ThemedText>
                </View>
                <UploadActionButtons
                  onPickDocument={() =>
                    pickDocument("application_letter", setRequestLetter)
                  }
                  onTakePhoto={() =>
                    takePhoto("application_letter", setRequestLetter)
                  }
                />
                {fileCard(selectedRequestLetter)}
                {form.formState.errors.application_letter?.message && (
                  <ThemedText
                    type="caption"
                    style={{ color: Colors.accentRed, marginTop: -6 }}
                  >
                    {form.formState.errors.application_letter.message as string}
                  </ThemedText>
                )}
              </ThemedView>
              {selectedPurpose !== "1" && (
                <View style={{ gap: 8 }}>
                  <ThemedView style={[styles.card, { gap: 14 }]}>
                    <View style={{ gap: 4 }}>
                      <ThemedText type="defaultSemiBold">
                        Surat Proposal Penelitian
                        <Text style={{ color: Colors.accentRed }}>{" *"}</Text>
                      </ThemedText>
                      <ThemedText
                        type="subheadline"
                        darkColor={Colors.dark.text.secondary}
                        lightColor={Colors.light.text.secondary}
                      >
                        Unggah berkas dalam format PDF, dengan ukuran maksimal
                        10 MB.
                      </ThemedText>
                    </View>
                    <UploadActionButtons
                      onPickDocument={() =>
                        pickDocument("research_proposal", setProposalLetter)
                      }
                    />
                    {fileCard(selectedProposalLetter)}
                    {form.formState.errors.research_proposal?.message && (
                      <ThemedText
                        type="caption"
                        style={{ color: Colors.accentRed, marginTop: -6 }}
                      >
                        {
                          form.formState.errors.research_proposal
                            .message as string
                        }
                      </ThemedText>
                    )}
                  </ThemedView>
                  <ThemedView style={[styles.card, { gap: 14 }]}>
                    <View style={{ gap: 4 }}>
                      <ThemedText type="defaultSemiBold">
                        Surat Keterangan Etik
                        <Text style={{ color: Colors.accentRed }}>{" *"}</Text>
                      </ThemedText>
                      <ThemedText
                        type="subheadline"
                        darkColor={Colors.dark.text.secondary}
                        lightColor={Colors.light.text.secondary}
                      >
                        Unggah berkas dalam format PDF, dengan ukuran maksimal 2
                        MB.
                      </ThemedText>
                    </View>
                    <UploadActionButtons
                      onPickDocument={() =>
                        pickDocument(
                          "ethics_clearance_letter",
                          setConductLetter,
                        )
                      }
                      onTakePhoto={() =>
                        takePhoto("ethics_clearance_letter", setConductLetter)
                      }
                    />
                    {fileCard(selectedConductLetter)}
                    {form.formState.errors.ethics_clearance_letter?.message && (
                      <ThemedText
                        type="caption"
                        style={{ color: Colors.accentRed, marginTop: -6 }}
                      >
                        {
                          form.formState.errors.ethics_clearance_letter
                            .message as string
                        }
                      </ThemedText>
                    )}
                  </ThemedView>
                  <ThemedView style={[styles.card, { gap: 14 }]}>
                    <View style={{ gap: 4 }}>
                      <ThemedText type="defaultSemiBold">
                        Surat Pernyataan Laporan Akhir
                        <Text style={{ color: Colors.accentRed }}>{" *"}</Text>
                      </ThemedText>
                      <ThemedText
                        type="subheadline"
                        darkColor={Colors.dark.text.secondary}
                        lightColor={Colors.light.text.secondary}
                      >
                        Unggah berkas dalam format PDF, dengan ukuran maksimal 2
                        MB.
                      </ThemedText>
                    </View>
                    <UploadActionButtons
                      onPickDocument={() =>
                        pickDocument(
                          "final_report_statement_letter",
                          setStatementLetter,
                        )
                      }
                      onTakePhoto={() =>
                        takePhoto(
                          "final_report_statement_letter",
                          setStatementLetter,
                        )
                      }
                    />
                    {fileCard(selectedStatementLetter)}
                    {form.formState.errors.final_report_statement_letter
                      ?.message && (
                      <ThemedText
                        type="caption"
                        style={{ color: Colors.accentRed, marginTop: -6 }}
                      >
                        {
                          form.formState.errors.final_report_statement_letter
                            .message as string
                        }
                      </ThemedText>
                    )}
                  </ThemedView>
                </View>
              )}
            </View>
          )}

          {/* Step 3 Fields */}
          {step === 3 && (
            <View style={{ gap: 8 }}>
              <ThemedView style={[styles.card, { gap: 16 }]}>
                <ThemedText type="subheadline">
                  Dengan mengisi formulir ini, Anda menyetujui syarat dan
                  ketentuan yang berlaku. Pastikan semua informasi yang Anda
                  berikan akurat dan lengkap untuk mempercepat proses pengajuan.
                  Pengajuan akan kami proses dalam waktu 1x24 jam, dan selesai
                  dalam waktu 3 Hari Kerja.
                </ThemedText>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <Controller
                    control={form.control}
                    name="agree1"
                    render={({ field }) => {
                      return (
                        <>
                          <Checkbox
                            hitSlop={10}
                            value={field.value}
                            onValueChange={field.onChange}
                            style={{ marginTop: 4 }}
                          />
                          <Pressable
                            style={{ flex: 1, minWidth: 0 }}
                            onPress={() => {
                              field.onChange(!field.value);
                            }}
                          >
                            <ThemedText
                              type="subheadline"
                              darkColor={Colors.dark.text.secondary}
                              lightColor={Colors.light.text.secondary}
                            >
                              Saya mengetahui bahwa proses pengajuan membutuhkan
                              waktu maximal 3 hari kerja
                            </ThemedText>
                          </Pressable>
                        </>
                      );
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <Controller
                    control={form.control}
                    name="agree2"
                    render={({ field }) => {
                      return (
                        <>
                          <Checkbox
                            hitSlop={10}
                            value={field.value}
                            onValueChange={field.onChange}
                            style={{ marginTop: 4 }}
                          />
                          <Pressable
                            style={{ flex: 1, minWidth: 0 }}
                            onPress={() => {
                              field.onChange(!field.value);
                            }}
                          >
                            <ThemedText
                              type="subheadline"
                              darkColor={Colors.dark.text.secondary}
                              lightColor={Colors.light.text.secondary}
                            >
                              Saya menyetujui bahwa segala bentuk pengajuan ini
                              akan menjadi hak milik dinas
                            </ThemedText>
                          </Pressable>
                        </>
                      );
                    }}
                  />
                </View>
              </ThemedView>
            </View>
          )}

          {/* Step Indicator & Button */}
          <View style={{ marginStart: 20 }}>
            <ThemedText
              type="subheadline"
              darkColor={Colors.dark.text.secondary}
              lightColor={Colors.light.text.secondary}
            >
              Langkah {step} dari 3
            </ThemedText>
          </View>
          <View
            style={{
              marginTop: 4,
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
            }}
          >
            {step > 1 && (
              <ThemedButton
                variant="secondary"
                onPress={() => {
                  if (step > 1) {
                    changeStep(step - 1);
                  }
                }}
              >
                Kembali
              </ThemedButton>
            )}
            {step < 3 && (
              <ThemedButton
                variant="primary"
                onPress={() => {
                  if (step < 3) {
                    changeStep(step + 1);
                  }
                }}
              >
                Selanjutnya
              </ThemedButton>
            )}
            {step === 3 && (
              <ThemedButton
                variant="primary"
                disabled={isLoading}
                onPress={() => {
                  form.handleSubmit(onSubmit)();
                }}
              >
                {isLoading ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <ThemedText type="defaultSemiBold"> </ThemedText>
                    <ActivityIndicator size="small" color="white" />
                    <ThemedText type="defaultSemiBold"> </ThemedText>
                  </View>
                ) : (
                  "Kirim"
                )}
              </ThemedButton>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={!!previewFile && !!previewFile.mimeType?.startsWith("image/")}
        uri={previewFile?.uri}
        onClose={() => setPreviewFile(null)}
      />

      {/* PDF Preview Modal */}
      <BottomSheetModal
        visible={!!previewFile && previewFile.mimeType === "application/pdf"}
        title="Preview Dokumen"
        onClose={() => setPreviewFile(null)}
        height="35%"
      >
        <View style={{ paddingTop: 16 }}>
          <ThemedText
            type="caption"
            darkColor={Colors.dark.text.secondary}
            lightColor={Colors.light.text.secondary}
            style={{ marginBottom: 16 }}
          >
            Ketuk dokumen di bawah ini untuk melihat isinya melalui aplikasi
            penampil dokumen di perangkat Anda.
          </ThemedText>
          {previewFile && (
            <DocumentRow
              label={previewFile.name}
              url={previewFile.uri}
              downloadProgressMap={{}}
              onPress={async () => {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(previewFile.uri);
                } else {
                  Alert.alert(
                    "Gagal",
                    "Perangkat Anda tidak mendukung fitur berbagi/membuka file ini.",
                  );
                }
              }}
            />
          )}
        </View>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.DEFAULT,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
  },
  dateField: {
    borderRadius: RADIUS.DEFAULT,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  dateFieldPressed: {
    opacity: 0.85,
  },
  dateFieldContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  fileCard: {
    borderRadius: RADIUS.DEFAULT,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
});
