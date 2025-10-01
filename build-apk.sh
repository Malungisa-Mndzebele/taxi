#!/bin/bash
# Simple APK Build Script

echo "🚗 Building Taxi App APK..."

# Check for Android SDK
if ! command -v android &> /dev/null; then
    echo "❌ Android SDK not found. Please install Android Studio."
    exit 1
fi

# Navigate to client directory
cd client/android || exit

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build debug APK (signed with debug key)
echo "🔨 Building debug APK..."
./gradlew assembleDebug

# Check if build was successful
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ APK built successfully!"
    echo "📦 Location: client/android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Copy to releases
    cp app/build/outputs/apk/debug/app-debug.apk ../../releases/TaxiApp-debug.apk
    echo "📁 Copied to: releases/TaxiApp-debug.apk"
    
    # Show file size
    ls -lh ../../releases/TaxiApp-debug.apk
else
    echo "❌ Build failed!"
    exit 1
fi
