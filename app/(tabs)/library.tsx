import DocumentRow from "@/components/document-row";
import ImagePreviewModal from "@/components/image-preview-modal";
import BottomSheetModal from "@/components/modal";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import ThemedButton from "@/components/themed-button";
import ThemedSeparator from "@/components/themed-separator";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, RADIUS, SCREEN_MARGIN_HORIZONTAL } from "@/constants/theme";
import { useBookmarks } from "@/contexts/bookmark-context";
import { useSubmissions } from "@/contexts/submission-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { downloadAndOpenDocument } from "@/services/document";
import { IPoster, IPublishedSubmission } from "@/types/submission";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function LibraryScreen() {
  const submissions = useSubmissions();
  const cardBackgound = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text.primary");
  const iconColor = useThemeColor({}, "text.secondary");
  const borderColor = useThemeColor({}, "components.supportCard.border");
  const flyers = submissions?.poster ?? [];
  const bookmarks = useBookmarks();
  const [scrollY] = useState(() => new Animated.Value(0));
  const [searchFocusAnim] = useState(() => new Animated.Value(0));
  const [titleVisibilityAnim] = useState(() => new Animated.Value(0));
  const [filterButtonScale] = useState(() => new Animated.Value(1));
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedPublication, setSelectedPublication] =
    useState<IPublishedSubmission | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | undefined>(undefined);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [downloadProgressMap, setDownloadProgressMap] = useState<
    Record<string, number>
  >({});

  // Image skeleton animation
  const [loaded, setLoaded] = useState(false);
  const [pulseAnim] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    if (loaded) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [loaded]);

  const published = useMemo(
    () => submissions?.publishedSubmissions ?? [],
    [submissions?.publishedSubmissions],
  );
  const refreshing = submissions?.isRefreshingPublished ?? false;

  // Prefetch flyer images on data load for instant display
  useEffect(() => {
    if (!published || published.length === 0) return;
    published.forEach((item) => {
      if (item.flyer) {
        Image.prefetch(item.flyer);
      }
    });
  }, [published]);

  // Handler for bookmark toggle
  const handleBookmark = (id: string) => {
    bookmarks?.toggleBookmark(id);
  };

  // Handlers for search input focus and blur animations
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.parallel([
      Animated.timing(searchFocusAnim, {
        toValue: -40,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(titleVisibilityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
    scrollY.setValue(20);
  };

  // Function to validate if a string is a valid HTTP URL
  const isValidHttpUrl = (value?: string | null) => {
    if (!value) return false;
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

  // Handlers for search input focus and blur animations
  const handleSearchBlur = () => {
    Animated.parallel([
      Animated.timing(searchFocusAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(titleVisibilityAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setIsSearchFocused(false));
    scrollY.setValue(0);
  };

  // Handler to clear search input and dismiss keyboard
  const handleSearchClear = () => {
    setQuery("");
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  // Flyer Card Component
  const FlyerCard = ({ data }: { data: IPoster }) => {
    const [loaded, setLoaded] = useState(false);
    const [pulseAnim] = useState(() => new Animated.Value(0.3));

    useEffect(() => {
      if (loaded) return;
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }, [loaded]);

    return (
      <Pressable
        onPress={() => {
          setPreviewUri(data.image_url);
          setPreviewVisible(true);
        }}
      >
        <View style={styles.flyerContainer}>
          <Image
            style={styles.flyerImage}
            source={{ uri: data.image_url }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            onLoad={() => setLoaded(true)}
          />
          {!loaded && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.flyerPlaceholder,
                { opacity: pulseAnim },
              ]}
            />
          )}
        </View>
      </Pressable>
    );
  };

  // Animation for filter button
  useEffect(() => {
    Animated.sequence([
      Animated.spring(filterButtonScale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 25,
        bounciness: 4,
      }),
      Animated.spring(filterButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 25,
        bounciness: 4,
      }),
    ]).start();
  }, [showBookmarksOnly]);

  // Handler for pull-to-refresh action
  const handleRefresh = async () => {
    await submissions?.refreshPublishedSubmissions();
  };

  // Filter published submissions based on search query (case-insensitive) and limit to 6 results for suggestions
  const filteredSuggestions = (published ?? [])
    .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  const renderCard = (item: IPublishedSubmission) => {
    return (
      <ThemedView
        key={item.id}
        variant="card"
        style={{
          marginBottom: 16,
          marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
        }}
      >
        <View style={styles.container}>
          <View style={styles.cardImage}>
            <Image
              source={{ uri: item.flyer }}
              contentFit="fill"
              contentPosition="center"
              cachePolicy="memory-disk"
              style={{
                width: "100%",
                borderRadius: 8,
                backgroundColor: Colors.light.fill.secondary,
                aspectRatio: 2 / 3,
              }}
              onLoad={() => setLoaded(true)}
            />
            {!loaded && (
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  styles.flyerPlaceholder,
                  { opacity: pulseAnim },
                ]}
              />
            )}
          </View>
          <View style={styles.cardContent}>
            <View>
              <View
                style={{
                  justifyContent: "space-between",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <ThemedText type="caption" style={{ marginRight: 8 }}>
                  Terbit pada{" "}
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </ThemedText>
                <Pressable
                  style={{ padding: 4, borderRadius: 4 }}
                  onPress={() => handleBookmark(item.id)}
                  hitSlop={20}
                >
                  {bookmarks?.bookmarkedIds.includes(item.id) ? (
                    <IconSymbol
                      name="bookmark.fill"
                      color={Colors.accentBlue}
                      size={20}
                      style={{
                        shadowColor: Colors.accentBlue,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                      }}
                    />
                  ) : (
                    <IconSymbol
                      name="bookmark"
                      color={Colors.light.icon}
                      size={20}
                    />
                  )}
                </Pressable>
              </View>
              <ThemedText
                type="subheadline"
                style={{
                  marginBottom: 4,
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                {item.title}
              </ThemedText>
            </View>
            <View>
              <ThemedSeparator style={{ marginVertical: 8 }} />
              <ThemedButton
                variant="link"
                size="small"
                hitSlop={10}
                onPress={() => setSelectedPublication(item)}
                style={styles.detailButton}
              >
                Lihat Detail
              </ThemedButton>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  };

  return (
    <ParallaxScrollView
      title="Pustaka Digital"
      scrollYValue={scrollY}
      titleVisibilityValue={titleVisibilityAnim}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Content */}

      {/* Search Input */}
      <Animated.View
        style={[
          {
            transform: [{ translateY: searchFocusAnim }],
            marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
          },
        ]}
      >
        <View style={styles.searchInputContainer}>
          <ThemedTextInput
            value={query}
            onChangeText={setQuery}
            placeholder={"Cari Judul Penelitian..."}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            inputStyle={[
              styles.input,
              { backgroundColor: cardBackgound, borderColor, borderWidth: 1 },
            ]}
            style={{ paddingVertical: 12, paddingRight: 40 }}
            icon={
              <IconSymbol
                name="magnifyingglass"
                style={{ width: 20 }}
                color={iconColor}
              />
            }
          />
          {query.length > 0 && (
            <Pressable
              onPress={handleSearchClear}
              style={styles.searchClearButton}
              hitSlop={10}
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={18}
                color={Colors.light.text.secondary}
              />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* Search Suggestions / Results */}
      {isSearchFocused ? (
        <Animated.View
          style={[
            styles.suggestionPanel,
            {
              transform: [{ translateY: searchFocusAnim }],
              marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
            },
          ]}
        >
          <ThemedText type="caption" style={styles.suggestionHeader}>
            {filteredSuggestions.length > 0
              ? "Hasil ditemukan:"
              : "Tidak ada hasil ditemukan"}
          </ThemedText>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item) => (
              <Pressable
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => setQuery(item.title)}
              >
                <View style={styles.suggestionTextBlock}>
                  <ThemedText
                    type="tightFootnote"
                    style={styles.suggestionTitle}
                  >
                    {item.title}
                  </ThemedText>
                  <ThemedText type="caption">
                    Terbit pada{" "}
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    handleBookmark(item.id);
                  }}
                  hitSlop={10}
                  style={{ padding: 4 }}
                >
                  <IconSymbol
                    name={
                      bookmarks?.bookmarkedIds.includes(item.id)
                        ? "bookmark.fill"
                        : "bookmark"
                    }
                    color={
                      bookmarks?.bookmarkedIds.includes(item.id)
                        ? Colors.accentBlue
                        : Colors.light.icon
                    }
                    size={18}
                  />
                </Pressable>
              </Pressable>
            ))
          ) : (
            <ThemedText type="subheadline" style={styles.noSuggestionText}>
              Coba kata kunci lain atau periksa ejaan judul.
            </ThemedText>
          )}
        </Animated.View>
      ) : (
        <View>
          {/* Flyer Section */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
              }}
            >
              <ThemedText type="title3" style={{ fontWeight: "700" }}>
                Rekomendasi Terkini
              </ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                marginBottom: 24,
                paddingLeft: SCREEN_MARGIN_HORIZONTAL,
                gap: 16,
              }}
              snapToInterval={176 + 16}
              snapToAlignment="start"
              decelerationRate="normal"
            >
              {flyers &&
                flyers.map((element, index) => (
                  <FlyerCard key={index} data={element} />
                ))}
              <View style={{ width: SCREEN_MARGIN_HORIZONTAL - 12 }} />
            </ScrollView>
          </View>
          {/* End Flyer Section */}

          {/* Compact filter buttons */}
          <Animated.View
            style={[
              {
                transform: [{ translateY: searchFocusAnim }],
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_MARGIN_HORIZONTAL,
                gap: 12,
                paddingBottom: 16,
              }}
            >
              <Animated.View
                style={{ transform: [{ scale: filterButtonScale }] }}
              >
                <Pressable
                  onPress={() => setShowBookmarksOnly((s) => !s)}
                  style={[
                    styles.bookmarkFilterButton,
                    showBookmarksOnly
                      ? styles.bookmarkFilterButtonActive
                      : null,
                    {
                      backgroundColor: cardBackgound,
                      borderColor,
                      borderWidth: 1,
                    },
                  ]}
                  hitSlop={8}
                >
                  <IconSymbol
                    name={showBookmarksOnly ? "bookmark.fill" : "bookmark"}
                    size={16}
                    color={showBookmarksOnly ? Colors.accentBlue : textColor}
                  />
                  <ThemedText
                    type="caption"
                    style={{
                      marginLeft: 8,
                      fontWeight: "600",
                      color: showBookmarksOnly ? Colors.accentBlue : textColor,
                    }}
                  >
                    {showBookmarksOnly
                      ? "Tampilkan Semua"
                      : `Tersimpan (${bookmarks?.bookmarkedIds.length ?? 0})`}
                  </ThemedText>
                </Pressable>
              </Animated.View>

              <Pressable
                onPress={() => setSortOrder("newest")}
                style={[
                  styles.bookmarkFilterButton,
                  sortOrder === "newest"
                    ? styles.bookmarkFilterButtonActive
                    : null,
                  {
                    backgroundColor: cardBackgound,
                    borderColor,
                    borderWidth: 1,
                  },
                ]}
                hitSlop={8}
              >
                <ThemedText
                  type="caption"
                  style={{
                    fontWeight: "600",
                    color:
                      sortOrder === "newest" ? Colors.accentBlue : textColor,
                  }}
                >
                  Terbaru
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => setSortOrder("oldest")}
                style={[
                  styles.bookmarkFilterButton,
                  sortOrder === "oldest"
                    ? styles.bookmarkFilterButtonActive
                    : null,
                  {
                    backgroundColor: cardBackgound,
                    borderColor,
                    borderWidth: 1,
                  },
                ]}
                hitSlop={8}
              >
                <ThemedText
                  type="caption"
                  style={{
                    fontWeight: "600",
                    color:
                      sortOrder === "oldest" ? Colors.accentBlue : textColor,
                  }}
                >
                  Terlama
                </ThemedText>
              </Pressable>
            </ScrollView>
          </Animated.View>

          {published?.length === 0 ? (
            <ThemedText
              type="default"
              style={{
                textAlign: "center",
                marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
              }}
            >
              Belum ada penelitian yang dipublikasikan.
            </ThemedText>
          ) : (
            // apply filters and sorting
            (published ?? [])
              .filter((item) =>
                item.title.toLowerCase().includes(query.toLowerCase()),
              )
              .filter((item) =>
                showBookmarksOnly
                  ? bookmarks?.bookmarkedIds.includes(item.id)
                  : true,
              )
              .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
              })
              .map((item) => renderCard(item))
          )}
        </View>
      )}

      {/* Bottom Sheet Modal for Publication Details */}
      <BottomSheetModal
        visible={Boolean(selectedPublication)}
        title="Detail Pustaka"
        onClose={() => setSelectedPublication(null)}
        height="72%"
      >
        {selectedPublication && (
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Sheet Body */}
            <View style={styles.modalTitleRow}>
              <ThemedText type="headline" style={{ flex: 1 }}>
                {selectedPublication.title}
              </ThemedText>
              <Pressable
                style={{ padding: 4 }}
                onPress={() => handleBookmark(selectedPublication.id)}
              >
                <IconSymbol
                  name={
                    bookmarks?.bookmarkedIds.includes(selectedPublication.id)
                      ? "bookmark.fill"
                      : "bookmark"
                  }
                  color={
                    bookmarks?.bookmarkedIds.includes(selectedPublication.id)
                      ? Colors.accentBlue
                      : Colors.light.icon
                  }
                  size={20}
                />
              </Pressable>
            </View>

            <ThemedText
              type="caption"
              style={{ color: Colors.light.text.secondary }}
            >
              Terbit pada{" "}
              {new Date(selectedPublication.created_at).toLocaleDateString(
                "id-ID",
                { day: "numeric", month: "long", year: "numeric" },
              )}
            </ThemedText>

            <ThemedSeparator style={{ marginVertical: 12 }} />

            <ThemedText
              type={selectedPublication.abstract ? "subheadline" : "footnote"}
              style={{ lineHeight: 20, paddingBottom: 12 }}
            >
              {selectedPublication.abstract || "Abstract tidak tersedia"}
            </ThemedText>

            <DocumentRow
              label={
                selectedPublication.research_summary
                  ? "Unduh Ringkasan Penelitian"
                  : "Ringkasan Penelitian tidak tersedia"
              }
              url={selectedPublication.research_summary}
              downloadProgressMap={downloadProgressMap}
              onPress={(url) => openDocument(url)}
            />

            <ThemedSeparator style={{ marginVertical: 12 }} />

            <Pressable
              onPress={() => {
                setPreviewUri(selectedPublication.flyer);
                setPreviewVisible(true);
              }}
            >
              <View style={styles.flyerContainer}>
                <Image
                  style={styles.flyerImage}
                  source={{ uri: selectedPublication.flyer }}
                  contentFit="cover"
                  transition={300}
                  cachePolicy="memory-disk"
                />
              </View>
            </Pressable>
          </ScrollView>
        )}
      </BottomSheetModal>
      <ImagePreviewModal
        visible={previewVisible}
        uri={previewUri}
        onClose={() => {
          setPreviewVisible(false);
          setPreviewUri(undefined);
        }}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.fill.vibrant.primary,
    paddingHorizontal: 24,
    marginBottom: 24,
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
  },
  searchInputContainer: {
    position: "relative",
  },
  searchClearButton: {
    position: "absolute",
    right: 14,
    top: 16,
  },
  flyerPlaceholder: {
    backgroundColor: Colors.light.fill.tertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
  },
  bookmarkFilterButtonActive: {
    backgroundColor: Colors.light.fill.secondary,
  },
  card: {
    borderRadius: RADIUS.DEFAULT,
    display: "flex",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
  },
  cardImage: {
    width: "30%",
    height: 150,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    marginLeft: 12,
  },
  container: {
    flex: 1,
    padding: 12,
    flexDirection: "row",
  },
  detailButton: {
    alignSelf: "flex-end",
    marginHorizontal: 12,
  },
  suggestionPanel: {
    marginBottom: 8,
  },
  suggestionHeader: {
    marginVertical: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  suggestionItem: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.fill.vibrant.primary,
  },
  suggestionTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  suggestionTitle: {
    marginBottom: 2,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  noSuggestionText: {
    paddingVertical: 12,
  },
  modalContent: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  modalImage: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: Colors.light.fill.secondary,
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  flyerContainer: {
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: Colors.light.fill.secondary,
    width: 176,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  flyerImage: {
    width: "100%",
    height: 256,
  },
});
