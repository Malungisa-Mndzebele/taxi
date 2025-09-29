#!/bin/bash

# Taxi App iOS Build Script
echo "🚗 Building Taxi App for iOS..."

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install iOS dependencies
echo "🍎 Installing iOS dependencies..."
cd ios
pod install
cd ..

# Build for iOS Simulator
echo "🔨 Building for iOS Simulator..."
npx react-native run-ios --simulator="iPhone 14"

# Build for iOS Device (requires Xcode and Apple Developer account)
echo "📱 Building for iOS Device..."
npx react-native run-ios --device

# Create archive for App Store distribution
echo "📦 Creating archive for App Store..."
cd ios
xcodebuild -workspace TaxiApp.xcworkspace -scheme TaxiApp -configuration Release -archivePath TaxiApp.xcarchive archive

# Export IPA file
echo "📤 Exporting IPA file..."
xcodebuild -exportArchive -archivePath TaxiApp.xcarchive -exportPath ./build -exportOptionsPlist ExportOptions.plist

echo "✅ iOS build completed!"
echo "📁 IPA file location: client/ios/build/TaxiApp.ipa"
echo "📱 Install on device using Xcode or TestFlight"
