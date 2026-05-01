import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' |
  'caption2' | 'subheadline' | 'footnote' | 'tightFootnote' | 'title2' | 'title3' | 'title4' | 'headline';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'caption2' ? styles.caption2 : undefined,
        type === 'subheadline' ? styles.subheadline : undefined,
        type === 'footnote' ? styles.footnote : undefined,
        type === 'tightFootnote' ? styles.tightFootnote : undefined,
        type === 'title2' ? styles.title2 : undefined,
        type === 'title3' ? styles.title3 : undefined,
        type === 'title4' ? styles.title4 : undefined,
        type === 'headline' ? styles.headline : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    lineHeight: 41,
  },
  title2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  title3: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  title4: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
  },
  tightFootnote: {
    fontSize: 13,
    lineHeight: 16,
  },
});
