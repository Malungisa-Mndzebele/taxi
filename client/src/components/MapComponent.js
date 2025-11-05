import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Platform, Alert, PermissionsAndroid } from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const MapComponent = ({
  initialRegion,
  markers = [],
  showUserLocation = true,
  followUserLocation = true,
  onLocationChange,
  onRegionChange,
  route = [],
  children,
  style,
}) => {
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const watchId = useRef(null);

  useEffect(() => {
    checkAndRequestLocationPermission();
    
    return () => {
      // Cleanup location watch on unmount
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hasLocationPermission && showUserLocation) {
      startLocationTracking();
    }
  }, [hasLocationPermission, showUserLocation]);

  const checkAndRequestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        setHasLocationPermission(auth === 'granted');
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location for maps and navigation',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const startLocationTracking = () => {
    // Get initial position
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };
        setCurrentLocation(location);
        
        if (onLocationChange) {
          onLocationChange(location);
        }

        // Center map on user location if following is enabled
        if (followUserLocation && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      },
      (error) => {
        console.error('Get location error:', error);
        Alert.alert('Location Error', 'Unable to get your current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    // Watch position for real-time updates
    watchId.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        const location = { 
          latitude, 
          longitude,
          speed,
          heading,
        };
        setCurrentLocation(location);
        
        if (onLocationChange) {
          onLocationChange(location);
        }

        // Optionally follow user as they move
        if (followUserLocation && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      },
      (error) => {
        console.error('Watch location error:', error);
      },
      { 
        enableHighAccuracy: true, 
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 2000, // Fastest update interval
      }
    );
  };

  const centerOnUserLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={[styles.map, style]}
      initialRegion={initialRegion || {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation={showUserLocation && hasLocationPermission}
      showsMyLocationButton={true}
      showsCompass={true}
      showsTraffic={false}
      loadingEnabled={true}
      onRegionChangeComplete={onRegionChange}
    >
      {/* User's current location marker with custom styling */}
      {currentLocation && showUserLocation && (
        <Circle
          center={currentLocation}
          radius={50}
          strokeColor="rgba(0, 122, 255, 0.5)"
          fillColor="rgba(0, 122, 255, 0.2)"
        />
      )}

      {/* Custom markers */}
      {markers.map((marker, index) => (
        <Marker
          key={marker.id || index}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          description={marker.description}
          pinColor={marker.color || 'red'}
        >
          {marker.customMarker}
        </Marker>
      ))}

      {/* Draw route/polyline if provided */}
      {route.length > 0 && (
        <Polyline
          coordinates={route}
          strokeColor="#007AFF"
          strokeWidth={4}
          lineDashPattern={[1]}
        />
      )}

      {children}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default MapComponent;
