import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  ActivityIndicator,
  Text,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { rideAPI } from '../services/api';
import { RIDE_STATUS, COLORS } from '../config';

export default function RideDetailsScreen({ route, navigation }) {
  const { user } = useAuth();
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRideDetails();
  }, [rideId]);

  const loadRideDetails = async () => {
    try {
      const response = await rideAPI.getRideDetails(rideId);
      setRide(response.data.ride);
    } catch (error) {
      console.error('Load ride details error:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RIDE_STATUS.COMPLETED:
        return COLORS.SUCCESS;
      case RIDE_STATUS.CANCELLED:
        return COLORS.ERROR;
      case RIDE_STATUS.REQUESTED:
        return COLORS.WARNING;
      case RIDE_STATUS.ACCEPTED:
        return COLORS.INFO;
      case RIDE_STATUS.ARRIVED:
        return COLORS.INFO;
      case RIDE_STATUS.STARTED:
        return COLORS.PRIMARY;
      default:
        return COLORS.GRAY;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case RIDE_STATUS.REQUESTED:
        return 'Requested';
      case RIDE_STATUS.ACCEPTED:
        return 'Accepted';
      case RIDE_STATUS.ARRIVED:
        return 'Driver Arrived';
      case RIDE_STATUS.STARTED:
        return 'In Progress';
      case RIDE_STATUS.COMPLETED:
        return 'Completed';
      case RIDE_STATUS.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end - start) / 60000); // minutes
    return `${duration} minutes`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ride not found</Text>
      </View>
    );
  }

  const otherParty = user.role === 'passenger' ? ride.driver : ride.passenger;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>Ride Details</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(ride.status) }]}
              textStyle={styles.statusText}
            >
              {getStatusText(ride.status)}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ride Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Ride ID:</Text>
              <Text style={styles.value}>{ride._id.slice(-8)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Distance:</Text>
              <Text style={styles.value}>{ride.distance.toFixed(2)} km</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>
                {formatDuration(ride.timeline.startedAt, ride.timeline.completedAt)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Total Fare:</Text>
              <Text style={[styles.value, styles.fareValue]}>${ride.fare.totalFare}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {user.role === 'passenger' ? 'Driver Information' : 'Passenger Information'}
            </Text>
            {otherParty ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.value}>
                    {otherParty.firstName} {otherParty.lastName}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{otherParty.phone}</Text>
                </View>
                {user.role === 'passenger' && otherParty.driverProfile && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Vehicle:</Text>
                    <Text style={styles.value}>
                      {otherParty.driverProfile.vehicleInfo?.make} {otherParty.driverProfile.vehicleInfo?.model}
                    </Text>
                  </View>
                )}
                {otherParty.rating && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Rating:</Text>
                    <Text style={styles.value}>
                      {otherParty.rating.toFixed(1)} ⭐
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.noInfo}>No information available</Text>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Pickup:</Text>
              <Text style={styles.locationText}>{ride.pickupLocation.address}</Text>
            </View>
            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Dropoff:</Text>
              <Text style={styles.locationText}>{ride.dropoffLocation.address}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timelineContainer}>
              <View style={styles.timelineItem}>
                <Text style={styles.timelineLabel}>Requested:</Text>
                <Text style={styles.timelineValue}>{formatDate(ride.timeline.requestedAt)}</Text>
              </View>
              {ride.timeline.acceptedAt && (
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Accepted:</Text>
                  <Text style={styles.timelineValue}>{formatDate(ride.timeline.acceptedAt)}</Text>
                </View>
              )}
              {ride.timeline.arrivedAt && (
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Arrived:</Text>
                  <Text style={styles.timelineValue}>{formatDate(ride.timeline.arrivedAt)}</Text>
                </View>
              )}
              {ride.timeline.startedAt && (
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Started:</Text>
                  <Text style={styles.timelineValue}>{formatDate(ride.timeline.startedAt)}</Text>
                </View>
              )}
              {ride.timeline.completedAt && (
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Completed:</Text>
                  <Text style={styles.timelineValue}>{formatDate(ride.timeline.completedAt)}</Text>
                </View>
              )}
              {ride.timeline.cancelledAt && (
                <View style={styles.timelineItem}>
                  <Text style={styles.timelineLabel}>Cancelled:</Text>
                  <Text style={styles.timelineValue}>{formatDate(ride.timeline.cancelledAt)}</Text>
                </View>
              )}
            </View>
          </View>

          {ride.cancellationReason && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cancellation Reason</Text>
                <Text style={styles.cancellationReason}>{ride.cancellationReason}</Text>
              </View>
            </>
          )}

          {ride.rating && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rating & Review</Text>
                {ride.rating.passengerRating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingLabel}>Passenger Rating:</Text>
                    <Text style={styles.ratingValue}>{ride.rating.passengerRating} ⭐</Text>
                  </View>
                )}
                {ride.rating.driverRating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingLabel}>Driver Rating:</Text>
                    <Text style={styles.ratingValue}>{ride.rating.driverRating} ⭐</Text>
                  </View>
                )}
                {ride.rating.passengerReview && (
                  <View style={styles.reviewContainer}>
                    <Text style={styles.reviewLabel}>Passenger Review:</Text>
                    <Text style={styles.reviewText}>{ride.rating.passengerReview}</Text>
                  </View>
                )}
                {ride.rating.driverReview && (
                  <View style={styles.reviewContainer}>
                    <Text style={styles.reviewLabel}>Driver Review:</Text>
                    <Text style={styles.reviewText}>{ride.rating.driverReview}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.GRAY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: COLORS.ERROR,
  },
  card: {
    margin: 20,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusChip: {
    paddingHorizontal: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 15,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.PRIMARY,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.GRAY,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  fareValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  noInfo: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontStyle: 'italic',
  },
  locationContainer: {
    marginBottom: 10,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
  },
  timelineContainer: {
    marginTop: 5,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timelineLabel: {
    fontSize: 14,
    color: COLORS.GRAY,
    flex: 1,
  },
  timelineValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  cancellationReason: {
    fontSize: 14,
    color: COLORS.ERROR,
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  ratingLabel: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  reviewContainer: {
    marginTop: 10,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    fontStyle: 'italic',
  },
});
