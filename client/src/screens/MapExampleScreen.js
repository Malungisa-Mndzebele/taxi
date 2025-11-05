import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { MapComponent } from '../components';

/**
 * Example Screen showing how to use the MapComponent with GPS
 * This demonstrates:
 * - Live GPS tracking
 * - Custom markers
 * - Location updates
 * - Route visualization
 */
export default function MapExampleScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [followUser, setFollowUser] = useState(true);
  const [nearbyLocations] = useState([
    {
      id: '1',
      latitude: 37.7849,
      longitude: -122.4194,
      title: 'Driver 1',
      description: 'Available',
      color: 'blue',
    },
    {
      id: '2',
      latitude: 37.7749,
      longitude: -122.4294,
      title: 'Driver 2',
      description: 'Available',
      color: 'green',
    },
  ]);

  const [route] = useState([
    { latitude: 37.7749, longitude: -122.4194 },
    { latitude: 37.7799, longitude: -122.4144 },
    { latitude: 37.7849, longitude: -122.4194 },
  ]);

  const handleLocationChange = (location) => {
    setUserLocation(location);
    console.log('📍 Location updated:', location);
    // Here you can send location to your backend
    // e.g., updateDriverLocation(location);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Component */}
      <View style={styles.mapContainer}>
        <MapComponent
          showUserLocation={true}
          followUserLocation={followUser}
          onLocationChange={handleLocationChange}
          markers={nearbyLocations}
          route={route}
        />

        {/* Floating controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFollowUser(!followUser)}
          >
            <Text style={styles.controlText}>
              {followUser ? '📍 Following' : '🔓 Free Move'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Info Card */}
      {userLocation && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>Current Location</Title>
            <Paragraph>
              📍 Lat: {userLocation.latitude.toFixed(6)}
            </Paragraph>
            <Paragraph>
              📍 Lng: {userLocation.longitude.toFixed(6)}
            </Paragraph>
            {userLocation.speed !== undefined && (
              <Paragraph>
                🚗 Speed: {(userLocation.speed * 3.6).toFixed(1)} km/h
              </Paragraph>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => alert('Request Ride')}
          style={styles.button}
        >
          Request Ride
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  controlsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
    gap: 10,
  },
  controlButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    margin: 16,
    elevation: 4,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    backgroundColor: '#000',
  },
});
