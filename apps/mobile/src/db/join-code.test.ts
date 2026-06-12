import { describe, expect, it } from "vitest";

import {
  JOIN_CODE_ALPHABET,
  JOIN_CODE_LENGTH,
  generateJoinCode,
  isValidJoinCode,
} from "./join-code.js";

describe("join code", () => {
  it("generates a five-character code from the safe alphabet", () => {
    const code = generateJoinCode(() => 0);

    expect(code).toHaveLength(JOIN_CODE_LENGTH);
    expect(code).toBe(JOIN_CODE_ALPHABET[0].repeat(JOIN_CODE_LENGTH));
    expect(isValidJoinCode(code)).toBe(true);
  });

  it("rejects ambiguous or wrong-length codes", () => {
    expect(isValidJoinCode("ABCDE")).toBe(true);
    expect(isValidJoinCode("ABCD")).toBe(false);
    expect(isValidJoinCode("ABCD0")).toBe(false);
    expect(isValidJoinCode("ABCDI")).toBe(false);
  });
});
