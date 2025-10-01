#!/bin/bash
# Cordova APK Builder

echo "🚗 Setting up Cordova for APK build..."

# Check if cordova is installed
if ! command -v cordova &> /dev/null; then
    echo "Installing Cordova globally..."
    npm install -g cordova
fi

# Create Cordova project
echo "Creating Cordova project..."
cordova create taxi-cordova com.taxiapp.mobile TaxiApp

# Navigate to project
cd taxi-cordova || exit

# Copy web app
echo "Copying web app files..."
rm -rf www/*
cp -r ../web/* www/

# Update config.xml with app details
cat > config.xml << 'EOF'
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.taxiapp.mobile" version="1.0.0" xmlns="http://www.w3.org/ns/widgets">
    <name>Taxi App</name>
    <description>
        Uber-like ride sharing application
    </description>
    <author email="dev@taxiapp.com" href="https://github.com">
        Taxi App Team
    </author>
    <content src="index.html" />
    <access origin="*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
    <platform name="android">
        <allow-intent href="market:*" />
        <icon density="ldpi" src="www/icon-192.png" />
        <icon density="mdpi" src="www/icon-192.png" />
        <icon density="hdpi" src="www/icon-192.png" />
        <icon density="xhdpi" src="www/icon-512.png" />
        <icon density="xxhdpi" src="www/icon-512.png" />
        <icon density="xxxhdpi" src="www/icon-512.png" />
    </platform>
    <preference name="DisallowOverscroll" value="true" />
    <preference name="android-minSdkVersion" value="23" />
    <preference name="android-targetSdkVersion" value="34" />
</widget>
EOF

# Add Android platform
echo "Adding Android platform..."
cordova platform add android

# Build APK
echo "Building APK..."
cordova build android

# Check if successful
APK_PATH="platforms/android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK built successfully!"
    cp "$APK_PATH" ../releases/TaxiApp.apk
    echo "📦 APK saved to: releases/TaxiApp.apk"
    ls -lh ../releases/TaxiApp.apk
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🎉 Done! Your APK is ready to install on Android phones!"
echo "📁 Location: releases/TaxiApp.apk"
echo ""
echo "To install:"
echo "1. Transfer APK to your Android phone"
echo "2. Enable 'Install from unknown sources' in Settings"
echo "3. Tap the APK file to install"
echo "4. Open and enjoy!"
