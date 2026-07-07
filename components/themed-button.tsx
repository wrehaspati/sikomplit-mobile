import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { ThemedText } from "./themed-text";

export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  variant?:
    | "themed"
    | "primary"
    | "secondary"
    | "outline"
    | "light"
    | "dark"
    | "link"
    | "outlineSecondary";
  size?: "default" | "small";
  icon?: React.ReactNode;
};

export default function ThemedButton({
  style,
  lightColor,
  darkColor,
  variant = "themed",
  size = "default",
  icon,
  disabled = false,
  ...rest
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const secondaryColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "components.supportCard.border",
  );

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        {
          backgroundColor,
          flexDirection: "row",
          alignItems: "center",
          opacity: disabled ? 0.6 : 1,
        },
        styles.shadow,
        style,
        size === "default" ? styles.default : undefined,
        size === "small" ? styles.small : undefined,
        variant === "primary" ? styles.primary : undefined,
        variant === "secondary" ? styles.secondary : undefined,
        variant === "outline" ? styles.outline : undefined,
        variant === "light" ? styles.light : undefined,
        variant === "dark" ? styles.dark : undefined,
        variant === "link" ? styles.link : undefined,
        variant === "outlineSecondary"
          ? [styles.outlineSecondary, { borderColor: secondaryColor }]
          : undefined,
      ]}
      {...rest}
    >
      {icon && <View style={{ paddingRight: 4 }}>{icon}</View>}
      <ThemedText
        type="defaultSemiBold"
        style={[
          size === "small" ? styles.smallText : undefined,
          variant === "primary" ? { color: "white" } : undefined,
          variant === "secondary"
            ? { color: Colors.light.text.primary }
            : undefined,
          variant === "outline" ? { color: Colors.accentBlue } : undefined,
          variant === "light"
            ? { color: Colors.light.text.primary }
            : undefined,
          variant === "dark" ? { color: Colors.dark.text.primary } : undefined,
          variant === "link" ? { color: Colors.accentBlue } : undefined,
        ]}
      >
        {rest.children}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = {
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  default: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: "center",
  },
  smallText: {
    fontSize: 14,
  },
  primary: {
    backgroundColor: Colors.accentBlue,
  },
  secondary: {
    backgroundColor: Colors.light.fill.vibrant.secondary,
  },
  outline: {
    paddingVertical: 11,
    paddingHorizontal: 23,
    borderWidth: 2,
    backgroundColor: "transparent",
    borderColor: Colors.accentBlue,
    shadowColor: "transparent",
  },
  light: {
    backgroundColor: Colors.light.background,
  },
  dark: {
    backgroundColor: Colors.dark.background,
  },
  link: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    shadowColor: "transparent",
  },
  outlineSecondary: {
    borderWidth: 2,
    backgroundColor: "transparent",
    shadowColor: "transparent",
  },
} as const;
