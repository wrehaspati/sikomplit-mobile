import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
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
};

export default function ThemedTextInput({ lightColor, darkColor, variant = 'default', underline = false, text, icon, ...props }: ThemedTextInputProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'secondary');
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View>
      {text && (
        <ThemedText type="subheadline" style={{ marginBottom: 4, fontWeight: '600' }} darkColor={Colors.labelSecondary}
          lightColor={Colors.labelSecondary}>
          {text}
        </ThemedText>
      )}
      <ThemedView style={icon ? styles.withIconContainer : null}>
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <TextInput
          {...props}
          style={[props.style, { backgroundColor, color: textColor },
          variant === 'transparent' && styles.transparent,
          (variant === 'default' && !icon) && styles.default,
          icon ? styles.withIcon : null,
          underline && styles.underline
          ]}
          secureTextEntry={props.secureTextEntry && !isPasswordVisible}
        />
        {props.secureTextEntry && (
          <View style={{ position: 'absolute', right: 16 }}>
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              {isPasswordVisible ?
                <IconSymbol name="eye.fill" color={Colors.labelSecondary} />
                :
                <IconSymbol name="eye.slash.fill" color={Colors.labelSecondary} />
              }
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  transparent: {
    backgroundColor: 'transparent',
    width: '100%',
    paddingTop: 12,
    paddingBottom: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  default: {
    width: '100%',
    paddingVertical: 12,
    paddingLeft: 16,
    fontSize: 16,
    borderRadius: 8,
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.vibrantFillSecondaryDark,
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
    borderRadius: 8,
    backgroundColor: Colors.fillTertiary,
  },
  eyeIcon: {
    padding: 10,
  },
});