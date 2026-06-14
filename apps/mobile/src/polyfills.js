import { getRandomValues, randomUUID } from "expo-crypto";

/** Hermes has no Web Crypto; app code and PowerSync use `crypto.randomUUID()`. */
const cryptoPolyfill = {
  randomUUID,
  getRandomValues,
};

if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = cryptoPolyfill;
} else {
  if (typeof globalThis.crypto.randomUUID !== "function") {
    globalThis.crypto.randomUUID = randomUUID;
  }
  if (typeof globalThis.crypto.getRandomValues !== "function") {
    globalThis.crypto.getRandomValues = getRandomValues;
  }
}
