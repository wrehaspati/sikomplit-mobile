/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
// @ts-nocheck

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type StringLeafPaths<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${StringLeafPaths<T[K]>}`
      : never;
}[keyof T & string];

type ThemeColorPath = StringLeafPaths<typeof Colors.light> &
  StringLeafPaths<typeof Colors.dark>;

function getNestedThemeColor<T extends Record<string, unknown>>(
  palette: T,
  path: string,
): string {
  const value = path.split(".").reduce<unknown>((acc, segment) => {
    if (
      acc &&
      typeof acc === "object" &&
      segment in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[segment];
    }

    return undefined;
  }, palette);

  if (typeof value !== "string") {
    throw new Error(`Invalid color path: ${path}`);
  }

  return value;
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorPath,
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return getNestedThemeColor(Colors[theme], colorName);
  }
}
