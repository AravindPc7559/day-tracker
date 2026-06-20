const { withAndroidManifest } = require('@expo/config-plugins');

// @react-native-voice/voice still pulls com.android.support libraries, which
// conflicts with androidx.core's appComponentFactory during manifest merging.
module.exports = function withAppComponentFactoryFix(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const application = manifest.application?.[0];
    if (application) {
      application.$['tools:replace'] = 'android:appComponentFactory';
    }

    return config;
  });
};
