#!/usr/bin/env node
/**
 * Patches @react-native/gradle-plugin for Gradle 9 + Android Studio JBR (Java 21):
 * - Remove foojay-resolver-convention (0.5.0 breaks Gradle 9; 1.0.0 auto-download is flaky on Windows)
 * - Use jvmToolchain(21) so Android Studio's bundled JBR works (RN defaults to 17)
 * https://github.com/facebook/react-native/issues/55781
 */
const fs = require("fs");
const path = require("path");

const GRADLE_PLUGIN = path.join(
  __dirname,
  "../node_modules/@react-native/gradle-plugin"
);

function patchFile(relativePath, transform) {
  const file = path.join(GRADLE_PLUGIN, relativePath);
  if (!fs.existsSync(file)) return false;
  const content = fs.readFileSync(file, "utf8");
  const patched = transform(content);
  if (patched === content) return false;
  fs.writeFileSync(file, patched);
  return true;
}

if (!fs.existsSync(GRADLE_PLUGIN)) {
  process.exit(0);
}

let changed = 0;

if (
  patchFile("settings.gradle.kts", (content) =>
    content.replace(
      /\nplugins \{ id\("org\.gradle\.toolchains\.foojay-resolver-convention"\)\.version\("[^"]+"\) \}\n/,
      "\n"
    )
  )
) {
  changed++;
}

for (const file of [
  "shared/build.gradle.kts",
  "shared-testutil/build.gradle.kts",
  "settings-plugin/build.gradle.kts",
  "react-native-gradle-plugin/build.gradle.kts",
]) {
  if (
    patchFile(file, (content) =>
      content.replace(/jvmToolchain\(17\)/g, "jvmToolchain(21)")
    )
  ) {
    changed++;
  }
}

if (
  patchFile(
    "react-native-gradle-plugin/src/main/kotlin/com/facebook/react/utils/JdkConfiguratorUtils.kt",
    (content) =>
      content
        .replace(/jvmToolchain\(17\)/g, "jvmToolchain(21)")
        .replace(/JavaVersion\.VERSION_17/g, "JavaVersion.VERSION_21")
  )
) {
  changed++;
}

function findAndroidStudioJbr() {
  if (process.platform === "win32") {
    const candidates = [
      path.join(
        process.env.ProgramFiles || "C:\\Program Files",
        "Android",
        "Android Studio",
        "jbr"
      ),
      path.join(
        process.env.LOCALAPPDATA || "",
        "Programs",
        "Android Studio",
        "jbr"
      ),
    ];
    for (const jbr of candidates) {
      if (fs.existsSync(path.join(jbr, "bin", "java.exe"))) return jbr;
    }
  }
  if (process.platform === "linux" || process.platform === "darwin") {
    const home = process.env.HOME || "";
    const candidates = [
      "/mnt/c/Program Files/Android/Android Studio/jbr",
      path.join(home, "android-studio/jbr"),
      "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
    ];
    for (const jbr of candidates) {
      if (fs.existsSync(path.join(jbr, "bin", "java"))) return jbr;
    }
  }
  return process.env.JAVA_HOME || null;
}

function upsertProperty(props, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^\\s*${key.replace(/\./g, "\\.")}=.*$`, "m");
  if (re.test(props)) return props.replace(re, line);
  return props.trimEnd() + (props ? "\n" : "") + line + "\n";
}

const GRADLE_TUNING = {
  "org.gradle.jvmargs":
    "-Xmx4096m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8",
  "org.gradle.workers.max": "2",
  "org.gradle.parallel": "false",
};

function ensureGradleProperties(propsPath, extra = {}) {
  fs.mkdirSync(path.dirname(propsPath), { recursive: true });
  let props = fs.existsSync(propsPath)
    ? fs.readFileSync(propsPath, "utf8")
    : "";
  for (const [key, value] of Object.entries({ ...GRADLE_TUNING, ...extra })) {
    props = upsertProperty(props, key, value);
  }
  fs.writeFileSync(propsPath, props);
}

const jbr = findAndroidStudioJbr();
const userGradleProps = path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  ".gradle",
  "gradle.properties"
);
if (jbr) {
  ensureGradleProperties(userGradleProps, {
    "org.gradle.java.home": jbr.replace(/\\/g, "/"),
  });
  console.log(`patch-react-native-gradle: org.gradle.java.home=${jbr}`);
} else {
  ensureGradleProperties(userGradleProps);
}

const projectGradleProps = path.join(
  __dirname,
  "../apps/mobile/android/gradle.properties"
);
if (fs.existsSync(projectGradleProps)) {
  ensureGradleProperties(projectGradleProps);
  console.log(
    "patch-react-native-gradle: tuned apps/mobile/android/gradle.properties"
  );
}

if (changed > 0) {
  console.log(
    `patch-react-native-gradle: patched ${changed} file(s) (Gradle 9 + JDK 21 toolchain)`
  );
}
