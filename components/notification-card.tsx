import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, RADIUS } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

// Notification status tone type
export type NotificationStatusTone = {
  kind: "approved" | "pending" | "revision" | "announcement";
  iconName: "checkmark.shield.fill" | "circle.fill" | "bell.fill";
};

// Define interface for NotificationCard component
interface Props {
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
}

/**
 * Renders a notification card.
 * @param props
 * @returns NotificationCard component
 */
export default function NotificationCard({
  backgroundColor,
  createdAtLabel,
  statusLabel,
  title,
  subtitle,
  footerLabel,
  statusTone,
  announcement = false,
  announcementLabel = "Pengumuman",
  onPress,
}: Props) {
  const Container = onPress ? Pressable : View;
  
  const badgeColors = {
    approved: {
      bg: useThemeColor({ light: Colors.notificationBadge.approved.background, dark: "rgba(52, 199, 89, 0.15)" }, "background"),
      text: useThemeColor({ light: Colors.notificationBadge.approved.text, dark: Colors.accentGreen }, "text.primary"),
    },
    pending: {
      bg: useThemeColor({ light: Colors.notificationBadge.pending.background, dark: "rgba(0, 122, 255, 0.15)" }, "background"),
      text: useThemeColor({ light: Colors.notificationBadge.pending.text, dark: Colors.accentBlue }, "text.primary"),
    },
    revision: {
      bg: useThemeColor({ light: Colors.notificationBadge.revision.background, dark: "rgba(255, 204, 0, 0.1)" }, "background"),
      text: useThemeColor({ light: Colors.notificationBadge.revision.text, dark: Colors.accentYellow }, "text.primary"),
    },
    announcement: {
      bg: useThemeColor({ light: Colors.notificationBadge.announcement.background, dark: "rgba(88, 86, 214, 0.15)" }, "background"),
      text: useThemeColor({ light: Colors.notificationBadge.announcement.text, dark: "#5E5CE6" }, "text.primary"),
    },
  };

  const borderColor = useThemeColor({}, "components.supportCard.border");
  const currentBadgeColor = badgeColors[announcement ? "announcement" : statusTone.kind];

  return (
    <Container
      {...(onPress ? { onPress } : {})}
      style={[
        styles.card,
        { backgroundColor },
        { borderColor, borderWidth: 1 },
        onPress && styles.pressableCard,
      ]}
    >
      <View
        style={[
          styles.statusIconWrap,
          { backgroundColor: currentBadgeColor.bg },
        ]}
      >
        <IconSymbol
          name={announcement ? "bell.fill" : statusTone.iconName}
          size={18}
          color={currentBadgeColor.text}
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.statusBadge,
              announcement && styles.announcementBadge,
              {
                backgroundColor: currentBadgeColor.bg,
              },
            ]}
          >
            <ThemedText
              type="caption"
              style={[
                styles.statusBadgeText,
                announcement && styles.announcementBadgeText,
                {
                  color: currentBadgeColor.text,
                },
              ]}
            >
              {announcement ? announcementLabel : statusLabel}
            </ThemedText>
          </View>
          <ThemedText
            type="caption"
            style={{ color: Colors.light.text.tertiary }}
          >
            {createdAtLabel}
          </ThemedText>
        </View>

        <ThemedText
          type="subheadline"
          style={styles.notificationTitleLong}
          numberOfLines={2}
        >
          {title}
        </ThemedText>
        <ThemedText
          type="tightFootnote"
          style={{ color: Colors.light.text.tertiary }}
          numberOfLines={2}
        >
          {subtitle}
        </ThemedText>
        <View style={styles.cardFooterRow}>
          <ThemedText
            type="caption"
            style={{ color: Colors.light.text.secondary, flex: 1 }}
            numberOfLines={1}
          >
            {footerLabel}
          </ThemedText>
          {!announcement && (
            <IconSymbol
              name="chevron.right"
              size={16}
              color={Colors.accentBlue}
            />
          )}
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.DEFAULT,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
  },
  pressableCard: {
    minHeight: 0,
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
    backgroundColor: Colors.notificationBadge.announcement.background,
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
  statusBadgeText: {
    fontWeight: "700",
  },
  announcementBadge: {},
  announcementBadgeText: {},
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
});
