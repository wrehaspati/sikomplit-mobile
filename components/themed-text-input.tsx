import { Colors, Radius } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'transparent' | 'default';
  underline?: boolean;
  text?: string;
  icon?: React.ReactNode;
  required?: boolean;
};

export default function ThemedTextInput({ lightColor, darkColor, variant = 'default', underline = false, text, icon, required, ...props }: ThemedTextInputProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'secondary');
  const textColor = useThemeColor({}, 'text.primary');
  const underlineColor = useThemeColor({}, 'fill.vibrant.secondary');
  const withIconContainerColor = useThemeColor({}, 'fill.tertiary');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View>
      {text && (
        <View style={{ marginBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
          {(icon && variant === 'transparent') && icon}
          <ThemedText type="defaultSemiBold">
            {text}
            {required && (
              <Text style={{ color: Colors.accentRed }}>
                {' *'}
              </Text>
            )}
          </ThemedText>
        </View>
      )}
      <ThemedView style={[
        (icon && variant !== 'transparent') ? [styles.withIconContainer, { backgroundColor: withIconContainerColor }] : null,
        variant === 'transparent' ? { backgroundColor: 'transparent' } : null,
        { borderRadius: variant === 'transparent' ? 0 : Radius.default },
      ]}>
        {(icon && variant !== 'transparent') && <View style={{ marginRight: 8 }}>{icon}</View>}
        <TextInput
          {...props}
          style={[props.style, { backgroundColor, color: textColor },
          variant === 'transparent' && styles.transparent,
          (variant === 'default' && !icon) && styles.default,
          (icon && variant !== 'transparent') ? styles.withIcon : null,
          underline && { borderBottomWidth: 1, borderBottomColor: underlineColor }
          ]}
          secureTextEntry={props.secureTextEntry && !isPasswordVisible}
        />
        {props.secureTextEntry && (
          <View style={{ position: 'absolute', right: 16 }}>
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              {isPasswordVisible ?
                <IconSymbol name="eye.fill" color={Colors.light.text.secondary} />
                :
                <IconSymbol name="eye.slash.fill" color={Colors.dark.text.secondary} />
              }
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </View >
  );
}

const styles = StyleSheet.create({
  transparent: {
    backgroundColor: 'transparent',
    width: '100%',
    fontSize: 16,
    paddingBottom: 4,
    marginVertical: 12,
  },
  default: {
    width: '100%',
    paddingVertical: 18,
    paddingLeft: 16,
    fontSize: 16,
    borderRadius: Radius.default,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  withIcon: {
    width: '100%',
    paddingVertical: 18,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  withIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: Radius.default,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
  eyeIcon: {
    padding: 10,
  },
});