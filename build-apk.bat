@echo off
echo Building Taxi App APK...

cd client\android

echo Cleaning previous builds...
call gradlew.bat clean

echo Building debug APK...
call gradlew.bat assembleDebug

if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo APK built successfully!
    copy app\build\outputs\apk\debug\app-debug.apk ..\..\releases\TaxiApp-debug.apk
    echo APK copied to releases\TaxiApp-debug.apk
) else (
    echo Build failed!
    exit /b 1
)
