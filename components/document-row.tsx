import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { ThemedView } from "./themed-view";

export interface DocumentRowProps {
  /** Primary label shown on the row */
  label: string;
  /** URL of the document — row is active when this is a valid http(s) URL */
  url?: string | null;
  /** Optional secondary line text (overrides default "Ketuk untuk membuka" / "Belum tersedia") */
  subtitle?: string;
  /** Download-progress map keyed by URL — the row shows a progress badge when the URL has an entry 0..1 */
  downloadProgressMap?: Record<string, number>;
  /** Called when the user taps the row */
  onPress?: (url?: string | null) => void;
  /** When true the row renders as "downloading" with a spinner instead of a chevron */
  loading?: boolean;
}

const isValidHttpUrl = (value?: string | null) =>
  !!value && /^https?:\/\//i.test(value);

/**
 * A reusable document-row component with a left accent stripe, icon badge,
 * label/subtitle, and download-progress support.
 */
export default function DocumentRow({
  label,
  url,
  subtitle,
  downloadProgressMap,
  onPress,
  loading = false,
}: DocumentRowProps) {
  const available = isValidHttpUrl(url);
  const borderColor = useThemeColor({}, "components.supportCard.border");
  const progress =
    url && downloadProgressMap ? (downloadProgressMap[url] ?? null) : null;
  const isDownloading =
    loading || (progress !== null && progress >= 0 && progress < 1);
  const progressPercent = Math.round((progress ?? 0) * 100);

  const resolvedSubtitle =
    subtitle ?? (available ? "Ketuk untuk membuka" : "Belum tersedia");

  return (
    <ThemedView variant="card" style={styles.wrapper}>
      <Pressable
        onPress={() => onPress?.(url)}
        disabled={!available && !onPress}
        style={({ pressed }) => [
          styles.row,
          { borderColor: borderColor },
          !available && styles.rowDisabled,
          pressed && available && { opacity: 0.7 },
        ]}
      >
        {/* Left accent stripe */}
        <View
          style={[
            styles.accentStripe,
            {
              backgroundColor: available
                ? Colors.accentBlue
                : Colors.light.fill.secondary,
            },
          ]}
        />
        <View style={styles.labelBlock}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: available
                  ? "rgba(0, 136, 255, 0.1)"
                  : Colors.light.fill.tertiary,
              },
            ]}
          >
            <IconSymbol
              name="document.fill"
              size={14}
              color={
                available ? Colors.accentBlue : Colors.light.text.secondary
              }
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <ThemedText
              type="subheadline"
              style={{ fontWeight: "600" }}
              numberOfLines={1}
            >
              {label}
            </ThemedText>
            <ThemedText
              type="caption"
              style={{
                color: available
                  ? Colors.accentBlue
                  : Colors.light.text.secondary,
                marginTop: 1,
              }}
            >
              {isDownloading ? `${progressPercent}% selesai` : resolvedSubtitle}
            </ThemedText>
          </View>
        </View>

        {/* Right side indicator */}
        {isDownloading ? (
          loading ? (
            <ActivityIndicator size="small" color={Colors.accentBlue} />
          ) : (
            <View style={styles.progressBadge}>
              <ThemedText
                type="caption"
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 10,
                  textAlign: "center",
                }}
              >
                {progressPercent}%
              </ThemedText>
            </View>
          )
        ) : (
          available && (
            <IconSymbol
              name="chevron.right"
              size={14}
              color={Colors.accentBlue}
            />
          )
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 6,
    boxShadow: "0px 0px 0px 0px rgba(0, 0, 0, 0.08)",
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    paddingLeft: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    overflow: "hidden",
  },
  rowDisabled: {
    opacity: 0.55,
  },
  accentStripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  labelBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  progressBadge: {
    backgroundColor: Colors.accentBlue,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 36,
    alignItems: "center",
  },
});
