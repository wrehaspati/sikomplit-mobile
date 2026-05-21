import React, { type ReactNode } from 'react';
import { Pressable, Modal as RNModal, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  cancelLabel?: string;
  height?: ViewStyle['height'];
  sheetStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function BottomSheetModal({
  visible,
  title,
  onClose,
  children,
  cancelLabel = 'Batal',
  height = '70%',
  sheetStyle,
  contentStyle,
}: Props) {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor, height }, sheetStyle]} onPress={() => undefined}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10}>
              <ThemedText type="defaultSemiBold" lightColor={Colors.light.text.secondary} darkColor={Colors.dark.text.secondary}>
                {cancelLabel}
              </ThemedText>
            </Pressable>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {title}
            </ThemedText>
            <View style={styles.spacer} />
          </View>
          <View style={[styles.content, contentStyle]}>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  spacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  footer: {
    height: 20,
  },
});