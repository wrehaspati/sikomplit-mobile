import { useRef } from 'react';
import { Animated, ScrollViewProps, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

type ParallaxScrollViewProps = ScrollViewProps & {
  title: string;
};

export default function ParallaxScrollView({ title, children, ...Props }: ParallaxScrollViewProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  return (
    <Animated.ScrollView
      style={{
        flex: 1,
      }}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      {...Props}
    >
      <Animated.View
        style={{
          ...styles.header,
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
          {title}
        </ThemedText>
      </Animated.View>
      <View style={styles.container}>
        {children}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginHorizontal: 24,
    marginBottom: 12,
    marginTop: 54
  }
});
