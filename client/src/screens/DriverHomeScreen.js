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
  List,
  Switch,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { driverAPI, rideAPI } from '../services/api';
import { RIDE_STATUS, COLORS, APP_CONFIG } from '../config';

const { width, height } = Dimensions.get('window');

export default function DriverHomeScreen({ navigation }) {
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
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    requestLocationPermission();
    loadDriverStats();
    setupSocketListeners();
    
    return () => {
      // Cleanup socket listeners
      off('new-ride-request');
      off('ride-status-changed');
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Taxi App needs access to your location to receive ride requests',
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
        
        // Update user location on server
        updateLocation([longitude, latitude], 'Current Location');
        
        // Emit location to socket for real-time tracking
        if (isOnline) {
          emit('driver-location', {
            driverId: user.id,
            location: { latitude, longitude }
          });
        }
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Error', 'Unable to get your location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const loadDriverStats = async () => {
    try {
      const response = await driverAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Load driver stats error:', error);
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
    on('new-ride-request', (data) => {
      setRideRequests(prev => [data, ...prev]);
      if (isAvailable) {
        setShowRequestsModal(true);
      }
    });

    on('ride-status-changed', (data) => {
      if (data.rideId === activeRide?._id) {
        setActiveRide(prev => ({ ...prev, status: data.status }));
      }
    });
  };

  const toggleOnlineStatus = async () => {
    const newOnlineStatus = !isOnline;
    setIsLoading(true);
    
    try {
      await driverAPI.updateStatus(newOnlineStatus, newOnlineStatus ? false : isAvailable);
      setIsOnline(newOnlineStatus);
      
      if (!newOnlineStatus) {
        setIsAvailable(false);
      }
      
      if (newOnlineStatus) {
        getCurrentLocation();
        loadRideRequests();
      }
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailableStatus = async () => {
    if (!isOnline) return;
    
    const newAvailableStatus = !isAvailable;
    setIsLoading(true);
    
    try {
      await driverAPI.updateStatus(isOnline, newAvailableStatus);
      setIsAvailable(newAvailableStatus);
      
      if (newAvailableStatus) {
        loadRideRequests();
      } else {
        setRideRequests([]);
      }
    } catch (error) {
      console.error('Update availability error:', error);
      Alert.alert('Error', 'Failed to update availability');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRideRequests = async () => {
    if (!currentLocation) return;
    
    try {
      const response = await driverAPI.getRideRequests(
        currentLocation.latitude,
        currentLocation.longitude,
        APP_CONFIG.DEFAULT_RADIUS
      );
      setRideRequests(response.data.rideRequests);
    } catch (error) {
      console.error('Load ride requests error:', error);
    }
  };

  const acceptRide = async (rideId) => {
    setIsLoading(true);
    try {
      const response = await rideAPI.acceptRide(rideId);
      setActiveRide(response.data.ride);
      setRideRequests(prev => prev.filter(ride => ride.rideId !== rideId));
      setShowRequestsModal(false);
      setIsAvailable(false);
      
      Alert.alert('Ride Accepted', 'Navigate to pickup location');
    } catch (error) {
      console.error('Accept ride error:', error);
      Alert.alert('Error', 'Failed to accept ride');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRideStatus = async (status) => {
    if (!activeRide) return;
    
    setIsLoading(true);
    try {
      let response;
      switch (status) {
        case RIDE_STATUS.ARRIVED:
          response = await rideAPI.arrive(activeRide._id);
          break;
        case RIDE_STATUS.STARTED:
          response = await rideAPI.startRide(activeRide._id);
          break;
        case RIDE_STATUS.COMPLETED:
          response = await rideAPI.completeRide(activeRide._id);
          setActiveRide(null);
          setIsAvailable(true);
          loadDriverStats();
          break;
      }
      
      if (response) {
        setActiveRide(response.data.ride);
      }
    } catch (error) {
      console.error('Update ride status error:', error);
      Alert.alert('Error', 'Failed to update ride status');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusCard = () => {
    return (
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Paragraph>Online</Paragraph>
              <Switch
                value={isOnline}
                onValueChange={toggleOnlineStatus}
                disabled={isLoading}
              />
            </View>
            <View style={styles.statusItem}>
              <Paragraph>Available</Paragraph>
              <Switch
                value={isAvailable}
                onValueChange={toggleAvailableStatus}
                disabled={!isOnline || isLoading}
              />
            </View>
          </View>
          
          {stats && (
            <View style={styles.statsRow}>
              <Chip icon="car" style={styles.statChip}>
                {stats.totalRides} rides
              </Chip>
              <Chip icon="star" style={styles.statChip}>
                {stats.rating.toFixed(1)}★
              </Chip>
              <Chip icon="currency-usd" style={styles.statChip}>
                ${stats.todayEarnings.toFixed(2)}
              </Chip>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderActiveRide = () => {
    if (!activeRide) return null;

    const getStatusText = () => {
      switch (activeRide.status) {
        case RIDE_STATUS.ACCEPTED:
          return 'Go to pickup location';
        case RIDE_STATUS.ARRIVED:
          return 'Passenger boarding';
        case RIDE_STATUS.STARTED:
          return 'Ride in progress';
        default:
          return 'Ride in progress';
      }
    };

    const getActionButton = () => {
      switch (activeRide.status) {
        case RIDE_STATUS.ACCEPTED:
          return (
            <Button
              mode="contained"
              onPress={() => updateRideStatus(RIDE_STATUS.ARRIVED)}
              disabled={isLoading}
            >
              Mark as Arrived
            </Button>
          );
        case RIDE_STATUS.ARRIVED:
          return (
            <Button
              mode="contained"
              onPress={() => updateRideStatus(RIDE_STATUS.STARTED)}
              disabled={isLoading}
            >
              Start Ride
            </Button>
          );
        case RIDE_STATUS.STARTED:
          return (
            <Button
              mode="contained"
              onPress={() => updateRideStatus(RIDE_STATUS.COMPLETED)}
              disabled={isLoading}
            >
              Complete Ride
            </Button>
          );
        default:
          return null;
      }
    };

    return (
      <Card style={styles.activeRideCard}>
        <Card.Content>
          <Title>{getStatusText()}</Title>
          <Paragraph>
            Passenger: {activeRide.passenger.firstName} {activeRide.passenger.lastName}
          </Paragraph>
          <Paragraph>
            Phone: {activeRide.passenger.phone}
          </Paragraph>
          <Paragraph>
            Fare: ${activeRide.fare.totalFare}
          </Paragraph>
          {getActionButton()}
        </Card.Content>
      </Card>
    );
  };

  const renderRideRequests = () => {
    if (rideRequests.length === 0) return null;

    return (
      <Portal>
        <Modal
          visible={showRequestsModal}
          onDismiss={() => setShowRequestsModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title>New Ride Requests</Title>
              {rideRequests.map((request, index) => (
                <Card key={index} style={styles.requestCard}>
                  <Card.Content>
                    <Paragraph>
                      From: {request.passenger.firstName} {request.passenger.lastName}
                    </Paragraph>
                    <Paragraph>
                      Fare: ${request.fare.totalFare}
                    </Paragraph>
                    <View style={styles.requestButtons}>
                      <Button
                        mode="outlined"
                        onPress={() => setShowRequestsModal(false)}
                        style={styles.requestButton}
                      >
                        Decline
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => acceptRide(request.rideId)}
                        disabled={isLoading}
                        style={styles.requestButton}
                      >
                        Accept
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
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

        {/* Active ride pickup/dropoff markers */}
        {activeRide && (
          <>
            <Marker
              coordinate={{
                latitude: activeRide.pickupLocation.coordinates[1],
                longitude: activeRide.pickupLocation.coordinates[0]
              }}
              title="Pickup Location"
              pinColor="green"
            />
            <Marker
              coordinate={{
                latitude: activeRide.dropoffLocation.coordinates[1],
                longitude: activeRide.dropoffLocation.coordinates[0]
              }}
              title="Dropoff Location"
              pinColor="red"
            />
          </>
        )}
      </MapView>

      {renderStatusCard()}
      {renderActiveRide()}
      {renderRideRequests()}

      <FAB
        style={styles.fab}
        icon="menu"
        onPress={() => navigation.openDrawer()}
      />
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
  statusCard: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statChip: {
    marginHorizontal: 2,
  },
  activeRideCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    elevation: 4,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  requestCard: {
    marginVertical: 5,
    elevation: 2,
  },
  requestButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  requestButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
