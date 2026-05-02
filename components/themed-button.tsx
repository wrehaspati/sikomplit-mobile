import { responsiveScale } from "@/constants/scaling";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { ThemedText } from "./themed-text";

export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'themed' | 'primary' | 'secondary' | 'outline' | 'light' | 'dark' | 'link';
  size?: 'default' | 'small';
  icon?: React.ReactNode;
};

export default function ThemedButton({
  style,
  lightColor,
  darkColor,
  variant = 'themed',
  size = 'default',
  icon,
  ...rest
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <TouchableOpacity style={[
      { backgroundColor, flexDirection: 'row', alignItems: 'center' },
      styles.shadow,
      style,
      size === 'default' ? styles.default : undefined,
      size === 'small' ? styles.small : undefined,
      variant === 'primary' ? styles.primary : undefined,
      variant === 'secondary' ? styles.secondary : undefined,
      variant === 'outline' ? styles.outline : undefined,
      variant === 'light' ? styles.light : undefined,
      variant === 'dark' ? styles.dark : undefined,
      variant === 'link' ? styles.link : undefined,
    ]} {...rest}>
      {icon && <View style={{ paddingRight: 4 }}>{icon}</View>}
      <ThemedText type="defaultSemiBold" style={[
        variant === 'primary' ? { color: 'white' } : undefined,
        variant === 'secondary' ? { color: Colors.vibrantControlSecondary } : undefined,
        variant === 'outline' ? { color: Colors.accentBlue } : undefined,
        variant === 'light' ? { color: Colors.light.text } : undefined,
        variant === 'dark' ? { color: Colors.dark.text } : undefined,
        variant === 'link' ? { color: Colors.accentBlue } : undefined,
      ]}>
        {rest.children}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = {
  shadow: {
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
  },
  default: {
    paddingVertical: responsiveScale(12),
    paddingHorizontal: responsiveScale(24),
    borderRadius: 25,
    alignItems: 'center',

  },
  small: {
    paddingVertical: responsiveScale(6),
    paddingHorizontal: responsiveScale(20),
    borderRadius: 25,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: Colors.accentBlue,
  },
  secondary: {
    backgroundColor: Colors.fillSecondary,
  },
  outline: {
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderColor: Colors.accentBlue,
  },
  light: {
    backgroundColor: Colors.light.background,
  },
  dark: {
    backgroundColor: Colors.dark.background,
  },
  link: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    boxShadow: 'none',
  }
} as const;