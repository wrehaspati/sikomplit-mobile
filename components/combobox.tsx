import { ThemedText } from '@/components/themed-text';
import { Colors, RADIUS } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Option<T = string> = {
  label: string;
  value: T;
};

type Props<T = string> = {
  options: Option<T>[];
  selectedValue?: T | null;
  onValueChange: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  titlePlaceholder?: string;
  errorMessage?: string;
};

export default function Combobox<T = string>({
  options,
  selectedValue,
  errorMessage,
  onValueChange,
  titlePlaceholder,
  placeholder = 'Pilih',
  searchPlaceholder = 'Cari...',
}: Props<T>) {
  const backgroundColor = useThemeColor({}, 'background');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedLabel = options.find((option) => String(option.value) === String(selectedValue))?.label;

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, { backgroundColor }, errorMessage && { borderColor: Colors.accentRed }, pressed && styles.pressed]}
      >
        <ThemedText type={'default'} lightColor={selectedLabel ? undefined : Colors.light.text.secondary} darkColor={selectedLabel ? undefined : Colors.dark.text.secondary}>
          {selectedLabel ?? placeholder}
        </ThemedText>
        <ThemedText lightColor={Colors.light.text.secondary} darkColor={Colors.dark.text.secondary}>
          ▾
        </ThemedText>
      </Pressable>
      {errorMessage && (
        <Text style={{ marginTop: 4, color: Colors.accentRed, fontSize: 12 }}>
          {errorMessage}
        </Text>
      )}

      <Modal animationType="fade" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor }]} onPress={() => undefined}>

            <View style={styles.sheetHeader}>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <ThemedText type="defaultSemiBold" lightColor={Colors.light.text.secondary} darkColor={Colors.dark.text.secondary}>
                  Batal
                </ThemedText>
              </Pressable>
              <ThemedText type="defaultSemiBold">
                {titlePlaceholder ?? 'Pilih data'}
              </ThemedText>
              <Text>{"             "}</Text>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={Colors.light.text.tertiary}
              style={[styles.input, { backgroundColor }]}
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = String(item.value) === String(selectedValue);

                return (
                  <Pressable
                    onPress={() => {
                      onValueChange(item.value);
                      setOpen(false);
                      setQuery('');
                    }}
                    style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}
                  >
                    <ThemedText type={selected ? 'defaultSemiBold' : 'default'} style={selected ? styles.optionSelectedText : undefined}>
                      {item.label}
                    </ThemedText>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <ThemedText type="caption" darkColor={Colors.dark.text.secondary} lightColor={Colors.light.text.secondary}>
                    Tidak ada hasil.
                  </ThemedText>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 52,
    borderRadius: RADIUS.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
  },
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
    height: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    minHeight: 48,
    borderRadius: RADIUS.DEFAULT,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
    paddingHorizontal: 24,
    marginBottom: 16,
    marginHorizontal: 8,
  },
  option: {
    minHeight: 48,
    borderRadius: RADIUS.DEFAULT,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.fill.secondary,
  },
  optionSelected: {
    backgroundColor: Colors.accentBlue,
    borderColor: Colors.accentBlue,
  },
  optionSelectedText: {
    color: '#fff',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
