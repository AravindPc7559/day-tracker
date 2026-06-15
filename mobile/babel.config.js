module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/features': './src/features',
            '@/services': './src/services',
            '@/theme': './src/theme',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/navigation': './src/navigation',
            '@/constants': './src/constants',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
    ],
  };
};
