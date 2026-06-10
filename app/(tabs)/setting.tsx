import { StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import ThemedButton from "@/components/themed-button";
import ThemedSeparator from "@/components/themed-separator";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, SCREEN_MARGIN_HORIZONTAL } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { ThemeMode, useThemePreference } from "@/contexts/theme-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";

export default function SettingScreen() {
  const auth = useAuth();
  const themePreference = useThemePreference();
  const sectionBackground = useThemeColor({}, "fill.vibrant.secondary");

  // Get user from context
  const user = auth?.state.user;

  // Profile picture initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "AN";

  // Handling sign out
  const handleSignOut = async () => {
    try {
      await auth?.signOut();
    } finally {
      router.navigate("/");
    }
  };

  // Theme options
  const themeOptions: {
    value: ThemeMode;
    label: string;
    description?: string;
  }[] = [
    { value: "light", label: "Terang" },
    { value: "dark", label: "Gelap" },
    { value: "system", label: "Sistem" },
  ];

  // Handling theme change
  const handleThemeChange = (mode: ThemeMode) => {
    themePreference?.setThemeMode(mode);
  };

  // Navigate to login
  const handleNavigateToLogin = () => router.push("/login");

  // Navigate to register
  const handleNavigateToRegister = () => router.push("/register");

  return (
    <ParallaxScrollView
      title="Pengaturan"
      contentContainerStyle={styles.content}
    >
      {/* Content */}

      {/* Profile Section (user) or Guest Section (not signed in) */}
      {user ? (
        <ThemedView variant="card" style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarCircle}>
              <ThemedText type="headline" style={{ color: "#fff" }}>
                {initials}
              </ThemedText>
            </View>
            <View style={styles.profileTextBlock}>
              <ThemedText type="headline" numberOfLines={1}>
                {user?.name ?? "Akun SIKOMPLIT"}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: Colors.light.text.secondary }}
                numberOfLines={1}
              >
                {user?.email ?? "Belum ada email"}
              </ThemedText>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.infoBadge,
                    { backgroundColor: sectionBackground },
                  ]}
                >
                  <ThemedText type="caption" style={styles.infoBadgeText}>
                    {user?.roles?.name ?? "Pengguna"}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.infoBadge,
                    {
                      backgroundColor: user?.email_verified_at
                        ? "#EAF8EF"
                        : "#FFF4E1",
                    },
                  ]}
                >
                  <ThemedText
                    type="caption"
                    style={[
                      styles.infoBadgeText,
                      {
                        color: user?.email_verified_at ? "#1F8A4C" : "#9A5A00",
                      },
                    ]}
                  >
                    {user?.email_verified_at
                      ? "Email terverifikasi"
                      : "Email belum diverifikasi"}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          <ThemedSeparator style={{ marginVertical: 12 }} />

          <View style={styles.metaGrid}>
            <View
              style={[styles.metaItem, { backgroundColor: sectionBackground }]}
            >
              <ThemedText
                type="caption"
                style={{ color: Colors.light.text.secondary }}
              >
                Tema
              </ThemedText>
              <ThemedText type="headline">
                {themePreference?.themeMode === "system"
                  ? "Sistem"
                  : themePreference?.themeMode === "light"
                    ? "Terang"
                    : "Gelap"}
              </ThemedText>
            </View>
            <View
              style={[styles.metaItem, { backgroundColor: sectionBackground }]}
            >
              <ThemedText
                type="caption"
                style={{ color: Colors.light.text.secondary }}
              >
                Status akun
              </ThemedText>
              <ThemedText type="headline">Aktif</ThemedText>
            </View>
            <View
              style={[styles.metaItem, { backgroundColor: sectionBackground }]}
            >
              <ThemedText
                type="caption"
                style={{ color: Colors.light.text.secondary }}
              >
                Bergabung
              </ThemedText>
              <ThemedText type="footnote" numberOfLines={1}>
                {user?.created_at
                  ? new Date(user.created_at).getFullYear()
                  : "-"}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      ) : (
        <ThemedView variant="card" style={styles.guestCard}>
          <ThemedText type="headline">Belum Masuk</ThemedText>
          <ThemedText type="caption" style={styles.guestMessage}>
            Silahkan masuk atau registrasi sebelum menggunakan layanan
            pengajuan.
          </ThemedText>
          <View style={styles.guestActions}>
            <ThemedButton
              variant="secondary"
              size="small"
              onPress={handleNavigateToLogin}
              style={styles.actionButton}
            >
              Masuk
            </ThemedButton>
            <ThemedButton
              variant="outlineSecondary"
              size="small"
              onPress={handleNavigateToRegister}
              style={[styles.actionButton, { marginLeft: 8 }]}
            >
              Daftar
            </ThemedButton>
          </View>
        </ThemedView>
      )}
      {/* End Profile/Guest Section */}

      {/* Theme Section */}
      <ThemedView variant="card" style={styles.sectionCard}>
        <ThemedText type="caption" style={styles.sectionLabel}>
          Tampilan
        </ThemedText>
        <View style={styles.themeOptionsWrap}>
          {themeOptions.map((option) => {
            const active = themePreference?.themeMode === option.value;

            return (
              <ThemedButton
                key={option.value}
                variant={active ? "secondary" : "outlineSecondary"}
                size="small"
                onPress={() => handleThemeChange(option.value)}
                style={styles.themeOptionButton}
              >
                {option.label}
              </ThemedButton>
            );
          })}
        </View>
        <ThemedText
          type="caption"
          style={{ color: Colors.light.text.secondary }}
        >
          {themeOptions.find(
            (option) => option.value === themePreference?.themeMode,
          )?.description ?? "Atur tema aplikasi"}
        </ThemedText>
      </ThemedView>
      {/* End Theme Section */}

      {/* Session Section */}
      {user ? (
        <ThemedView variant="card" style={styles.sectionCard}>
          <ThemedText type="caption" style={styles.sectionLabel}>
            Sesi
          </ThemedText>
          <ThemedButton
            variant="secondary"
            size="small"
            onPress={handleSignOut}
            style={styles.actionButton}
          >
            Keluar Akun
          </ThemedButton>
          <ThemedText
            type="caption"
            style={{ color: Colors.light.text.secondary }}
          >
            Hapus sesi saat ini dan kembali ke layar masuk
          </ThemedText>
        </ThemedView>
      ) : (
        <ThemedView variant="card" style={styles.sectionCard}>
          <ThemedText
            type="subheadline"
            style={{ fontWeight: "600", alignSelf: "center" }}
            darkColor={Colors.dark.text.primary}
            lightColor={Colors.light.text.primary}
          >
            Akses Dibatasi
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
      {/* End Session Section */}

      {/* About Section */}
      <ThemedView variant="card" style={styles.sectionCard}>
        <ThemedText type="caption" style={styles.sectionLabel}>
          Tentang Aplikasi
        </ThemedText>
        <ThemedText
          type="footnote"
          style={{ color: Colors.light.text.secondary }}
        >
          Sikomplit atau sistem rekomendasi penelitian merupakan inovasi berupa
          aplikasi pelayanan publik yang dihadirkan untuk mempermudah pelayanan
          penerbitan surat rekomendasi penelitian di kawasan Dinas Kesehatan
          Kota Denpasar. Aplikasi prototipe ini dikembangkan sebagai bagian dari
          penelitian dalam upaya pengembangan lanjutan dari sistem rekomendasi
          penelitian yang sebelumnya hadir dalam bentuk aplikasi berbasis web.
        </ThemedText>
      </ThemedView>
      {/* End About Section */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_MARGIN_HORIZONTAL,
    paddingBottom: 28,
  },
  profileCard: {
    padding: 14,
    gap: 12,
  },
  profileTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.accentBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  profileTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  infoBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  infoBadgeText: {
    fontWeight: "700",
  },
  metaGrid: {
    flexDirection: "row",
    gap: 8,
  },
  metaItem: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    padding: 10,
    gap: 4,
  },
  sectionCard: {
    padding: 16,
    gap: 10,
    marginTop: 12,
  },
  themeOptionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  themeOptionButton: {
    flexGrow: 1,
    minWidth: 96,
    justifyContent: "center",
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
    color: Colors.light.text.secondary,
  },
  actionButton: {
    width: "100%",
    justifyContent: "center",
  },
  guestCard: {
    padding: 14,
    gap: 10,
    alignItems: "center",
  },
  guestMessage: {
    textAlign: "center",
    color: Colors.light.text.secondary,
    marginBottom: 6,
  },
  guestActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 8,
  },
});
