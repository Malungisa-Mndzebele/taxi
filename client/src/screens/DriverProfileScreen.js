import React, { useState } from 'react';
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
  TextInput,
  Avatar,
  List,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { driverAPI } from '../services/api';

export default function DriverProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: user?.driverProfile?.licenseNumber || '',
    vehicleInfo: {
      make: user?.driverProfile?.vehicleInfo?.make || '',
      model: user?.driverProfile?.vehicleInfo?.model || '',
      year: user?.driverProfile?.vehicleInfo?.year || '',
      color: user?.driverProfile?.vehicleInfo?.color || '',
      plateNumber: user?.driverProfile?.vehicleInfo?.plateNumber || '',
    },
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await driverAPI.updateProfile(formData);
      updateUser(response.data.user);
      setIsEditing(false);
      Alert.alert('Success', 'Driver profile updated successfully');
    } catch (error) {
      console.error('Update driver profile error:', error);
      Alert.alert('Error', 'Failed to update driver profile');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.licenseNumber) {
      Alert.alert('Error', 'License number is required');
      return false;
    }
    if (!formData.vehicleInfo.make || !formData.vehicleInfo.model) {
      Alert.alert('Error', 'Vehicle make and model are required');
      return false;
    }
    if (!formData.vehicleInfo.year) {
      Alert.alert('Error', 'Vehicle year is required');
      return false;
    }
    if (!formData.vehicleInfo.plateNumber) {
      Alert.alert('Error', 'License plate number is required');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      handleSaveProfile();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
            style={styles.avatar}
          />
          <Title style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Title>
          <Paragraph style={styles.email}>{user?.email}</Paragraph>
          <Paragraph style={styles.role}>Driver</Paragraph>
          
          {user?.driverProfile?.rating && (
            <View style={styles.ratingContainer}>
              <Paragraph style={styles.rating}>
                ⭐ {user.driverProfile.rating.toFixed(1)} ({user.driverProfile.totalRides} rides)
              </Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Driver Information</Title>
          {isEditing ? (
            <>
              <TextInput
                label="License Number"
                value={formData.licenseNumber}
                onChangeText={(text) => handleInputChange('licenseNumber', text)}
                style={styles.input}
                mode="outlined"
                placeholder="Enter your license number"
              />
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditing(false)}
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  disabled={isLoading}
                  style={styles.button}
                >
                  Save
                </Button>
              </View>
            </>
          ) : (
            <>
              <List.Item
                title="License Number"
                description={user?.driverProfile?.licenseNumber || 'Not provided'}
                left={props => <List.Icon {...props} icon="card-account-details" />}
              />
              <Button
                mode="outlined"
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                Edit Driver Info
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Vehicle Information</Title>
          {isEditing ? (
            <>
              <TextInput
                label="Make"
                value={formData.vehicleInfo.make}
                onChangeText={(text) => handleInputChange('vehicleInfo.make', text)}
                style={styles.input}
                mode="outlined"
                placeholder="e.g., Toyota"
              />
              <TextInput
                label="Model"
                value={formData.vehicleInfo.model}
                onChangeText={(text) => handleInputChange('vehicleInfo.model', text)}
                style={styles.input}
                mode="outlined"
                placeholder="e.g., Camry"
              />
              <TextInput
                label="Year"
                value={formData.vehicleInfo.year.toString()}
                onChangeText={(text) => handleInputChange('vehicleInfo.year', parseInt(text) || '')}
                style={styles.input}
                mode="outlined"
                placeholder="e.g., 2020"
                keyboardType="numeric"
              />
              <TextInput
                label="Color"
                value={formData.vehicleInfo.color}
                onChangeText={(text) => handleInputChange('vehicleInfo.color', text)}
                style={styles.input}
                mode="outlined"
                placeholder="e.g., White"
              />
              <TextInput
                label="License Plate"
                value={formData.vehicleInfo.plateNumber}
                onChangeText={(text) => handleInputChange('vehicleInfo.plateNumber', text)}
                style={styles.input}
                mode="outlined"
                placeholder="e.g., ABC-123"
              />
            </>
          ) : (
            <>
              <List.Item
                title="Make"
                description={user?.driverProfile?.vehicleInfo?.make || 'Not provided'}
                left={props => <List.Icon {...props} icon="car" />}
              />
              <List.Item
                title="Model"
                description={user?.driverProfile?.vehicleInfo?.model || 'Not provided'}
                left={props => <List.Icon {...props} icon="car" />}
              />
              <List.Item
                title="Year"
                description={user?.driverProfile?.vehicleInfo?.year?.toString() || 'Not provided'}
                left={props => <List.Icon {...props} icon="calendar" />}
              />
              <List.Item
                title="Color"
                description={user?.driverProfile?.vehicleInfo?.color || 'Not provided'}
                left={props => <List.Icon {...props} icon="palette" />}
              />
              <List.Item
                title="License Plate"
                description={user?.driverProfile?.vehicleInfo?.plateNumber || 'Not provided'}
                left={props => <List.Icon {...props} icon="card-account-details" />}
              />
              <Button
                mode="outlined"
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                Edit Vehicle Info
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Driver Statistics</Title>
          <List.Item
            title="Total Rides"
            description={user?.driverProfile?.totalRides?.toString() || '0'}
            left={props => <List.Icon {...props} icon="car" />}
          />
          <List.Item
            title="Rating"
            description={user?.driverProfile?.rating?.toFixed(1) || '0.0'} ⭐
            left={props => <List.Icon {...props} icon="star" />}
          />
          <List.Item
            title="Status"
            description={user?.driverProfile?.isOnline ? 'Online' : 'Offline'}
            left={props => <List.Icon {...props} icon="circle" />}
          />
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('DriverStats')}
            style={styles.editButton}
          >
            View Detailed Stats
          </Button>
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
  profileCard: {
    margin: 20,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#000',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  role: {
    fontSize: 14,
    color: '#999',
    textTransform: 'capitalize',
  },
  ratingContainer: {
    marginTop: 10,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  card: {
    margin: 20,
    marginTop: 0,
    elevation: 4,
  },
  input: {
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    marginTop: 15,
  },
});
