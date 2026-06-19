import DocumentRow from "@/components/document-row";
import ImagePreviewModal from "@/components/image-preview-modal";
import BottomSheetModal from "@/components/modal";
import NotificationModal from "@/components/notification-modal";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import ThemedButton from "@/components/themed-button";
import ThemedSeparator from "@/components/themed-separator";
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
import { IPoster, ISubmissionData } from "@/types/submission";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import * as MailComposer from "expo-mail-composer";
import { router } from "expo-router";
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
  View,
} from "react-native";
import Svg, {
  Defs,
  FeGaussianBlur,
  Filter,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
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

export default function HomeScreen() {
  const auth = useAuth();
  const submissions = useSubmissions();
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "fill.vibrant.tertiary");
  const iconBackground = useThemeColor({}, "fill.primary");
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

  // Flyer Card Component
  const FlyerCard = ({ data }: { data: IPoster }) => {
    const [loaded, setLoaded] = useState(false);
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      if (loaded) return;
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }, [loaded, pulseAnim]);

    return (
      <Pressable
        onPress={() => {
          setPreviewUri(data.image_url);
          setPreviewVisible(true);
        }}
      >
        <View style={styles.flyerContainer}>
          <Image
            style={styles.flyerImage}
            source={{ uri: data.image_url }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            onLoad={() => setLoaded(true)}
          />
          {!loaded && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.flyerPlaceholder,
                { opacity: pulseAnim },
              ]}
            />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ParallaxScrollView
      title="Beranda"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Content */}

      {/* First Card */}
      <View
        style={[
          styles.card,
          {
            minHeight: FIRST_CARD_HEIGHT,
            marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
            borderWidth: 0,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/card-bg.webp")}
          style={styles.cardBackground}
          contentFit="cover"
          contentPosition={"center"}
        />
        <Image
          source={require("@/assets/images/shadow-icon.webp")}
          style={styles.logoIcon}
        />
        <View style={styles.vectorWave}>
          <Svg viewBox="0 0 422 56" style={StyleSheet.absoluteFill}>
            <Defs>
              <Filter id="blur">
                <FeGaussianBlur stdDeviation="8" />
              </Filter>
              <LinearGradient
                id="paint0_linear_114_324"
                x1="211"
                y1="0"
                x2="211"
                y2="219.998"
                gradientUnits="userSpaceOnUse"
              >
                <Stop stopColor="#000000" stopOpacity="0.2" />
                <Stop offset="1" stopColor="#000000" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d="M233.354 40.1323C71.7758 -5.3362 17.6288 30.0686264 0 0V576H422V93.6662C419.274 155.8852 333.5 80.7095 233.354 40.1323Z"
              fill="url(#paint0_linear_114_324)"
              fillOpacity="1"
              filter="url(#blur)"
            />
          </Svg>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            borderRadius: RADIUS.DEFAULT,
          }}
        >
          <View style={styles.cardContainer}>
            <ThemedText
              type="subheadline"
              style={{
                color: Colors.light.text.quarternary,
                fontWeight: "600",
              }}
            >
              SELAMAT DATANG DI
            </ThemedText>
            <ThemedText type="title" style={{ color: "white" }}>
              SIKOMPLIT
            </ThemedText>
            <ThemedText
              type="caption"
              style={{
                color: Colors.light.text.quarternary,
                textAlign: "left",
              }}
            >
              Aplikasi Sistem Pengajuan Rekomendasi Penelitian Dinas Kesehatan
              Kota Denpasar
            </ThemedText>
          </View>
          {auth?.state.user ? (
            <BlurView style={styles.callAction} intensity={50} tint="dark">
              <ThemedButton
                variant="primary"
                size="small"
                style={{ alignSelf: "flex-end" }}
                onPress={() => {
                  router.navigate({ pathname: "/form" });
                }}
              >
                Ajukan Rekomendasi
              </ThemedButton>
            </BlurView>
          ) : (
            <BlurView style={styles.callAction} intensity={50} tint="dark">
              <ThemedButton
                variant="primary"
                size="small"
                style={{ alignSelf: "flex-end" }}
                onPress={() => {
                  router.navigate({ pathname: "/register" });
                }}
              >
                Buat Akun
              </ThemedButton>
              <ThemedButton
                variant="light"
                size="small"
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: Colors.light.fill.tertiary,
                }}
                onPress={() => {
                  router.navigate({ pathname: "/login" });
                }}
              >
                Masuk
              </ThemedButton>
            </BlurView>
          )}
        </View>
      </View>
      {/* End First Card */}

      {/* Quick Access Section */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickAccessContainer}
          snapToAlignment="center"
          decelerationRate="fast"
        >
          {auth?.state.user ? (
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
              )
          ) : (
            <ThemedView
              style={[
                styles.card,
                styles.emptyHistoryCard,
                { borderColor: backgroundColor },
              ]}
              lightColor={cardBackground}
              darkColor={cardBackground}
            >
              <ThemedText type="subheadline" style={{ fontWeight: "600" }}>
                Akses Terbatas
              </ThemedText>
              <ThemedText
                type="footnote"
                style={{ textAlign: "center" }}
                darkColor={Colors.dark.text.secondary}
                lightColor={Colors.light.text.secondary}
              >
                Silahkan masuk atau registrasi sebelum menggunakan layanan
                pengajuan.
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>
      </View>
      {/* End Quick Access Section */}

      {/* Guide Section */}
      <View
        style={{
          marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
        }}
      >
        <ThemedText type="title3" style={{ marginBottom: 12 }}>
          Dukungan Penggunaan
        </ThemedText>
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
        <Pressable
          style={[
            styles.card,
            {
              marginTop: 16,
              borderColor: backgroundColor,
              display: "flex",
              flexDirection: "row",
              paddingHorizontal: 20,
              paddingVertical: 20,
              backgroundColor: cardBackground,
            },
          ]}
          onPress={() => setOpenModal(true)}
        >
          <IconSymbol size={40} name="document.fill" color={iconBackground} />
          <View style={{ flex: 1, minWidth: 0, marginStart: 12 }}>
            <ThemedText
              type="caption"
              style={{ color: Colors.light.text.secondary, fontWeight: "600" }}
            >
              LAMPIRAN
            </ThemedText>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <ThemedText
                type="headline"
                style={{ fontWeight: "600", marginBottom: 4, flexShrink: 1 }}
              >
                Berkas Pendukung
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={CHEVRON_SIZE}
                color={Colors.light.text.secondary}
                style={{ marginStart: 4 }}
              />
            </View>
            <ThemedText
              type="caption"
              style={{ color: Colors.light.text.secondary, flexShrink: 1 }}
            >
              Berikut dilampirkan dokumen panduan atau template formulir yang
              dapat diunduh.
            </ThemedText>
          </View>
        </Pressable>
      </View>
      {/* End Guide Section */}

      {/* Flyer Section */}
      <View
        style={{
          marginTop: SECTION_GAP,
        }}
      >
        <ThemedText
          type="title3"
          style={{
            marginBottom: 12,
            marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
          }}
        >
          Pustaka Digital
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            marginBottom: 12,
            paddingHorizontal: 24,
            gap: 12,
          }}
          decelerationRate="normal"
        >
          {flyers &&
            flyers.map((element, index) => (
              <FlyerCard key={index} data={element} />
            ))}
        </ScrollView>
        <ThemedSeparator style={{ marginHorizontal: 24 }} />
        <Pressable
          onPress={() => {
            router.navigate("/library");
          }}
          hitSlop={10}
          style={{
            alignSelf: "flex-start",
            paddingTop: 12,
            marginHorizontal: 24,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ThemedText
            type="default"
            lightColor={Colors.accentBlue}
            darkColor={Colors.accentBlue}
          >
            Selengkapnya
          </ThemedText>
          <IconSymbol
            name="chevron.right"
            size={CHEVRON_SIZE}
            color={Colors.accentBlue}
            style={{ marginStart: 4, marginTop: 3 }}
          />
        </Pressable>
      </View>
      {/* End Flyer Section */}

      {/* Support Section */}
      <View style={styles.supportContainer}>
        <ThemedText type="title3">Bantuan Layanan</ThemedText>
        <ThemedText type="footnote">
          Dinas Kesehatan Kota DenpasarJl. Maruti No.8, Pemecutan Kaja, Kec.
          Denpasar Utara, Kota Denpasar, Bali
        </ThemedText>
        <View style={{ display: "flex", flexDirection: "row", gap: 12 }}>
          <ThemedButton
            variant="secondary"
            onPress={() => {
              Linking.openURL(
                `http://api.whatsapp.com/send?phone=${PHONE_NUMBER}`,
              );
            }}
            icon={
              <Image
                source={require("@/assets/images/whatsapp.png")}
                style={{ width: 20, height: 20, marginEnd: 4, marginStart: -2 }}
              />
            }
            size="small"
            style={{ alignSelf: "flex-start" }}
          >
            Whatsapp
          </ThemedButton>
          <ThemedButton
            variant="secondary"
            onPress={async () => {
              const canSend = await MailComposer.isAvailableAsync();
              if (!canSend) {
                Alert.alert(
                  "Email tidak tersedia",
                  "Email tidak tersedia di perangkat ini. Silakan cek kembali atau gunakan aplikasi email pihak ketiga.",
                );
                return;
              }
              const options = {
                subject: "Bantuan Layanan - SIKOMPLIT",
                recipients: [EMAIL],
              };
              await MailComposer.composeAsync(options);
            }}
            icon={
              <IconSymbol
                size={25}
                name="envelope.fill"
                color={Colors.accentBlue}
                style={{ marginEnd: 2, marginStart: -3 }}
              />
            }
            size="small"
            style={{ alignSelf: "flex-start" }}
          >
            Email
          </ThemedButton>
        </View>
        <View>
          <ThemedSeparator style={{ marginTop: SECTION_GAP }} />
          <Pressable
            onPress={() => {
              router.push("/term");
            }}
            hitSlop={10}
            style={styles.supportLink}
          >
            <ThemedText
              type="default"
              lightColor={Colors.light.text.secondary}
              darkColor={Colors.light.text.secondary}
            >
              Syarat dan Ketentuan Layanan
            </ThemedText>
            <IconSymbol
              name="chevron.right"
              size={CHEVRON_SIZE}
              color={Colors.light.text.secondary}
              style={{ marginStart: 4 }}
            />
          </Pressable>
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
    </ParallaxScrollView>
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
    marginVertical: 16,
    marginBottom: SECTION_GAP,
    marginStart: 24,
    paddingEnd: 48,
    gap: 12,
  },
  card: {
    borderRadius: RADIUS.DEFAULT,
    display: "flex",
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
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
