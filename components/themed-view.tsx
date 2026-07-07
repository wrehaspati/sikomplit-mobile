import { StyleSheet, View, type ViewProps } from "react-native";

import { RADIUS } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: "card";
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const cardBackgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "card",
  );
  const borderColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "components.supportCard.border",
  );

  return (
    <View
      style={[
        { backgroundColor },
        variant === "card"
          ? [
              styles.card,
              {
                backgroundColor: cardBackgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
              },
            ]
          : undefined,
        style,
      ]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.DEFAULT,
    display: "flex",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
  },
});
