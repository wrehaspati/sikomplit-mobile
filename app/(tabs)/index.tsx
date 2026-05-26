import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, RADIUS, SCREEN_MARGIN_HORIZONTAL } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { useVideoPlayer, VideoView } from 'expo-video';

import { activeSubmission, publishedSubmission } from "@/api/submission-api";
import ImagePreviewModal from "@/components/image-preview-modal";
import BottomSheetModal from "@/components/modal";
import NotificationModal from "@/components/notification-modal";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import ThemedSeparator from "@/components/themed-separator";
import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { downloadAndOpenDocument } from "@/services/document";
import { formatDate } from "@/services/format-date";
import { shortResearchType } from "@/services/format-text";
import { IPublishedSubmission, ISubmissionData } from "@/types/submission";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Defs, FeGaussianBlur, Filter, LinearGradient, Path, Stop } from "react-native-svg";
import NotificationCard from "../../components/notification-card";
import { getStatusMeta } from "./notification";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FIRST_CARD_HEIGHT = SCREEN_WIDTH * 1;
const SECTION_GAP = 24;
const CHEVRON_SIZE = Platform.OS === 'ios' ? 12 : 16;

interface IGuideDocument {
  name: string;
  uri: string;
}

const videoSource = require('@/assets/videos/sample.mp4');
const guideDoc: IGuideDocument[] = [
  {
    name: "Surat Pernyataan Tugas Akhir",
    uri: "https://sikomplit.com/assets/file/surat-pernyataan-laporan-akhir.docx",
  },
]

export default function HomeScreen() {
  const auth = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'fill.vibrant.tertiary');
  const iconBackground = useThemeColor({}, 'fill.primary');
  const [userSubmissions, setUserSubmissions] = useState<ISubmissionData[] | []>([]);
  const [flyers, setFlyers] = useState<IPublishedSubmission[]>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, number>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<ISubmissionData | null>(null);

  // Fetch published submissions
  const fetchPublishedSubmissions = async () => {
    try {
      const res = await publishedSubmission();
      setFlyers(res);
    } catch {
      setFlyers([]);
    }
  };

  // Fetch user submissions
  const fetchUserSubmission = async () => {
    try {
      const res = await activeSubmission();
      setUserSubmissions(res);
    } catch {
      setUserSubmissions([]);
    }
  };

  // Handler for pull-to-refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    if (auth?.state.user) {
      await fetchUserSubmission();
    }
    await fetchPublishedSubmissions();
    setRefreshing(false);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPublishedSubmissions();
    fetchUserSubmission();
  }, [auth]);

  // Initialize video player
  const player = useVideoPlayer(videoSource, player => {
    // no additional configuration needed for now
  });

  // Function to validate if a string is a valid HTTP URL
  const isValidHttpUrl = (value?: string | null) => {
    if (!value) return false
    return /^https?:\/\//i.test(value);
  };

  // Function to open a document URL using authenticated download + open
  const openDocument = async (url?: string | null) => {
    if (!isValidHttpUrl(url)) {
      Alert.alert("Dokumen tidak tersedia", "Tautan dokumen tidak valid atau belum tersedia.");
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


  const HistoryCard = ({ submission }: { submission: ISubmissionData }) => {
    const statusTone = getStatusMeta(submission.progress_status);
    return (
      <View style={{
        width: SCREEN_WIDTH - 2 * SCREEN_MARGIN_HORIZONTAL,
      }} key={submission.id}>
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
    )
  };

  const FlyerCard = ({ data }: { data: IPublishedSubmission }) => {
    return (
      <Pressable onPress={() => { setPreviewUri(data.flyer); setPreviewVisible(true); }}>
        <View style={styles.flyerContainer}>
          <Image
            style={styles.flyerImage}
            source={data.flyer}
            contentFit="cover"
            transition={1000}
          />
        </View>
      </Pressable>
    )
  };

  return (
    <ParallaxScrollView
      title="Beranda"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      {/* Content */}

      {/* First Card */}
      <View style={[
        styles.card, {
          minHeight: FIRST_CARD_HEIGHT,
          marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
          borderWidth: 0
        }]}>
        <Image
          source={require('@/assets/images/card-bg.webp')}
          style={styles.cardBackground}
          contentFit="cover"
        />
        <Image
          source={require('@/assets/images/app-icon.webp')}
          style={styles.logoIcon}
        />
        <View style={styles.vectorWave}>
          <Svg viewBox="0 0 422 0" style={StyleSheet.absoluteFill}>
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
                gradientUnits="userSpaceOnUse">
                <Stop stopColor="#000000" stopOpacity="0.2" />
                <Stop offset="1" stopColor="#000000" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d="M233.354 40.1323C71.7758 -25.3362 17.6288 0.0686264 0 40.1323V276H422V63.6662C419.274 95.8852 533.5 80.7095 233.354 40.1323Z"
              fill="url(#paint0_linear_114_324)"
              fillOpacity="1"
              filter="url(#blur)"
            />
          </Svg>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', borderRadius: RADIUS.DEFAULT }}>
          <View style={styles.cardContainer}>
            <ThemedText type="subheadline" style={{ color: Colors.light.text.quarternary, fontWeight: '600' }}>
              SELAMAT DATANG DI
            </ThemedText>
            <ThemedText type="title" style={{ color: 'white' }}>
              SIKOMPLIT
            </ThemedText>
            <ThemedText type="caption" style={{ color: Colors.light.text.quarternary, textAlign: 'left' }}>
              Aplikasi Sistem Pengajuan Rekomendasi Penelitian Dinas Kesehatan Kota Denpasar
            </ThemedText>
          </View>
          {auth?.state.user ? (
            <BlurView style={styles.callAction} intensity={50} tint="dark">
              <ThemedButton variant="primary" size="small" style={{ alignSelf: 'flex-end' }}
                onPress={() => {
                  router.navigate({ pathname: '/form' });
                }}>
                Ajukan Rekomendasi
              </ThemedButton>
            </BlurView>
          ) : (
            <BlurView style={styles.callAction} intensity={50} tint="dark">
              <ThemedButton variant="primary" size="small" style={{ alignSelf: 'flex-end' }}
                onPress={() => {
                  router.navigate({ pathname: '/register' });
                }}>
                Buat Akun
              </ThemedButton>
              <ThemedButton variant="light" size="small"
                style={{ alignSelf: 'flex-end', backgroundColor: Colors.light.fill.tertiary }}
                onPress={() => {
                  router.navigate({ pathname: '/login' });
                }}>
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
          decelerationRate="fast">
          {auth?.state.user ? (
            userSubmissions.slice(0, 3).map(element => (
              <HistoryCard key={element.id} submission={element} />
            )).concat(userSubmissions.length === 0 ? (
              <ThemedView
                key="empty-history"
                style={[
                  styles.card,
                  styles.emptyHistoryCard,
                  { borderColor: backgroundColor }
                ]}
                lightColor={cardBackground}
                darkColor={cardBackground}>
                <ThemedText type="subheadline" style={{ fontWeight: '600' }}>
                  Belum Ada Pengajuan
                </ThemedText>
                <ThemedText type="footnote" style={{ textAlign: 'center' }} darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                  Notifikasi pengingat akan muncul di sini setelah mengajukan permohonan rekomendasi penelitian.
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/form')}
                  hitSlop={10}
                  style={{ marginTop: 12 }}>
                  <ThemedText type="defaultSemiBold" lightColor={Colors.accentBlue} darkColor={Colors.accentBlue}>
                    Ajukan Sekarang
                  </ThemedText>
                </Pressable>
              </ThemedView>
            ) : [])
          ) : (
            <ThemedView
              style={[
                styles.card,
                styles.emptyHistoryCard,
                { borderColor: backgroundColor }
              ]}
              lightColor={cardBackground}
              darkColor={cardBackground}>
              <ThemedText type="subheadline" style={{ fontWeight: '600' }}>
                Akses Terbatas
              </ThemedText>
              <ThemedText type="footnote" style={{ textAlign: 'center' }} darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                Silahkan masuk atau registrasi sebelum menggunakan layanan pengajuan.
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>
      </View>
      {/* End Quick Access Section */}

      {/* Guide Section */}
      <View style={{
        marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
      }}>
        <ThemedText type="title3" style={{ marginBottom: 12 }}>
          Dukungan Penggunaan
        </ThemedText>
        <View style={[styles.card, { borderWidth: 0 }]}>
          <VideoView
            style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: RADIUS.DEFAULT }}
            player={player}
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
            contentFit="fill"
          />
        </View>
        <Pressable
          style={[
            styles.card, {
              marginTop: 16,
              borderColor: backgroundColor,
              display: 'flex',
              flexDirection: 'row',
              paddingHorizontal: 20,
              paddingVertical: 20,
              backgroundColor: cardBackground,
            },
          ]}
          onPress={() => setOpenModal(true)}>
          <IconSymbol size={40} name="document.fill" color={iconBackground} />
          <View style={{ flex: 1, minWidth: 0, marginStart: 12 }}>
            <ThemedText type="caption" style={{ color: Colors.light.text.secondary, fontWeight: '600' }}>
              LAMPIRAN
            </ThemedText>
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <ThemedText type="headline" style={{ fontWeight: '600', marginBottom: 4, flexShrink: 1 }}>
                Berkas Pendukung
              </ThemedText>
              <IconSymbol name="chevron.right" size={CHEVRON_SIZE} color={Colors.light.text.secondary} style={{ marginStart: 4 }} />
            </View>
            <ThemedText type="caption" style={{ color: Colors.light.text.secondary, flexShrink: 1 }}>
              Berikut dilampirkan dokumen panduan atau template formulir yang dapat diunduh.
            </ThemedText>
          </View>
        </Pressable>
      </View>
      {/* End Guide Section */}

      {/* Flyer Section */}
      <View style={{
        marginTop: SECTION_GAP,
      }}>
        <ThemedText
          type="title3"
          style={{
            marginBottom: 12,
            marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
          }}>
          Pustaka Digital
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            marginBottom: 12,
            paddingHorizontal: 24,
            gap: 12
          }}
          decelerationRate="normal">
          {flyers && flyers.map((element, index) => (
            <FlyerCard key={index} data={element} />
          ))}
        </ScrollView>
        <ThemedSeparator style={{ marginHorizontal: 24 }} />
        <Pressable
          onPress={() => { router.navigate('/library'); }}
          hitSlop={10}
          style={{
            alignSelf: 'flex-start',
            paddingTop: 12,
            marginHorizontal: 24,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
          }}>
          <ThemedText type="default" lightColor={Colors.accentBlue} darkColor={Colors.accentBlue}>
            Selengkapnya
          </ThemedText>
          <IconSymbol name="chevron.right" size={CHEVRON_SIZE} color={Colors.accentBlue} style={{ marginStart: 4, marginTop: 3 }} />
        </Pressable>
      </View>
      {/* End Flyer Section */}

      {/* Support Section */}
      <View style={styles.supportContainer}>
        <ThemedText type="title3">
          Bantuan Layanan
        </ThemedText>
        <ThemedText type="footnote">
          Dinas Kesehatan Kota DenpasarJl. Maruti No.8, Pemecutan Kaja, Kec. Denpasar Utara, Kota Denpasar, Bali
        </ThemedText>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
          <ThemedButton variant="secondary" icon={(<Image source={require('@/assets/images/whatsapp.png')} style={{ width: 20, height: 20, marginEnd: 4, marginStart: -2 }} />)} size="small" style={{ alignSelf: 'flex-start' }}>
            Whatsapp
          </ThemedButton>
          <ThemedButton variant="secondary" icon={(<IconSymbol size={25} name="envelope.fill" color={Colors.accentBlue} style={{ marginEnd: 2, marginStart: -3 }} />)} size="small" style={{ alignSelf: 'flex-start' }}>
            Email
          </ThemedButton>
        </View>
        <View>
          <ThemedSeparator style={{ marginTop: SECTION_GAP }} />
          <Pressable
            onPress={() => { }}
            hitSlop={10}
            style={styles.supportLink}>
            <ThemedText type="footnote" lightColor={Colors.light.text.secondary} darkColor={Colors.light.text.secondary}>
              Syarat dan Ketentuan Layanan
            </ThemedText>
            <IconSymbol name="chevron.right" size={CHEVRON_SIZE} color={Colors.light.text.secondary} style={{ marginStart: 4 }} />
          </Pressable>
        </View>
      </View>
      {/* End Support Section */}

      {/* End Content */}
      <BottomSheetModal visible={openModal} title={'Daftar Lampiran'} onClose={() => setOpenModal(false)} height="68%">
        <View style={styles.modalBody}>
          <ThemedText type="caption" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
            Berikut adalah dokumen panduan dan template formulir yang dapat diunduh untuk membantu proses pengajuan rekomendasi penelitian.
          </ThemedText>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.guideList}>
            {guideDoc.map((file) => {
              const progress = downloadProgressMap[file.uri];
              const downloading = progress !== undefined;
              const progressPercent = Math.round((progress ?? 0) * 100);
              return (
                <Pressable
                  key={file.uri}
                  onPress={() => openDocument(file.uri)}
                  disabled={downloading}
                  style={({ pressed }) => [
                    styles.guideCard, pressed &&
                    !downloading &&
                    styles.guideCardPressed, downloading &&
                    styles.guideCardDisabled,
                    {
                      borderColor: cardBackground,
                      backgroundColor: backgroundColor,
                    }
                  ]}
                >
                  <View style={[styles.guideIconWrap, { backgroundColor: cardBackground }]}>
                    <IconSymbol size={22} name="arrow.down.app.fill" color={Colors.accentBlue} />
                  </View>
                  <View style={styles.guideInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.guideTitle}>
                      {file.name}
                    </ThemedText>
                    <ThemedText type="caption2" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                      {downloading ? `${progressPercent}% selesai` : 'Ketuk untuk mengunduh'}
                    </ThemedText>

                    {downloading && (
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${Math.max(8, progressPercent)}%` }]} />
                      </View>
                    )}
                  </View>
                  <View style={styles.guideAction}>
                    {downloading ? (
                      <>
                        <ActivityIndicator size="small" color={Colors.accentBlue} />
                      </>
                    ) : (
                      <ThemedText type="caption" style={{ color: Colors.accentBlue, fontWeight: '700' }}>
                        Buka
                      </ThemedText>
                    )}
                  </View>
                </Pressable>
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
      />
      <ImagePreviewModal visible={previewVisible} uri={previewUri} onClose={() => { setPreviewVisible(false); setPreviewUri(undefined); }} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  supportContainer: {
    paddingBottom: 54,
    paddingHorizontal: SCREEN_MARGIN_HORIZONTAL,
    gap: 12,
    marginTop: SECTION_GAP
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
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)'
  },
  cardBackground: {
    ...StyleSheet.absoluteFill,
  },
  emptyHistoryCard: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: SCREEN_WIDTH - 2 * SCREEN_MARGIN_HORIZONTAL,
  },
  vectorWave: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  logoIcon: {
    width: 48 * 1.4,
    height: 33 * 1.4,
    alignSelf: 'flex-end',
    margin: 20,
  },
  callAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: RADIUS.DEFAULT,
    borderBottomRightRadius: RADIUS.DEFAULT,
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.DEFAULT,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  flyerContainer: {
    width: 200,
    height: 300,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyerImage: {
    flex: 1,
    backgroundColor: Colors.light.fill.tertiary,
    width: '100%',
    aspectRatio: 2 / 3,
  },
  modalBody: {
    flex: 1,
    gap: 12,
  },
  guideList: {
    gap: 10,
    paddingBottom: 8,
  },
  guideCard: {
    minHeight: 72,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guideCardPressed: {
    opacity: 0.85,
  },
  guideCardDisabled: {
    opacity: 0.75,
  },
  guideIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  guideInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  guideTitle: {
    flexShrink: 1,
  },
  progressTrack: {
    height: 4,
    marginTop: 6,
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: Colors.light.fill.secondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.DEFAULT,
    backgroundColor: Colors.accentBlue,
  },
  guideAction: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  supportLink: {
    alignSelf: 'flex-start',
    paddingTop: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
});