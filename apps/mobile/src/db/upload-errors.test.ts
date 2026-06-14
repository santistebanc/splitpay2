import { describe, expect, it } from "vitest";

import { isConflictStatus, isDuplicateKeyError } from "./upload-errors.js";

describe("isDuplicateKeyError", () => {
  it("detects postgres unique violations", () => {
    expect(isDuplicateKeyError({ code: "23505" })).toBe(true);
  });

  it("detects duplicate key from message text", () => {
    expect(
      isDuplicateKeyError({
        message: 'duplicate key value violates unique constraint "groups_pkey"',
      })
    ).toBe(true);
  });

  it("ignores other errors", () => {
    expect(isDuplicateKeyError({ code: "23503" })).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
  });
});

describe("isConflictStatus", () => {
  it("detects HTTP 409", () => {
    expect(isConflictStatus(409)).toBe(true);
    expect(isConflictStatus(200)).toBe(false);
  });
});
