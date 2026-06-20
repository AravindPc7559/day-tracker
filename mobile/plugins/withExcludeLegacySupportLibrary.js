const { withAppBuildGradle } = require('@expo/config-plugins');

// @react-native-voice/voice depends on the legacy com.android.support
// libraries, which duplicate classes already provided by androidx.core,
// failing :app:checkReleaseDuplicateClasses. Drop the legacy artifacts.
module.exports = function withExcludeLegacySupportLibrary(config) {
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes("exclude group: 'com.android.support'")) {
      config.modResults.contents += `
configurations.all {
    exclude group: 'com.android.support'
}
`;
    }
    return config;
  });
};
