# Taxi App - Build Instructions

This guide will help you build downloadable files for iOS and Android platforms.

## Prerequisites

### For iOS Development:
- macOS with Xcode 12.0 or later
- Apple Developer Account (for device testing and App Store distribution)
- CocoaPods installed: `sudo gem install cocoapods`

### For Android Development:
- Android Studio with Android SDK
- Java Development Kit (JDK) 11 or later
- Android SDK Build Tools 30.0.3 or later

### For Both Platforms:
- Node.js 16.0 or later
- React Native CLI: `npm install -g @react-native-community/cli`

## Quick Build Commands

### iOS Build
```bash
# Make script executable (macOS/Linux)
chmod +x build-ios.sh
./build-ios.sh

# Or run manually:
cd client
npm install
cd ios && pod install && cd ..
npx react-native run-ios
```

### Android Build
```bash
# Make script executable (macOS/Linux)
chmod +x build-android.sh
./build-android.sh

# Or run manually:
cd client
npm install
cd android
./gradlew assembleRelease
```

### Windows Build
```cmd
# Run Windows batch script
build-windows.bat

# Or run manually:
cd client
npm install
cd android
gradlew.bat assembleRelease
```

## Downloadable Files

After building, you'll find these files:

### iOS
- **Simulator Build**: `client/ios/build/Build/Products/Debug-iphonesimulator/TaxiApp.app`
- **Device Build**: `client/ios/build/TaxiApp.ipa`
- **App Store Archive**: `client/ios/TaxiApp.xcarchive`

### Android
- **Debug APK**: `client/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `client/android/app/build/outputs/apk/release/app-release.apk`
- **App Bundle**: `client/android/app/build/outputs/bundle/release/app-release.aab`

## Installation Methods

### iOS Installation

#### For Development/Testing:
1. **iOS Simulator**: 
   - Open Xcode
   - Select iOS Simulator
   - Run: `npx react-native run-ios`

2. **Physical Device**:
   - Connect iPhone via USB
   - Open Xcode
   - Select your device
   - Run: `npx react-native run-ios --device`

3. **TestFlight** (for beta testing):
   - Upload IPA to App Store Connect
   - Add testers via TestFlight
   - Testers receive email invitation

#### For Production:
- Upload to App Store Connect
- Submit for App Store review
- Publish to App Store

### Android Installation

#### For Development/Testing:
1. **Android Emulator**:
   - Start Android Studio
   - Launch AVD Manager
   - Run: `npx react-native run-android`

2. **Physical Device**:
   - Enable Developer Options on Android device
   - Enable USB Debugging
   - Connect via USB
   - Run: `npx react-native run-android`

3. **APK Installation**:
   ```bash
   # Install via ADB
   adb install client/android/app/build/outputs/apk/release/app-release.apk
   
   # Or transfer APK to device and install manually
   ```

#### For Production:
- Upload AAB to Google Play Console
- Submit for Play Store review
- Publish to Play Store

## Configuration Files

### iOS Configuration
- **Bundle Identifier**: `com.taxiapp`
- **App Name**: Taxi App
- **Version**: 1.0
- **Permissions**: Location, Camera, Photo Library

### Android Configuration
- **Package Name**: `com.taxiapp`
- **App Name**: Taxi App
- **Version Code**: 1
- **Version Name**: 1.0
- **Permissions**: Internet, Location, Camera, Storage

## Environment Setup

### Backend Configuration
Make sure your backend server is running:
```bash
# Start backend server
cd server
npm start
```

### Environment Variables
Create `.env` file in client directory:
```
API_BASE_URL=http://localhost:5000/api
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Troubleshooting

### Common iOS Issues:
- **Pod install fails**: Run `cd ios && pod deintegrate && pod install`
- **Build fails**: Clean build folder in Xcode (Product → Clean Build Folder)
- **Signing issues**: Check Apple Developer account and certificates

### Common Android Issues:
- **Gradle build fails**: Run `cd android && ./gradlew clean`
- **Metro bundler issues**: Run `npx react-native start --reset-cache`
- **Device not recognized**: Check USB debugging and drivers

### General Issues:
- **Node modules issues**: Delete `node_modules` and run `npm install`
- **Cache issues**: Run `npx react-native start --reset-cache`
- **Port conflicts**: Kill processes on ports 8081, 5000

## Security Notes

### For Production:
- Use proper signing certificates
- Enable code obfuscation
- Use HTTPS for API calls
- Implement proper authentication
- Add app security measures

### For Testing:
- Use debug builds for development
- Test on multiple devices
- Verify all permissions work correctly
- Test offline functionality

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review React Native documentation
3. Check platform-specific documentation (iOS/Android)
4. Verify all prerequisites are installed correctly

## File Locations Summary

```
taxi/
├── client/
│   ├── ios/
│   │   ├── build/
│   │   │   └── TaxiApp.ipa          # iOS App Store file
│   │   └── TaxiApp.xcarchive        # iOS Archive
│   └── android/
│       └── app/build/outputs/
│           ├── apk/release/
│           │   └── app-release.apk  # Android APK
│           └── bundle/release/
│               └── app-release.aab  # Android App Bundle
├── build-ios.sh                     # iOS build script
├── build-android.sh                 # Android build script
└── build-windows.bat                # Windows build script
```

Happy building! 🚗📱
