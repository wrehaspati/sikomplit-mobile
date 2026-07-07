/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#007AFF";
const tintColorDark = "#0A84FF";

export const Colors = {
  light: {
    text: {
      primary: "#1A1A2E",
      secondary: "#6D6D72",
      tertiary: "#AEAEB2",
      quarternary: "#D1D1D6",
    },
    default: "#F7F7FA",
    background: "#FFFFFF",
    secondary: "#EEEEF2",
    separator: "#D1D1D6",
    tint: tintColorLight,
    icon: "#6D6D72",
    tabIconDefault: "#6D6D72",
    tabIconSelected: tintColorLight,
    fill: {
      primary: "rgba(120, 120, 128, 0.16)",
      secondary: "rgba(120, 120, 128, 0.12)",
      tertiary: "rgba(118, 118, 128, 0.08)",
      vibrant: {
        primary: "#F0F0F5",
        secondary: "#F5F5FA",
        tertiary: "#FAFAFD",
      },
    },
    components: {
      appFlow: {
        gradient: ["#003f87", "#115cb9"] as [string, string],
        text: "#FFFFFF",
        desc: "rgba(255, 255, 255, 0.85)",
        iconBg: "rgba(255, 255, 255, 0.2)",
        line: "rgba(255, 255, 255, 0.15)",
        circle1: "rgba(255, 255, 255, 0.15)",
        circle2: "rgba(255, 255, 255, 0.1)",
      },
      supportCard: {
        background: "#FFFFFF",
        border: "rgba(0, 0, 0, 0.05)",
        shadow: "0px 8px 24px rgba(0, 0, 0, 0.04)",
        accentCircle: "rgba(52, 120, 246, 0.04)",
        iconBg: "rgba(52, 120, 246, 0.1)",
        icon: "#2968C8",
        footerBorder: "rgba(0, 0, 0, 0.05)",
        addressCard: {
          gradient: ["#F0F7FF", "#E6F0FE"] as [string, string],
          border: "rgba(41, 104, 200, 0.12)",
          iconBg: "#FFFFFF",
          iconShadow: "0px 4px 12px rgba(41, 104, 200, 0.08)",
          icon: "#2968C8",
          title: "#1A202C",
        },
        whatsapp: {
          background: "#F0FDF4",
          border: "#DCFCE7",
          iconBg: "#DCFCE7",
          text: "#16A34A",
        },
        email: {
          background: "#EFF6FF",
          border: "#DBEAFE",
          iconBg: "#DBEAFE",
          text: "#2563EB",
        },
      },
    },
  },
  dark: {
    text: {
      primary: "#F5F5F7",
      secondary: "#ABABAB",
      tertiary: "#636366",
      quarternary: "#48484A",
    },
    default: "#000",
    background: "#151718",
    secondary: "#1F1F1F",
    separator: "#38383A",
    tint: tintColorDark,
    icon: "#A8ADB2",
    tabIconDefault: "#A8ADB2",
    tabIconSelected: tintColorDark,
    fill: {
      primary: "rgba(120, 120, 128, 0.24)",
      secondary: "rgba(120, 120, 128, 0.20)",
      tertiary: "rgba(118, 118, 128, 0.16)",
      vibrant: {
        primary: "#2C2C2E",
        secondary: "#252527",
        tertiary: "#1C1C1E",
      },
    },
    components: {
      appFlow: {
        gradient: ["#003f87", "#115cb9"] as [string, string],
        text: "#FFFFFF",
        desc: "rgba(255, 255, 255, 0.85)",
        iconBg: "rgba(255, 255, 255, 0.2)",
        line: "rgba(255, 255, 255, 0.15)",
        circle1: "rgba(255, 255, 255, 0.15)",
        circle2: "rgba(255, 255, 255, 0.1)",
      },
      supportCard: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "rgba(255, 255, 255, 0.1)",
        shadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
        accentCircle: "rgba(10, 132, 255, 0.05)",
        iconBg: "rgba(10, 132, 255, 0.15)",
        icon: "#6EB5FF",
        footerBorder: "rgba(255, 255, 255, 0.1)",
        addressCard: {
          gradient: ["rgba(10, 132, 255, 0.1)", "rgba(10, 132, 255, 0.02)"] as [string, string],
          border: "rgba(10, 132, 255, 0.15)",
          iconBg: "rgba(10, 132, 255, 0.2)",
          iconShadow: "none",
          icon: "#6EB5FF",
          title: "#E5E5E5",
        },
        whatsapp: {
          background: "rgba(34, 197, 94, 0.1)",
          border: "rgba(34, 197, 94, 0.2)",
          iconBg: "rgba(34, 197, 94, 0.2)",
          text: "#4ADE80",
        },
        email: {
          background: "rgba(59, 130, 246, 0.1)",
          border: "rgba(59, 130, 246, 0.2)",
          iconBg: "rgba(59, 130, 246, 0.2)",
          text: "#60A5FA",
        },
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
      text: "#7A4500",
      border: "#E8C896",
      icon: "#7A4500",
    },
    approved: {
      background: "#EAF8EF",
      text: "#167539",
      stripe: "#2FB36A",
      icon: "#167539",
    },
    revision: {
      background: "#FFF7D6",
      text: "#8C6C00",
      stripe: "#D9A400",
      icon: "#8C6C00",
    },
    pending: {
      background: "#E0F2FF",
      text: "#0952A5",
      stripe: "#0088FF",
      icon: "#0952A5",
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
