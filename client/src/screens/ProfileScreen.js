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
  Switch,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.user);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout }
      ]
    );
  };

  const handleChangePassword = () => {
    // Navigate to change password screen
    Alert.alert('Coming Soon', 'Change password feature will be available soon');
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await userAPI.deactivateAccount();
              logout();
            } catch (error) {
              console.error('Deactivate account error:', error);
              Alert.alert('Error', 'Failed to deactivate account');
            }
          }
        }
      ]
    );
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
          <Paragraph style={styles.role}>
            {user?.role === 'passenger' ? 'Passenger' : 'Driver'}
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Personal Information</Title>
          {isEditing ? (
            <>
              <TextInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Phone"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
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
                  onPress={handleSaveProfile}
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
                title="First Name"
                description={user?.firstName}
                left={props => <List.Icon {...props} icon="account" />}
              />
              <List.Item
                title="Last Name"
                description={user?.lastName}
                left={props => <List.Icon {...props} icon="account" />}
              />
              <List.Item
                title="Phone"
                description={user?.phone}
                left={props => <List.Icon {...props} icon="phone" />}
              />
              <List.Item
                title="Email"
                description={user?.email}
                left={props => <List.Icon {...props} icon="email" />}
              />
              <Button
                mode="outlined"
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Account Settings</Title>
          <List.Item
            title="Change Password"
            description="Update your password"
            left={props => <List.Icon {...props} icon="lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleChangePassword}
          />
          <Divider />
          <List.Item
            title="Ride History"
            description="View your ride history"
            left={props => <List.Icon {...props} icon="history" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('RideHistory')}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Danger Zone</Title>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.button, styles.logoutButton]}
            textColor="#F44336"
          >
            Logout
          </Button>
          <Button
            mode="outlined"
            onPress={handleDeactivateAccount}
            style={[styles.button, styles.deactivateButton]}
            textColor="#F44336"
          >
            Deactivate Account
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
  logoutButton: {
    borderColor: '#F44336',
    marginBottom: 10,
  },
  deactivateButton: {
    borderColor: '#F44336',
  },
});
