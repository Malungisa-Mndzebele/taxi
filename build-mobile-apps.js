#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Building Mobile Apps for Phone Installation...\n');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description, options = {}) {
    try {
        log(`\n${colors.cyan}${description}...${colors.reset}`);
        execSync(command, { 
            stdio: 'inherit', 
            cwd: process.cwd(),
            ...options
        });
        log(`✅ ${description} completed successfully!`, 'green');
        return true;
    } catch (error) {
        log(`❌ ${description} failed: ${error.message}`, 'red');
        return false;
    }
}

function createReleasesDirectory() {
    const releaseDir = 'releases';
    if (!fs.existsSync(releaseDir)) {
        fs.mkdirSync(releaseDir);
        log(`📁 Created releases directory`, 'green');
    }
    return releaseDir;
}

function checkPrerequisites() {
    log('\n🔍 Checking prerequisites...', 'yellow');
    
    const checks = [
        { name: 'Node.js', command: 'node --version' },
        { name: 'npm', command: 'npm --version' }
    ];
    
    for (const check of checks) {
        try {
            const version = execSync(check.command, { encoding: 'utf8' }).trim();
            log(`✅ ${check.name}: ${version}`, 'green');
        } catch (error) {
            log(`❌ ${check.name} not found. Please install it first.`, 'red');
            return false;
        }
    }
    
    return true;
}

function buildAndroid() {
    log('\n🤖 Building Android APK for phone installation...', 'blue');
    
    const androidSteps = [
        {
            command: 'cd client && npm install --legacy-peer-deps --force',
            description: 'Installing client dependencies (with legacy peer deps)'
        },
        {
            command: 'cd client && npx react-native doctor',
            description: 'Checking React Native environment'
        }
    ];
    
    for (const step of androidSteps) {
        if (!runCommand(step.command, step.description)) {
            log('⚠️ Step failed, but continuing...', 'yellow');
        }
    }
    
    // Try to build Android APK
    log('\n🔨 Attempting to build Android APK...', 'blue');
    
    const buildCommands = [
        'cd client/android && gradlew.bat clean',
        'cd client/android && gradlew.bat assembleDebug'
    ];
    
    for (const command of buildCommands) {
        if (!runCommand(command, `Running: ${command}`)) {
            log('❌ Android build failed. Let me try alternative approach...', 'red');
            
            // Try alternative build method
            log('\n🔄 Trying alternative build method...', 'yellow');
            if (runCommand('cd client && npx react-native run-android --variant=debug', 'Building with React Native CLI')) {
                // Copy the generated APK
                const apkSource = 'client/android/app/build/outputs/apk/debug/app-debug.apk';
                const apkDest = 'releases/app-debug.apk';
                
                if (fs.existsSync(apkSource)) {
                    fs.copyFileSync(apkSource, apkDest);
                    const stats = fs.statSync(apkDest);
                    log(`✅ APK copied to releases: ${apkDest} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'green');
                    return true;
                }
            }
            return false;
        }
    }
    
    // Copy APK to releases directory
    const apkSource = 'client/android/app/build/outputs/apk/debug/app-debug.apk';
    const apkDest = 'releases/app-debug.apk';
    
    if (fs.existsSync(apkSource)) {
        fs.copyFileSync(apkSource, apkDest);
        const stats = fs.statSync(apkDest);
        log(`✅ APK copied to releases: ${apkDest} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'green');
        return true;
    } else {
        log('❌ APK file not found after build', 'red');
        return false;
    }
}

function buildIOS() {
    log('\n🍎 Building iOS App for phone installation...', 'blue');
    
    const iosSteps = [
        {
            command: 'cd client && npm install --legacy-peer-deps --force',
            description: 'Installing client dependencies'
        },
        {
            command: 'cd client/ios && pod install',
            description: 'Installing iOS dependencies'
        }
    ];
    
    for (const step of iosSteps) {
        if (!runCommand(step.command, step.description)) {
            log('⚠️ iOS setup step failed, but continuing...', 'yellow');
        }
    }
    
    log('\n📱 iOS Build Instructions:', 'yellow');
    log('To build iOS app for your iPhone:', 'yellow');
    log('1. Open Xcode', 'yellow');
    log('2. Open: client/ios/TaxiApp.xcworkspace', 'yellow');
    log('3. Select your iPhone as the target device', 'yellow');
    log('4. Click the Play button to build and install', 'yellow');
    log('5. Trust the developer certificate on your iPhone', 'yellow');
    
    return true;
}

function createInstallationGuide() {
    const guide = `# 📱 Mobile App Installation Guide

## 🤖 Android Installation

### Method 1: Direct APK Installation
1. **Download APK**: Get \`app-debug.apk\` from the releases folder
2. **Transfer to Phone**: 
   - Email the APK to yourself
   - Use USB cable to transfer
   - Use cloud storage (Google Drive, Dropbox)
3. **Enable Unknown Sources**:
   - Go to Settings → Security → Unknown Sources
   - Enable "Install from unknown sources"
4. **Install**:
   - Tap the APK file on your phone
   - Tap "Install"
   - Wait for installation to complete
5. **Open App**: Find "Taxi App" in your app drawer

### Method 2: USB Debugging (Advanced)
1. **Enable Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. **Enable USB Debugging**:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
3. **Connect Phone**: Connect via USB cable
4. **Install via ADB**:
   \`\`\`bash
   adb install releases/app-debug.apk
   \`\`\`

## 🍎 iOS Installation

### Method 1: Xcode Installation (Recommended)
1. **Open Xcode**: On your Mac
2. **Open Project**: Open \`client/ios/TaxiApp.xcworkspace\`
3. **Connect iPhone**: Via USB cable
4. **Select Device**: Choose your iPhone as target
5. **Build & Run**: Click the Play button
6. **Trust Developer**: 
   - Go to Settings → General → Device Management
   - Trust the developer certificate

### Method 2: TestFlight (If Available)
1. **Create IPA**: Build archive in Xcode
2. **Upload to App Store Connect**
3. **Add Testers**: Invite via TestFlight
4. **Install**: Testers receive email invitation

## 🚀 Using the Apps

### First Time Setup:
1. **Start Backend Server**: Run \`npm start\` on your computer
2. **Open App**: Launch the mobile app
3. **Register**: Create account as passenger or driver
4. **Login**: Use your credentials
5. **Start Using**: Request or accept rides!

### Features Available:
- ✅ User registration and login
- ✅ Ride requests with pickup/dropoff locations
- ✅ Driver dashboard to accept rides
- ✅ Real-time ride tracking
- ✅ Rating system
- ✅ Push notifications (when configured)

## 🔧 Troubleshooting

### Android Issues:
- **Installation fails**: Check "Unknown Sources" is enabled
- **App crashes**: Ensure backend server is running
- **No rides showing**: Check internet connection

### iOS Issues:
- **Build fails**: Check Xcode and iOS versions
- **Installation fails**: Trust developer certificate
- **App crashes**: Check backend server connection

## 📞 Support

- **Backend Server**: Must be running on your computer
- **Network**: Phone and computer must be on same network
- **Port**: Server runs on port 5000
- **URL**: http://localhost:5000 (or your computer's IP)

Enjoy your mobile taxi app! 🚗📱`;

    fs.writeFileSync('MOBILE_INSTALLATION.md', guide);
    log('✅ Created mobile installation guide: MOBILE_INSTALLATION.md', 'green');
}

function createDownloadPage() {
    const downloadPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Taxi App - Mobile Downloads</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
        .download-btn { display: inline-block; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 10px; margin: 10px; font-size: 1.2rem; }
        .download-btn:hover { background: #0056b3; }
        .download-btn.android { background: #3ddc84; color: #000; }
        .download-btn.ios { background: #000; }
        .download-btn.web { background: #6c757d; }
        .instructions { text-align: left; background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .status { padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; font-weight: bold; margin: 5px 0; }
        .status.ready { background: #d4edda; color: #155724; }
        .status.instructions { background: #fff3cd; color: #856404; }
    </style>
</head>
<body>
    <h1>🚗 Taxi App - Mobile Downloads</h1>
    <p>Download and install on your phone</p>
    
    <div>
        <a href="releases/app-debug.apk" class="download-btn android" download>📱 Download Android APK</a>
        <a href="web/index.html" class="download-btn web" target="_blank">🌐 Open Web App</a>
    </div>
    
    <div class="status instructions">🍎 iOS: See installation instructions below</div>
    
    <div class="instructions">
        <h3>📋 Installation Instructions</h3>
        
        <h4>🤖 Android:</h4>
        <ol>
            <li>Click "Download Android APK" above</li>
            <li>Transfer APK to your Android phone</li>
            <li>Enable "Install from unknown sources" in Settings</li>
            <li>Tap the APK file and install</li>
            <li>Open the app and start using!</li>
        </ol>
        
        <h4>🍎 iOS:</h4>
        <ol>
            <li>Open Xcode on your Mac</li>
            <li>Open: client/ios/TaxiApp.xcworkspace</li>
            <li>Connect your iPhone via USB</li>
            <li>Select your iPhone as target device</li>
            <li>Click Play button to build and install</li>
            <li>Trust developer certificate in iPhone Settings</li>
        </ol>
        
        <h4>🌐 Web Version:</h4>
        <ol>
            <li>Click "Open Web App" above</li>
            <li>Works on any device with a browser</li>
            <li>Add to home screen for app-like experience</li>
        </ol>
        
        <p><strong>Important:</strong> Make sure the backend server is running on your computer at <code>http://localhost:5000</code> before using the app.</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync('mobile-download.html', downloadPage);
    log('✅ Created mobile download page: mobile-download.html', 'green');
}

function main() {
    log('🚗 Mobile App Builder', 'bright');
    log('====================', 'bright');
    
    if (!checkPrerequisites()) {
        log('\n❌ Prerequisites check failed. Please install missing dependencies.', 'red');
        process.exit(1);
    }
    
    const args = process.argv.slice(2);
    const buildAndroidFlag = args.includes('--android') || args.includes('--all');
    const buildIOSFlag = args.includes('--ios') || args.includes('--all');
    
    if (!buildAndroidFlag && !buildIOSFlag) {
        log('\nUsage: node build-mobile-apps.js [--android] [--ios] [--all]', 'yellow');
        log('Examples:', 'yellow');
        log('  node build-mobile-apps.js --android    # Build Android only', 'yellow');
        log('  node build-mobile-apps.js --ios        # Build iOS only', 'yellow');
        log('  node build-mobile-apps.js --all        # Build both platforms', 'yellow');
        process.exit(1);
    }
    
    // Create releases directory
    createReleasesDirectory();
    
    let success = true;
    
    if (buildAndroidFlag) {
        success = buildAndroid() && success;
    }
    
    if (buildIOSFlag) {
        success = buildIOS() && success;
    }
    
    // Create installation guide and download page
    createInstallationGuide();
    createDownloadPage();
    
    if (success) {
        log('\n🎉 Mobile app build completed!', 'green');
        log('📁 Files created:', 'cyan');
        if (buildAndroidFlag) {
            log('   • Android APK: releases/app-debug.apk', 'cyan');
        }
        log('   • Installation Guide: MOBILE_INSTALLATION.md', 'cyan');
        log('   • Download Page: mobile-download.html', 'cyan');
        log('\n📱 Next steps:', 'yellow');
        log('   1. Transfer APK to your Android phone', 'yellow');
        log('   2. Enable "Install from unknown sources"', 'yellow');
        log('   3. Install and test the app', 'yellow');
        log('   4. For iOS: Use Xcode to build and install', 'yellow');
    } else {
        log('\n❌ Build completed with some errors.', 'red');
        log('📱 You can still use the web version: web/index.html', 'yellow');
    }
}

if (require.main === module) {
    main();
}

module.exports = { buildAndroid, buildIOS, createInstallationGuide };
