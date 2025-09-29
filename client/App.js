import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import DriverHomeScreen from './src/screens/DriverHomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RideHistoryScreen from './src/screens/RideHistoryScreen';
import RideDetailsScreen from './src/screens/RideDetailsScreen';
import DriverProfileScreen from './src/screens/DriverProfileScreen';
import DriverStatsScreen from './src/screens/DriverStatsScreen';

// Import context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
        ) : user.role === 'passenger' ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Taxi App' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ title: 'Profile' }}
            />
            <Stack.Screen 
              name="RideHistory" 
              component={RideHistoryScreen} 
              options={{ title: 'Ride History' }}
            />
            <Stack.Screen 
              name="RideDetails" 
              component={RideDetailsScreen} 
              options={{ title: 'Ride Details' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="DriverHome" 
              component={DriverHomeScreen} 
              options={{ title: 'Driver Dashboard' }}
            />
            <Stack.Screen 
              name="DriverProfile" 
              component={DriverProfileScreen} 
              options={{ title: 'Driver Profile' }}
            />
            <Stack.Screen 
              name="DriverStats" 
              component={DriverStatsScreen} 
              options={{ title: 'Statistics' }}
            />
            <Stack.Screen 
              name="RideDetails" 
              component={RideDetailsScreen} 
              options={{ title: 'Ride Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <SocketProvider>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <AppNavigator />
        </SocketProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
