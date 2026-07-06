/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#007AFF";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: {
      primary: "#1A1A2E",
      secondary: "#8E8E93",
      tertiary: "#C7C7CC",
      quarternary: "#E5E5EA",
    },
    default: "#F7F7FA",
    background: "#FFFFFF",
    secondary: "#EEEEF2",
    separator: "#E5E5EA",
    tint: tintColorLight,
    icon: "#8E8E93",
    tabIconDefault: "#8E8E93",
    tabIconSelected: tintColorLight,
    fill: {
      primary: "rgba(120, 120, 128, 0.12)",
      secondary: "rgba(120, 120, 128, 0.08)",
      tertiary: "rgba(118, 118, 128, 0.06)",
      vibrant: {
        primary: "#F0F0F5",
        secondary: "#F5F5FA",
        tertiary: "#FAFAFD",
      },
    },
  },
  dark: {
    text: {
      primary: "#FFFFFF",
      secondary: "#999999",
      tertiary: "#404040",
      quarternary: "#262626",
    },
    default: "#000",
    background: "#151718",
    secondary: "#1F1F1F",
    separator: "#C6C6C8",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    fill: {
      primary: "rgba(120, 120, 120, 0.20)",
      secondary: "rgba(120, 120, 128, 0.16)",
      tertiary: "rgba(118, 118, 128, 0.12)",
      vibrant: {
        primary: "#333333",
        secondary: "#1F1F1F",
        tertiary: "#121212",
      },
    },
  },
  accentBlue: "#007AFF",
  accentRed: "#FF3B30",
  accentYellow: "#FFCC00",
  accentGreen: "#34C759",
  backgroundSecondary: "#F7F7FA",
  notificationBadge: {
    announcement: {
      background: "#FFF4E1",
      text: "#9A5A00",
      border: "#F1D7B0",
      icon: "#9A5A00",
    },
    approved: {
      background: "#EAF8EF",
      text: "#1F8A4C",
      stripe: "#2FB36A",
      icon: "#1F8A4C",
    },
    revision: {
      background: "#FFF7D6",
      text: "#B48A00",
      stripe: "#D9A400",
      icon: "#B48A00",
    },
    pending: {
      background: "#E0F2FF",
      text: "#0B63C7",
      stripe: "#0088FF",
      icon: "#0B63C7",
    },
  },
};

export const RADIUS = {
  DEFAULT: 16,
};

export const SCREEN_MARGIN_HORIZONTAL = 24;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
