import { publishedSubmission } from "@/api/submission-api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import ThemedButton from "@/components/themed-button";
import ThemedSeparator from "@/components/themed-separator";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, RADIUS, SCREEN_MARGIN_HORIZONTAL } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IPublishedSubmission } from "@/types/submission";
import { Image } from "expo-image";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, RefreshControl, StyleSheet, View } from "react-native";

const BOOKMARK_STORAGE_KEY = 'library-bookmarks';

export default function LibraryScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgound = useThemeColor({}, 'fill.vibrant.tertiary');
  const iconColor = useThemeColor({}, 'text.secondary');
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [published, setPublished] = useState<IPublishedSubmission[]>();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Fetch published submissions
  const fetchPublishedSubmissions = async () => {
    try {
      const res = await publishedSubmission();
      setPublished(res);
    } catch {
      setPublished([]);
    }
  };

  // Handler for bookmark toggle
  const handleBookmark = (id: string) => {
    setBookmarkedIds((prev) => prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id]);
  };

  // Load bookmarks from secure storage on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const storedBookmarks = await SecureStore.getItemAsync(BOOKMARK_STORAGE_KEY);
        if (storedBookmarks) {
          const parsedBookmarks = JSON.parse(storedBookmarks);
          if (Array.isArray(parsedBookmarks)) {
            setBookmarkedIds(parsedBookmarks.filter((bookmarkId): bookmarkId is string => typeof bookmarkId === 'string'));
          }
        }
      } catch {
        setBookmarkedIds([]);
      } finally {
        setBookmarksLoaded(true);
      }
    };

    loadBookmarks();
  }, []);

  // Save bookmarks to secure storage whenever they change
  useEffect(() => {
    if (!bookmarksLoaded) {
      return;
    }

    const saveBookmarks = async () => {
      try {
        await SecureStore.setItemAsync(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkedIds));
      } catch { }
    };

    saveBookmarks();
  }, [bookmarkedIds, bookmarksLoaded]);

  // Handlers for search input focus and blur animations
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.timing(searchFocusAnim, {
      toValue: -40,
      duration: 300,
      useNativeDriver: true,
    }).start();
    scrollY.setValue(20);
  };

  // Handlers for search input focus and blur animations
  const handleSearchBlur = () => {
    Animated.timing(searchFocusAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsSearchFocused(false));
    scrollY.setValue(0);
  };

  // Handler for pull-to-refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPublishedSubmissions();
    setRefreshing(false);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPublishedSubmissions();
  }, []);

  // Filter published submissions based on search query (case-insensitive) and limit to 6 results for suggestions
  const filteredSuggestions = (published ?? []).filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const renderCard = (item: IPublishedSubmission) => {
    return (
      <ThemedView key={item.id} variant="card">
        <View style={styles.container}>
          <View style={styles.cardImage}>
            <Image
              source={{ uri: item.flyer }}
              contentFit="fill"
              contentPosition="center"
              style={{
                width: '100%',
                borderRadius: 8,
                backgroundColor: Colors.light.fill.secondary,
                aspectRatio: 2 / 3,
              }} />
          </View>
          <View style={styles.cardContent}>
            <View>
              <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText type="caption" style={{ marginRight: 8 }}>
                  Terbit pada {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </ThemedText>
                <Pressable style={{ padding: 4, borderRadius: 4 }} onPress={() => handleBookmark(item.id)} hitSlop={20}>
                  {bookmarkedIds.includes(item.id) ? (
                    <IconSymbol name="star.fill" color={Colors.accentYellow} size={20} style={{ shadowColor: Colors.accentYellow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }} />
                  ) : (
                    <IconSymbol name="star" color={Colors.light.icon} size={20} />
                  )}
                </Pressable>
              </View>
              <ThemedText type="subheadline" style={{ marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' }}>
                {item.title}
              </ThemedText>
            </View>
            <View>
              <ThemedSeparator style={{ marginVertical: 8 }} />
              <ThemedButton variant="secondary" size="small" onPress={() => { }} style={styles.detailButton}>
                Lihat Detail
              </ThemedButton>
            </View>
          </View>
        </View>
      </ThemedView>
    )
  };

  return (
    <ParallaxScrollView
      title="Pustaka Digital"
      scrollYValue={scrollY}
      contentContainerStyle={{ paddingHorizontal: SCREEN_MARGIN_HORIZONTAL }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      {/* Content */}

      {/* Search Input */}
      <Animated.View
        style={[{ transform: [{ translateY: searchFocusAnim }] }]}>
        <ThemedTextInput
          value={query}
          onChangeText={setQuery}
          placeholder={"Cari Judul Penelitian..."}
          placeholderTextColor={Colors.light.text.secondary}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          inputStyle={[styles.input, { backgroundColor: cardBackgound }]}
          style={{ paddingVertical: 12 }}
          icon={<IconSymbol name="magnifyingglass" style={{ width: 20 }} color={iconColor} />}
        />
      </Animated.View>

      {/* Search Suggestions / Results */}
      {isSearchFocused ? (
        <Animated.View style={[
          styles.suggestionPanel,
          {
            transform: [{ translateY: searchFocusAnim }]
          }]}>
          <ThemedText type="caption" style={styles.suggestionHeader}>
            {filteredSuggestions.length > 0 ? 'Hasil ditemukan:' : 'Tidak ada hasil ditemukan'}
          </ThemedText>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item) => (
              <Pressable
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => setQuery(item.title)}>
                <View style={styles.suggestionTextBlock}>
                  <ThemedText type="tightFootnote" style={styles.suggestionTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText type="caption">
                    Terbit pada {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </ThemedText>
                </View>
                <IconSymbol
                  name={bookmarkedIds.includes(item.id) ? 'star.fill' : 'star'}
                  color={bookmarkedIds.includes(item.id) ? Colors.accentYellow : Colors.light.icon}
                  size={18}
                />
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
          {published?.length === 0 ? (
            <ThemedText type="default" style={{ textAlign: 'center' }}>
              Belum ada penelitian yang dipublikasikan.
            </ThemedText>
          ) : published?.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).map(renderCard)}
        </View>
      )}
    </ParallaxScrollView >
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    paddingHorizontal: 24,
    marginBottom: 16,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)'
  },
  card: {
    borderRadius: RADIUS.DEFAULT,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)'
  },
  cardImage: {
    width: '30%',
    height: 150,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  container: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
  },
  detailButton: {
    alignSelf: 'flex-end',
  }
  ,
  suggestionPanel: {
    marginBottom: 8,
  },
  suggestionHeader: {
    marginVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  suggestionItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.fill.secondary,
  },
  suggestionTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  suggestionTitle: {
    marginBottom: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  noSuggestionText: {
    paddingVertical: 12,
  }
});