# 📱 Taxi App - Download & Installation Guide

## Quick Start

### 1. Build the Apps
```bash
# Build Android APK
npm run build-android

# Build iOS App (requires macOS + Xcode)
npm run build-ios

# Build both platforms
npm run build-all
```

### 2. Access Download Page
```bash
# Open download page in browser
npm run download

# Or manually open: download.html
```

## 📁 Generated Files

After building, you'll find these downloadable files:

### Android
- **APK File**: `client/android/app/build/outputs/apk/release/app-release.apk`
- **AAB File**: `client/android/app/build/outputs/bundle/release/app-release.aab`

### iOS
- **App Bundle**: `client/ios/build/` (requires Xcode to create IPA)

## 📲 Installation Methods

### Android Installation
1. **Download APK**: Get the APK file from the download page
2. **Enable Unknown Sources**: 
   - Go to Settings → Security → Unknown Sources
   - Enable "Install from unknown sources"
3. **Install**: Tap the APK file to install

### iOS Installation
1. **Build with Xcode**: Open `client/ios/TaxiApp.xcworkspace` in Xcode
2. **Select Device**: Choose your iPhone/iPad
3. **Build & Run**: Click the play button in Xcode
4. **Trust Developer**: Go to Settings → General → Device Management → Trust

### Web Installation
- **No Installation Required**: Just open `web/index.html` in any browser
- **PWA Support**: Can be installed as a web app on mobile devices

## 🔧 Prerequisites

### For Android Development:
- Android Studio
- Android SDK
- Java Development Kit (JDK) 11+

### For iOS Development:
- macOS with Xcode 12.0+
- Apple Developer Account (for device testing)
- CocoaPods: `sudo gem install cocoapods`

### For Both:
- Node.js 16.0+
- React Native CLI: `npm install -g @react-native-community/cli`

## 🚀 Quick Commands

```bash
# Install all dependencies
npm run install-all

# Start backend server
npm start

# Build Android APK
npm run build-android

# Open download page
npm run download
```

## 📋 File Structure

```
taxi/
├── client/
│   ├── android/
│   │   └── app/build/outputs/
│   │       ├── apk/release/app-release.apk    # Android APK
│   │       └── bundle/release/app-release.aab # Android App Bundle
│   └── ios/
│       └── build/                             # iOS build files
├── web/
│   └── index.html                             # Web version
├── download.html                              # Download page
├── build-apps.js                              # Build script
└── BUILD_INSTRUCTIONS.md                      # Detailed build guide
```

## 🛠️ Troubleshooting

### Android Build Issues:
```bash
# Clean and rebuild
cd client/android
./gradlew clean
./gradlew assembleRelease
```

### iOS Build Issues:
```bash
# Clean and reinstall pods
cd client/ios
pod deintegrate
pod install
```

### General Issues:
```bash
# Clear React Native cache
npx react-native start --reset-cache

# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `BUILD_INSTRUCTIONS.md` for detailed steps
3. Ensure all prerequisites are installed
4. Verify your backend server is running on port 5000

## 🎯 Next Steps

1. **Test the Apps**: Install on your devices and test all features
2. **Customize**: Modify app icons, colors, and branding
3. **Deploy**: Upload to app stores or distribute via other channels
4. **Monitor**: Set up analytics and crash reporting

Happy building! 🚗📱
