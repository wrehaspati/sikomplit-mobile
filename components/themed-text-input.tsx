import { Colors, RADIUS } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ReactNode } from 'react';
import { useState } from "react";
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'transparent' | 'default';
  underline?: boolean;
  title?: string;
  inputStyle?: StyleProp<ViewStyle>;
  icon?: ReactNode;
  required?: boolean;
  errorMessage?: string;
};

export default function ThemedTextInput({
  lightColor,
  darkColor,
  variant = 'default',
  underline = false,
  inputStyle,
  title,
  icon,
  required,
  errorMessage,
  ...props
}: ThemedTextInputProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'secondary');
  const textColor = useThemeColor({}, 'text.primary');
  const placeholderTextColor = useThemeColor({}, 'text.tertiary');
  const underlineColor = useThemeColor({}, 'fill.vibrant.secondary');
  const withIconContainerColor = useThemeColor({}, 'fill.tertiary');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasInlineIcon = Boolean(icon && variant === 'transparent');
  const hasContainerIcon = Boolean(icon && variant !== 'transparent');
  const isSecureTextEntry = Boolean(props.secureTextEntry);

  return (
    <View>
      {title && (
        <View style={{ marginBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
          {hasInlineIcon && icon}
          <ThemedText type="defaultSemiBold">
            {title}
            {required && (
              <Text style={{ color: Colors.accentRed }}>
                {' *'}
              </Text>
            )}
          </ThemedText>
        </View>
      )}
      <ThemedView style={[
        hasContainerIcon ? [styles.withIconContainer, { backgroundColor: withIconContainerColor }] : null,
        variant === 'transparent' ? styles.transparentContainer : null,
        inputStyle,
        (errorMessage && variant !== 'transparent') && { borderColor: Colors.accentRed, borderWidth: 1 },
      ]}>
        {hasContainerIcon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <TextInput
          {...props}
          style={[{ backgroundColor, color: textColor, paddingVertical: 18 }, props.style,
          variant === 'transparent' && styles.transparent,
          (variant === 'default' && !icon) && styles.default,
          hasContainerIcon ? styles.withIcon : null,
          underline && { borderBottomWidth: 1, borderBottomColor: underlineColor },
          (errorMessage && underline) && { borderBottomColor: Colors.accentRed },
          ]}
          secureTextEntry={isSecureTextEntry && !isPasswordVisible}
          placeholderTextColor={placeholderTextColor}
        />
        {isSecureTextEntry && (
          <View style={{ position: 'absolute', right: 16 }}>
            <TouchableOpacity onPress={() => setIsPasswordVisible((value) => !value)} style={styles.eyeIcon}>
              {isPasswordVisible ?
                <IconSymbol name="eye.fill" color={Colors.light.text.secondary} />
                :
                <IconSymbol name="eye.slash.fill" color={Colors.dark.text.secondary} />
              }
            </TouchableOpacity>
          </View>
        )}
        {errorMessage && (
          <Text style={{ marginTop: 4, color: Colors.accentRed, fontSize: 12 }}>
            {errorMessage}
          </Text>
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
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    paddingBottom: 8,
  },
  default: {
    width: '100%',
    paddingVertical: 18,
    paddingLeft: 16,
    fontSize: 16,
    borderRadius: RADIUS.DEFAULT,
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
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  withIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: RADIUS.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
  eyeIcon: {
    padding: 10,
  },
});