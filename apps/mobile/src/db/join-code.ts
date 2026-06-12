/** Uppercase alphanumeric, excluding ambiguous 0/O, 1/I/L. */
export const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const JOIN_CODE_LENGTH = 5;

/** Generates a random join code for a new group. */
export function generateJoinCode(random: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    const index = Math.floor(random() * JOIN_CODE_ALPHABET.length);
    code += JOIN_CODE_ALPHABET[index];
  }
  return code;
}

/** True when the code matches the product join-code format. */
export function isValidJoinCode(code: string): boolean {
  if (code.length !== JOIN_CODE_LENGTH) {
    return false;
  }

  return [...code].every((char) => JOIN_CODE_ALPHABET.includes(char));
}
