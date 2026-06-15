const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const keysPath = join(__dirname, "local.keys");

function loadLocalKeys() {
  const content = readFileSync(keysPath, "utf8");
  const keys = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    keys[trimmed.slice(0, separator)] = trimmed.slice(separator + 1);
  }

  return keys;
}

function requireKey(keys, ...names) {
  for (const name of names) {
    const value = keys[name];
    if (value) {
      return value;
    }
  }

  throw new Error(`Missing ${names.join(" or ")} in ${keysPath}`);
}

const keys = loadLocalKeys();

module.exports = {
  LOCAL_SUPABASE_URL: requireKey(keys, "EXPO_PUBLIC_SUPABASE_URL"),
  LOCAL_ANON_KEY: requireKey(
    keys,
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY"
  ),
  LOCAL_SERVICE_ROLE_KEY: requireKey(keys, "SUPABASE_SERVICE_ROLE_KEY"),
  LOCAL_POWERSYNC_URL: requireKey(keys, "EXPO_PUBLIC_POWERSYNC_URL"),
};
