import ThemedButton from "@/components/themed-button";
import ThemedSeparator from "@/components/themed-separator";
import { ThemedText } from "@/components/themed-text";
import ThemedTextInput from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Radius } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

export default function Library() {
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'text.secondary');
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const [query, setQuery] = useState('');

  // Temporary handlers for bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const handleBookmark = (id: string) => {
    setBookmarkedIds((prev) => prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id]);
  }

  const handleSearchFocus = () => {
    Animated.timing(searchFocusAnim, {
      toValue: -40,
      duration: 300,
      useNativeDriver: true,
    }).start();
    scrollY.setValue(20);
  };

  const handleSearchBlur = () => {
    Animated.timing(searchFocusAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    scrollY.setValue(0);
  };

  return (
    <Animated.ScrollView
      style={{
        flex: 1,
      }}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}>
      <View style={{ marginHorizontal: 24, marginBottom: 20, marginTop: 54 }}>

        {/* Content */}
        <Animated.View
          id="header"
          style={{
            marginBottom: 12,
            opacity: scrollY.interpolate({
              inputRange: [0, 18, 72],
              outputRange: [1, 0, 0],
              extrapolate: 'clamp',
            }),
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 72],
                outputRange: [0, 72],
                extrapolate: 'clamp',
              }),
            }],
          }}
        >
          <ThemedText type="title">
            Pustaka Digital
          </ThemedText>
        </Animated.View>

        {/* Search Input */}
        <Animated.View
          style={[
            {
              transform: [{ translateY: searchFocusAnim }],
            },
          ]}
        >
          <ThemedTextInput
            value={query}
            onChangeText={setQuery}
            placeholder={"Cari Judul Penelitian..."}
            placeholderTextColor={Colors.light.text.secondary}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            inputStyle={[styles.input, { backgroundColor: backgroundColor }]}
            style={{ paddingVertical: 12 }}
            icon={<IconSymbol name="magnifyingglass" style={{ width: 20 }} color={iconColor} />}
          />
        </Animated.View>

        {/* Search Results */}
        <View>
          <ThemedView style={styles.card}>
            <View style={styles.container}>
              <View style={styles.cardImage}>
                <Image source={require('@/assets/images/example.jpg')} contentFit="fill" style={{ width: '100%', height: '100%', borderRadius: 8 }} />
              </View>
              <View style={styles.cardContent}>
                <View>
                  <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText type="caption" style={{ marginRight: 8 }}>
                      Terbit pada 12 Maret 2026
                    </ThemedText>
                    <Pressable style={{ padding: 4, borderRadius: 4 }} onPress={() => handleBookmark('example-id')} hitSlop={20}>
                      {bookmarkedIds.includes('example-id') ? (
                        <IconSymbol name="star.fill" color={Colors.accentYellow} size={20} style={{ shadowColor: Colors.accentYellow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }} />
                      ) : (
                        <IconSymbol name="star" color={Colors.light.icon} size={20} />
                      )}
                    </Pressable>
                  </View>
                  <ThemedText type="subheadline" style={{ marginBottom: 4, fontWeight: '600' }}>
                    APLIKASI METODE MOXIBUSI DENGAN ACUPRESSURE DAN AROMATERAPI ESSENTIAL OIL TERHADAP PENGURANGAN NYERI DAN PERCEPATAN DILATARI SERVIK KALA 1 PERSANINAN
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
        </View>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    paddingHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  card: {
    borderRadius: Radius.default,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
  },
  cardImage: {
    width: '30%',
    height: 170,
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
});