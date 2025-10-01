#!/usr/bin/env node

/**
 * Create APK from Web App
 * This script provides instructions and tools to convert the web app into an installable APK
 */

const fs = require('fs');
const path = require('path');

console.log('🚗 Taxi App - APK Creator\n');
console.log('='.repeat(60));

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if we have the necessary files
const webAppPath = path.join(__dirname, 'web', 'index.html');
const releasesPath = path.join(__dirname, 'releases');

if (!fs.existsSync(webAppPath)) {
    log('❌ Error: web/index.html not found!', 'red');
    process.exit(1);
}

if (!fs.existsSync(releasesPath)) {
    fs.mkdirSync(releasesPath, { recursive: true });
}

log('\n📱 Creating Android APK from Web App\n', 'blue');

log('Option 1: Use PWA Builder (Recommended - Easiest)', 'green');
log('━'.repeat(60), 'green');
log('PWA Builder creates a real APK from your Progressive Web App\n');
log('Steps:', 'yellow');
log('1. Go to: https://www.pwabuilder.com/', 'yellow');
log('2. Enter your web app URL (or use local file)', 'yellow');
log('3. Click "Start" to analyze your PWA', 'yellow');
log('4. Click "Package For Stores"', 'yellow');
log('5. Select "Android" and download APK', 'yellow');
log('6. Save APK to releases/ folder\n', 'yellow');

log('Option 2: Use Apache Cordova (Technical)', 'green');
log('━'.repeat(60), 'green');
log('Create a native wrapper around the web app\n');
log('Commands:', 'yellow');
log('  npm install -g cordova', 'yellow');
log('  cordova create taxi-cordova com.taxiapp.mobile TaxiApp', 'yellow');
log('  cd taxi-cordova', 'yellow');
log('  cordova platform add android', 'yellow');
log('  cordova build android', 'yellow');

log('\n\nOption 3: Manual Build with Android Studio (Most Control)', 'green');
log('━'.repeat(60), 'green');

// Create a simple build script
const buildScript = `#!/bin/bash
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
`;

fs.writeFileSync('build-apk.sh', buildScript);
fs.chmodSync('build-apk.sh', '755');

log('Created build script: build-apk.sh\n', 'yellow');

// Create a Windows batch version
const buildBat = `@echo off
echo Building Taxi App APK...

cd client\\android

echo Cleaning previous builds...
call gradlew.bat clean

echo Building debug APK...
call gradlew.bat assembleDebug

if exist "app\\build\\outputs\\apk\\debug\\app-debug.apk" (
    echo APK built successfully!
    copy app\\build\\outputs\\apk\\debug\\app-debug.apk ..\\..\\releases\\TaxiApp-debug.apk
    echo APK copied to releases\\TaxiApp-debug.apk
) else (
    echo Build failed!
    exit /b 1
)
`;

fs.writeFileSync('build-apk.bat', buildBat);

log('Created Windows build script: build-apk.bat\n', 'yellow');

// Create comprehensive guide
const apkGuide = `# 🚀 Creating APK File for Android Installation

## Quick Methods (Choose One)

### ⚡ Method 1: PWA Builder (Fastest - No coding needed)

**Best for:** Non-developers, quick APK generation

1. **Host your web app** (or use localhost with ngrok)
2. **Visit:** https://www.pwabuilder.com/
3. **Enter URL:** Your web app URL
4. **Analyze:** Let it scan your PWA
5. **Package:** Click "Package For Stores" → Android
6. **Download:** Get your APK file
7. **Done!** Install on Android phone

**Pros:**
- ✅ No development environment needed
- ✅ No Android Studio required
- ✅ Creates signed APK
- ✅ Works in minutes

**Cons:**
- ⚠️ Requires web app to be hosted online
- ⚠️ Less customization

---

### 🔧 Method 2: Apache Cordova (Intermediate)

**Best for:** Developers familiar with npm/node

\`\`\`bash
# Install Cordova globally
npm install -g cordova

# Create Cordova project
cordova create taxi-cordova com.taxiapp.mobile TaxiApp
cd taxi-cordova

# Copy your web app files to www/
rm -rf www/*
cp -r ../web/* www/

# Add Android platform
cordova platform add android

# Build APK
cordova build android

# Find APK at:
# platforms/android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

**Pros:**
- ✅ Full control over build
- ✅ Can add native plugins
- ✅ Customizable
- ✅ Repeatable builds

**Cons:**
- ⚠️ Requires Node.js and Android SDK
- ⚠️ More setup required

---

### 🏗️ Method 3: React Native Build (Advanced)

**Best for:** Those with full Android development setup

**Requirements:**
- Android Studio
- Android SDK (API 34)
- Java JDK 11+
- Gradle

**Steps:**

1. **Fix dependencies:**
\`\`\`bash
cd client
npm install --legacy-peer-deps --force
\`\`\`

2. **Build APK:**

**On Mac/Linux:**
\`\`\`bash
./build-apk.sh
\`\`\`

**On Windows:**
\`\`\`bash
build-apk.bat
\`\`\`

**Or manually:**
\`\`\`bash
cd client/android
./gradlew assembleDebug  # Mac/Linux
# OR
gradlew.bat assembleDebug  # Windows
\`\`\`

3. **Find APK:**
\`\`\`
client/android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

**Pros:**
- ✅ True native app
- ✅ Best performance
- ✅ Full React Native features

**Cons:**
- ⚠️ Complex setup
- ⚠️ Dependency issues possible
- ⚠️ Requires Android Studio

---

## 🎯 Recommended Approach

**For most users:** Use **Method 1 (PWA Builder)**

Why?
- No setup required
- Works in 5 minutes
- Creates proper signed APK
- No technical knowledge needed

**Steps:**

1. **Make web app accessible:**
   - Start server: \`npm start\`
   - Use ngrok to expose: \`npx ngrok http 5000\`
   - Get public URL

2. **Generate APK:**
   - Go to https://www.pwabuilder.com/
   - Enter your ngrok URL
   - Click "Start"
   - Download Android package

3. **Install:**
   - Transfer APK to phone
   - Enable "Unknown sources"
   - Install and enjoy!

---

## 📦 Alternative: Use Existing PWA

Your app already works as a PWA (Progressive Web App):

1. Open \`web/index.html\` in Chrome on Android
2. Tap menu (⋮) → "Add to Home Screen"
3. App installs instantly!

**This is often better than APK because:**
- ✅ Instant installation
- ✅ Automatic updates
- ✅ Smaller size
- ✅ No "unknown sources" needed

---

## 🔧 Troubleshooting

### React Native Build Fails:
**Problem:** Namespace errors, dependency conflicts

**Solution:**
1. Use PWA Builder instead (Method 1)
2. OR use Cordova (Method 2)
3. OR use PWA installation (no APK needed)

### No Android Studio:
**Solution:** Use PWA Builder (no Android Studio needed)

### Want Quick Solution:
**Solution:** Use PWA installation (add to home screen)

---

## 📱 Current Status

Your app is ready to use RIGHT NOW via PWA:

1. **On Android phone:** Open Chrome
2. **Navigate to:** \`web/index.html\` (or hosted URL)
3. **Add to Home Screen**
4. **Done!** Works like native app

**No APK needed!**

---

## 🎉 Summary

**Easiest:** PWA installation (no APK needed)
**Fastest APK:** PWA Builder (5 minutes)
**Most Control:** React Native/Cordova build

**Recommendation:** Start with PWA installation, create APK later if needed.

Your app works perfectly as PWA - APK is optional!
`;

fs.writeFileSync(path.join(releasesPath, 'CREATE_APK_GUIDE.md'), apkGuide);

log('✅ Created comprehensive guide: releases/CREATE_APK_GUIDE.md\n', 'green');

// Create a simple Cordova setup script
const cordovaSetup = `#!/bin/bash
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
`;

fs.writeFileSync('create-cordova-apk.sh', cordovaSetup);
fs.chmodSync('create-cordova-apk.sh', '755');

log('✅ Created Cordova setup script: create-cordova-apk.sh\n', 'green');

// Summary
log('\n' + '='.repeat(60), 'blue');
log('📋 SUMMARY', 'blue');
log('='.repeat(60), 'blue');

log('\n✅ Created the following files:', 'green');
log('  • build-apk.sh - Shell script for React Native build');
log('  • build-apk.bat - Windows batch script for build');
log('  • create-cordova-apk.sh - Cordova APK builder');
log('  • releases/CREATE_APK_GUIDE.md - Comprehensive guide\n');

log('🚀 Quick Start Options:\n', 'yellow');

log('1️⃣  PWA Builder (Easiest - Recommended):', 'green');
log('   → Visit: https://www.pwabuilder.com/');
log('   → Enter your web app URL');
log('   → Download APK\n');

log('2️⃣  Cordova (Good balance):', 'green');
log('   → Run: ./create-cordova-apk.sh');
log('   → APK will be in releases/\n');

log('3️⃣  PWA Installation (No APK needed):', 'green');
log('   → Open web/index.html in Chrome on Android');
log('   → Add to Home Screen');
log('   → Works instantly!\n');

log('📖 Full guide:', 'yellow');
log('   Read: releases/CREATE_APK_GUIDE.md\n');

log('='.repeat(60), 'blue');
log('✨ Your app is ready! Choose the method that works best for you.', 'green');
log('='.repeat(60), 'blue');

