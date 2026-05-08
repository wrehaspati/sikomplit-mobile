import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { responsiveScale } from "@/constants/scaling";
import { Colors, Radius } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { useVideoPlayer, VideoView } from 'expo-video';

import ThemedSeparator from "@/components/themed-separator";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Defs, FeGaussianBlur, Filter, LinearGradient, Path, Stop } from "react-native-svg";

interface IApplyHistory {
  id: number;
  title: string;
  step: number;
  date: string;
}

interface IFlyer {
  id: number;
  link: string;
}

const videoSource = 'https://youtu.be/emlZdBVVbMQ';

// Dummy data for demonstration purposes
const dumData: IApplyHistory[] = [
  {
    id: 1,
    title: 'Permohonan Data Awal',
    step: 3,
    date: '12 Juni 2024',
  },
  {
    id: 2,
    title: 'Permohonan Mendapatkan SKP',
    step: 2,
    date: '15 Juni 2024',
  },
  {
    id: 3,
    title: 'Tugas Akhir Penelitian',
    step: 1,
    date: '20 Juni 2024',
  },
  {
    id: 4,
    title: 'Tugas Akhir Penelitian',
    step: 1,
    date: '20 Juni 2024',
  }
]

const dumFlyer: IFlyer[] = [
  {
    id: 1,
    link: 'https://placehold.co/1024x1536/jpg',
  },
  {
    id: 2,
    link: 'https://placehold.co/1024x1536/jpg',
  },
  {
    id: 3,
    link: 'https://placehold.co/1024x1536/jpg',
  },
  {
    id: 4,
    link: 'https://placehold.co/1024x1536/jpg',
  },
]

export default function HomeScreen() {
  const [history, setHistory] = useState<IApplyHistory[] | []>([]);
  const [flyers, setFlyers] = useState<IFlyer[] | []>(dumFlyer);
  const scrollY = useRef(new Animated.Value(0)).current;
  const applySteps = [
    'Pengajuan Disubmit',
    'Konfirmasi Admin',
    'Menunggu Revisi',
    'Proses Disposisi',
    'Rekomendasi Diterbitkan',
    'Menunggu Hasil Penelitian',
  ]

  const HistoryCard = ({ data }: { data: IApplyHistory }) => (
    <ThemedView style={[styles.card, { width: responsiveScale(340), marginHorizontal: 0, marginVertical: 12, marginEnd: 23, padding: 20 }]}>
      <ThemedView style={styles.badge} lightColor={Colors.light.fill.vibrant.tertiary} darkColor={Colors.dark.fill.vibrant.primary}>
        <IconSymbol size={10} name="circle.fill" color={Colors.accentBlue} />
        <ThemedText type="footnote">
          {applySteps[data.step - 1]}
        </ThemedText>
      </ThemedView>
      <View style={{ marginTop: 12, gap: 4 }}>
        <ThemedText type="headline" style={{ fontWeight: '600' }}>
          {data.title}
        </ThemedText>
        <ThemedText type="caption" style={{ color: Colors.light.text.secondary }}>
          Diajukan pada {data.date}
        </ThemedText>
      </View>
      <View>
        <View style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 12 }}>
          <ThemedText type="caption" style={{ fontWeight: '600' }}>
            Tekan untuk melihat detail
          </ThemedText>
          <ThemedText type="caption" style={{ fontWeight: '600', color: Colors.accentBlue }}>
            Tahap ke {data.step} dari {applySteps.length}
          </ThemedText>
        </View>
      </View>
    </ThemedView >
  );

  const EmptyHistory = () => (
    <ThemedView style={[styles.card, { width: responsiveScale(340), padding: 20, marginVertical: 12 }]}>
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
          <Link href="/form" style={{ fontWeight: '600', color: Colors.accentBlue }}>
            Klik untuk mulai
          </Link>
        </View>
      </View>
    </ThemedView >
  );

  const HistoryWrapper = (data: IApplyHistory[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: 12, marginStart: 23, paddingEnd: 23 }}
      snapToAlignment="center" snapToInterval={responsiveScale(340) + 23} decelerationRate="fast">
      {data.map(element => (
        <HistoryCard key={element.id} data={element} />
      )).concat(data.length === 0 ? <EmptyHistory key="empty" /> : [])}
    </ScrollView>
  );

  const FlyerCard = ({ data }: { data: IFlyer }) => (
    <Image source={{ uri: data.link }} style={{ width: responsiveScale(200), height: responsiveScale(300) }} contentFit="contain" contentPosition={"left top"} />
  );

  const FlyerWarp = (data: IFlyer[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: 12, paddingStart: 23, paddingEnd: 23, gap: 12 }}
      decelerationRate="normal">
      {data.map((element, index) => (
        <FlyerCard key={index} data={element} />
      ))}
    </ScrollView>
  );

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  return (
    <Animated.ScrollView
      style={{
        flex: 1,
      }}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}>
      {/* Content */}

      {/* Welcome Card */}
      <View style={{ marginHorizontal: 23, marginBottom: 20, marginTop: 53 }}>
        <Animated.View
          style={{
            marginBottom: 12,
            opacity: scrollY.interpolate({
              inputRange: [0, 18, 72],
              outputRange: [1, 0, 0],
              extrapolate: 'clamp',
            }),
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 72],
                outputRange: [0, 72],
                extrapolate: 'clamp',
              }),
            }],
          }}
        >
          <ThemedText type="title">
            Beranda
          </ThemedText>
        </Animated.View>
        <View style={[
          styles.card, {
            minHeight: responsiveScale(450)
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
            <Svg width="100%" height="100%" viewBox="0 0 422 276" style={StyleSheet.absoluteFillObject}>
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
                  <Stop stopColor="#000000" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#000000" stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Path
                d="M233.354 40.1323C71.7758 -25.3362 17.6288 0.0686264 0 40.1323V276H422V63.6662C419.274 95.8852 333.5 80.7095 233.354 40.1323Z"
                fill="url(#paint0_linear_114_324)"
                fillOpacity="1"
                filter="url(#blur)"
              />
            </Svg>
          </View>
          {/* Card Content */}
          <View style={{ flex: 1, justifyContent: 'flex-end', borderRadius: Radius.default }}>
            <View style={styles.cardContainer}>
              <ThemedText type="subheadline" style={{ color: Colors.light.text.tertiary, fontWeight: '600' }}>
                SELAMAT DATANG DI
              </ThemedText>
              <ThemedText type="title" style={{ color: 'white' }}>
                SIKOMPLIT
              </ThemedText>
              <ThemedText type="tightFootnote" style={{ color: Colors.light.text.tertiary, textAlign: 'justify' }}>
                Sistem Rekomendasi Penelitian (SIKOMPLIT) adalah sistem informasi yang dirancang untuk memudahkan pelayanan terpadu di masyarakat khususnya dalam penerbitan surat rekomendasi
              </ThemedText>
            </View>
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
          </View>
        </View>
      </View>
      {/* End Welcome Card */}

      {/* History Section */}
      <View style={{ marginBottom: 7 }}>
        <ThemedText type="title3" style={{ marginHorizontal: 23 }}>
          Riwayat Pengajuan
        </ThemedText>
        {HistoryWrapper(history)}
      </View>
      {/* End History Section */}

      {/* Guide Section */}
      <View style={{ marginBottom: 20, marginHorizontal: 23 }}>
        <ThemedText type="title3" style={{ marginBottom: 12 }}>
          Dukungan Penggunaan
        </ThemedText>
        <View style={styles.card}>
          <VideoView
            style={{ width: '100%', height: responsiveScale(200) }}
            player={player}
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
          />
        </View>
        <ThemedView style={[styles.card, { marginTop: 20 }]}>
          <View style={{ display: 'flex', flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }} >
            <IconSymbol size={responsiveScale(48)} name="document.fill" color={Colors.light.fill.vibrant.secondary} />
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
            <ThemedButton variant="link" style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}>
              Tampilkan Dokumen
            </ThemedButton>
          </View>
        </ThemedView >
      </View>
      {/* End Guide Section */}

      {/* Flyer Section */}
      <ThemedView style={{
        marginBottom: 43,
        paddingVertical: 23,
        marginTop: 20,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <ThemedText type="title3" style={{ marginHorizontal: 23, marginBottom: 12 }}>
          Pilihan Terbaik Kami
        </ThemedText>
        {FlyerWarp(flyers)}
        <ThemedSeparator style={{ marginHorizontal: 23 }} />
        <ThemedButton variant="link" style={{ alignSelf: 'flex-start', marginHorizontal: 23 }}>
          Lihat Semua Pustaka Digital
        </ThemedButton>
      </ThemedView>
      {/* End Flyer Section */}

      {/* Support Section */}
      <View style={{ marginBottom: 40, marginHorizontal: 23, gap: 12 }}>
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
          <ThemedSeparator lightColor={Colors.light.fill.vibrant.secondary} style={{ marginTop: 12 }} />
          <ThemedButton variant="link" style={{ alignSelf: 'flex-start' }}>
            Syarat dan Ketentuan Layanan
          </ThemedButton>
        </View>
      </View>

      {/* End Content */}
    </Animated.ScrollView >
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
    height: responsiveScale(250),
  },
  logoIcon: {
    width: responsiveScale(48 * 1.4),
    height: responsiveScale(33 * 1.4),
    alignSelf: 'flex-end',
    margin: 20,
  },
  callAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: Radius.default,
    borderBottomRightRadius: Radius.default,
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cardContainer: {
    paddingHorizontal: 20,
    gap: 4,
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
  }
});