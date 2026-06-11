import type { ColorSchemeName } from "react-native";
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper";

import { isDarkColorScheme } from "./color-scheme";

/** Paper M3 theme following the device light/dark preference. */
export function getTheme(
  colorScheme: ColorSchemeName | null | undefined
): MD3Theme {
  return isDarkColorScheme(colorScheme) ? MD3DarkTheme : MD3LightTheme;
}
