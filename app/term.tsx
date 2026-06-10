import ThemedSeparator from "@/components/themed-separator";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, SCREEN_MARGIN_HORIZONTAL } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ScrollView, StyleSheet, View } from "react-native";

// Terms of Service section data (from web version)
const TERMS_SECTIONS = [
  {
    number: "1",
    title: "Layanan",
    items: [
      "Website ini disediakan untuk memfasilitasi publik dalam mengajukan permohonan surat rekomendasi penelitian kepada instansi yang berwenang. Proses pengajuan sepenuhnya bersifat administratif dan tidak dipungut biaya.",
    ],
  },
  {
    number: "2",
    title: "Kepemilikan dan Hak atas Dokumen",
    items: [
      "Semua dokumen, berkas, dan informasi yang dikirimkan melalui platform ini, termasuk namun tidak terbatas pada proposal, abstrak, dan lampiran lainnya, akan menjadi hak milik instansi terkait. Pengguna memahami dan menyetujui bahwa hak kepemilikan atas dokumen yang diajukan akan dialihkan kepada instansi sebagai bagian dari proses administrasi dan dokumentasi.",
    ],
  },
  {
    number: "3",
    title: "Tanggung Jawab Pengguna",
    items: [
      "Pengguna bertanggung jawab untuk memastikan bahwa semua data dan dokumen yang dikirimkan adalah benar, akurat, dan tidak melanggar hak pihak ketiga mana pun. Penyalahgunaan layanan, termasuk pengajuan dokumen palsu atau manipulatif, dapat mengakibatkan penolakan pengajuan dan pelaporan kepada pihak berwenang.",
    ],
  },
  {
    number: "4",
    title: "Penggunaan Data Penelitian",
    items: [
      "Instansi dan website ini berhak menggunakan bagian dari data non-sensitif seperti abstrak atau ringkasan penelitian dalam bentuk flyer atau materi promosi lainnya untuk tujuan edukasi dan pengembangan penelitian. Penggunaan ini tidak akan menyertakan data sensitif atau identitas pribadi tanpa persetujuan tertulis.",
    ],
  },
  {
    number: "5",
    title: "Penafian dan Batasan Tanggung Jawab",
    items: [
      "Instansi dan pihak pengelola website tidak bertanggung jawab atas kerugian yang timbul akibat kesalahan pengisian data oleh pengguna atau gangguan teknis dari pihak penyedia layanan hosting. Segala bentuk tanggung jawab atas penyimpanan dan perlindungan data yang dikumpulkan berada pada tanggung jawab instansi dan penyedia layanan hosting.",
    ],
  },
];

// Privacy Policy section data (from web version)
const PRIVACY_SECTIONS = [
  {
    number: "1",
    title: "Informasi yang Dikumpulkan",
    description:
      "Kami mengumpulkan informasi berikut melalui formulir pengajuan:",
    items: [
      "Informasi pribadi seperti Nama, NIK, Nomor Telepon, Alamat Email",
      "Informasi akademik atau pekerjaan seperti Pendidikan, Instansi, dan Jabatan",
      "Berkas dokumen pendukung pengajuan seperti proposal penelitian, surat permohonan, dan abstrak penelitian",
    ],
  },
  {
    number: "2",
    title: "Penggunaan Informasi",
    description: "Informasi yang dikumpulkan akan digunakan untuk keperluan:",
    items: [
      "Verifikasi dan validasi data pemohon",
      "Proses administrasi pengajuan surat rekomendasi",
      "Pengarsipan dokumen oleh instansi",
      "Publikasi abstrak dalam bentuk flyer (tanpa menyertakan informasi pribadi)",
    ],
  },
  {
    number: "3",
    title: "Penyimpanan dan Keamanan Data",
    items: [
      "Semua data yang dikirimkan disimpan secara aman di server yang dikelola oleh penyedia layanan hosting yang bekerja sama dengan instansi. Kami menerapkan langkah-langkah keamanan teknis dan administratif yang wajar untuk melindungi data Anda dari akses tidak sah, perubahan, atau pengungkapan.",
    ],
  },
  {
    number: "4",
    title: "Pembagian Data",
    items: [
      "Kami tidak akan membagikan, menjual, atau menyewakan data pribadi Anda kepada pihak ketiga mana pun tanpa persetujuan eksplisit, kecuali jika diwajibkan oleh hukum atau perintah pengadilan.",
    ],
  },
  {
    number: "5",
    title: "Hak Anda",
    description: "Anda berhak untuk:",
    items: [
      "Meminta akses atas data pribadi Anda yang kami simpan",
      "Meminta koreksi jika terdapat kesalahan dalam data Anda",
      "Meminta penghapusan data sesuai dengan ketentuan hukum yang berlaku",
    ],
  },
  {
    number: "6",
    title: "Perubahan Kebijakan",
    items: [
      "Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan diumumkan melalui website,aplikasi, dan media sosial kami yang berlaku segera setelah dipublikasikan.",
    ],
  },
];

type SectionData = {
  number: string;
  title: string;
  description?: string;
  items: string[];
};

export default function TermScreen() {
  const sectionBackground = useThemeColor({}, "fill.vibrant.secondary");
  const accentBg = useThemeColor(
    {
      light: Colors.notificationBadge.pending.background,
      dark: "rgba(0,136,255,0.12)",
    },
    "fill.vibrant.tertiary",
  );
  const greenAccentBg = useThemeColor(
    {
      light: Colors.notificationBadge.approved.background,
      dark: "rgba(31,138,76,0.12)",
    },
    "fill.vibrant.tertiary",
  );

  // Render a section card
  const renderSection = (
    section: SectionData,
    badgeBg: string,
    badgeLightColor: string,
    badgeDarkColor: string,
    hasDescription?: boolean,
  ) => (
    <ThemedView
      key={section.number + section.title}
      variant="card"
      style={styles.sectionCard}
    >
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionNumberBadge, { backgroundColor: badgeBg }]}>
          <ThemedText
            type="caption"
            style={styles.sectionNumberText}
            lightColor={badgeLightColor}
            darkColor={badgeDarkColor}
          >
            {section.number}
          </ThemedText>
        </View>
        <ThemedText type="headline" style={{ flex: 1 }}>
          {section.title}
        </ThemedText>
      </View>

      <ThemedSeparator style={{ marginVertical: 4 }} />

      {/* Optional description before items */}
      {section.description && (
        <ThemedText
          type="footnote"
          lightColor={Colors.light.text.secondary}
          darkColor={Colors.dark.text.secondary}
          style={{ lineHeight: 20 }}
        >
          {section.description}
        </ThemedText>
      )}

      {/* Section Items */}
      <View style={styles.sectionItemsContainer}>
        {section.items.map((item, itemIndex) => (
          <View key={itemIndex} style={styles.sectionItem}>
            <View
              style={[styles.bulletDot, { backgroundColor: sectionBackground }]}
            >
              <ThemedText
                type="caption2"
                lightColor={Colors.light.text.secondary}
                darkColor={Colors.dark.text.secondary}
                style={{ fontWeight: "700" }}
              >
                {hasDescription
                  ? `${String.fromCharCode(97 + itemIndex)}.`
                  : `${section.number}.${itemIndex + 1}`}
              </ThemedText>
            </View>
            <ThemedText
              type="footnote"
              lightColor={Colors.light.text.secondary}
              darkColor={Colors.dark.text.secondary}
              style={styles.sectionItemText}
            >
              {item}
            </ThemedText>
          </View>
        ))}
      </View>
    </ThemedView>
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* Intro Card */}
      <ThemedView variant="card" style={styles.introCard}>
        <View style={styles.introIconRow}>
          <View style={styles.introIconCircle}>
            <IconSymbol name="document.fill" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <ThemedText type="headline">
              Ketentuan Layanan dan Kebijakan Privasi
            </ThemedText>
            <ThemedText
              type="caption"
              lightColor={Colors.light.text.secondary}
              darkColor={Colors.dark.text.secondary}
            >
              Tanggal Berlaku: Juli 2025
            </ThemedText>
          </View>
        </View>

        <ThemedSeparator style={{ marginVertical: 8 }} />

        <ThemedText
          type="footnote"
          lightColor={Colors.light.text.secondary}
          darkColor={Colors.dark.text.secondary}
          style={{ lineHeight: 20 }}
        >
          Selamat datang di layanan pengajuan surat rekomendasi penelitian kami.
          Dengan menggunakan situs web ini, Anda menyetujui Ketentuan Layanan
          berikut. Mohon untuk membaca secara seksama sebelum mengakses atau
          menggunakan layanan kami.
        </ThemedText>
      </ThemedView>

      {/* Terms of Service Header */}
      <View style={styles.majorSectionHeader}>
        <ThemedText type="title3">Terms of Service</ThemedText>
        <ThemedText
          type="caption"
          lightColor={Colors.light.text.secondary}
          darkColor={Colors.dark.text.secondary}
        >
          Ketentuan Layanan
        </ThemedText>
      </View>

      {/* Terms of Service Sections */}
      {TERMS_SECTIONS.map((section) =>
        renderSection(
          section,
          accentBg,
          Colors.notificationBadge.pending.text,
          Colors.accentBlue,
        ),
      )}

      {/* Privacy Policy Header */}
      <View style={styles.majorSectionHeader}>
        <ThemedText type="title3">Privacy Policy</ThemedText>
        <ThemedText
          type="caption"
          lightColor={Colors.light.text.secondary}
          darkColor={Colors.dark.text.secondary}
        >
          Kebijakan Privasi
        </ThemedText>
      </View>

      {/* Privacy Policy Intro */}
      <ThemedView variant="card" style={styles.privacyIntroCard}>
        <ThemedText
          type="footnote"
          lightColor={Colors.light.text.secondary}
          darkColor={Colors.dark.text.secondary}
          style={{ lineHeight: 20 }}
        >
          Kami berkomitmen untuk menjaga dan melindungi privasi Anda. Kebijakan
          ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan,
          dan melindungi informasi pribadi Anda.
        </ThemedText>
      </ThemedView>

      {/* Privacy Policy Sections */}
      {PRIVACY_SECTIONS.map((section) =>
        renderSection(
          section,
          greenAccentBg,
          Colors.notificationBadge.approved.text,
          Colors.accentGreen,
          !!section.description,
        ),
      )}

      {/* Contact Section */}
      <ThemedView variant="card" style={styles.contactCard}>
        <ThemedText type="caption" style={styles.sectionLabel}>
          Kontak
        </ThemedText>
        <View style={styles.contactItemsContainer}>
          <View
            style={[
              styles.contactInfoRow,
              { backgroundColor: sectionBackground },
            ]}
          >
            <IconSymbol
              name="person.fill"
              size={16}
              color={Colors.accentBlue}
            />
            <View style={{ flex: 1 }}>
              <ThemedText
                type="caption"
                lightColor={Colors.light.text.secondary}
                darkColor={Colors.dark.text.secondary}
              >
                Instansi Pengelola
              </ThemedText>
              <ThemedText
                type="footnote"
                lightColor={Colors.light.text.primary}
                darkColor={Colors.dark.text.primary}
                style={{ fontWeight: "600" }}
              >
                Dinas Kesehatan Kota Denpasar
              </ThemedText>
            </View>
          </View>
          <View
            style={[
              styles.contactInfoRow,
              { backgroundColor: sectionBackground },
            ]}
          >
            <IconSymbol
              name="envelope.fill"
              size={16}
              color={Colors.accentBlue}
            />
            <View style={{ flex: 1 }}>
              <ThemedText
                type="caption"
                lightColor={Colors.light.text.secondary}
                darkColor={Colors.dark.text.secondary}
              >
                Email
              </ThemedText>
              <ThemedText
                type="footnote"
                lightColor={Colors.light.text.primary}
                darkColor={Colors.dark.text.primary}
                style={{ fontWeight: "600" }}
              >
                dinkeskotadenpasar@gmail.com
              </ThemedText>
            </View>
          </View>
          <View
            style={[
              styles.contactInfoRow,
              { backgroundColor: sectionBackground },
            ]}
          >
            <IconSymbol name="house.fill" size={16} color={Colors.accentBlue} />
            <View style={{ flex: 1 }}>
              <ThemedText
                type="caption"
                lightColor={Colors.light.text.secondary}
                darkColor={Colors.dark.text.secondary}
              >
                Alamat
              </ThemedText>
              <ThemedText
                type="footnote"
                lightColor={Colors.light.text.primary}
                darkColor={Colors.dark.text.primary}
                style={{ fontWeight: "600" }}
              >
                Jl. Maruti No.8, Pemecutan Kaja, Kec. Denpasar Utara, Kota
                Denpasar, Bali
              </ThemedText>
            </View>
          </View>
          <View
            style={[
              styles.contactInfoRow,
              { backgroundColor: sectionBackground },
            ]}
          >
            <IconSymbol name="phone.fill" size={16} color={Colors.accentBlue} />
            <View style={{ flex: 1 }}>
              <ThemedText
                type="caption"
                lightColor={Colors.light.text.secondary}
                darkColor={Colors.dark.text.secondary}
              >
                Telepon
              </ThemedText>
              <ThemedText
                type="footnote"
                lightColor={Colors.light.text.primary}
                darkColor={Colors.dark.text.primary}
                style={{ fontWeight: "600" }}
              >
                (0361) 424801
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText
          type="caption"
          lightColor={Colors.light.text.tertiary}
          darkColor={Colors.dark.text.tertiary}
          style={{ textAlign: "center" }}
        >
          © 2025 SIKOMPLIT — Dinas Kesehatan Kota Denpasar
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
    paddingHorizontal: SCREEN_MARGIN_HORIZONTAL,
    paddingBottom: 40,
  },
  introCard: {
    padding: 16,
    gap: 6,
  },
  introIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  introIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  majorSectionHeader: {
    marginTop: 24,
    marginBottom: 4,
    gap: 2,
  },
  privacyIntroCard: {
    padding: 16,
    marginTop: 12,
  },
  sectionCard: {
    padding: 16,
    gap: 10,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionNumberBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  sectionNumberText: {
    fontWeight: "700",
  },
  sectionItemsContainer: {
    gap: 10,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    marginTop: 1,
  },
  sectionItemText: {
    flex: 1,
    lineHeight: 20,
  },
  contactCard: {
    padding: 16,
    gap: 10,
    marginTop: 12,
  },
  contactItemsContainer: {
    gap: 8,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
    color: Colors.light.text.secondary,
  },
  contactInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
    gap: 4,
    paddingBottom: 8,
  },
});
