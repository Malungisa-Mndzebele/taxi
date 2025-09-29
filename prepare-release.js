#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Preparing Taxi App for Release...\n');

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

function runCommand(command, description) {
    try {
        log(`\n${colors.cyan}${description}...${colors.reset}`);
        execSync(command, { stdio: 'inherit', cwd: process.cwd() });
        log(`✅ ${description} completed successfully!`, 'green');
        return true;
    } catch (error) {
        log(`❌ ${description} failed: ${error.message}`, 'red');
        return false;
    }
}

function createReleaseDirectory() {
    const releaseDir = 'releases';
    if (!fs.existsSync(releaseDir)) {
        fs.mkdirSync(releaseDir);
        log(`📁 Created releases directory`, 'green');
    }
    return releaseDir;
}

function buildAndroid() {
    log('\n🤖 Building Android APK for release...', 'blue');
    
    const androidSteps = [
        {
            command: 'cd client && npm install',
            description: 'Installing client dependencies'
        },
        {
            command: 'cd client/android && ./gradlew clean',
            description: 'Cleaning Android build'
        },
        {
            command: 'cd client/android && ./gradlew assembleRelease',
            description: 'Building release APK'
        }
    ];
    
    for (const step of androidSteps) {
        if (!runCommand(step.command, step.description)) {
            log('❌ Android build failed. Please check the errors above.', 'red');
            return false;
        }
    }
    
    // Copy APK to releases directory
    const apkSource = 'client/android/app/build/outputs/apk/release/app-release.apk';
    const apkDest = 'releases/app-release.apk';
    
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
    log('\n🍎 Building iOS App for release...', 'blue');
    
    const iosSteps = [
        {
            command: 'cd client && npm install',
            description: 'Installing client dependencies'
        },
        {
            command: 'cd client/ios && pod install',
            description: 'Installing iOS dependencies'
        }
    ];
    
    for (const step of iosSteps) {
        if (!runCommand(step.command, step.description)) {
            log('❌ iOS setup failed. Please check the errors above.', 'red');
            return false;
        }
    }
    
    log('📝 iOS build requires Xcode. Please run the following commands manually:', 'yellow');
    log('   cd client/ios', 'yellow');
    log('   xcodebuild -workspace TaxiApp.xcworkspace -scheme TaxiApp -configuration Release -archivePath TaxiApp.xcarchive archive', 'yellow');
    log('   xcodebuild -exportArchive -archivePath TaxiApp.xcarchive -exportPath ./build -exportOptionsPlist ExportOptions.plist', 'yellow');
    log('   Then copy TaxiApp.ipa to the releases directory', 'yellow');
    
    return true;
}

function createExportOptions() {
    const exportOptions = {
        method: "development",
        teamID: "YOUR_TEAM_ID",
        compileBitcode: false,
        uploadBitcode: false,
        uploadSymbols: true,
        provisioningProfiles: {
            "com.taxiapp": "YOUR_PROVISIONING_PROFILE"
        }
    };
    
    const exportPath = 'client/ios/ExportOptions.plist';
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>compileBitcode</key>
    <false/>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>`;
    
    fs.writeFileSync(exportPath, plistContent);
    log(`✅ Created ExportOptions.plist at ${exportPath}`, 'green');
}

function createReleaseNotes() {
    const releaseNotes = `# 🚗 Taxi App Release

## 📱 Downloads

### Android
- **APK File**: app-release.apk
- **Installation**: Download and install directly on Android devices
- **Requirements**: Enable "Install from unknown sources"

### iOS  
- **IPA File**: TaxiApp.ipa
- **Installation**: Download and install via Xcode or TestFlight
- **Requirements**: Trust developer certificate in device settings

### Web
- **URL**: https://malungisa-mndzebele.github.io/taxi/web/
- **Installation**: No installation required - works in any browser

## 🚀 Quick Start

1. **Start Backend Server**:
   \`\`\`bash
   npm start
   \`\`\`

2. **Download App**: Click the appropriate download link above

3. **Install**: Follow the installation instructions for your platform

4. **Login**: Open the app and create an account or login

5. **Start Using**: Request rides as a passenger or accept rides as a driver

## 📋 Features

- ✅ User registration and authentication
- ✅ Real-time ride requests and acceptance  
- ✅ Driver and passenger dashboards
- ✅ Live ride tracking
- ✅ Cross-platform support (iOS, Android, Web)
- ✅ Real-time communication

## 🆘 Support

- **Documentation**: Check the README.md file
- **Issues**: Create an issue in the repository
- **Web Version**: Use the web interface if mobile apps don't work

Enjoy your ride! 🚗✨`;

    fs.writeFileSync('releases/RELEASE_NOTES.md', releaseNotes);
    log('✅ Created release notes', 'green');
}

function main() {
    log('🚗 Taxi App Release Preparation', 'bright');
    log('================================', 'bright');
    
    const args = process.argv.slice(2);
    const buildAndroidFlag = args.includes('--android') || args.includes('--all');
    const buildIOSFlag = args.includes('--ios') || args.includes('--all');
    
    if (!buildAndroidFlag && !buildIOSFlag) {
        log('\nUsage: node prepare-release.js [--android] [--ios] [--all]', 'yellow');
        log('Examples:', 'yellow');
        log('  node prepare-release.js --android    # Build Android only', 'yellow');
        log('  node prepare-release.js --ios        # Build iOS only', 'yellow');
        log('  node prepare-release.js --all        # Build both platforms', 'yellow');
        process.exit(1);
    }
    
    // Create releases directory
    createReleaseDirectory();
    
    let success = true;
    
    if (buildAndroidFlag) {
        success = buildAndroid() && success;
    }
    
    if (buildIOSFlag) {
        createExportOptions();
        success = buildIOS() && success;
    }
    
    createReleaseNotes();
    
    if (success) {
        log('\n🎉 Release preparation completed!', 'green');
        log('📁 Check the releases directory for your app files:', 'cyan');
        log('   • Android APK: releases/app-release.apk', 'cyan');
        log('   • iOS IPA: releases/TaxiApp.ipa (after manual build)', 'cyan');
        log('   • Release Notes: releases/RELEASE_NOTES.md', 'cyan');
        log('\n📤 Next steps:', 'yellow');
        log('   1. Create a GitHub release with tag v1.0.0', 'yellow');
        log('   2. Upload the APK and IPA files to the release', 'yellow');
        log('   3. Update the download links in README.md', 'yellow');
    } else {
        log('\n❌ Release preparation completed with errors.', 'red');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { buildAndroid, buildIOS, createReleaseNotes };
