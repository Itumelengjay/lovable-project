import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export function ProfileScreen() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const stats = {
    posts: 24,
    followers: 1250,
    following: 843
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-6">
          <View className="w-20 h-20 bg-gray-200 rounded-full" />
          <View className="flex-row flex-1 justify-around ml-4">
            <View className="items-center">
              <Text className="font-bold text-lg">{stats.posts}</Text>
              <Text className="text-gray-600">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="font-bold text-lg">{stats.followers}</Text>
              <Text className="text-gray-600">Followers</Text>
            </View>
            <View className="items-center">
              <Text className="font-bold text-lg">{stats.following}</Text>
              <Text className="text-gray-600">Following</Text>
            </View>
          </View>
        </View>

        <Text className="font-bold text-lg mb-1">Username</Text>
        <Text className="text-gray-600 mb-4">Music enthusiast | Vibing 24/7 🎵</Text>

        <TouchableOpacity 
          className="bg-gray-100 p-3 rounded-lg mb-4"
          onPress={() => {/* Edit Profile */}}
        >
          <Text className="text-center font-semibold">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-black p-3 rounded-lg mb-4"
          onPress={handleSignOut}
        >
          <Text className="text-center text-white font-semibold">Sign Out</Text>
        </TouchableOpacity>

        <View className="h-px bg-gray-200 my-4" />

        <Text className="font-bold text-lg mb-4">Recent Activity</Text>
        
        <ScrollView>
          {[1, 2, 3].map((item) => (
            <View key={item} className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-gray-200 rounded-full mr-3" />
              <View className="flex-1">
                <Text className="font-semibold">Shared a new track</Text>
                <Text className="text-gray-500">2 hours ago</Text>
              </View>
              <Ionicons name="musical-notes-outline" size={24} color="black" />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
