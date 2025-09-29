@echo off
REM Taxi App Build Script for Windows
echo 🚗 Building Taxi App for Windows...

REM Navigate to client directory
cd client

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build for Android (Windows can build Android)
echo 🤖 Building for Android...
cd android
gradlew.bat assembleRelease
cd ..

REM Build for Web (PWA)
echo 🌐 Building for Web...
npm run build

echo ✅ Build completed!
echo 📁 APK file location: client\android\app\build\outputs\apk\release\app-release.apk
echo 📁 Web build location: client\web\build\
echo 📱 Install APK on Android device using ADB
echo 🌐 Deploy web build to any web server
