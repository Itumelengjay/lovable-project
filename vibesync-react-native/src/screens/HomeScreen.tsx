import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth, collection, addDoc, query, orderBy, onSnapshot } from '../../firebase';

type Post = {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
  type: string;
};

export function HomeScreen() {
  const navigation = useNavigation();
  const [feed, setFeed] = useState<Post[]>([]);
  const [vibeText, setVibeText] = useState('');

  useEffect(() => {
    const postsRef = collection(db, 'vibes');
    const q = query(postsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setFeed(data);
    });

    return unsubscribe;
  }, []);

  const handleSubmitVibe = async () => {
    if (!vibeText.trim()) return;

    try {
      const postsRef = collection(db, 'vibes');
      await addDoc(postsRef, {
        userId: auth.currentUser?.uid,
        text: vibeText,
        type: 'text',
        timestamp: new Date()
      });
      setVibeText('');
    } catch (error) {
      console.error('Error posting vibe:', error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Feed</Text>
      </View>
      
      <View className="p-4 border-b border-gray-200">
        <TextInput
          className="bg-gray-100 p-3 rounded-lg mb-2"
          placeholder="Share your vibe..."
          value={vibeText}
          onChangeText={setVibeText}
          multiline
        />
        <TouchableOpacity
          className="bg-black p-3 rounded-lg"
          onPress={handleSubmitVibe}
        >
          <Text className="text-white text-center font-semibold">Post Vibe</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1">
        {feed.map(post => (
          <TouchableOpacity 
            key={post.id}
            className="p-4 border-b border-gray-100"
            onPress={() => navigation.navigate('PostDetail' as never, { post } as never)}
          >
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 bg-gray-200 rounded-full mr-3" />
              <Text className="font-semibold">User</Text>
              <Text className="text-gray-500 ml-2">
                {new Date(post.timestamp).toLocaleDateString()}
              </Text>
            </View>
            
            <Text className="text-gray-800 mb-3">{post.text}</Text>
            
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-4">
                <Ionicons name="heart-outline" size={20} color="black" />
                <Text className="ml-1">0</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={20} color="black" />
                <Text className="ml-1">0</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
