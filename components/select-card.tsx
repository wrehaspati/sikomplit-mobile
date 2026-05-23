import { ThemedText } from '@/components/themed-text';
import { Colors, RADIUS } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type Option<T = string> = {
  label: string;
  value: T;
};

type Props<T = string> = {
  options: Option<T>[];
  selectedValue?: T | null;
  onValueChange: (value: T) => void;
  column?: number;
  textAlign?: 'flex-start' | 'flex-end' | 'center';
  onError?: boolean;
};

export default function SelectCard<T = string>({ options, selectedValue, onValueChange, onError, column = 2, textAlign = 'center' }: Props<T>) {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const selected = String(opt.value) === String(selectedValue);

        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onValueChange(opt.value)}
            style={({ pressed }) => [
              styles.optionCard,
              { backgroundColor, flexBasis: `${100 / column - 2}%`, alignItems: textAlign },
              selected && styles.optionSelected,
              onError ? { borderColor: Colors.accentRed, borderWidth: 1 } : null,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type={selected ? "default" : "default"} style={selected ? styles.selectedText : undefined}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flexGrow: 1,
    borderRadius: RADIUS.DEFAULT,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    justifyContent: 'center',
    borderColor: Colors.light.fill.secondary,
  },
  optionSelected: {
    borderColor: Colors.accentBlue,
    backgroundColor: Colors.accentBlue,
  },
  selectedText: {
    color: '#fff',
  },
  pressed: { opacity: 0.85 },
});
