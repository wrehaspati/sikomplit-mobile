import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Radius, SCREEN_MARGIN_HORIZONTAL } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { useVideoPlayer, VideoView } from 'expo-video';

import { activeSubmission, publishedSubmission } from "@/api/submission-api";
import ImagePreviewModal from "@/components/image-preview-modal";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import ThemedSeparator from "@/components/themed-separator";
import { useAuth } from "@/contexts/auth-context";
import { IPublishedSubmission, ISubmissionData } from "@/types/submission";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Defs, FeGaussianBlur, Filter, LinearGradient, Path, Stop } from "react-native-svg";

const videoSource = 'https://youtu.be/emlZdBVVbMQ';

const FIRST_CARD_HEIGHT = 400;

export default function HomeScreen() {
  const auth = useAuth();
  const [userSubmissions, setUserSubmissions] = useState<ISubmissionData[] | []>([]);
  const [flyers, setFlyers] = useState<IPublishedSubmission[]>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

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
    player.loop = true;
    player.play();
  });

  const HistoryCard = ({ data }: { data: ISubmissionData }) => (
    <ThemedView style={[styles.card, { width: 340, marginHorizontal: 0, marginVertical: 12, marginEnd: 24, padding: 20 }]}>
      <ThemedView style={styles.badge} lightColor={Colors.light.fill.vibrant.tertiary} darkColor={Colors.dark.fill.vibrant.primary}>
        <IconSymbol size={10} name="circle.fill" color={Colors.accentBlue} />
        <ThemedText type="footnote">
          {data.progress_status}
        </ThemedText>
      </ThemedView>
      <View style={{ marginTop: 12, gap: 4 }}>
        <ThemedText type="headline" style={{ fontWeight: '600' }}>
          {data.research_type.split('/')[0]}
        </ThemedText>
        <ThemedText type="caption" style={{ color: Colors.light.text.secondary }}>
          Diajukan pada {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </ThemedText>
      </View>
      <View>
        <View style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 12 }}>
          <ThemedText type="caption" style={{ fontWeight: '600', color: Colors.accentBlue }}>
            Tekan untuk melihat detail
          </ThemedText>
          <ThemedText type="caption" style={{ fontWeight: '800', color: Colors.light.text.tertiary }}>
            {data.request_number}
          </ThemedText>
        </View>
      </View>
    </ThemedView >
  );

  const EmptyHistory = () => (
    <ThemedView style={[styles.card, { width: 340, padding: 20, marginVertical: 12 }]}>
      <ThemedView style={styles.badge} lightColor={Colors.light.fill.vibrant.tertiary} darkColor={Colors.dark.fill.vibrant.primary}>
        <IconSymbol size={10} name="circle.fill" color={Colors.accentBlue} />
        <ThemedText type="footnote">
          Tidak Ditemukan
        </ThemedText>
      </ThemedView>
      <View style={{ marginTop: 12, gap: 4 }}>
        <ThemedText type="title4" style={{ fontWeight: '600' }}>
          Belum ada riwayat pengajuan
        </ThemedText>
        <ThemedText type="caption" style={{ color: Colors.light.text.secondary }}>
          Silahkan mengajukan permohonan dan lihat riwayat pengajuan Anda di sini.
        </ThemedText>
      </View>
      <View>
        <View style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'flex-end', marginTop: 12 }}>
          <Pressable onPress={() => router.push('/form')} hitSlop={10}>
            <ThemedText type="defaultSemiBold" lightColor={Colors.accentBlue} darkColor={Colors.accentBlue}>
              Ajukan Sekarang
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView >
  );

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
        {/* Card Content */}
        <View style={{ flex: 1, justifyContent: 'flex-end', borderRadius: Radius.default }}>
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
                }}
              >
                Ajukan Rekomendasi
              </ThemedButton>
            </BlurView>
          ) : (
            <BlurView style={styles.callAction} intensity={50} tint="dark">
              <ThemedButton variant="primary" size="small" style={{ alignSelf: 'flex-end' }}
                onPress={() => {
                  router.navigate({ pathname: '/register' });
                }}
              >
                Buat Akun
              </ThemedButton>
              <ThemedButton variant="light" size="small"
                style={{ alignSelf: 'flex-end', backgroundColor: Colors.light.fill.tertiary }}
                onPress={() => {
                  router.navigate({ pathname: '/login' });
                }}
              >
                Masuk
              </ThemedButton>
            </BlurView>
          )}
        </View>
      </View>
      {/* End Welcome Card */}

      {/* History Section */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: 12, marginStart: 24, paddingEnd: 24 }}
          snapToAlignment="center" snapToInterval={340 + 24} decelerationRate="fast">
          {userSubmissions.map(element => (
            <HistoryCard key={element.id} data={element} />
          )).concat(userSubmissions.length === 0 ? (<EmptyHistory key="empty" />) : [])}
        </ScrollView>
      </View>
      {/* End History Section */}

      {/* Guide Section */}
      <View style={{
        marginBottom: 44,
        marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
      }}>
        <ThemedText type="title3" style={{ marginBottom: 12 }}>
          Dukungan Penggunaan
        </ThemedText>
        <View style={styles.card}>
          <VideoView
            style={{ width: '100%', height: 200 }}
            player={player}
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
          />
        </View>
        <ThemedView style={[styles.card, { marginTop: 20 }]}>
          <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }} >
            <IconSymbol size={48} name="document.fill" color={Colors.light.fill.vibrant.secondary} />
            <View style={{ flex: 1, minWidth: 0, marginStart: 12 }}>
              <ThemedText type="caption" style={{ color: Colors.light.text.tertiary, fontWeight: '600' }}>
                DOKUMEN PEDOMAN
              </ThemedText>
              <ThemedText type="headline" style={{ fontWeight: '600', marginBottom: 4, flexShrink: 1 }}>
                Surat Pernyataan Laporan Akhir
              </ThemedText>
              <ThemedText type="caption" style={{ color: Colors.light.text.secondary, flexShrink: 1, textAlign: 'justify' }}>
                Pedoman ini berisi informasi penting mengenai format dan persyaratan yang harus dipenuhi dalam pengajuan rekomendasi penelitian.
              </ThemedText>
            </View>
          </View>
          <View style={{ marginHorizontal: 20, paddingBottom: 10 }}>
            <ThemedSeparator />
            <Pressable onPress={() => { }} hitSlop={10} style={{ alignSelf: 'flex-start', paddingVertical: 12 }}>
              <ThemedText type="defaultSemiBold" lightColor={Colors.accentBlue} darkColor={Colors.accentBlue}>
                Tampilkan Dokumen
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView >
      </View>
      {/* End Guide Section */}

      {/* Flyer Section */}
      <ThemedView style={{
        marginBottom: 44,
        paddingTop: 44,
        paddingBottom: 24,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <ThemedText type="title3" style={{ marginHorizontal: 24, marginBottom: 12 }}>
          Pilihan Topik Terbaik
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: 12, paddingStart: 24, paddingEnd: 24, gap: 12 }}
          decelerationRate="normal">
          {flyers && flyers.map((element, index) => (
            <FlyerCard key={index} data={element} />
          ))}
        </ScrollView>
        <ThemedSeparator style={{ marginHorizontal: 24 }} />
        <Pressable onPress={() => { router.navigate('/library'); }} hitSlop={10} style={{ alignSelf: 'flex-start', paddingVertical: 12, marginHorizontal: 24, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <ThemedText type="defaultSemiBold" lightColor={Colors.accentBlue} darkColor={Colors.accentBlue}>
            Menuju Pustaka Digital
          </ThemedText>
          <IconSymbol name="chevron.right" size={20} color={Colors.accentBlue} style={{ marginStart: 4 }} />
        </Pressable>
      </ThemedView>
      {/* End Flyer Section */}

      {/* Support Section */}
      <View style={{ marginBottom: 40, marginHorizontal: SCREEN_MARGIN_HORIZONTAL, gap: 12 }}>
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
          <ThemedSeparator lightColor={Colors.dark.fill.vibrant.primary} style={{ marginTop: 12 }} />
          <Pressable onPress={() => { }} hitSlop={10} style={{ alignSelf: 'flex-start', paddingVertical: 12 }}>
            <ThemedText type="defaultSemiBold" lightColor={Colors.light.text.secondary} darkColor={Colors.light.text.secondary}>
              Syarat dan Ketentuan Layanan
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* End Content */}
      <ImagePreviewModal visible={previewVisible} uri={previewUri} onClose={() => { setPreviewVisible(false); setPreviewUri(undefined); }} />
    </ParallaxScrollView >
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.default,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)'
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
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
    borderBottomLeftRadius: Radius.default,
    borderBottomRightRadius: Radius.default,
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
    borderRadius: Radius.default,
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
  },
});