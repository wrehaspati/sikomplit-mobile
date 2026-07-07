import DocumentRow from "@/components/document-row";
import HomepageScrollView from "@/components/homapage-scroll-view";
import ImagePreviewModal from "@/components/image-preview-modal";
import BottomSheetModal from "@/components/modal";
import NotificationModal from "@/components/notification-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { EMAIL, PHONE_NUMBER } from "@/constants/contact-person";
import { Colors, RADIUS, SCREEN_MARGIN_HORIZONTAL } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useSubmissions } from "@/contexts/submission-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { downloadAndOpenDocument } from "@/services/document";
import { formatDate } from "@/services/format-date";
import { shortResearchType } from "@/services/format-text";
import { ISubmissionData } from "@/types/submission";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as MailComposer from "expo-mail-composer";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import NotificationCard from "../../components/notification-card";
import { getStatusMeta } from "./notification";

// CONSTANT VALUE
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FIRST_CARD_HEIGHT = SCREEN_WIDTH * 1;
const SECTION_GAP = 24;
const CHEVRON_SIZE = Platform.OS === "ios" ? 12 : 16;

// Interface for guide document structure
interface IGuideDocument {
  name: string;
  uri: string;
}

// Video source for tutorial
const videoSource = "https://admin.sikomplit.com/sample.mp4";

// List of guide documents
const guideDoc: IGuideDocument[] = [
  {
    name: "Surat Pernyataan Tugas Akhir",
    uri: "https://sikomplit.com/assets/file/surat-pernyataan-laporan-akhir.docx",
  },
];

const SUBMISSION_STEPS = [
  {
    id: 1,
    title: "Ajukan Surat",
    description: "Isi form dan upload berkas pendukung",
    icon: "document.fill",
  },
  {
    id: 2,
    title: "Tunggu 3 Hari",
    description: "Verifikasi oleh petugas terkait",
    icon: "clock.fill",
  },
  {
    id: 3,
    title: "Surat Diterbitkan",
    description: "Unduh surat pengesahan Anda",
    icon: "checkmark.seal.fill",
  },
  {
    id: 4,
    title: "Lakukan Penelitian",
    description: "Selesaikan riset atau observasi",
    icon: "magnifyingglass",
  },
  {
    id: 5,
    title: "Kirimkan Hasil",
    description: "Unggah dokumen laporan akhir",
    icon: "paperplane.fill",
  },
] as const;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const auth = useAuth();
  const submissions = useSubmissions();
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "background");
  const iconBackground = useThemeColor({}, "icon");
  const theme = Colors[isDark ? "dark" : "light"];
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | undefined>(undefined);
  const [openModal, setOpenModal] = useState(false);
  const [downloadProgressMap, setDownloadProgressMap] = useState<
    Record<string, number>
  >({});
  const [selectedSubmission, setSelectedSubmission] =
    useState<ISubmissionData | null>(null);
  const userSubmissions = submissions?.userSubmissions ?? [];
  const flyers = submissions?.poster ?? [];
  const refreshing =
    (submissions?.isRefreshingPublished ?? false) ||
    (submissions?.isRefreshingUser ?? false) ||
    (submissions?.isRefreshingPoster ?? false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flyerPressAnim = useRef(new Animated.Value(0)).current;
  const appVersion = Constants.expoConfig?.version ?? "Unknown";

  // Animations for Pustaka Digital Flyers
  const pressTranslateLeft = flyerPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });
  const pressTranslateRight = flyerPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });
  const pressScaleCenter = flyerPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });
  const params = useLocalSearchParams<{ request_number?: string }>();
  const requestNumberParam = params.request_number;

  // Open notification modal if request_number parameter is present
  useEffect(() => {
    if (requestNumberParam && userSubmissions.length > 0) {
      const submission = userSubmissions.find(
        (item) => item.request_number === requestNumberParam,
      );
      if (submission) {
        setSelectedSubmission(submission);
        // Clear parameter from URL so it doesn't pop up again
        router.setParams({ request_number: undefined });
      }
    }
  }, [requestNumberParam, userSubmissions]);

  // Close details modal when context starts refreshing
  useEffect(() => {
    if (refreshing) {
      setSelectedSubmission(null);
    }
  }, [refreshing]);

  // Prefetch flyer images on data load for instant display
  useEffect(() => {
    if (flyers.length === 0) return;
    flyers.forEach((item) => {
      if (item.image_url) {
        Image.prefetch(item.image_url);
      }
    });
  }, [flyers]);

  // Handler for pull-to-refresh action
  const handleRefresh = async () => {
    await submissions?.refreshAllSubmissions();
  };

  // Initialize video player
  const player = useVideoPlayer(videoSource, (player) => {
    // no additional configuration needed for now
  });

  // Function to validate if a string is a valid HTTP URL
  const isValidHttpUrl = (value?: string | null) => {
    if (!value) return false;
    return /^https?:\/\//i.test(value);
  };

  // Function to open a document URL using authenticated download + open
  const openDocument = async (url?: string | null) => {
    if (!isValidHttpUrl(url)) {
      Alert.alert(
        "Dokumen tidak tersedia",
        "Tautan dokumen tidak valid atau belum tersedia.",
      );
      return;
    }

    const safeUrl = url as string;

    try {
      setDownloadProgressMap((s) => ({ ...s, [safeUrl]: 0 }));
      await downloadAndOpenDocument(safeUrl, (p) => {
        setDownloadProgressMap((s) => ({ ...s, [safeUrl]: p }));
      });
      setDownloadProgressMap((s) => {
        const copy = { ...s };
        delete copy[safeUrl];
        return copy;
      });
    } catch {
      setDownloadProgressMap((s) => {
        const copy = { ...s };
        if (safeUrl in copy) delete copy[safeUrl];
        return copy;
      });
      Alert.alert("Gagal membuka dokumen", "Silakan coba lagi beberapa saat.");
    }
  };

  // History Card Component
  const HistoryCard = ({ submission }: { submission: ISubmissionData }) => {
    const statusTone = getStatusMeta(submission.progress_status);
    return (
      <View
        style={{
          width: SCREEN_WIDTH - 2 * SCREEN_MARGIN_HORIZONTAL,
        }}
        key={submission.id}
      >
        <NotificationCard
          backgroundColor={cardBackground}
          createdAtLabel={formatDate(submission.updated_at)}
          statusLabel={submission.progress_status}
          title={shortResearchType(submission.research_type)}
          subtitle={`#${submission.request_number} - ${submission.research_upload?.title ?? submission.created_at}`}
          footerLabel="Ketuk untuk melihat detail pengajuan"
          statusTone={statusTone}
          onPress={() => setSelectedSubmission(submission)}
        />
      </View>
    );
  };

  return (
    <HomepageScrollView
      scrollYValue={scrollY}
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Content */}

      {/* Quick Access Section */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickAccessContainer}
          snapToAlignment="center"
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH - SCREEN_MARGIN_HORIZONTAL}
        >
          {auth?.state.user &&
            [...userSubmissions]
              .sort(
                (a, b) =>
                  new Date(b.updated_at).getTime() -
                  new Date(a.updated_at).getTime(),
              )
              .slice(0, 3)
              .map((element) => (
                <HistoryCard key={element.id} submission={element} />
              ))
              .concat(
                userSubmissions.length === 0 ? (
                  <ThemedView
                    key="empty-history"
                    style={[
                      styles.card,
                      styles.emptyHistoryCard,
                      { borderColor: backgroundColor },
                    ]}
                    lightColor={cardBackground}
                    darkColor={cardBackground}
                  >
                    <ThemedText
                      type="subheadline"
                      style={{ fontWeight: "600" }}
                    >
                      Belum Ada Pengajuan
                    </ThemedText>
                    <ThemedText
                      type="footnote"
                      style={{ textAlign: "center" }}
                      darkColor={Colors.dark.text.secondary}
                      lightColor={Colors.light.text.secondary}
                    >
                      Notifikasi pengingat akan muncul di sini setelah
                      mengajukan permohonan rekomendasi penelitian.
                    </ThemedText>
                    <Pressable
                      onPress={() => router.push("/form")}
                      hitSlop={10}
                      style={{ marginTop: 12 }}
                    >
                      <ThemedText
                        type="defaultSemiBold"
                        lightColor={Colors.accentBlue}
                        darkColor={Colors.accentBlue}
                      >
                        Ajukan Sekarang
                      </ThemedText>
                    </Pressable>
                  </ThemedView>
                ) : (
                  []
                ),
              )}
          {/* Spacer to fix Android ScrollView paddingRight bug */}
          <View style={{ width: SCREEN_MARGIN_HORIZONTAL - 12 }} />
        </ScrollView>
      </View>
      {/* End Quick Access Section */}

      {/* Highlight Section */}
      <Pressable
        onPress={() => router.push("/library")}
        onPressIn={() => {
          Animated.spring(flyerPressAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(flyerPressAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }}
        style={{
          marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
          marginBottom: SECTION_GAP,
        }}
      >
        <LinearGradient
          colors={["#003f87", "#115cb9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: RADIUS.DEFAULT,
            padding: 24,
            overflow: "hidden",
            position: "relative",
            minHeight: 250,
          }}
        >
          {/* Decorative background blur */}
          <View
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 100,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              zIndex: 10,
            }}
          >
            <View>
              <ThemedText
                type="title3"
                style={{ color: "#fff", marginBottom: 4 }}
              >
                Pilihan Terbaik
              </ThemedText>
              <ThemedText type="subheadline" style={{ color: "#acc7ff" }}>
                Jelajahi Pustaka Digital
              </ThemedText>
            </View>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: RADIUS.DEFAULT,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="arrow.forward" size={20} color="#fff" />
            </View>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: 20,
              zIndex: 10,
            }}
          >
            <View
              style={{
                position: "relative",
                width: "100%",
                height: 190,
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {flyers && flyers.length > 2 && (
                <Animated.View
                  style={{
                    position: "absolute",
                    width: 130,
                    height: 190,
                    borderRadius: 4,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.2)",
                    transform: [
                      { rotate: "6deg" },
                      { translateX: 30 },
                      { translateX: pressTranslateRight },
                    ],
                    opacity: 0.6,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.4,
                    shadowRadius: 24,
                  }}
                >
                  <Image
                    source={{ uri: flyers[2].image_url }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Animated.View>
              )}
              {flyers && flyers.length > 1 && (
                <Animated.View
                  style={{
                    position: "absolute",
                    width: 130,
                    height: 190,
                    borderRadius: 4,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    transform: [
                      { rotate: "-6deg" },
                      { translateX: -30 },
                      { translateX: pressTranslateLeft },
                    ],
                    opacity: 0.8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.4,
                    shadowRadius: 24,
                  }}
                >
                  <Image
                    source={{ uri: flyers[1].image_url }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Animated.View>
              )}
              {flyers && flyers.length > 0 && (
                <Animated.View
                  style={{
                    position: "absolute",
                    width: 140,
                    height: 200,
                    borderRadius: 4,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.9)",
                    zIndex: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.5,
                    shadowRadius: 24,
                    transform: [{ scale: pressScaleCenter }],
                  }}
                >
                  <Image
                    source={{ uri: flyers[0].image_url }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Animated.View>
              )}
            </View>
          </View>
        </LinearGradient>
      </Pressable>
      {/* End Highlight Section */}

      {/* Guide Section */}
      <View
        style={{
          marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
        }}
      >
        {/* Video Section */}
        <View style={[styles.card, { borderWidth: 0 }]}>
          <VideoView
            style={{
              width: "100%",
              aspectRatio: 16 / 9,
              borderRadius: RADIUS.DEFAULT,
            }}
            player={player}
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
            contentFit="fill"
          />
        </View>
        {/* End Video Section */}

        {/* Attachment Section */}
        <Pressable
          style={({ pressed }) => [
            {
              marginTop: SECTION_GAP,
              backgroundColor: theme.components.supportCard.background,
              borderRadius: RADIUS.DEFAULT + 4,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.components.supportCard.border,
              boxShadow: theme.components.supportCard.shadow,
              overflow: "hidden",
              position: "relative",
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={() => setOpenModal(true)}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: theme.components.supportCard.iconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                name="tray.and.arrow.down.fill"
                size={24}
                color={theme.components.supportCard.icon}
              />
            </View>

            <View style={{ flex: 1 }}>
              <ThemedText
                type="caption"
                style={{
                  color: theme.components.supportCard.icon,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}
              >
                LAMPIRAN PANDUAN
              </ThemedText>
              <ThemedText
                type="headline"
                style={{ fontWeight: "700", marginBottom: 2 }}
              >
                Berkas Pendukung
              </ThemedText>
              <ThemedText
                type="caption"
                style={{
                  color: isDark
                    ? Colors.dark.text.secondary
                    : Colors.light.text.secondary,
                }}
              >
                Unduh dokumen panduan atau template formulir yang dibutuhkan.
              </ThemedText>
            </View>

            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                name="chevron.right"
                size={16}
                color={
                  isDark
                    ? Colors.dark.text.secondary
                    : Colors.light.text.secondary
                }
              />
            </View>
          </View>
        </Pressable>
        {/* End Attachment Section */}
      </View>
      {/* End Guide Section */}

      {/* App Flow Section */}
      <View
        style={{
          marginTop: SECTION_GAP,
          marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
        }}
      >
        <LinearGradient
          colors={theme.components.appFlow.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: RADIUS.DEFAULT,
            paddingHorizontal: 20,
            paddingVertical: 24,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Decorative background shapes */}
          <View
            style={{
              position: "absolute",
              bottom: -50,
              left: -50,
              width: 150,
              height: 150,
              backgroundColor: theme.components.appFlow.circle1,
              borderRadius: 75,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 20,
              right: -30,
              width: 100,
              height: 100,
              backgroundColor: theme.components.appFlow.circle2,
              borderRadius: 20,
              transform: [{ rotate: "45deg" }],
            }}
          />

          <ThemedText
            type="title3"
            style={{ color: theme.components.appFlow.text, marginBottom: 20 }}
          >
            Alur Pengajuan
          </ThemedText>

          <View>
            {SUBMISSION_STEPS.map((step, index) => (
              <View
                key={step.id}
                style={{
                  flexDirection: "row",
                  alignItems: "stretch",
                  gap: 16,
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: theme.components.appFlow.iconBg,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: theme.components.appFlow.iconBg,
                    }}
                  >
                    <IconSymbol
                      name={step.icon as any}
                      size={16}
                      color={theme.components.appFlow.text}
                    />
                  </View>
                  {/* Vertical line connector */}
                  {index < SUBMISSION_STEPS.length - 1 && (
                    <View
                      style={{
                        width: 2,
                        flex: 1,
                        backgroundColor: theme.components.appFlow.line,
                        opacity: 0.15,
                        marginVertical: 4,
                      }}
                    />
                  )}
                </View>

                <View
                  style={{
                    flex: 1,
                    paddingTop: 4,
                    paddingBottom: index < SUBMISSION_STEPS.length - 1 ? 24 : 0,
                  }}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    style={{
                      color: theme.components.appFlow.text,
                      marginBottom: 2,
                    }}
                  >
                    {step.title}
                  </ThemedText>
                  <ThemedText
                    type="footnote"
                    style={{ color: theme.components.appFlow.desc }}
                  >
                    {step.description}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
      {/* End App Flow Section */}

      {/* Support Section */}
      <View
        style={{
          marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
          marginTop: SECTION_GAP,
          marginBottom: 32,
        }}
      >
        <View
          style={{
            backgroundColor: theme.components.supportCard.background,
            borderRadius: RADIUS.DEFAULT + 4,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.components.supportCard.border,
            boxShadow: theme.components.supportCard.shadow,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Decorative background accent */}
          <View
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme.components.supportCard.accentCircle,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: theme.components.supportCard.iconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                name="questionmark.circle.fill"
                size={24}
                color={theme.components.supportCard.icon}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="title3" style={{ fontWeight: "700" }}>
                Butuh Bantuan?
              </ThemedText>
              <ThemedText
                type="caption"
                style={{
                  color: isDark
                    ? Colors.dark.text.secondary
                    : Colors.light.text.secondary,
                  marginTop: 2,
                }}
              >
                Layanan Informasi dan Bantuan
              </ThemedText>
            </View>
          </View>

          <LinearGradient
            colors={theme.components.supportCard.addressCard.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: RADIUS.DEFAULT,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: theme.components.supportCard.addressCard.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor:
                  theme.components.supportCard.addressCard.iconBg,
                boxShadow: theme.components.supportCard.addressCard.iconShadow,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                name="mappin.and.ellipse"
                size={22}
                color={theme.components.supportCard.addressCard.icon}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText
                type="subheadline"
                style={{
                  fontWeight: "700",
                  marginBottom: 4,
                }}
                lightColor={
                  Colors.light.components.supportCard.addressCard.title
                }
                darkColor={Colors.dark.components.supportCard.addressCard.title}
              >
                Dinas Kesehatan Kota Denpasar
              </ThemedText>
              <ThemedText
                type="caption"
                style={{
                  lineHeight: 18,
                  color: isDark
                    ? Colors.dark.text.secondary
                    : Colors.light.text.secondary,
                }}
              >
                Jl. Maruti No.8, Pemecutan Kaja, Kec. Denpasar Utara, Kota
                Denpasar, Bali
              </ThemedText>
            </View>
          </LinearGradient>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `http://api.whatsapp.com/send?phone=${PHONE_NUMBER}`,
                )
              }
              style={({ pressed }) => [
                {
                  flex: 1,
                  backgroundColor:
                    theme.components.supportCard.whatsapp.background,
                  borderRadius: RADIUS.DEFAULT,
                  padding: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.components.supportCard.whatsapp.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.components.supportCard.whatsapp.iconBg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Image
                  source={require("@/assets/images/whatsapp.png")}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: theme.components.supportCard.whatsapp.text,
                  }}
                />
              </View>
              <ThemedText
                type="footnote"
                style={{
                  fontWeight: "700",
                  color: theme.components.supportCard.whatsapp.text,
                }}
              >
                WhatsApp
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={async () => {
                const canSend = await MailComposer.isAvailableAsync();
                if (!canSend) {
                  Alert.alert(
                    "Email tidak tersedia",
                    "Email tidak tersedia di perangkat ini. Silakan cek kembali atau gunakan aplikasi email pihak ketiga.",
                  );
                  return;
                }
                await MailComposer.composeAsync({
                  subject: "Bantuan Layanan - SIKOMPLIT",
                  recipients: [EMAIL],
                });
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  backgroundColor:
                    theme.components.supportCard.email.background,
                  borderRadius: RADIUS.DEFAULT,
                  padding: 16,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.components.supportCard.email.border,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.components.supportCard.email.iconBg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <IconSymbol
                  name="envelope.fill"
                  size={22}
                  color={theme.components.supportCard.email.text}
                />
              </View>
              <ThemedText
                type="footnote"
                style={{
                  fontWeight: "700",
                  color: theme.components.supportCard.email.text,
                }}
              >
                Email
              </ThemedText>
            </Pressable>
          </View>

          {/* Footer Links */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: theme.components.supportCard.footerBorder,
              paddingTop: 16,
            }}
          >
            <Pressable
              onPress={() => router.push("/term")}
              hitSlop={10}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <ThemedText
                type="caption"
                style={{
                  fontWeight: "600",
                  color: isDark
                    ? Colors.dark.text.secondary
                    : Colors.light.text.secondary,
                }}
              >
                Syarat dan Ketentuan
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={12}
                color={
                  isDark
                    ? Colors.dark.text.secondary
                    : Colors.light.text.secondary
                }
                style={{ marginStart: 4 }}
              />
            </Pressable>
            <ThemedText
              type="caption"
              style={{
                color: isDark
                  ? Colors.dark.text.tertiary
                  : Colors.light.text.tertiary,
                fontWeight: "600",
              }}
            >
              v{appVersion}
            </ThemedText>
          </View>
        </View>
      </View>
      {/* End Support Section */}

      {/* End Content */}
      <BottomSheetModal
        visible={openModal}
        title={"Daftar Lampiran"}
        onClose={() => setOpenModal(false)}
        height="68%"
      >
        <View style={styles.modalBody}>
          <ThemedText
            type="caption"
            darkColor={Colors.dark.text.secondary}
            lightColor={Colors.light.text.secondary}
          >
            Berikut adalah dokumen panduan dan template formulir yang dapat
            diunduh untuk membantu proses pengajuan rekomendasi penelitian.
          </ThemedText>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.guideList}
          >
            {guideDoc.map((file) => {
              return (
                <DocumentRow
                  key={file.uri}
                  label={file.name}
                  url={file.uri}
                  downloadProgressMap={downloadProgressMap}
                  onPress={(url) => openDocument(url)}
                />
              );
            })}
          </ScrollView>
        </View>
      </BottomSheetModal>
      <NotificationModal
        visible={selectedSubmission !== null}
        submission={selectedSubmission}
        sectionBackground={backgroundColor}
        secondaryText={Colors.light.text.secondary}
        tertiaryText={Colors.light.text.tertiary}
        onClose={() => setSelectedSubmission(null)}
        onOpenDocument={openDocument}
        downloadProgressMap={downloadProgressMap}
        onReuploadSuccess={async () => {
          await submissions?.refreshUserSubmissions();
        }}
      />
      <ImagePreviewModal
        visible={previewVisible}
        uri={previewUri}
        onClose={() => {
          setPreviewVisible(false);
          setPreviewUri(undefined);
        }}
      />
    </HomepageScrollView>
  );
}

const styles = StyleSheet.create({
  supportContainer: {
    paddingBottom: 54,
    paddingHorizontal: SCREEN_MARGIN_HORIZONTAL,
    gap: 12,
    marginTop: SECTION_GAP,
  },
  quickAccessContainer: {
    marginTop: 36,
    marginBottom: SECTION_GAP,
    paddingLeft: SCREEN_MARGIN_HORIZONTAL,
    gap: 12,
  },
  card: {
    borderRadius: RADIUS.DEFAULT,
    display: "flex",
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
  },
  cardBackground: {
    ...StyleSheet.absoluteFill,
    filter: "brightness(0.9)",
  },
  emptyHistoryCard: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: SCREEN_WIDTH - 2 * SCREEN_MARGIN_HORIZONTAL,
  },
  vectorWave: {
    bottom: 0,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  logoIcon: {
    width: 64,
    height: 64,
    alignSelf: "flex-end",
    margin: 12,
  },
  callAction: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: RADIUS.DEFAULT,
    borderBottomRightRadius: RADIUS.DEFAULT,
    padding: 16,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.DEFAULT,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  flyerContainer: {
    width: 200,
    height: 300,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  flyerImage: {
    flex: 1,
    backgroundColor: Colors.light.fill.tertiary,
    width: "100%",
    aspectRatio: 2 / 3,
  },
  flyerPlaceholder: {
    backgroundColor: Colors.light.fill.tertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    flex: 1,
    gap: 12,
  },
  guideList: {
    gap: 10,
    paddingBottom: 8,
  },
  supportLink: {
    alignSelf: "flex-start",
    paddingTop: 12,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});
