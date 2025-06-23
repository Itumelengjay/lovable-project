import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';

type PostDetailParams = {
  PostDetail: {
    post: {
      id: string;
      user: string;
      content: string;
      likes: number;
      comments: number;
    };
  };
};

type Props = {
  route: RouteProp<PostDetailParams, 'PostDetail'>;
};

export function PostDetailScreen({ route }: Props) {
  const { post } = route.params;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 bg-gray-200 rounded-full mr-3" />
          <View>
            <Text className="font-semibold text-lg">{post.user}</Text>
            <Text className="text-gray-500">2 hours ago</Text>
          </View>
        </View>

        <Text className="text-lg mb-4">{post.content}</Text>

        <View className="flex-row items-center mb-4">
          <View className="flex-row items-center mr-6">
            <Ionicons name="heart-outline" size={24} color="black" />
            <Text className="ml-2">{post.likes}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={24} color="black" />
            <Text className="ml-2">{post.comments}</Text>
          </View>
        </View>

        <View className="h-px bg-gray-200 my-4" />

        <Text className="font-semibold mb-4">Comments</Text>
        
        {/* Sample comments */}
        <View className="space-y-4">
          <View className="flex-row">
            <View className="w-8 h-8 bg-gray-200 rounded-full mr-3" />
            <View className="flex-1">
              <Text className="font-semibold">User1</Text>
              <Text className="text-gray-800">Great vibes! 🎵</Text>
            </View>
          </View>
          <View className="flex-row">
            <View className="w-8 h-8 bg-gray-200 rounded-full mr-3" />
            <View className="flex-1">
              <Text className="font-semibold">User2</Text>
              <Text className="text-gray-800">Love this track!</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
