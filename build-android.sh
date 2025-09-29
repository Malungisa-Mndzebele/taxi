#!/bin/bash

# Taxi App Android Build Script
echo "🚗 Building Taxi App for Android..."

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Build debug APK
echo "🔨 Building debug APK..."
npx react-native run-android --variant=debug

# Build release APK
echo "📦 Building release APK..."
cd android
./gradlew assembleRelease

# Build App Bundle (recommended for Play Store)
echo "📱 Building App Bundle..."
./gradlew bundleRelease

echo "✅ Android build completed!"
echo "📁 APK file location: client/android/app/build/outputs/apk/release/app-release.apk"
echo "📁 AAB file location: client/android/app/build/outputs/bundle/release/app-release.aab"
echo "📱 Install APK on device using: adb install app-release.apk"
