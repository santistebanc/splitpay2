import { describe, expect, it } from "vitest";
import { isDarkColorScheme } from "./color-scheme.js";

describe("isDarkColorScheme", () => {
  it("returns true only for dark color scheme", () => {
    expect(isDarkColorScheme("dark")).toBe(true);
  });

  it("returns false for light, unspecified, and missing scheme", () => {
    expect(isDarkColorScheme("light")).toBe(false);
    expect(isDarkColorScheme("unspecified")).toBe(false);
    expect(isDarkColorScheme(null)).toBe(false);
    expect(isDarkColorScheme(undefined)).toBe(false);
  });
});
