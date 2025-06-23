import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, DocumentData } from 'firebase/firestore';
import { db } from '../../App';

interface Vibe {
  id: string;
  text: string;
  username: string;
  createdAt: any;
  likes: number;
  comments: number;
  shares: number;
  userId: string;
}

export default function HomeScreen() {
  const [vibeText, setVibeText] = useState<string>('');
  const [vibes, setVibes] = useState<Vibe[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'vibes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const vibesData: Vibe[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        vibesData.push({ id: doc.id, text: data.text, username: data.username, createdAt: data.createdAt, likes: data.likes, comments: data.comments, shares: data.shares, userId: data.userId });
      });
      setVibes(vibesData);
    });
    return () => unsubscribe();
  }, []);

  const postVibe = async () => {
    if (vibeText.trim().length === 0) return;
    await addDoc(collection(db, 'vibes'), {
      text: vibeText,
      createdAt: serverTimestamp(),
      likes: 0,
      comments: 0,
      shares: 0,
      userId: 'user_123', // Replace with auth user id
      username: 'Roger', // Replace with auth username
    });
    setVibeText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's your vibe today?"
        value={vibeText}
        onChangeText={setVibeText}
        multiline
        maxLength={280}
      />
      <Button title="Post" onPress={postVibe} disabled={vibeText.trim().length === 0} />
      <FlatList
        data={vibes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Vibe }) => (
          <View style={styles.vibeItem}>
            <Text style={styles.username}>{item.username}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
        style={styles.vibeList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  vibeList: { marginTop: 16 },
  vibeItem: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
