# 📱 How to Install Your Taxi App on Your Phone

## 🤖 Android Installation

### You now have: releases/taxi-app.apk

### Installation Steps:

1. **Transfer APK to your phone:**
   - Email it to yourself and download on phone
   - Use USB cable to copy to phone
   - Upload to Google Drive/Dropbox and download on phone

2. **Enable installation from unknown sources:**
   - Go to Settings → Security
   - Enable "Unknown Sources" or "Install unknown apps"
   - (On newer Android: Settings → Apps → Special access → Install unknown apps → Select your browser/file manager)

3. **Install the app:**
   - Locate the APK file on your phone
   - Tap on it
   - Tap "Install"
   - Wait for installation to complete

4. **Open the app:**
   - Find "Taxi App" in your app drawer
   - Tap to open
   - Register or login
   - Start using!

### Alternative: Install via USB

If you have USB debugging enabled:

```bash
# Connect phone via USB
# Run this command on your computer:
adb install releases/taxi-app.apk
```

## 🍎 iPhone Installation

### Option 1: Progressive Web App (Easiest)

1. **Start the server on your computer:**
   ```bash
   npm start
   ```

2. **Find your computer's IP address:**
   - Windows: Run `ipconfig` in Command Prompt
   - Look for "IPv4 Address" (e.g., 192.168.1.100)

3. **On your iPhone:**
   - Open Safari
   - Go to: `http://YOUR_IP:5000/web/`
   - Tap the Share button (square with arrow)
   - Tap "Add to Home Screen"
   - Tap "Add"

4. **Use the app:**
   - Find the app icon on your home screen
   - Works just like a native app!

### Option 2: Build with Xcode (Requires Mac)

1. **Open Xcode on your Mac**
2. **Open:** `client/ios/TaxiApp.xcworkspace`
3. **Connect iPhone via USB**
4. **Select your iPhone as target device**
5. **Click Play button to build and install**
6. **Trust developer certificate in iPhone Settings**

## 🌐 Web Version (Works on All Phones)

The easiest way to use on any phone:

1. **Start server:** `npm start`
2. **On your phone's browser:** Go to `http://YOUR_IP:5000/web/`
3. **Add to home screen** for app-like experience

## ⚙️ Important Setup

### Before using the app:

1. **Backend server must be running:**
   ```bash
   npm start
   ```

2. **Phone and computer must be on same WiFi network**

3. **Update API URL in app (if needed):**
   - The app needs to know your server's IP address
   - Default is `http://localhost:5000`
   - Change to your computer's IP: `http://192.168.1.100:5000`

## 🎯 Features Available

Once installed, you can:

- ✅ Register as passenger or driver
- ✅ Login to your account
- ✅ Request rides (passengers)
- ✅ Accept rides (drivers)
- ✅ Track rides in real-time
- ✅ Rate drivers/passengers
- ✅ View ride history
- ✅ Manage profile

## 🔧 Troubleshooting

### Android:
- **Can't install:** Make sure "Unknown Sources" is enabled
- **App crashes:** Check that backend server is running
- **Can't connect:** Verify server IP address and WiFi connection

### iPhone:
- **Can't add to home screen:** Make sure you're using Safari
- **App won't load:** Check server is running and IP is correct
- **Build fails in Xcode:** Make sure iOS development tools are installed

## 📞 Need Help?

Common issues:

1. **Server not running:** Run `npm start` on your computer
2. **Wrong IP address:** Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. **Firewall blocking:** Allow port 5000 in firewall settings
4. **Different WiFi networks:** Connect both devices to same network

Enjoy your mobile taxi app! 🚗📱
