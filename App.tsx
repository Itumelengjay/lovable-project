import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config - replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyAdAxbKXCnYMY_mtTeclJYMIP-JM20wEYw",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const Tab = createBottomTabNavigator();

function HomeScreen() {
  return (
    <View style={styles.center}>
      <Text>Home Screen - Vibe Text Post, Feed, Media Feed</Text>
    </View>
  );
}

function DiscoverScreen() {
  return (
    <View style={styles.center}>
      <Text>Discover Screen - YouTube Trending, Search</Text>
    </View>
  );
}

function SyncScreen() {
  return (
    <View style={styles.center}>
      <Text>Sync Screen - Real-time media sync and chat</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.center}>
      <Text>Profile Screen - User info, Vibe Score, Marketplace</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
          let iconName: "home" | "home-outline" | "search" | "search-outline" | "sync" | "sync-outline" | "person" | "person-outline" = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Sync') {
            iconName = focused ? 'sync' : 'sync-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Discover" component={DiscoverScreen} />
        <Tab.Screen name="Sync" component={SyncScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
