import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, RADIUS } from '@/constants/theme';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

export type NotificationStatusTone = {
  badgeBackground: string;
  badgeText: string;
  iconName: 'checkmark.shield.fill' | 'circle.fill';
};

type Props = {
  backgroundColor: string;
  createdAtLabel: string;
  statusLabel: string;
  title: string;
  subtitle: string;
  footerLabel: string;
  statusTone: NotificationStatusTone;
  announcement?: boolean;
  announcementLabel?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function NotificationCard({
  backgroundColor,
  createdAtLabel,
  statusLabel,
  title,
  subtitle,
  footerLabel,
  statusTone,
  announcement = false,
  announcementLabel = 'Pengumuman',
  onPress,
}: Props) {
  const Container = onPress ? Pressable : View;
  const announcementBadge = Colors.notificationBadge.announcement;

  return (
    <Container
      {...(onPress ? { onPress } : {})}
      style={[
        styles.card,
        { backgroundColor },
        announcement && styles.announcementCard,
        onPress && styles.pressableCard,
        //!announcement && { borderColor: statusTone.badgeBackground, borderWidth: 1 }
      ]}
    >
      <View style={[styles.statusIconWrap, announcement ? { backgroundColor: announcementBadge.background } : { backgroundColor: statusTone.badgeBackground }]}>
        <IconSymbol name={announcement ? 'bell.fill' : statusTone.iconName} size={18} color={announcement ? announcementBadge.icon : statusTone.badgeText} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.statusBadge, announcement && styles.announcementBadge, { backgroundColor: announcement ? announcementBadge.background : statusTone.badgeBackground }]}>
            <ThemedText type="caption" style={[styles.statusBadgeText, announcement && styles.announcementBadgeText, { color: announcement ? announcementBadge.text : statusTone.badgeText }]}>
              {announcement ? announcementLabel : statusLabel}
            </ThemedText>
          </View>
          <ThemedText type="caption" style={{ color: Colors.light.text.tertiary }}>
            {createdAtLabel}
          </ThemedText>
        </View>

        <ThemedText type="subheadline" style={styles.notificationTitleLong} numberOfLines={2}>
          {title}
        </ThemedText>
        <ThemedText type="tightFootnote" style={{ color: Colors.light.text.tertiary }} numberOfLines={2}>
          {subtitle}
        </ThemedText>
        <View style={styles.cardFooterRow}>
          <ThemedText type="caption" style={{ color: Colors.light.text.secondary, flex: 1 }} numberOfLines={1}>
            {footerLabel}
          </ThemedText>
          {!announcement && <IconSymbol name="chevron.right" size={16} color={Colors.accentBlue} />}
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.DEFAULT,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)'
  },
  pressableCard: {
    minHeight: 0,
  },
  announcementCard: {
    // borderWidth: 1,
    // borderColor: Colors.notificationBadge.announcement.border,
  },
  statusIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 10,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementIconWrap: {
    backgroundColor: Colors.notificationBadge.announcement.background,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  statusBadgeText: {
    fontWeight: '700',
  },
  announcementBadge: {},
  announcementBadgeText: {},
  notificationTitleLong: {
    fontWeight: '700',
    marginBottom: 5,
    fontSize: 14,
    lineHeight: 18,
    flexShrink: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});