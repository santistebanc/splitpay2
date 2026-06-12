const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enablePackageExports = true;

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    if (moduleName === "@powersync/react-native") {
      return { type: "empty" };
    }

    const webMapping = {
      "@powersync/web": "@powersync/web/dist/index.umd.js",
    };
    if (webMapping[moduleName]) {
      return context.resolveRequest(context, webMapping[moduleName], platform);
    }
  } else if (moduleName === "@powersync/web") {
    return { type: "empty" };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
