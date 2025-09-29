import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
  List,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { driverAPI } from '../services/api';
import { COLORS } from '../config';

export default function DriverStatsScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [statsResponse, earningsResponse] = await Promise.all([
        driverAPI.getStats(),
        driverAPI.getEarnings(1, 10)
      ]);

      setStats(statsResponse.data.stats);
      setEarnings(earningsResponse.data.rides);
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadStats(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Today's Performance</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.todayRides}</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${stats.todayEarnings.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderOverallStats = () => {
    if (!stats) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Overall Statistics</Title>
          <List.Item
            title="Total Rides"
            description={stats.totalRides.toString()}
            left={props => <List.Icon {...props} icon="car" color={COLORS.PRIMARY} />}
          />
          <List.Item
            title="Total Earnings"
            description={`$${stats.totalEarnings.toFixed(2)}`}
            left={props => <List.Icon {...props} icon="currency-usd" color={COLORS.SUCCESS} />}
          />
          <List.Item
            title="Average Rating"
            description={`${stats.rating.toFixed(1)} ⭐`}
            left={props => <List.Icon {...props} icon="star" color={COLORS.SECONDARY} />}
          />
          <List.Item
            title="Status"
            description={stats.isOnline ? 'Online' : 'Offline'}
            left={props => (
              <List.Icon 
                {...props} 
                icon="circle" 
                color={stats.isOnline ? COLORS.SUCCESS : COLORS.ERROR} 
              />
            )}
          />
          <List.Item
            title="Availability"
            description={stats.isAvailable ? 'Available' : 'Busy'}
            left={props => (
              <List.Icon 
                {...props} 
                icon="circle" 
                color={stats.isAvailable ? COLORS.SUCCESS : COLORS.WARNING} 
              />
            )}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderEarningsHistory = () => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Recent Earnings</Title>
          {earnings.length === 0 ? (
            <Text style={styles.noEarnings}>No earnings history found</Text>
          ) : (
            earnings.map((ride, index) => (
              <View key={index}>
                <List.Item
                  title={`${ride.passenger.firstName} ${ride.passenger.lastName}`}
                  description={formatDate(ride.timeline.completedAt)}
                  right={() => (
                    <Text style={styles.earningsAmount}>
                      ${ride.fare.totalFare}
                    </Text>
                  )}
                  left={props => <List.Icon {...props} icon="car" color={COLORS.PRIMARY} />}
                />
                {index < earnings.length - 1 && <Divider />}
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.PRIMARY]}
        />
      }
    >
      {renderStatsCard()}
      {renderOverallStats()}
      {renderEarningsHistory()}
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
  statsCard: {
    margin: 20,
    elevation: 4,
    backgroundColor: COLORS.PRIMARY,
  },
  cardTitle: {
    color: '#fff',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  card: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
  },
  noEarnings: {
    textAlign: 'center',
    color: COLORS.GRAY,
    fontStyle: 'italic',
    marginVertical: 20,
  },
  earningsAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
  },
});
