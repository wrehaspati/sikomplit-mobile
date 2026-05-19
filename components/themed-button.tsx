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
  disabled = false,
  ...rest
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <TouchableOpacity disabled={disabled} style={[
      { backgroundColor, flexDirection: 'row', alignItems: 'center', opacity: disabled ? 0.6 : 1 },
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
        variant === 'secondary' ? { color: Colors.light.text.primary } : undefined,
        variant === 'outline' ? { color: Colors.accentBlue } : undefined,
        variant === 'light' ? { color: Colors.light.text.primary } : undefined,
        variant === 'dark' ? { color: Colors.dark.text.primary } : undefined,
        variant === 'link' ? { color: Colors.accentBlue } : undefined,
      ]}>
        {rest.children}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  default: {
    paddingVertical: responsiveScale(12),
    paddingHorizontal: responsiveScale(24),
    borderRadius: 24,
    alignItems: 'center',
  },
  small: {
    paddingVertical: responsiveScale(6),
    paddingHorizontal: responsiveScale(20),
    borderRadius: 24,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: Colors.accentBlue,
  },
  secondary: {
    backgroundColor: Colors.light.fill.vibrant.secondary,
  },
  outline: {
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderColor: Colors.accentBlue,
    shadowColor: 'transparent',
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
    shadowColor: 'transparent',
  }
} as const;