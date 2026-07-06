import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactElement } from "react";
import {
  Animated as RNAnimated,
  ScrollViewProps,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React from "react";
import { IconSymbol } from "./ui/icon-symbol";

const HEADER_HEIGHT = 550;

type Props = ScrollViewProps & {
  header?: ReactElement;
  headerBackgroundColor?: { dark: string; light: string };
  scrollYValue?: RNAnimated.Value;
};

export default function HomepageScrollView({
  children,
  header,
  scrollYValue,
  headerBackgroundColor,
  ...Props
}: Props) {
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const { refreshControl } = Props as ScrollViewProps & {
    refreshControl?: React.ReactElement<any>;
  };
  const injectedRefreshControl = refreshControl
    ? React.cloneElement(refreshControl as React.ReactElement<any>, {
        zIndex: 100,
        progressViewOffset: 40,
        tintColor: "#ffffff",
        colors: ["#003f87"],
        progressBackgroundColor: "#ffffff",
      })
    : undefined;
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}
      refreshControl={injectedRefreshControl}
      automaticallyAdjustContentInsets={true}
    >
      {/* Background for top overscroll to prevent white flicker */}
      <View
        style={{
          position: "absolute",
          top: -1000,
          left: 0,
          right: 0,
          height: 1000,
          backgroundColor: "#003f87",
        }}
      />
      <View style={styles.header}>
        <Animated.View style={[StyleSheet.absoluteFill, headerAnimatedStyle]}>
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: "#003f87" }]}
          />
          <Image
            source={require("@/assets/images/card-bg.webp")}
            style={[StyleSheet.absoluteFill, { opacity: 0.4 }]}
            contentFit="cover"
          />
          <LinearGradient
            colors={[
              "rgba(0, 63, 135, 0.9)",
              "rgba(17, 92, 185, 0.8)",
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View
          style={[styles.headerInner, { paddingTop: Math.max(insets.top, 24) }]}
        >
          {/* <View style={styles.topBar}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcpN9MFWVJ8mjF2GJhsL2IcGGnS0C_d76SrpxnlyCcRMvHWtn_Xy3W88ZmqTdy0M9BcA4fs6oZyJ3QHnoPXaCoJfSvDbVAa3_ULftP1RVBiGTCslSbmVtZIegW5kP70eUJeJjSFR6aQar1v-7lgxBGTCdJX35P6opHwhrTKCj2kEa99__ukwf8-jfnVXAcjL8HYb0ydbVeSG9tJpITH7qBDeCRAEAwhuO3s93j47kPjFVC_PCkmYnhrA",
                }}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>

            <View style={styles.topBarActions}>
              <TouchableOpacity style={styles.iconButton}>
                <BlurView
                  intensity={20}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
                <MaterialIcons name="search" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <BlurView
                  intensity={20}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
                <MaterialIcons name="menu" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View> */}

          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PROTOTIPE SIKOMPLIT</Text>
            </View>

            <Text style={styles.title}>
              Rekomendasi Penelitian{"\n"}
              <Text style={styles.titleHighlight}>Lebih Cepat & Mudah</Text>
            </Text>

            <Text style={styles.subtitle}>
              Sistem Rekomendasi Penelitian terpadu untuk kemudahan pelayanan
              penerbitan surat rekomendasi bagi masyarakat.
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => {
                  if (auth?.state.user) {
                    router.push("/form");
                  } else {
                    router.push("/login");
                  }
                }}
                style={styles.primaryButtonWrapper}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#66df75", "#34C759"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    {auth?.state.user ? "Ajukan Rekomendasi" : "Masuk"}
                  </Text>
                  <IconSymbol
                    name={"arrow.forward"}
                    size={20}
                    color={"#002106"}
                    style={{ marginLeft: 4 }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={() => {
                  if (auth?.state.user) {
                    router.push("/library");
                  } else {
                    router.push("/register");
                  }
                }}
              >
                <BlurView
                  intensity={20}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.secondaryButtonText}>
                  {auth?.state.user
                    ? "Kunjungi Pustaka Digital"
                    : "Buat Akun Baru"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
  },
  headerInner: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: "#fff",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  topBarActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(131, 252, 142, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(131, 252, 142, 0.5)",
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#83fc8e",
    marginRight: 8,
  },
  badgeText: {
    color: "#83fc8e",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleHighlight: {
    color: "#83fc8e",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#d7e2ff",
    opacity: 0.9,
    marginBottom: 32,
    maxWidth: 320,
  },
  actionButtons: {
    flexDirection: "column",
    gap: 16,
  },
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#006e25",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryButtonText: {
    color: "#002106",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    overflow: "hidden",
    marginTop: -24,
  },
});
