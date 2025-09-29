import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  List,
  Chip,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { rideAPI } from '../services/api';
import { RIDE_STATUS, COLORS } from '../config';

export default function RideHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRideHistory();
  }, []);

  const loadRideHistory = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (pageNum === 1) {
        setIsLoading(true);
      }

      const response = await rideAPI.getRideHistory(pageNum, 10);
      const newRides = response.data.rides;

      if (pageNum === 1) {
        setRides(newRides);
      } else {
        setRides(prev => [...prev, ...newRides]);
      }

      setHasMore(newRides.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Load ride history error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadRideHistory(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadRideHistory(page + 1);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RIDE_STATUS.COMPLETED:
        return COLORS.SUCCESS;
      case RIDE_STATUS.CANCELLED:
        return COLORS.ERROR;
      default:
        return COLORS.GRAY;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case RIDE_STATUS.COMPLETED:
        return 'Completed';
      case RIDE_STATUS.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderRideItem = ({ item }) => {
    const otherParty = user.role === 'passenger' ? item.driver : item.passenger;
    
    return (
      <Card style={styles.rideCard} onPress={() => navigation.navigate('RideDetails', { rideId: item._id })}>
        <Card.Content>
          <View style={styles.rideHeader}>
            <View style={styles.rideInfo}>
              <Title style={styles.rideTitle}>
                {otherParty ? `${otherParty.firstName} ${otherParty.lastName}` : 'Unknown'}
              </Title>
              <Paragraph style={styles.rideDate}>
                {formatDate(item.timeline.completedAt || item.timeline.cancelledAt || item.createdAt)}
              </Paragraph>
            </View>
            <View style={styles.rideStatus}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusText}
              >
                {getStatusText(item.status)}
              </Chip>
              <Text style={styles.fareText}>${item.fare.totalFare}</Text>
            </View>
          </View>
          
          <View style={styles.rideDetails}>
            <Paragraph style={styles.locationText}>
              From: {item.pickupLocation.address}
            </Paragraph>
            <Paragraph style={styles.locationText}>
              To: {item.dropoffLocation.address}
            </Paragraph>
            <Paragraph style={styles.distanceText}>
              Distance: {item.distance.toFixed(2)} km
            </Paragraph>
          </View>

          {item.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Your Rating:</Text>
              <Text style={styles.ratingText}>
                {user.role === 'passenger' ? item.rating.driverRating : item.rating.passengerRating} ⭐
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No ride history found</Text>
      <Text style={styles.emptySubtext}>Your completed rides will appear here</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      </View>
    );
  };

  if (isLoading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading ride history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rides}
        keyExtractor={(item) => item._id}
        renderItem={renderRideItem}
        contentContainerStyle={rides.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
      />
    </View>
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
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.GRAY,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  rideCard: {
    marginBottom: 15,
    elevation: 2,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  rideInfo: {
    flex: 1,
  },
  rideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rideDate: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  rideStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  fareText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  rideDetails: {
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingLabel: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginRight: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});
