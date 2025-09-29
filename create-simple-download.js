#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚗 Creating Simple Download System...\n');

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

function createReleasesDirectory() {
    const releaseDir = 'releases';
    if (!fs.existsSync(releaseDir)) {
        fs.mkdirSync(releaseDir);
        log(`📁 Created releases directory`, 'green');
    }
    return releaseDir;
}

function createDownloadPage() {
    const downloadPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Taxi App - Download & Use</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 700px;
            width: 100%;
            text-align: center;
        }
        
        .logo {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5rem;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 40px;
            font-size: 1.2rem;
        }
        
        .main-option {
            background: #e3f2fd;
            border: 2px solid #2196f3;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
        }
        
        .main-option h2 {
            color: #1976d2;
            margin-bottom: 15px;
        }
        
        .main-option p {
            color: #555;
            margin-bottom: 20px;
        }
        
        .download-btn {
            background: #2196f3;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            margin: 10px;
        }
        
        .download-btn:hover {
            background: #1976d2;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(33,150,243,0.3);
        }
        
        .download-btn.web {
            background: #4caf50;
        }
        
        .download-btn.web:hover {
            background: #45a049;
        }
        
        .alternative-options {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
        }
        
        .alternative-options h3 {
            color: #333;
            margin-bottom: 15px;
        }
        
        .option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .option-info {
            display: flex;
            align-items: center;
        }
        
        .option-icon {
            font-size: 1.5rem;
            margin-right: 10px;
        }
        
        .option-name {
            font-weight: bold;
            color: #333;
        }
        
        .option-desc {
            color: #666;
            font-size: 0.9rem;
        }
        
        .status {
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .status.available {
            background: #d4edda;
            color: #155724;
        }
        
        .status.coming-soon {
            background: #fff3cd;
            color: #856404;
        }
        
        .instructions {
            margin-top: 30px;
            text-align: left;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
        }
        
        .instructions h3 {
            color: #333;
            margin-bottom: 15px;
        }
        
        .instructions ol {
            margin-left: 20px;
        }
        
        .instructions li {
            margin: 8px 0;
            color: #555;
        }
        
        .instructions code {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
        
        .server-info {
            margin-top: 20px;
            padding: 15px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            color: #856404;
        }
        
        .server-info strong {
            color: #533f03;
        }
        
        .features {
            margin-top: 30px;
            text-align: left;
        }
        
        .features h3 {
            color: #333;
            margin-bottom: 15px;
        }
        
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .feature {
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .feature-icon {
            font-size: 1.5rem;
            margin-bottom: 10px;
        }
        
        .feature-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .feature-desc {
            color: #666;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚗</div>
        <h1>Taxi App</h1>
        <p class="subtitle">Your ride-sharing solution is ready!</p>
        
        <div class="main-option">
            <h2>🌐 Web App (Recommended)</h2>
            <p>No installation required - works on any device with a browser!</p>
            <a href="web/index.html" class="download-btn web" target="_blank">🚀 Open Web App</a>
        </div>
        
        <div class="alternative-options">
            <h3>📱 Alternative Options</h3>
            
            <div class="option">
                <div class="option-info">
                    <div class="option-icon">🤖</div>
                    <div>
                        <div class="option-name">Android App</div>
                        <div class="option-desc">Native Android APK</div>
                    </div>
                </div>
                <div>
                    <div class="status coming-soon">Coming Soon</div>
                </div>
            </div>
            
            <div class="option">
                <div class="option-info">
                    <div class="option-icon">🍎</div>
                    <div>
                        <div class="option-name">iOS App</div>
                        <div class="option-desc">Native iOS IPA</div>
                    </div>
                </div>
                <div>
                    <div class="status coming-soon">Coming Soon</div>
                </div>
            </div>
        </div>
        
        <div class="features">
            <h3>✨ Features</h3>
            <div class="feature-list">
                <div class="feature">
                    <div class="feature-icon">👤</div>
                    <div class="feature-title">User Registration</div>
                    <div class="feature-desc">Create accounts for passengers and drivers</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚖</div>
                    <div class="feature-title">Ride Requests</div>
                    <div class="feature-desc">Request rides with pickup and dropoff locations</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <div class="feature-title">Real-time Updates</div>
                    <div class="feature-desc">Live ride tracking and status updates</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">⭐</div>
                    <div class="feature-title">Rating System</div>
                    <div class="feature-desc">Rate drivers and passengers after rides</div>
                </div>
            </div>
        </div>
        
        <div class="instructions">
            <h3>📋 Quick Start Guide</h3>
            
            <h4>🌐 Using the Web App:</h4>
            <ol>
                <li>Click "Open Web App" above</li>
                <li>Register as a passenger or driver</li>
                <li>Login with your credentials</li>
                <li>Start requesting or accepting rides!</li>
            </ol>
            
            <h4>📱 For Mobile Users:</h4>
            <ol>
                <li>Open the web app on your phone</li>
                <li>Add to home screen for app-like experience</li>
                <li>Use it just like a native app</li>
            </ol>
        </div>
        
        <div class="server-info">
            <strong>⚠️ Important:</strong> Make sure the backend server is running on your computer at <code>http://localhost:5000</code> before using the app. Start it with: <code>npm start</code>
        </div>
    </div>
    
    <script>
        // Auto-detect if user is on mobile and show appropriate message
        function detectMobile() {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                const mainOption = document.querySelector('.main-option');
                mainOption.innerHTML = \`
                    <h2>📱 Mobile Web App</h2>
                    <p>Perfect for mobile devices - works like a native app!</p>
                    <a href="web/index.html" class="download-btn web" target="_blank">🚀 Open Mobile App</a>
                    <p style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                        💡 Tip: Add to home screen for the best experience
                    </p>
                \`;
            }
        }
        
        // Track usage
        function trackUsage(action) {
            console.log(\`User action: \${action}\`);
            // You can add analytics tracking here
        }
        
        // Add click handlers
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                trackUsage('web_app_opened');
            });
        });
        
        // Initialize
        window.onload = detectMobile;
    </script>
</body>
</html>`;
    
    fs.writeFileSync('download.html', downloadPage);
    log('✅ Created enhanced download page: download.html', 'green');
}

function createSimpleInstructions() {
    const instructions = `# 🚗 Taxi App - Simple Setup Guide

## For Users (Super Easy!)

### Option 1: Web App (Recommended)
1. **Start the server**: Run \`npm start\` in your terminal
2. **Open the app**: Go to \`download.html\` in your browser
3. **Click "Open Web App"**: No installation needed!
4. **Register & Login**: Create your account
5. **Start using**: Request rides or accept them as a driver

### Option 2: Direct Web Access
- **URL**: \`web/index.html\`
- **Works on**: Any device with a browser
- **Mobile**: Add to home screen for app-like experience

## Features Available
- ✅ User registration and login
- ✅ Ride requests with pickup/dropoff locations
- ✅ Driver dashboard to accept rides
- ✅ Real-time ride tracking
- ✅ Rating system
- ✅ Cross-platform (works on all devices)

## No Installation Required!
The web version provides the full app experience without any downloads or installations. It works on:
- 📱 Mobile phones (Android & iOS)
- 💻 Desktop computers
- 📟 Tablets
- 🌐 Any device with a web browser

## Perfect User Experience
1. Visit your repository
2. Read the README
3. Click the web app link
4. Start using immediately!

## For Developers
- **Backend**: Node.js/Express server
- **Frontend**: HTML/JavaScript web interface
- **Database**: MongoDB
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT tokens

## Support
- **Web App**: Always available, no setup needed
- **Mobile Apps**: Coming soon (Android APK & iOS IPA)
- **Documentation**: Check README.md for detailed setup

Enjoy your ride! 🚗✨`;

    fs.writeFileSync('SIMPLE_SETUP.md', instructions);
    log('✅ Created simple setup guide: SIMPLE_SETUP.md', 'green');
}

function createReleasesReadme() {
    const releasesReadme = `# 🚗 Taxi App - Release Files

## Current Release: v1.0.0

### Available Downloads

#### 🌐 Web App (Ready Now!)
- **File**: \`web/index.html\`
- **Access**: Open in any web browser
- **Installation**: No installation required
- **Platforms**: All devices with browsers

#### 📱 Mobile Apps (Coming Soon)
- **Android APK**: \`app-release.apk\` (In development)
- **iOS IPA**: \`TaxiApp.ipa\` (In development)

## Quick Start

1. **Start Backend Server**:
   \`\`\`bash
   npm start
   \`\`\`

2. **Open Web App**:
   - Go to \`download.html\` in your browser
   - Click "Open Web App"
   - Register and start using!

## Features

- ✅ User registration and authentication
- ✅ Real-time ride requests and acceptance
- ✅ Driver and passenger dashboards
- ✅ Live ride tracking
- ✅ Cross-platform web interface
- ✅ Real-time communication

## Installation Instructions

### Web App
1. No installation required
2. Works in any modern web browser
3. For mobile: Add to home screen for app-like experience

### Mobile Apps (When Available)
1. Download the appropriate file for your device
2. Follow platform-specific installation instructions
3. Trust developer certificate if required

## Support

- **Documentation**: Check README.md
- **Issues**: Create an issue in the repository
- **Web Version**: Always available as fallback

## Release Notes

### v1.0.0
- Initial release with web interface
- Full ride-sharing functionality
- Real-time communication
- Cross-platform compatibility
- Mobile-optimized web interface

Enjoy your ride! 🚗✨`;

    fs.writeFileSync('releases/README.md', releasesReadme);
    log('✅ Created releases README: releases/README.md', 'green');
}

function main() {
    log('🚗 Creating Simple Download System', 'bright');
    log('==================================', 'bright');
    
    // Create releases directory
    createReleasesDirectory();
    
    // Create download page
    createDownloadPage();
    
    // Create simple instructions
    createSimpleInstructions();
    
    // Create releases readme
    createReleasesReadme();
    
    log('\n🎉 Simple download system created successfully!', 'green');
    log('📁 Files created:', 'cyan');
    log('   • Download Page: download.html', 'cyan');
    log('   • Setup Guide: SIMPLE_SETUP.md', 'cyan');
    log('   • Releases README: releases/README.md', 'cyan');
    log('\n📤 Next steps:', 'yellow');
    log('   1. Open download.html in your browser to test', 'yellow');
    log('   2. Update README.md with the web app link', 'yellow');
    log('   3. Share the download.html link with users', 'yellow');
    log('\n🌐 Perfect user experience:', 'green');
    log('   • Users visit your repository', 'green');
    log('   • Click the web app link', 'green');
    log('   • Start using immediately - no installation!', 'green');
}

if (require.main === module) {
    main();
}

module.exports = { createDownloadPage, createSimpleInstructions, createReleasesReadme };
