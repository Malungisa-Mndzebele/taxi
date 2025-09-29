module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/index.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-paper|react-native-vector-icons|react-native-maps|react-native-geolocation-service|react-native-permissions|react-native-async-storage|react-native-image-picker|react-native-ratings|react-native-elements|react-native-linear-gradient|react-native-modal|react-native-animatable|react-native-reanimated|react-native-svg|react-native-phone-number-input|react-native-credit-card-input|react-native-stripe|react-native-push-notification|react-native-device-info|react-native-keychain)/)',
  ],
  testEnvironment: 'jsdom',
  verbose: true,
};
