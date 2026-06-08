import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, RADIUS, SCREEN_MARGIN_HORIZONTAL } from "@/constants/theme";
import { useSubmissions } from "@/contexts/submission-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { downloadAndOpenDocument } from "@/services/document";
import { formatDate } from "@/services/format-date";
import { shortResearchType } from "@/services/format-text";
import { ISubmissionData } from "@/types/submission";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import NotificationCard, {
  type NotificationStatusTone,
} from "../../components/notification-card";
import NotificationModal from "../../components/notification-modal";

// Interface for filter
type SortOrder = "newest" | "oldest";
type StatusFilter = "all" | "pending" | "approved" | "revision";

// Interface for announcement notification
type AnnouncementNotification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
};

// Interface for feed items
type FeedItem =
  | { type: "submission"; created_at: string; submission: ISubmissionData }
  | {
      type: "announcement";
      created_at: string;
      announcement: AnnouncementNotification;
    };

// Prepared dummy announcements to simulate Firebase push notifications
const DUMMY_ANNOUNCEMENTS: AnnouncementNotification[] = [
  {
    id: "ann-1",
    title: "Pemeliharaan Sistem Layanan Rekomendasi",
    message:
      "Layanan akan mengalami pemeliharaan pada Jumat, 20.00-22.00 WIB. Mohon simpan draft Anda sebelum waktu tersebut.",
    created_at: "2026-05-18T13:10:00.000Z",
  },
  {
    id: "ann-2",
    title: "Perubahan Ketentuan Unggah Dokumen",
    message:
      "Format dokumen proposal kini mendukung ukuran hingga 25 MB. Pastikan file dapat dibaca dengan jelas sebelum dikirim.",
    created_at: "2026-05-15T08:30:00.000Z",
  },
  {
    id: "ann-3",
    title: "Pengingat Verifikasi Email Akun",
    message:
      "Silakan verifikasi email untuk mendapatkan notifikasi status pengajuan terbaru melalui push notification Firebase.",
    created_at: "2026-05-12T04:45:00.000Z",
  },
];

/**
 * Determines the status metadata (badge color, text color, stripe color, and icon) based on the submission status text.
 * @param status
 * @returns
 */
export const getStatusMeta = (status: string) => {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("selesai") ||
    normalized.includes("approved") ||
    normalized.includes("diterima")
  ) {
    return {
      kind: "approved" as const,
      badgeBackground: Colors.notificationBadge.approved.background,
      badgeText: Colors.notificationBadge.approved.text,
      stripe: Colors.notificationBadge.approved.stripe,
      iconName: "checkmark.shield.fill" as const,
    };
  }

  if (
    normalized.includes("revisi") ||
    normalized.includes("review") ||
    normalized.includes("perbaikan")
  ) {
    return {
      kind: "revision" as const,
      badgeBackground: Colors.notificationBadge.revision.background,
      badgeText: Colors.notificationBadge.revision.text,
      stripe: Colors.notificationBadge.revision.stripe,
      iconName: "circle.fill" as const,
    };
  }

  return {
    kind: "pending" as const,
    badgeBackground: Colors.notificationBadge.pending.background,
    badgeText: Colors.notificationBadge.pending.text,
    stripe: Colors.notificationBadge.pending.stripe,
    iconName: "circle.fill" as const,
  };
};

export default function NotificationScreen() {
  const submissions = useSubmissions();
  const backgroundColor = useThemeColor({}, "fill.vibrant.tertiary");
  const sectionBackground = useThemeColor({}, "fill.vibrant.tertiary");
  const tertiaryText = useThemeColor({}, "text.secondary");
  const secondaryText = useThemeColor({}, "text.secondary");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<ISubmissionData | null>(null);
  const [downloadProgressMap, setDownloadProgressMap] = useState<
    Record<string, number>
  >({});

  // Get user submissions from context
  const userSubmissions = useMemo(
    () => submissions?.userSubmissions ?? [],
    [submissions?.userSubmissions],
  );

  // Get refreshing state from context
  const refreshing = submissions?.isRefreshingUser ?? false;

  // Handler for pull-to-refresh action
  const handleRefresh = async () => {
    await submissions?.refreshUserSubmissions();
  };

  // Memoized sorted submissions based on creation date
  const sortedSubmissions = useMemo(() => {
    return [...userSubmissions];
  }, [userSubmissions]);

  // Memoized filtered submissions based on status filter
  const filteredSubmissions = useMemo(() => {
    if (statusFilter === "all") return sortedSubmissions;
    return sortedSubmissions.filter((submission) => {
      const statusMeta = getStatusMeta(submission.progress_status);
      return statusMeta.kind === statusFilter;
    });
  }, [sortedSubmissions, statusFilter]);

  // Memoized feed items combining submissions and announcements, sorted by creation date
  const feedItems = useMemo(() => {
    const submissionItems: FeedItem[] = filteredSubmissions.map(
      (submission) => ({
        type: "submission",
        created_at: submission.created_at,
        submission,
      }),
    );

    const announcementItems: FeedItem[] = DUMMY_ANNOUNCEMENTS.map(
      (announcement) => ({
        type: "announcement",
        created_at: announcement.created_at,
        announcement,
      }),
    );

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

  return (
    <>
      <ParallaxScrollView
        title="Notifikasi"
        contentContainerStyle={{
          paddingHorizontal: SCREEN_MARGIN_HORIZONTAL,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Content */}

        {/* Filter */}
        <ThemedView
          style={[styles.filterWrap, { backgroundColor: sectionBackground }]}
        >
          <ThemedText type="caption" style={styles.filterLabel}>
            Urutkan tanggal dibuat
          </ThemedText>
          <View style={styles.filterButtonsRow}>
            <Pressable
              onPress={() => setSortOrder("newest")}
              style={[
                styles.filterButton,
                sortOrder === "newest"
                  ? styles.filterButtonActive
                  : styles.filterButtonInactive,
              ]}
            >
              <ThemedText
                type="caption"
                style={
                  sortOrder === "newest"
                    ? styles.filterTextActive
                    : styles.filterTextInactive
                }
              >
                Terbaru
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setSortOrder("oldest")}
              style={[
                styles.filterButton,
                sortOrder === "oldest"
                  ? styles.filterButtonActive
                  : styles.filterButtonInactive,
              ]}
            >
              <ThemedText
                type="caption"
                style={
                  sortOrder === "oldest"
                    ? styles.filterTextActive
                    : styles.filterTextInactive
                }
              >
                Terlama
              </ThemedText>
            </Pressable>
          </View>
          {/* Status Filter */}
          <ThemedText
            type="caption"
            style={[styles.filterLabel, { marginTop: 10 }]}
          >
            Status
          </ThemedText>
          <View style={styles.filterButtonsRowWrap}>
            <Pressable
              onPress={() => setStatusFilter("all")}
              style={[
                styles.filterButton,
                statusFilter === "all"
                  ? styles.filterButtonActive
                  : styles.filterButtonInactive,
              ]}
            >
              <ThemedText
                type="caption"
                style={
                  statusFilter === "all"
                    ? styles.filterTextActive
                    : styles.filterTextInactive
                }
              >
                Semua
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setStatusFilter("pending")}
              style={[
                styles.filterButton,
                statusFilter === "pending"
                  ? styles.filterButtonActive
                  : styles.filterButtonInactive,
              ]}
            >
              <View style={styles.filterChipContent}>
                <IconSymbol
                  name="circle.fill"
                  size={10}
                  color={
                    statusFilter === "pending" ? "#fff" : Colors.accentBlue
                  }
                />
                <ThemedText
                  type="caption"
                  style={
                    statusFilter === "pending"
                      ? styles.filterTextActive
                      : styles.filterTextInactive
                  }
                >
                  Pending
                </ThemedText>
              </View>
            </Pressable>
            <Pressable
              onPress={() => setStatusFilter("approved")}
              style={[
                styles.filterButton,
                statusFilter === "approved"
                  ? styles.filterButtonActive
                  : styles.filterButtonInactive,
              ]}
            >
              <View style={styles.filterChipContent}>
                <IconSymbol
                  name="checkmark.shield.fill"
                  size={12}
                  color={
                    statusFilter === "approved" ? "#fff" : Colors.accentGreen
                  }
                />
                <ThemedText
                  type="caption"
                  style={
                    statusFilter === "approved"
                      ? styles.filterTextActive
                      : styles.filterTextInactive
                  }
                >
                  Disetujui
                </ThemedText>
              </View>
            </Pressable>
            <Pressable
              onPress={() => setStatusFilter("revision")}
              style={[
                styles.filterButton,
                statusFilter === "revision"
                  ? styles.filterButtonActive
                  : styles.filterButtonInactive,
              ]}
            >
              <View style={styles.filterChipContent}>
                <IconSymbol
                  name="circle.fill"
                  size={12}
                  color={
                    statusFilter === "revision" ? "#fff" : Colors.accentYellow
                  }
                />
                <ThemedText
                  type="caption"
                  style={
                    statusFilter === "revision"
                      ? styles.filterTextActive
                      : styles.filterTextInactive
                  }
                >
                  Perlu Revisi
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </ThemedView>
        {/* End Filter */}

        {/* Notification Items */}
        {feedItems.length === 0 ? (
          <ThemedView
            style={[
              styles.emptyStateCard,
              { backgroundColor: sectionBackground },
            ]}
          >
            <ThemedText type="headline" style={styles.emptyStateTitle}>
              Belum Ada Notifikasi
            </ThemedText>
            <ThemedText
              type="subheadline"
              style={{ color: tertiaryText, textAlign: "center" }}
            >
              Notifikasi pengajuan akan muncul di sini setelah Anda mengirim
              formulir.
            </ThemedText>
          </ThemedView>
        ) : (
          feedItems.map((item) => {
            if (item.type === "announcement") {
              return (
                <NotificationCard
                  key={item.announcement.id}
                  backgroundColor={backgroundColor}
                  createdAtLabel={formatDate(item.announcement.created_at)}
                  statusLabel="Pengumuman"
                  title={item.announcement.title}
                  subtitle={item.announcement.message}
                  footerLabel="Firebase Push Notification"
                  statusTone={
                    {
                      badgeBackground:
                        Colors.notificationBadge.announcement.background,
                      badgeText: Colors.notificationBadge.announcement.text,
                      iconName: "circle.fill",
                    } as NotificationStatusTone
                  }
                  announcement
                />
              );
            }

            const submission = item.submission;
            const statusTone = getStatusMeta(submission.progress_status);

            return (
              <NotificationCard
                key={submission.id}
                backgroundColor={backgroundColor}
                createdAtLabel={formatDate(submission.updated_at)}
                statusLabel={submission.progress_status}
                title={shortResearchType(submission.research_type)}
                subtitle={`#${submission.request_number} - ${submission.research_upload?.title ?? submission.created_at}`}
                footerLabel="Ketuk untuk melihat detail pengajuan"
                statusTone={statusTone}
                onPress={() => setSelectedSubmission(submission)}
              />
            );
          })
        )}
        {/* End Notification Items */}

        {/* End Content */}
      </ParallaxScrollView>

      <NotificationModal
        visible={selectedSubmission !== null}
        submission={selectedSubmission}
        sectionBackground={sectionBackground}
        secondaryText={secondaryText}
        tertiaryText={tertiaryText}
        onClose={() => setSelectedSubmission(null)}
        onOpenDocument={openDocument}
        downloadProgressMap={downloadProgressMap}
        onReuploadSuccess={async () => {
          await submissions?.refreshUserSubmissions();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  filterWrap: {
    borderRadius: RADIUS.DEFAULT,
    padding: 16,
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: "600",
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
    borderRadius: RADIUS.DEFAULT,
    padding: 20,
    alignItems: "center",
  },
  emptyStateTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  notificationCard: {
    borderRadius: RADIUS.DEFAULT,
  },
});
