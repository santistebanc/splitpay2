import type { ColorSchemeName } from "react-native";

/** Whether the OS color scheme is dark (everything else maps to light). */
export function isDarkColorScheme(
  colorScheme: ColorSchemeName | null | undefined
): boolean {
  return colorScheme === "dark";
}
