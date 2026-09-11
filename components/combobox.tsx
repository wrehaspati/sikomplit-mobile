import { ThemedText } from "@/components/themed-text";
import { Colors, RADIUS, SCREEN_MARGIN_HORIZONTAL } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BottomSheetModal from "./modal";
import ThemedTextInput from "./themed-text-input";
import { IconSymbol } from "./ui/icon-symbol";

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
  background?: string;
};

export default function Combobox<T = string>({
  options,
  selectedValue,
  errorMessage,
  onValueChange,
  titlePlaceholder,
  background,
  placeholder = "Pilih",
  searchPlaceholder = "Cari...",
}: Props<T>) {
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "components.supportCard.border");
  const iconColor = useThemeColor({}, "text.secondary");
  const cardColor = useThemeColor({}, "card");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedLabel = options.find(
    (option) => String(option.value) === String(selectedValue),
  )?.label;

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  // Handler to clear search input and dismiss keyboard
  const handleSearchClear = () => {
    setQuery("");
    Keyboard.dismiss();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: background ? background : backgroundColor,
            borderColor: borderColor,
          },
          errorMessage && { borderColor: Colors.accentRed },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText
          type={"default"}
          lightColor={selectedLabel ? undefined : Colors.light.text.secondary}
          darkColor={selectedLabel ? undefined : Colors.dark.text.secondary}
        >
          {selectedLabel ?? placeholder}
        </ThemedText>
        <ThemedText
          lightColor={Colors.light.text.secondary}
          darkColor={Colors.dark.text.secondary}
        >
          ▾
        </ThemedText>
      </Pressable>
      {errorMessage && (
        <Text style={{ marginTop: 4, color: Colors.accentRed, fontSize: 12 }}>
          {errorMessage}
        </Text>
      )}

      <BottomSheetModal
        visible={open}
        title={titlePlaceholder ?? "Pilih data"}
        onClose={() => setOpen(false)}
      >
        <View style={{ position: "relative" }}>
          <ThemedTextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={Colors.light.text.secondary}
            inputStyle={[
              styles.input,
              {
                backgroundColor: background ? background : backgroundColor,
                borderColor,
                borderWidth: 1,
                marginHorizontal: SCREEN_MARGIN_HORIZONTAL,
              },
            ]}
            style={{ paddingVertical: 12, paddingRight: 40 }}
            icon={
              <IconSymbol
                name="magnifyingglass"
                style={{ width: 20 }}
                color={iconColor}
              />
            }
          />
          {query.length > 0 && (
            <Pressable
              onPress={handleSearchClear}
              style={styles.searchClearButton}
              hitSlop={10}
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={18}
                color={Colors.light.text.secondary}
              />
            </Pressable>
          )}
        </View>
        <FlatList
          data={filteredOptions}
          style={{ paddingHorizontal: SCREEN_MARGIN_HORIZONTAL }}
          keyExtractor={(item) => String(item.value)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const selected = String(item.value) === String(selectedValue);
            return (
              <Pressable
                onPress={() => {
                  onValueChange(item.value);
                  setOpen(false);
                  setQuery("");
                }}
                style={({ pressed }) => [
                  styles.option,
                  {
                    borderColor: borderColor,
                    backgroundColor: background ? background : cardColor,
                  },
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText
                  type={selected ? "defaultSemiBold" : "default"}
                  style={selected ? styles.optionSelectedText : undefined}
                >
                  {item.label}
                </ThemedText>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ThemedText
                type="caption"
                darkColor={Colors.dark.text.secondary}
                lightColor={Colors.light.text.secondary}
              >
                Tidak ada hasil.
              </ThemedText>
            </View>
          }
        />
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 52,
    borderRadius: RADIUS.DEFAULT,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  input: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.fill.vibrant.primary,
    paddingHorizontal: 24,
    marginBottom: 24,
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
  },
  option: {
    minHeight: 48,
    borderRadius: RADIUS.DEFAULT,
    paddingHorizontal: 24,
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
  },
  optionSelected: {
    backgroundColor: Colors.accentBlue,
    borderColor: Colors.accentBlue,
  },
  optionSelectedText: {
    color: "#fff",
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
  },
  searchClearButton: {
    position: "absolute",
    right: 14,
    top: 16,
  },
});
