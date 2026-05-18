import { activeSubmission } from "@/api/submission-api";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Radius } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ISubmissionData } from "@/types/submission";
import { openBrowserAsync, WebBrowserPresentationStyle } from "expo-web-browser";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from "react-native";

type SortOrder = "newest" | "oldest";
type StatusFilter = "all" | "pending" | "approved" | "revision";

type AnnouncementNotification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
};

type FeedItem =
  | { type: "submission"; created_at: string; submission: ISubmissionData }
  | { type: "announcement"; created_at: string; announcement: AnnouncementNotification };

// Prepared dummy announcements to simulate Firebase push notifications
const DUMMY_ANNOUNCEMENTS: AnnouncementNotification[] = [
  {
    id: "ann-1",
    title: "Pemeliharaan Sistem Layanan Rekomendasi",
    message: "Layanan akan mengalami pemeliharaan pada Jumat, 20.00-22.00 WIB. Mohon simpan draft Anda sebelum waktu tersebut.",
    created_at: "2026-05-18T13:10:00.000Z",
  },
  {
    id: "ann-2",
    title: "Perubahan Ketentuan Unggah Dokumen",
    message: "Format dokumen proposal kini mendukung ukuran hingga 25 MB. Pastikan file dapat dibaca dengan jelas sebelum dikirim.",
    created_at: "2026-05-15T08:30:00.000Z",
  },
  {
    id: "ann-3",
    title: "Pengingat Verifikasi Email Akun",
    message: "Silakan verifikasi email untuk mendapatkan notifikasi status pengajuan terbaru melalui push notification Firebase.",
    created_at: "2026-05-12T04:45:00.000Z",
  },
];

export default function NotificationScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const sectionBackground = useThemeColor({}, "fill.vibrant.secondary");
  const tertiaryText = useThemeColor({}, "text.tertiary");
  const secondaryText = useThemeColor({}, "text.secondary");
  const scrollY = useRef(new Animated.Value(0)).current;
  const [userSubmissions, setUserSubmissions] = useState<ISubmissionData[] | []>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<ISubmissionData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    await fetchUserSubmission();
    setRefreshing(false);
  };
  // Fetch data on component mount
  useEffect(() => {
    fetchUserSubmission();
  }, []);

  // Memoized sorted submissions based on creation date
  const sortedSubmissions = useMemo(() => {
    return [...userSubmissions];
  }, [userSubmissions]);

  // Function to determine status metadata for styling
  const getStatusMeta = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized.includes("selesai") || normalized.includes("approved") || normalized.includes("diterima")) {
      return {
        kind: "approved" as const,
        badgeBackground: "#E7F8ED",
        badgeText: Colors.accentGreen,
        stripe: "#31B364",
        iconName: "checkmark.shield.fill" as const,
      };
    }

    if (normalized.includes("revisi") || normalized.includes("review") || normalized.includes("perbaikan")) {
      return {
        kind: "revision" as const,
        badgeBackground: "#FFFBE6",
        badgeText: Colors.accentYellow,
        stripe: Colors.accentYellow,
        iconName: "circle.fill" as const,
      };
    }

    return {
      kind: "pending" as const,
      badgeBackground: "#E8F3FF",
      badgeText: "#0F61C5",
      stripe: Colors.accentBlue,
      iconName: "circle.fill" as const,
    };
  };

  // Memoized filtered submissions based on status filter
  const filteredSubmissions = useMemo(() => {
    if (statusFilter === "all") {
      return sortedSubmissions;
    }

    return sortedSubmissions.filter((submission) => {
      const statusMeta = getStatusMeta(submission.progress_status);
      return statusMeta.kind === statusFilter;
    });
  }, [sortedSubmissions, statusFilter]);

  // Memoized feed items combining submissions and announcements, sorted by creation date
  const feedItems = useMemo(() => {
    const submissionItems: FeedItem[] = filteredSubmissions.map((submission) => ({
      type: "submission",
      created_at: submission.created_at,
      submission,
    }));

    const announcementItems: FeedItem[] = DUMMY_ANNOUNCEMENTS.map((announcement) => ({
      type: "announcement",
      created_at: announcement.created_at,
      announcement,
    }));

    const merged = [...submissionItems, ...announcementItems];

    merged.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();

      if (sortOrder === "newest") {
        return timeB - timeA;
      }

      return timeA - timeB;
    });

    return merged;
  }, [filteredSubmissions, sortOrder]);

  // Function to validate if a string is a valid HTTP URL
  const isValidHttpUrl = (value?: string | null) => {
    if (!value) {
      return false;
    }

    return /^https?:\/\//i.test(value);
  };

  // Function to open a document URL, with platform-specific handling
  const openDocument = async (url?: string | null) => {
    if (!isValidHttpUrl(url)) {
      Alert.alert("Dokumen tidak tersedia", "Tautan dokumen tidak valid atau belum tersedia.");
      return;
    }

    const safeUrl = url as string;

    try {
      await openBrowserAsync(safeUrl, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch {
      Alert.alert("Gagal membuka dokumen", "Silakan coba lagi beberapa saat.");
    }
  };

  // Function to format date strings into a more readable format
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Function to format date and time into a more readable format
  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to extract a short research type from a potentially longer string
  const shortResearchType = (value?: string) => {
    if (!value) {
      return "-";
    }

    const chunk = value.split("/")[0]?.trim();
    return chunk && chunk.length > 0 ? chunk : value;
  };

  // Component to display a label and value pair in the submission details
  const DetailRow = ({ label, value }: { label: string; value?: string | null }) => {
    return (
      <View style={styles.detailRow}>
        <ThemedText type="caption" style={{ color: tertiaryText, marginBottom: 2 }}>
          {label}
        </ThemedText>
        <ThemedText type="subheadline" style={{ fontWeight: "600" }}>
          {value && value.trim().length > 0 ? value : "-"}
        </ThemedText>
      </View>
    );
  };

  // Component to display a document row with a label and a link to open the document if available
  const DocumentRow = ({ label, url }: { label: string; url?: string | null }) => {
    const available = isValidHttpUrl(url);

    return (
      <Pressable
        onPress={() => openDocument(url)}
        disabled={!available}
        style={[styles.documentRow, !available && styles.documentRowDisabled]}
      >
        <View style={styles.documentLabelBlock}>
          <IconSymbol name="document.fill" size={16} color={available ? Colors.accentBlue : Colors.light.text.secondary} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <ThemedText type="subheadline" style={{ fontWeight: "600" }} numberOfLines={1}>
              {label}
            </ThemedText>
            <ThemedText type="caption" style={{ color: available ? Colors.accentBlue : secondaryText }}>
              {available ? "Buka / Unduh" : "Belum tersedia"}
            </ThemedText>
          </View>
        </View>
        {available && <IconSymbol name="chevron.right" size={16} color={Colors.accentBlue} />}
      </Pressable>
    );
  };

  return (
    <>
      <Animated.ScrollView
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.screenPadding}>
          <Animated.View
            id="header"
            style={{
              marginBottom: 16,
              opacity: scrollY.interpolate({
                inputRange: [0, 18, 72],
                outputRange: [1, 0, 0],
                extrapolate: "clamp",
              }),
              transform: [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 72],
                  outputRange: [0, 72],
                  extrapolate: "clamp",
                }),
              }],
            }}
          >
            <ThemedText type="title">Notifikasi</ThemedText>
          </Animated.View>

          <ThemedView style={[styles.filterWrap, { backgroundColor: sectionBackground }]}>
            <ThemedText type="caption" style={styles.filterLabel}>
              Urutkan tanggal dibuat
            </ThemedText>
            <View style={styles.filterButtonsRow}>
              <Pressable
                onPress={() => setSortOrder("newest")}
                style={[
                  styles.filterButton,
                  sortOrder === "newest" ? styles.filterButtonActive : styles.filterButtonInactive,
                ]}
              >
                <ThemedText
                  type="caption"
                  style={sortOrder === "newest" ? styles.filterTextActive : styles.filterTextInactive}
                >
                  Terbaru
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setSortOrder("oldest")}
                style={[
                  styles.filterButton,
                  sortOrder === "oldest" ? styles.filterButtonActive : styles.filterButtonInactive,
                ]}
              >
                <ThemedText
                  type="caption"
                  style={sortOrder === "oldest" ? styles.filterTextActive : styles.filterTextInactive}
                >
                  Terlama
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText type="caption" style={[styles.filterLabel, { marginTop: 10 }]}>Status</ThemedText>
            <View style={styles.filterButtonsRowWrap}>
              <Pressable
                onPress={() => setStatusFilter("all")}
                style={[
                  styles.filterButton,
                  statusFilter === "all" ? styles.filterButtonActive : styles.filterButtonInactive,
                ]}
              >
                <ThemedText
                  type="caption"
                  style={statusFilter === "all" ? styles.filterTextActive : styles.filterTextInactive}
                >
                  Semua
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setStatusFilter("pending")}
                style={[
                  styles.filterButton,
                  statusFilter === "pending" ? styles.filterButtonActive : styles.filterButtonInactive,
                ]}
              >
                <View style={styles.filterChipContent}>
                  <IconSymbol
                    name="circle.fill"
                    size={10}
                    color={statusFilter === "pending" ? "#fff" : Colors.accentBlue}
                  />
                  <ThemedText
                    type="caption"
                    style={statusFilter === "pending" ? styles.filterTextActive : styles.filterTextInactive}
                  >
                    Pending
                  </ThemedText>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setStatusFilter("approved")}
                style={[
                  styles.filterButton,
                  statusFilter === "approved" ? styles.filterButtonActive : styles.filterButtonInactive,
                ]}
              >
                <View style={styles.filterChipContent}>
                  <IconSymbol
                    name="checkmark.shield.fill"
                    size={12}
                    color={statusFilter === "approved" ? "#fff" : Colors.accentGreen}
                  />
                  <ThemedText
                    type="caption"
                    style={statusFilter === "approved" ? styles.filterTextActive : styles.filterTextInactive}
                  >
                    Disetujui
                  </ThemedText>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setStatusFilter("revision")}
                style={[
                  styles.filterButton,
                  statusFilter === "revision" ? styles.filterButtonActive : styles.filterButtonInactive,
                ]}
              >
                <View style={styles.filterChipContent}>
                  <IconSymbol
                    name="circle.fill"
                    size={12}
                    color={statusFilter === "revision" ? "#fff" : Colors.accentYellow}
                  />
                  <ThemedText
                    type="caption"
                    style={statusFilter === "revision" ? styles.filterTextActive : styles.filterTextInactive}
                  >
                    Perlu Revisi
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </ThemedView>

          {feedItems.length === 0 ? (
            <ThemedView style={[styles.emptyStateCard, { backgroundColor: sectionBackground }]}>
              <ThemedText type="headline" style={styles.emptyStateTitle}>
                Belum Ada Notifikasi
              </ThemedText>
              <ThemedText type="subheadline" style={{ color: tertiaryText, textAlign: "center" }}>
                Notifikasi pengajuan akan muncul di sini setelah Anda mengirim formulir.
              </ThemedText>
            </ThemedView>
          ) : (
            feedItems.map((item) => {
              if (item.type === "announcement") {
                return (
                  <ThemedView key={item.announcement.id} style={[styles.announcementCard, { backgroundColor }]}>
                    <View style={[styles.statusIconWrap, styles.announcementIconWrap]}>
                      <IconSymbol name="bell.fill" size={18} color="#AD6500" />
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.announcementBadge}>
                          <ThemedText type="caption" style={styles.announcementBadgeText}>
                            Pengumuman
                          </ThemedText>
                        </View>
                        <ThemedText type="caption" style={{ color: tertiaryText }}>
                          {formatDate(item.announcement.created_at)}
                        </ThemedText>
                      </View>

                      <ThemedText type="subheadline" style={styles.notificationTitleLong} numberOfLines={2}>
                        {item.announcement.title}
                      </ThemedText>

                      <ThemedText type="tightFootnote" style={{ color: tertiaryText }} numberOfLines={2}>
                        {item.announcement.message}
                      </ThemedText>

                      <ThemedText type="caption" style={[styles.announcementSource, { color: secondaryText }]}>
                        Firebase Push Notification
                      </ThemedText>
                    </View>
                  </ThemedView>
                );
              }

              const submission = item.submission;
              const statusTone = getStatusMeta(submission.progress_status);

              return (
                <Pressable
                  key={submission.id}
                  onPress={() => setSelectedSubmission(submission)}
                  style={[styles.notificationCard, { backgroundColor }]}
                >
                  <View style={[styles.statusIconWrap, { backgroundColor: statusTone.badgeBackground }]}>
                    <IconSymbol name={statusTone.iconName} size={18} color={statusTone.badgeText} />
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.statusBadge, { backgroundColor: statusTone.badgeBackground }]}>
                        <ThemedText type="caption" style={{ color: statusTone.badgeText, fontWeight: "700" }}>
                          {submission.progress_status}
                        </ThemedText>
                      </View>
                      <ThemedText type="caption" style={{ color: tertiaryText }}>
                        {formatDate(submission.updated_at)}
                      </ThemedText>
                    </View>

                    <ThemedText type="subheadline" style={styles.notificationTitleLong} numberOfLines={2}>
                      {shortResearchType(submission.research_type)}
                    </ThemedText>

                    <ThemedText type="tightFootnote" style={{ color: tertiaryText, marginBottom: 6 }} numberOfLines={2}>
                      #{submission.request_number} - {submission.research_upload?.title ?? submission.created_at}
                    </ThemedText>

                    <View style={styles.cardFooterRow}>
                      <ThemedText type="caption" style={{ color: secondaryText, flex: 1 }} numberOfLines={1}>
                        Ketuk untuk melihat detail pengajuan
                      </ThemedText>
                      <IconSymbol name="chevron.right" size={16} color={Colors.accentBlue} />
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </Animated.ScrollView>

      <Modal
        visible={selectedSubmission !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedSubmission(null)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalTopBar}>
            <ThemedText type="title4">Detail Pengajuan</ThemedText>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedSubmission(null)}
            >
              <ThemedText type="subheadline" style={{ color: Colors.accentBlue, fontWeight: "700" }}>
                Tutup
              </ThemedText>
            </Pressable>
          </View>

          {selectedSubmission && (
            <ScrollView contentContainerStyle={styles.modalContent}>
              <ThemedView style={[styles.modalCard, { backgroundColor: sectionBackground }]}>
                <ThemedText type="headline" style={{ marginBottom: 12 }}>
                  Ringkasan
                </ThemedText>
                <DetailRow label="Nomor Permintaan" value={selectedSubmission.request_number} />
                <DetailRow label="Status" value={selectedSubmission.progress_status} />
                <DetailRow label="Jenis Penelitian" value={shortResearchType(selectedSubmission.research_type)} />
                <DetailRow label="Judul Penelitian" value={selectedSubmission.research_upload?.title} />
                <DetailRow label="Dibuat" value={formatDateTime(selectedSubmission.created_at)} />
                <DetailRow label="Terakhir Diperbarui" value={formatDateTime(selectedSubmission.updated_at)} />
              </ThemedView>

              <ThemedView style={[styles.modalCard, { backgroundColor: sectionBackground }]}>
                <ThemedText type="headline" style={{ marginBottom: 12 }}>
                  Informasi Pemohon
                </ThemedText>
                <DetailRow label="Nama" value={selectedSubmission.name} />
                <DetailRow label="Email" value={selectedSubmission.email} />
                <DetailRow label="No. Telepon" value={selectedSubmission.phone} />
                <DetailRow label="NIK" value={selectedSubmission.national_identity_number} />
                <DetailRow label="Tanggal Lahir" value={selectedSubmission.date_of_birth} />
                <DetailRow label="Gender" value={selectedSubmission.gender} />
                <DetailRow label="Pendidikan Terakhir" value={selectedSubmission.last_education} />
                <DetailRow label="Pekerjaan" value={selectedSubmission.occupation} />
              </ThemedView>

              <ThemedView style={[styles.modalCard, { backgroundColor: sectionBackground }]}>
                <ThemedText type="headline" style={{ marginBottom: 12 }}>
                  Dokumen
                </ThemedText>
                <DocumentRow label="Surat Permohonan" url={selectedSubmission.application_letter} />
                <DocumentRow label="Proposal Penelitian" url={selectedSubmission.research_proposal} />
                <DocumentRow label="Ethics Clearance" url={selectedSubmission.ethics_clearance_letter} />
                <DocumentRow label="Surat Pernyataan Laporan Akhir" url={selectedSubmission.final_report_statement_letter} />
                <DocumentRow label="Surat Rekomendasi" url={selectedSubmission.recommendation_letter} />
              </ThemedView>
            </ScrollView>
          )}
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screenPadding: {
    marginHorizontal: 24,
    marginBottom: 28,
    marginTop: 54,
  },
  filterWrap: {
    borderRadius: Radius.default,
    padding: 12,
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  filterButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterButtonsRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: Colors.accentBlue,
    borderColor: Colors.accentBlue,
  },
  filterButtonInactive: {
    backgroundColor: "transparent",
    borderColor: Colors.light.fill.secondary,
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  filterTextInactive: {
    color: Colors.light.text.secondary,
    fontWeight: "600",
  },
  filterChipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emptyStateCard: {
    borderRadius: Radius.default,
    padding: 20,
    alignItems: "center",
  },
  emptyStateTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  notificationCard: {
    borderRadius: Radius.default,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  announcementCard: {
    borderRadius: Radius.default,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F6E2C5",
  },
  statusIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 10,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  announcementIconWrap: {
    backgroundColor: "#FFEFD8",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  notificationTitleLong: {
    fontWeight: "700",
    marginBottom: 5,
    fontSize: 14,
    lineHeight: 18,
    flexShrink: 1,
  },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  announcementBadge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: "#FFEFD8",
  },
  announcementBadgeText: {
    color: "#AD6500",
    fontWeight: "700",
  },
  announcementSource: {
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 56,
  },
  modalTopBar: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.fill.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 12,
  },
  modalCard: {
    borderRadius: Radius.default,
    padding: 14,
  },
  detailRow: {
    marginBottom: 10,
  },
  documentRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  documentRowDisabled: {
    opacity: 0.6,
  },
  documentLabelBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
});