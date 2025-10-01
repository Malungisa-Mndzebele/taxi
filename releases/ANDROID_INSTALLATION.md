# 📱 Android Installation Guide

## ✅ Recommended: Install as Progressive Web App (PWA)

The easiest and fastest way to use the Taxi App on Android is as a Progressive Web App.

### Step-by-Step Installation:

1. **Start the Backend Server**
   ```bash
   npm start
   ```

2. **Open the Web App**
   - On your Android phone, open Chrome browser
   - Navigate to: `file:///path/to/taxi/web/index.html`
   - OR if server is accessible: `http://your-computer-ip:5000`

3. **Install to Home Screen**
   - Tap the menu button (three dots) in Chrome
   - Select "Add to Home Screen"
   - Give it a name: "Taxi App"
   - Tap "Add"

4. **Launch the App**
   - Find "Taxi App" icon on your home screen
   - Tap to launch - it works just like a native app!
   - Full screen, no browser UI
   - Works offline (cached)

### ✨ Why PWA is Better:

- ✅ **Instant Installation** - No build required
- ✅ **Always Updated** - Get latest features immediately
- ✅ **Smaller Size** - No large APK download
- ✅ **Same Experience** - Works exactly like native app
- ✅ **No Permissions** - Installs without unknown sources
- ✅ **Cross-Platform** - Works on all devices

## 🔧 Alternative: Build Native APK

If you need a true native APK, follow these steps:

### Prerequisites:
- Android Studio installed
- Android SDK (API 34)
- Java JDK 11+
- Node.js 16+

### Build Steps:

1. **Fix Dependencies**
   ```bash
   cd client
   npm install --legacy-peer-deps
   ```

2. **Clean Previous Builds**
   ```bash
   cd android
   ./gradlew clean
   ```

3. **Build APK**
   ```bash
   ./gradlew assembleDebug
   ```

4. **Find APK**
   - Location: `client/android/app/build/outputs/apk/debug/app-debug.apk`
   - Transfer to your phone
   - Enable "Install from unknown sources"
   - Install and run

### Known Issues:
- React Native library namespace conflicts
- Requires Android Gradle Plugin 8.1.1
- Some dependencies need manual fixes

## 🌐 Web Version Features

The web/PWA version includes:
- ✅ User registration and login
- ✅ Ride requests
- ✅ Driver dashboard  
- ✅ Real-time updates
- ✅ Geolocation support
- ✅ Responsive design
- ✅ Offline capabilities
- ✅ Push notifications (when configured)

## 🚀 Getting Started

Once installed (PWA or APK):

1. **Register an Account**
   - Choose Passenger or Driver
   - Enter your details
   - Create password

2. **Login**
   - Use your credentials
   - Stay logged in

3. **For Passengers:**
   - Enter pickup location
   - Enter destination
   - Request ride
   - Wait for driver acceptance

4. **For Drivers:**
   - Go online
   - View available rides
   - Accept rides
   - Complete trips

## 📞 Troubleshooting

**App won't load:**
- Ensure backend server is running
- Check network connection
- Verify server URL in config

**Can't install PWA:**
- Use Chrome browser on Android
- Ensure HTTPS or localhost
- Check browser version (need modern Chrome)

**Features not working:**
- Clear browser cache
- Reinstall the PWA
- Check console for errors

## 💡 Tips

- **Internet Required**: App needs connection to server
- **Same Network**: Phone and server should be on same WiFi (or use ngrok for remote access)
- **Server URL**: Update API_BASE_URL in config if needed
- **Location Permissions**: Grant when requested for full functionality

Enjoy your Taxi App! 🚗📱

