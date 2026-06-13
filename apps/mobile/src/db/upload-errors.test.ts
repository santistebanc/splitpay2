import { describe, expect, it } from "vitest";

import { isDuplicateKeyError } from "./upload-errors.js";

describe("isDuplicateKeyError", () => {
  it("detects postgres unique violations", () => {
    expect(isDuplicateKeyError({ code: "23505" })).toBe(true);
  });

  it("ignores other errors", () => {
    expect(isDuplicateKeyError({ code: "23503" })).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
  });
});
