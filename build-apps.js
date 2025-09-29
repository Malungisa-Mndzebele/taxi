#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Taxi App - Building for iOS and Android...\n');

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

function checkPrerequisites() {
    log('\n🔍 Checking prerequisites...', 'yellow');
    
    const checks = [
        { name: 'Node.js', command: 'node --version' },
        { name: 'npm', command: 'npm --version' },
        { name: 'React Native CLI', command: 'npx react-native --version' }
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
    log('\n🤖 Building Android APK...', 'blue');
    
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
        },
        {
            command: 'cd client/android && ./gradlew bundleRelease',
            description: 'Building release AAB'
        }
    ];
    
    for (const step of androidSteps) {
        if (!runCommand(step.command, step.description)) {
            log('❌ Android build failed. Please check the errors above.', 'red');
            return false;
        }
    }
    
    // Check if files were created
    const apkPath = 'client/android/app/build/outputs/apk/release/app-release.apk';
    const aabPath = 'client/android/app/build/outputs/bundle/release/app-release.aab';
    
    if (fs.existsSync(apkPath)) {
        const stats = fs.statSync(apkPath);
        log(`✅ APK created: ${apkPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'green');
    }
    
    if (fs.existsSync(aabPath)) {
        const stats = fs.statSync(aabPath);
        log(`✅ AAB created: ${aabPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'green');
    }
    
    return true;
}

function buildIOS() {
    log('\n🍎 Building iOS App...', 'blue');
    
    const iosSteps = [
        {
            command: 'cd client && npm install',
            description: 'Installing client dependencies'
        },
        {
            command: 'cd client/ios && pod install',
            description: 'Installing iOS dependencies'
        },
        {
            command: 'cd client && npx react-native run-ios --configuration Release',
            description: 'Building iOS app'
        }
    ];
    
    for (const step of iosSteps) {
        if (!runCommand(step.command, step.description)) {
            log('❌ iOS build failed. Please check the errors above.', 'red');
            return false;
        }
    }
    
    return true;
}

function createDownloadLinks() {
    log('\n🔗 Creating download links...', 'yellow');
    
    const downloadPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Taxi App - Download</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .download-section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
        .download-btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .download-btn:hover { background: #0056b3; }
        .file-info { background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🚗 Taxi App - Download</h1>
    
    <div class="download-section">
        <h2>📱 Android App</h2>
        <div class="file-info">
            <strong>APK File:</strong> app-release.apk<br>
            <strong>Size:</strong> ${fs.existsSync('client/android/app/build/outputs/apk/release/app-release.apk') ? 
                (fs.statSync('client/android/app/build/outputs/apk/release/app-release.apk').size / 1024 / 1024).toFixed(2) + ' MB' : 'Not built'}
        </div>
        <a href="client/android/app/build/outputs/apk/release/app-release.apk" class="download-btn" download>Download APK</a>
        
        <div class="file-info">
            <strong>AAB File:</strong> app-release.aab<br>
            <strong>Size:</strong> ${fs.existsSync('client/android/app/build/outputs/bundle/release/app-release.aab') ? 
                (fs.statSync('client/android/app/build/outputs/bundle/release/app-release.aab').size / 1024 / 1024).toFixed(2) + ' MB' : 'Not built'}
        </div>
        <a href="client/android/app/build/outputs/bundle/release/app-release.aab" class="download-btn" download>Download AAB</a>
    </div>
    
    <div class="download-section">
        <h2>🍎 iOS App</h2>
        <div class="file-info">
            <strong>Status:</strong> ${fs.existsSync('client/ios/build') ? 'Built successfully' : 'Not built'}
        </div>
        <p>For iOS, you'll need to build using Xcode and create an IPA file for distribution.</p>
    </div>
    
    <div class="download-section">
        <h2>🌐 Web Version</h2>
        <a href="web/index.html" class="download-btn">Open Web App</a>
    </div>
    
    <div class="download-section">
        <h2>📋 Installation Instructions</h2>
        <h3>Android:</h3>
        <ol>
            <li>Download the APK file</li>
            <li>Enable "Install from unknown sources" in your device settings</li>
            <li>Install the APK file</li>
        </ol>
        
        <h3>iOS:</h3>
        <ol>
            <li>Build the app using Xcode</li>
            <li>Install via Xcode or TestFlight</li>
        </ol>
    </div>
</body>
</html>`;
    
    fs.writeFileSync('download.html', downloadPage);
    log('✅ Download page created: download.html', 'green');
}

function main() {
    log('🚗 Taxi App Builder', 'bright');
    log('==================', 'bright');
    
    if (!checkPrerequisites()) {
        log('\n❌ Prerequisites check failed. Please install missing dependencies.', 'red');
        process.exit(1);
    }
    
    const args = process.argv.slice(2);
    const buildAndroidFlag = args.includes('--android') || args.includes('--all');
    const buildIOSFlag = args.includes('--ios') || args.includes('--all');
    
    if (!buildAndroidFlag && !buildIOSFlag) {
        log('\nUsage: node build-apps.js [--android] [--ios] [--all]', 'yellow');
        log('Examples:', 'yellow');
        log('  node build-apps.js --android    # Build Android only', 'yellow');
        log('  node build-apps.js --ios        # Build iOS only', 'yellow');
        log('  node build-apps.js --all        # Build both platforms', 'yellow');
        process.exit(1);
    }
    
    let success = true;
    
    if (buildAndroidFlag) {
        success = buildAndroid() && success;
    }
    
    if (buildIOSFlag) {
        success = buildIOS() && success;
    }
    
    createDownloadLinks();
    
    if (success) {
        log('\n🎉 Build completed successfully!', 'green');
        log('📁 Check the following locations for your app files:', 'cyan');
        log('   • Android APK: client/android/app/build/outputs/apk/release/app-release.apk', 'cyan');
        log('   • Android AAB: client/android/app/build/outputs/bundle/release/app-release.aab', 'cyan');
        log('   • iOS Build: client/ios/build/', 'cyan');
        log('   • Download Page: download.html', 'cyan');
    } else {
        log('\n❌ Build completed with errors. Please check the output above.', 'red');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { buildAndroid, buildIOS, createDownloadLinks };
