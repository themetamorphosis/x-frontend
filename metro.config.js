const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force CJS resolution for zustand to avoid import.meta.env in the bundle.
// The ESM build uses import.meta.env which crashes in classic <script> tags.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "zustand/middleware" || moduleName.startsWith("zustand/middleware/")) {
    return context.resolveRequest(context, "zustand/middleware.js", platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
