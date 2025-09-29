#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Building Taxi App (Simple Version)...\n');

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

function createReleasesDirectory() {
    const releaseDir = 'releases';
    if (!fs.existsSync(releaseDir)) {
        fs.mkdirSync(releaseDir);
        log(`📁 Created releases directory`, 'green');
    }
    return releaseDir;
}

function buildAndroidSimple() {
    log('\n🤖 Building Android APK (Simple Method)...', 'blue');
    
    const androidSteps = [
        {
            command: 'cd client && npm install --legacy-peer-deps',
            description: 'Installing client dependencies (with legacy peer deps)'
        },
        {
            command: 'cd client/android && gradlew.bat clean',
            description: 'Cleaning Android build'
        },
        {
            command: 'cd client/android && gradlew.bat assembleRelease',
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

function createSimpleDownloadPage() {
    const downloadPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Taxi App - Download</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
        .download-btn { display: inline-block; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 10px; margin: 10px; font-size: 1.2rem; }
        .download-btn:hover { background: #0056b3; }
        .download-btn.android { background: #3ddc84; color: #000; }
        .download-btn.ios { background: #000; }
        .download-btn.web { background: #6c757d; }
        .instructions { text-align: left; background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🚗 Taxi App</h1>
    <p>Download and install on your device</p>
    
    <div>
        <a href="releases/app-release.apk" class="download-btn android" download>📱 Download Android APK</a>
        <a href="web/index.html" class="download-btn web" target="_blank">🌐 Open Web App</a>
    </div>
    
    <div class="instructions">
        <h3>📋 Installation Instructions</h3>
        <h4>Android:</h4>
        <ol>
            <li>Click "Download Android APK" above</li>
            <li>When download completes, tap the APK file</li>
            <li>Enable "Install from unknown sources" if prompted</li>
            <li>Tap "Install" and wait for completion</li>
            <li>Open the app and start using it!</li>
        </ol>
        
        <h4>Web Version:</h4>
        <ol>
            <li>Click "Open Web App" above</li>
            <li>No installation required - works in any browser</li>
            <li>For mobile: Add to home screen for app-like experience</li>
        </ol>
        
        <p><strong>Important:</strong> Make sure the backend server is running on your computer at <code>http://localhost:5000</code> before using the app.</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync('download.html', downloadPage);
    log('✅ Created simple download page: download.html', 'green');
}

function main() {
    log('🚗 Taxi App Simple Builder', 'bright');
    log('==========================', 'bright');
    
    // Create releases directory
    createReleasesDirectory();
    
    // Build Android
    const success = buildAndroidSimple();
    
    // Create download page
    createSimpleDownloadPage();
    
    if (success) {
        log('\n🎉 Build completed successfully!', 'green');
        log('📁 Files created:', 'cyan');
        log('   • Android APK: releases/app-release.apk', 'cyan');
        log('   • Download Page: download.html', 'cyan');
        log('\n📤 Next steps:', 'yellow');
        log('   1. Test the APK by installing it on an Android device', 'yellow');
        log('   2. Open download.html in your browser to test downloads', 'yellow');
        log('   3. Upload the APK to GitHub Releases for public access', 'yellow');
    } else {
        log('\n❌ Build completed with errors.', 'red');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { buildAndroidSimple, createSimpleDownloadPage };
