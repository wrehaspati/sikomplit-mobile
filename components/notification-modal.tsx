import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, RADIUS } from '@/constants/theme';
import { formatDateTime } from '@/services/format-date';
import { ISubmissionData } from '@/types/submission';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type Props = {
  visible: boolean;
  submission: ISubmissionData | null;
  sectionBackground: string;
  secondaryText: string;
  tertiaryText: string;
  onClose: () => void;
  onOpenDocument: (url?: string | null) => void;
  downloadProgressMap: Record<string, number>;
};

export default function NotificationModal({
  visible,
  submission,
  sectionBackground,
  secondaryText,
  tertiaryText,
  onClose,
  onOpenDocument,
  downloadProgressMap,
}: Props) {
  const isValidHttpUrl = (value?: string | null) => !!value && /^https?:\/\//i.test(value);

  const DocumentRow = ({ label, url }: { label: string; url?: string | null }) => {
    const available = isValidHttpUrl(url);
    const progress = url ? downloadProgressMap[url] ?? null : null;
    const isDownloading = progress !== null && progress >= 0 && progress < 1;

    return (
      <Pressable onPress={() => onOpenDocument(url)} disabled={!available} style={[styles.documentRow, !available && styles.documentRowDisabled]}>
        <View style={styles.documentLabelBlock}>
          <IconSymbol name="document.fill" size={16} color={available ? Colors.accentBlue : Colors.light.text.secondary} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <ThemedText type="subheadline" style={{ fontWeight: '600' }} numberOfLines={1}>
              {label}
            </ThemedText>
            <ThemedText type="caption" style={{ color: available ? Colors.accentBlue : secondaryText }}>
              {available ? 'Buka / Unduh' : 'Belum tersedia'}
            </ThemedText>
          </View>
        </View>
        {isDownloading ? (
          <ThemedText type="caption" style={{ color: Colors.accentBlue, fontWeight: '700' }}>
            {Math.round((progress ?? 0) * 100)}%
          </ThemedText>
        ) : (
          available && <IconSymbol name="chevron.right" size={16} color={Colors.accentBlue} />
        )}
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <ThemedView style={styles.modalContainer} variant="card">
        <View style={styles.modalTopBar}>
          <ThemedText type="title4">Detail Pengajuan</ThemedText>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <ThemedText type="subheadline" style={{ color: Colors.accentBlue, fontWeight: '700' }}>
              Tutup
            </ThemedText>
          </Pressable>
        </View>

        {submission && (
          <ScrollView contentContainerStyle={styles.modalContent}>
            <ThemedView style={[styles.modalCard, { backgroundColor: sectionBackground }]}>
              <ThemedText type="headline" style={{ marginBottom: 12 }}>
                Ringkasan
              </ThemedText>
              <DetailRow label="Nomor Permintaan" value={submission.request_number} tertiaryText={tertiaryText} />
              <DetailRow label="Status" value={submission.progress_status} tertiaryText={tertiaryText} />
              <DetailRow label="Jenis Penelitian" value={submission.research_type.split('/')[0] ?? submission.research_type} tertiaryText={tertiaryText} />
              <DetailRow label="Judul Penelitian" value={submission.research_upload?.title} tertiaryText={tertiaryText} />
              <DetailRow label="Dibuat" value={formatDateTime(submission.created_at)} tertiaryText={tertiaryText} />
              <DetailRow label="Terakhir Diperbarui" value={formatDateTime(submission.updated_at)} tertiaryText={tertiaryText} />
            </ThemedView>

            <ThemedView style={[styles.modalCard, { backgroundColor: sectionBackground }]}>
              <ThemedText type="headline" style={{ marginBottom: 12 }}>
                Informasi Pemohon
              </ThemedText>
              <DetailRow label="Nama" value={submission.name} tertiaryText={tertiaryText} />
              <DetailRow label="Email" value={submission.email} tertiaryText={tertiaryText} />
              <DetailRow label="No. Telepon" value={submission.phone} tertiaryText={tertiaryText} />
              <DetailRow label="NIK" value={submission.national_identity_number} tertiaryText={tertiaryText} />
              <DetailRow label="Tanggal Lahir" value={submission.date_of_birth} tertiaryText={tertiaryText} />
              <DetailRow label="Gender" value={submission.gender} tertiaryText={tertiaryText} />
              <DetailRow label="Pendidikan Terakhir" value={submission.last_education} tertiaryText={tertiaryText} />
              <DetailRow label="Pekerjaan" value={submission.occupation} tertiaryText={tertiaryText} />
            </ThemedView>

            <ThemedView style={[styles.modalCard, { backgroundColor: sectionBackground }]}>
              <ThemedText type="headline" style={{ marginBottom: 12 }}>
                Dokumen
              </ThemedText>
              <DocumentRow label="Surat Permohonan" url={submission.application_letter} />
              <DocumentRow label="Proposal Penelitian" url={submission.research_proposal} />
              <DocumentRow label="Ethics Clearance" url={submission.ethics_clearance_letter} />
              <DocumentRow label="Surat Pernyataan Laporan Akhir" url={submission.final_report_statement_letter} />
              <DocumentRow label="Surat Rekomendasi" url={submission.recommendation_letter} />
            </ThemedView>
          </ScrollView>
        )}
      </ThemedView>
    </Modal>
  );
}

function DetailRow({ label, value, tertiaryText }: { label: string; value?: string | null; tertiaryText: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="caption" style={{ color: tertiaryText, marginBottom: 2 }}>
        {label}
      </ThemedText>
      <ThemedText type="subheadline" style={{ fontWeight: '600' }}>
        {value && value.trim().length > 0 ? value : '-'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 24,
  },
  modalTopBar: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.fill.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    paddingVertical: 4,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 12,
  },
  modalCard: {
    borderRadius: RADIUS.DEFAULT,
    padding: 16,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)'
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  documentRowDisabled: {
    opacity: 0.6,
  },
  documentLabelBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
});