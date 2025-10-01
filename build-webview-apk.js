#!/usr/bin/env node

/**
 * Build a WebView APK using Capacitor (easier than Cordova)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Building Taxi App WebView APK\n');

// Check if Capacitor CLI is installed
function checkCapacitor() {
    try {
        execSync('npx cap --version', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

// Create Capacitor project
function createCapacitorProject() {
    console.log('📦 Creating Capacitor project...\n');
    
    const capacitorDir = 'taxi-capacitor';
    
    if (fs.existsSync(capacitorDir)) {
        console.log('⚠️  Removing existing capacitor directory...');
        fs.rmSync(capacitorDir, { recursive: true, force: true });
    }
    
    // Create directory
    fs.mkdirSync(capacitorDir);
    process.chdir(capacitorDir);
    
    // Initialize npm project
    console.log('📝 Initializing npm project...');
    const packageJson = {
        name: 'taxi-app',
        version: '1.0.0',
        description: 'Taxi App - Ride Sharing Application',
        main: 'index.html',
        scripts: {
            "build": "echo 'No build needed'",
        },
        dependencies: {
            "@capacitor/android": "^5.5.0",
            "@capacitor/core": "^5.5.0",
            "@capacitor/cli": "^5.5.0"
        }
    };
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    
    // Install Capacitor
    console.log('📥 Installing Capacitor...');
    try {
        execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Failed to install Capacitor');
        return false;
    }
    
    // Initialize Capacitor
    console.log('⚙️  Initializing Capacitor...');
    try {
        execSync('npx cap init "Taxi App" "com.taxiapp.mobile" --web-dir=www', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Failed to initialize Capacitor');
        return false;
    }
    
    // Copy web files
    console.log('📂 Copying web app files...');
    const wwwDir = 'www';
    if (!fs.existsSync(wwwDir)) {
        fs.mkdirSync(wwwDir);
    }
    
    // Copy all files from ../web to www
    const webDir = path.join('..', 'web');
    const files = fs.readdirSync(webDir);
    
    files.forEach(file => {
        const srcPath = path.join(webDir, file);
        const destPath = path.join(wwwDir, file);
        
        if (fs.statSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`   ✓ Copied ${file}`);
        }
    });
    
    // Add Android platform
    console.log('\n📱 Adding Android platform...');
    try {
        execSync('npx cap add android', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Failed to add Android platform');
        return false;
    }
    
    // Sync files
    console.log('🔄 Syncing files...');
    try {
        execSync('npx cap sync', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Failed to sync');
        return false;
    }
    
    return true;
}

// Build APK
function buildAPK() {
    console.log('\n🔨 Building APK...');
    
    try {
        process.chdir('android');
        execSync('./gradlew assembleDebug', { stdio: 'inherit' });
        
        const apkPath = 'app/build/outputs/apk/debug/app-debug.apk';
        if (fs.existsSync(apkPath)) {
            console.log('\n✅ APK built successfully!');
            
            // Copy to releases
            const releasesPath = path.join('..', '..', 'releases', 'TaxiApp.apk');
            fs.copyFileSync(apkPath, releasesPath);
            
            const stats = fs.statSync(releasesPath);
            console.log(`📦 APK saved to: releases/TaxiApp.apk`);
            console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            
            return true;
        } else {
            console.error('❌ APK file not found after build');
            return false;
        }
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        return false;
    }
}

// Main function
async function main() {
    console.log('Checking requirements...\n');
    
    // Save current directory
    const originalDir = process.cwd();
    
    try {
        if (!createCapacitorProject()) {
            console.error('\n❌ Failed to create Capacitor project');
            process.exit(1);
        }
        
        // Change back to android directory if not already there
        const capacitorDir = path.join(originalDir, 'taxi-capacitor');
        
        // Try to build
        process.chdir(capacitorDir);
        
        if (buildAPK()) {
            console.log('\n🎉 Success! Your APK is ready!');
            console.log('\n📱 To install on Android:');
            console.log('1. Transfer releases/TaxiApp.apk to your phone');
            console.log('2. Enable "Unknown sources" in Settings');
            console.log('3. Tap the APK to install');
            console.log('4. Open and enjoy!\n');
        } else {
            console.log('\n⚠️  Build failed, but you can still use PWA installation:');
            console.log('   Open web/index.html on Android and Add to Home Screen\n');
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n💡 Alternative: Use PWA Builder at https://www.pwabuilder.com/\n');
    } finally {
        // Change back to original directory
        process.chdir(originalDir);
    }
}

if (require.main === module) {
    main();
}

module.exports = { createCapacitorProject, buildAPK };

