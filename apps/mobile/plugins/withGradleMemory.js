const { withGradleProperties } = require("@expo/config-plugins");

/** Reduce parallel Gradle/native work — prefab spawns JVMs per module and can OOM on Windows. */
module.exports = function withGradleMemory(config) {
  return withGradleProperties(config, (config) => {
    const set = (key, value) => {
      const existing = config.modResults.find(
        (p) => p.type === "property" && p.key === key
      );
      if (existing) existing.value = value;
      else config.modResults.push({ type: "property", key, value });
    };
    set(
      "org.gradle.jvmargs",
      "-Xmx4096m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8"
    );
    set("org.gradle.workers.max", "2");
    set("org.gradle.parallel", "false");
    return config;
  });
};
