import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  FAB,
  Portal,
  Modal,
  TextInput,
  List,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { rideAPI, userAPI } from '../services/api';
import { RIDE_STATUS, COLORS, APP_CONFIG } from '../config';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user, updateLocation } = useAuth();
  const { emit, on, off } = useSocket();
  const mapRef = useRef(null);
  
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationText, setDestinationText] = useState('');

  useEffect(() => {
    requestLocationPermission();
    loadActiveRide();
    setupSocketListeners();
    
    return () => {
      // Cleanup socket listeners
      off('ride-accepted');
      off('driver-arrived');
      off('ride-started');
      off('ride-completed');
      off('ride-cancelled');
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Taxi App needs access to your location to find nearby drivers',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Location permission is required');
          return;
        }
      }

      getCurrentLocation();
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        
        setRegion(newRegion);
        setCurrentLocation({ latitude, longitude });
        setPickupLocation({ latitude, longitude });
        
        // Update user location on server
        updateLocation([longitude, latitude], 'Current Location');
        
        // Get nearby drivers
        getNearbyDrivers(latitude, longitude);
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Error', 'Unable to get your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const getNearbyDrivers = async (latitude, longitude) => {
    try {
      const response = await userAPI.getNearbyDrivers(latitude, longitude, APP_CONFIG.DEFAULT_RADIUS);
      setNearbyDrivers(response.data.drivers);
    } catch (error) {
      console.error('Get nearby drivers error:', error);
    }
  };

  const loadActiveRide = async () => {
    try {
      const response = await rideAPI.getActiveRides();
      if (response.data.rides.length > 0) {
        setActiveRide(response.data.rides[0]);
      }
    } catch (error) {
      console.error('Load active ride error:', error);
    }
  };

  const setupSocketListeners = () => {
    on('ride-accepted', (data) => {
      setActiveRide(prev => ({ ...prev, status: RIDE_STATUS.ACCEPTED, driver: data.driver }));
      Alert.alert('Ride Accepted', `Driver ${data.driver.firstName} is on the way!`);
    });

    on('driver-arrived', (data) => {
      setActiveRide(prev => ({ ...prev, status: RIDE_STATUS.ARRIVED }));
      Alert.alert('Driver Arrived', 'Your driver has arrived at the pickup location');
    });

    on('ride-started', (data) => {
      setActiveRide(prev => ({ ...prev, status: RIDE_STATUS.STARTED }));
    });

    on('ride-completed', (data) => {
      setActiveRide(null);
      Alert.alert('Ride Completed', `Total fare: $${data.fare.totalFare}`);
    });

    on('ride-cancelled', (data) => {
      setActiveRide(null);
      Alert.alert('Ride Cancelled', data.reason || 'Ride was cancelled');
    });
  };

  const handleMapPress = (event) => {
    if (!activeRide) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setDropoffLocation({ latitude, longitude });
      setShowDestinationModal(true);
    }
  };

  const requestRide = async () => {
    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Error', 'Please select pickup and dropoff locations');
      return;
    }

    setIsLoading(true);
    try {
      // Calculate distance and duration (simplified)
      const distance = calculateDistance(pickupLocation, dropoffLocation);
      const estimatedDuration = Math.round(distance * 2); // Rough estimate

      const rideData = {
        pickupLocation: {
          coordinates: [pickupLocation.longitude, pickupLocation.latitude],
          address: 'Pickup Location'
        },
        dropoffLocation: {
          coordinates: [dropoffLocation.longitude, dropoffLocation.latitude],
          address: destinationText || 'Dropoff Location'
        },
        distance,
        estimatedDuration,
        paymentMethod: 'card'
      };

      const response = await rideAPI.requestRide(rideData);
      setActiveRide(response.data.ride);
      setShowDestinationModal(false);
      
      Alert.alert('Ride Requested', 'Looking for nearby drivers...');
    } catch (error) {
      console.error('Request ride error:', error);
      Alert.alert('Error', 'Failed to request ride');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRide = async () => {
    if (!activeRide) return;

    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await rideAPI.cancelRide(activeRide._id, 'Cancelled by passenger');
              setActiveRide(null);
            } catch (error) {
              console.error('Cancel ride error:', error);
              Alert.alert('Error', 'Failed to cancel ride');
            }
          }
        }
      ]
    );
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const renderRideStatus = () => {
    if (!activeRide) return null;

    const getStatusText = () => {
      switch (activeRide.status) {
        case RIDE_STATUS.REQUESTED:
          return 'Looking for drivers...';
        case RIDE_STATUS.ACCEPTED:
          return 'Driver is on the way';
        case RIDE_STATUS.ARRIVED:
          return 'Driver has arrived';
        case RIDE_STATUS.STARTED:
          return 'Ride in progress';
        default:
          return 'Ride in progress';
      }
    };

    return (
      <Card style={styles.rideStatusCard}>
        <Card.Content>
          <Title>{getStatusText()}</Title>
          {activeRide.driver && (
            <Paragraph>
              Driver: {activeRide.driver.firstName} {activeRide.driver.lastName}
            </Paragraph>
          )}
          {activeRide.fare && (
            <Paragraph>Estimated fare: ${activeRide.fare.totalFare}</Paragraph>
          )}
          <Button
            mode="outlined"
            onPress={cancelRide}
            style={styles.cancelButton}
          >
            Cancel Ride
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}

        {/* Pickup location marker */}
        {pickupLocation && (
          <Marker
            coordinate={pickupLocation}
            title="Pickup Location"
            pinColor="green"
          />
        )}

        {/* Dropoff location marker */}
        {dropoffLocation && (
          <Marker
            coordinate={dropoffLocation}
            title="Dropoff Location"
            pinColor="red"
          />
        )}

        {/* Nearby drivers */}
        {nearbyDrivers.map((driver, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: driver.currentLocation.coordinates[1],
              longitude: driver.currentLocation.coordinates[0]
            }}
            title={`Driver ${driver.firstName}`}
            pinColor="orange"
          />
        ))}
      </MapView>

      {renderRideStatus()}

      <FAB
        style={styles.fab}
        icon="menu"
        onPress={() => navigation.openDrawer()}
      />

      <Portal>
        <Modal
          visible={showDestinationModal}
          onDismiss={() => setShowDestinationModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title>Set Destination</Title>
              <TextInput
                label="Destination"
                value={destinationText}
                onChangeText={setDestinationText}
                style={styles.input}
                mode="outlined"
              />
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowDestinationModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={requestRide}
                  disabled={isLoading}
                  style={styles.modalButton}
                >
                  {isLoading ? <ActivityIndicator color="#fff" /> : 'Request Ride'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  rideStatusCard: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    elevation: 4,
  },
  cancelButton: {
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});
