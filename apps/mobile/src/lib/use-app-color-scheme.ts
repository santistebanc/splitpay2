import { Platform, useColorScheme } from "react-native";
import { useEffect, useState } from "react";

function readWebColorScheme(): "light" | "dark" {
  if (Platform.OS !== "web" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Resolved app color scheme — on web uses `prefers-color-scheme` directly. */
export function useAppColorScheme(): "light" | "dark" {
  const nativeScheme = useColorScheme();
  const [webScheme, setWebScheme] = useState(() => readWebColorScheme());

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      setWebScheme(media.matches ? "dark" : "light");
    };

    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  if (Platform.OS === "web") {
    return webScheme;
  }

  return nativeScheme === "dark" ? "dark" : "light";
}
