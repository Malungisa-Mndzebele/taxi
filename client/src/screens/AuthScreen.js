import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Switch,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../config';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.PASSENGER,
  });

  const { login, register } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!isLogin) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        Alert.alert('Error', 'Please fill in all required fields');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }

      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        const { confirmPassword, ...registerData } = formData;
        result = await register(registerData);
      }

      if (!result.success) {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Title style={styles.title}>Taxi App</Title>
          <Paragraph style={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {!isLogin && (
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
                  label="Phone Number"
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                />
              </>
            )}

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              style={styles.input}
              mode="outlined"
              secureTextEntry
            />

            {!isLogin && (
              <>
                <TextInput
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry
                />

                <View style={styles.roleContainer}>
                  <Text style={styles.roleLabel}>I want to be a:</Text>
                  <View style={styles.roleButtons}>
                    <Button
                      mode={formData.role === USER_ROLES.PASSENGER ? 'contained' : 'outlined'}
                      onPress={() => handleInputChange('role', USER_ROLES.PASSENGER)}
                      style={styles.roleButton}
                    >
                      Passenger
                    </Button>
                    <Button
                      mode={formData.role === USER_ROLES.DRIVER ? 'contained' : 'outlined'}
                      onPress={() => handleInputChange('role', USER_ROLES.DRIVER)}
                      style={styles.roleButton}
                    >
                      Driver
                    </Button>
                  </View>
                </View>
              </>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                isLogin ? 'Login' : 'Register'
              )}
            </Button>

            <Button
              mode="text"
              onPress={() => setIsLogin(!isLogin)}
              style={styles.switchButton}
            >
              {isLogin 
                ? "Don't have an account? Register" 
                : "Already have an account? Login"
              }
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    elevation: 4,
  },
  input: {
    marginBottom: 15,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 15,
    paddingVertical: 5,
  },
  switchButton: {
    marginTop: 10,
  },
});
