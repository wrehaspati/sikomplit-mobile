import { Colors } from "@/constants/theme";
import { ThemedText } from "./themed-text";

export default function Disclaimer() {
  return (
    <ThemedText
      type="caption"
      style={{ textAlign: "center" }}
      lightColor={Colors.light.text.secondary}
      darkColor={Colors.dark.text.secondary}
    >
      Aplikasi ini adalah purwarupa penelitian akademis dan tidak mewakili
      entitas pemerintah atau Dinas Kesehatan mana pun.
    </ThemedText>
  );
}
