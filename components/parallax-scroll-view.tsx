import React, { useRef } from 'react';
import { Animated, Platform, ScrollViewProps, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

type ParallaxScrollViewProps = ScrollViewProps & {
  title: string;
  scrollYValue?: Animated.Value;
  titleVisibilityValue?: Animated.Value;
};

const HEADER_OFFSET = 54 + 12 + 41;

export default function ParallaxScrollView({
  title,
  children,
  scrollYValue,
  titleVisibilityValue,
  ...Props
}: ParallaxScrollViewProps) {
  const fallbackScrollY = useRef(new Animated.Value(0)).current;
  const fallbackTitleVisibility = useRef(new Animated.Value(0)).current;
  const scrollY = scrollYValue ?? fallbackScrollY;
  const titleVisibility = titleVisibilityValue ?? fallbackTitleVisibility;
  const { refreshControl, ...scrollProps } = Props as ScrollViewProps & { refreshControl?: React.ReactElement<any> };
  const injectedRefreshControl = refreshControl
    ? React.cloneElement(refreshControl as React.ReactElement<any>, {
      progressViewOffset: HEADER_OFFSET,
    })
    : undefined;
  const adjustedScroll = Platform.OS === 'ios' ? Animated.add(scrollY, HEADER_OFFSET) : scrollY;

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={{
          ...styles.header,
          opacity: Animated.multiply(
            adjustedScroll.interpolate({
              inputRange: [0, 18, 72],
              outputRange: [1, 0, 0],
              extrapolate: 'clamp',
            }),
            titleVisibility.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          ),
          transform: [
            {
              translateY: titleVisibility.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -16],
              }),
            },
          ],
        }}>
        <ThemedText type="title">
          {title}
        </ThemedText>
      </Animated.View>
      <Animated.ScrollView
        style={{
          flex: 1,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={injectedRefreshControl}
        contentInset={Platform.OS === 'ios' ? { top: HEADER_OFFSET } : undefined}
        contentOffset={Platform.OS === 'ios' ? { x: 0, y: -HEADER_OFFSET } : undefined}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'ios' ? 0 : undefined,
        }}
        {...scrollProps}
        automaticallyAdjustContentInsets={false}>
        <View style={{ height: Platform.OS === 'ios' ? 0 : HEADER_OFFSET }} />
        <View style={styles.container}>
          {children}
        </View>
      </Animated.ScrollView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 20,
  },
  header: {
    marginHorizontal: 24,
    marginBottom: 12,
    top: 54,
    position: 'absolute',
  }
});
