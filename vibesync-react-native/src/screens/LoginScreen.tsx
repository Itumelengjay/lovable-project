import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup 
} from '../../firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (signupError) {
        Alert.alert('Error', signupError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Error', 'Google Sign-in is only available on web platform');
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-4xl font-bold mb-8">VibeSync</Text>
      <Text className="text-gray-600 text-center mb-8">Share your musical journey with the world</Text>

      <View className="w-full space-y-4">
        <TextInput
          className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-gray-50"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <TextInput
          className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-gray-50"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity
          className={`w-full h-12 rounded-lg items-center justify-center ${
            isLoading ? 'bg-gray-400' : 'bg-black'
          }`}
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold">
            {isLoading ? 'Please wait...' : 'Login / Register'}
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'web' && (
          <TouchableOpacity
            className="w-full h-12 border border-gray-300 rounded-lg items-center justify-center mt-4"
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Text className="font-semibold">Continue with Google</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text className="text-gray-500 mt-8 text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}
