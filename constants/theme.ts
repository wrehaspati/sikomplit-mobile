/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: {
      primary: '#1A1A1A',
      secondary: '#727272',
      tertiary: '#BFBFBF',
      quarternary: '#D9D9D9',
    },
    background: '#fff',
    secondary: '#E0E0E0',
    separator: '#C6C6C8',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    fill: {
      primary: 'rgba(8, 3, 3, 0.2)',
      secondary: 'rgba(120, 120, 128, 0.16)',
      tertiary: 'rgba(118, 118, 128, 0.12)',
      vibrant: {
        primary: '#CCCCCC',
        secondary: '#E0E0E0',
        tertiary: '#EDEDED',
      }
    }
  },
  dark: {
    text: {
      primary: '#FFFFFF',
      secondary: '#999999',
      tertiary: '#404040',
      quarternary: '#262626',
    },
    background: '#151718',
    secondary: '#1F1F1F',
    separator: '#C6C6C8',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    fill: {
      primary: 'rgba(120, 120, 120, 0.20)',
      secondary: 'rgba(120, 120, 128, 0.16)',
      tertiary: 'rgba(118, 118, 128, 0.12)',
      vibrant: {
        primary: '#333333',
        secondary: '#1F1F1F',
        tertiary: '#121212',
      }
    }
  },
  accentBlue: '#0088FF',
  accentRed: '#FF383C',
  accentYellow: '#FFCC00',
  backgroundSecondary: '#F2F2F7',
};

export const Radius = {
  default: 20,
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
