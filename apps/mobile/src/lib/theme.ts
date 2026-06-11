import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
  type MD3Theme,
} from "react-native-paper";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export type AppThemes = {
  paper: MD3Theme;
  navigation: NavigationTheme;
};

/** Paper + React Navigation themes for the given resolved color scheme. */
export function getThemes(scheme: "light" | "dark"): AppThemes {
  const dark = scheme === "dark";
  return {
    paper: dark ? MD3DarkTheme : MD3LightTheme,
    navigation: dark ? DarkTheme : LightTheme,
  };
}
