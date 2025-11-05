# 🗺️ Maps & GPS Setup Guide

## Google Maps API Key Setup

### Step 1: Get Your Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (if you don't have one)
   - Click "Select a project" → "New Project"
   - Name it "Taxi App" → Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable these APIs:
     - **Maps SDK for Android**
     - **Maps SDK for iOS**
     - **Places API** (optional, for address autocomplete)
     - **Directions API** (optional, for routing)
     - **Distance Matrix API** (optional, for fare calculation)

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key (it looks like: `AIzaSy...`)

5. **Restrict Your API Key** (Recommended for production)
   - Click on your API key to edit it
   - Under "Application restrictions":
     - For Android: Select "Android apps" and add your package name (`com.taxiapp`) with SHA-1 fingerprint
     - For iOS: Select "iOS apps" and add your bundle identifier
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose the APIs you enabled above
   - Click "Save"

### Step 2: Add API Key to Android

**File:** `client/android/app/src/main/AndroidManifest.xml`

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"/>
```

### Step 3: Add API Key to iOS (if building for iOS)

**File:** `client/ios/TaxiApp/AppDelegate.mm`

Add this import at the top:
```objc
#import <GoogleMaps/GoogleMaps.h>
```

Add this line in the `didFinishLaunchingWithOptions` method:
```objc
[GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY_HERE"];
```

## GPS Permissions

### Android Permissions ✅ (Already configured)
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_NETWORK_STATE

### iOS Permissions ✅ (Already configured)
- NSLocationWhenInUseUsageDescription
- NSLocationAlwaysAndWhenInUseUsageDescription

## Testing GPS Functionality

### On Android Emulator

1. **Enable Location Services**
   - In emulator, go to Settings → Location → Turn ON

2. **Set Mock Location**
   - In Android Studio, click "..." (More) button in emulator toolbar
   - Go to "Location" tab
   - Enter coordinates or search for a location
   - Click "Send"

### On iOS Simulator

1. **Set Mock Location**
   - In Xcode, go to Debug → Location → Custom Location
   - Enter coordinates (e.g., 37.7749, -122.4194 for San Francisco)

### On Real Device

1. **Enable Location Services**
   - Android: Settings → Location → Turn ON
   - iOS: Settings → Privacy → Location Services → Turn ON

2. **Grant App Permissions**
   - When the app first requests location, tap "Allow"

## Using the Map Component

### Basic Usage

```javascript
import { MapComponent } from '../components';

function MyScreen() {
  const handleLocationChange = (location) => {
    console.log('New location:', location);
    // Update your backend or state
  };

  return (
    <MapComponent
      showUserLocation={true}
      followUserLocation={true}
      onLocationChange={handleLocationChange}
      markers={[
        {
          latitude: 37.7749,
          longitude: -122.4194,
          title: 'Pickup Location',
          description: 'Your ride starts here',
          color: 'green'
        }
      ]}
    />
  );
}
```

### Advanced Usage with Custom Markers

```javascript
import { MapComponent } from '../components';
import { View, Image } from 'react-native';

function DriverMap() {
  const [drivers, setDrivers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const driverMarkers = drivers.map(driver => ({
    latitude: driver.location.latitude,
    longitude: driver.location.longitude,
    title: driver.name,
    description: `Rating: ${driver.rating}`,
    customMarker: (
      <View>
        <Image source={require('./assets/car-icon.png')} />
      </View>
    )
  }));

  return (
    <MapComponent
      showUserLocation={true}
      followUserLocation={false}
      onLocationChange={setUserLocation}
      markers={driverMarkers}
      route={[
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.7849, longitude: -122.4094 },
      ]}
    />
  );
}
```

## Map Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialRegion` | Object | SF coords | Initial map region |
| `markers` | Array | `[]` | Array of marker objects |
| `showUserLocation` | Boolean | `true` | Show user's location |
| `followUserLocation` | Boolean | `true` | Auto-follow user |
| `onLocationChange` | Function | - | Called when location updates |
| `onRegionChange` | Function | - | Called when map region changes |
| `route` | Array | `[]` | Polyline coordinates |
| `style` | Object | - | Custom map styles |
| `children` | React Node | - | Custom overlays |

## Common Issues & Solutions

### Issue: Map shows gray screen
**Solution:** 
- Check that your API key is valid
- Ensure required APIs are enabled in Google Cloud Console
- Check internet connection

### Issue: "Location permission denied"
**Solution:**
- Go to device Settings → Apps → Taxi App → Permissions
- Enable Location permission

### Issue: Location not updating
**Solution:**
- Make sure GPS is enabled on device
- Check that app has location permissions
- Try restarting the app

### Issue: "Failed to load map" on Android
**Solution:**
- Run: `cd android && ./gradlew clean`
- Rebuild the app: `npm run android`

## Production Considerations

1. **Secure Your API Key**
   - Add application restrictions (package name/bundle ID)
   - Add API restrictions (only enable needed APIs)
   - Consider using Android/iOS key restrictions

2. **Optimize Location Updates**
   - Adjust `distanceFilter` based on your needs
   - Reduce update frequency when user is stationary
   - Stop location tracking when not needed

3. **Handle Battery Drain**
   - Use `WhenInUse` instead of `Always` permission
   - Stop tracking when app is in background (unless needed)
   - Reduce accuracy when high precision isn't needed

4. **Test Edge Cases**
   - No internet connection
   - Location services disabled
   - Permission denied
   - GPS signal lost

## Additional Resources

- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Google Maps Platform](https://developers.google.com/maps)
- [React Native Geolocation](https://github.com/react-native-geolocation/react-native-geolocation)

---

**Need help?** Open an issue or check the troubleshooting section above.
