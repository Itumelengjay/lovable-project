import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';

interface Vibe {
  id: string;
  userId: string;
  text: string;
  createdAt: any;
  username?: string;
}

export function HomeFeed() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [newVibe, setNewVibe] = useState('');

  const postVibe = async () => {
    if (!newVibe.trim()) return;
    if (!auth.currentUser) return;
    await addDoc(collection(db, 'vibes'), {
      text: newVibe,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    setNewVibe('');
  };

  useEffect(() => {
    const q = query(collection(db, 'vibes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Vibe[];
      const userIds = [...new Set(docs.map(v => v.userId))];
      const userDocs = await Promise.all(userIds.map(uid => getDoc(doc(db, 'users', uid))));
      const userMap: Record<string, string> = {};
      userDocs.forEach((d, i) => {
        if (d.exists()) userMap[userIds[i]] = d.data().username || userIds[i];
      });
      const enriched = docs.map(v => ({ ...v, username: userMap[v.userId] || v.userId }));
      setVibes(enriched);
    });
    return unsub;
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏠 Home Feed</Text>
      <TextInput
        placeholder="What's your vibe today?"
        value={newVibe}
        onChangeText={setNewVibe}
        style={styles.input}
      />
      <TouchableOpacity onPress={postVibe} style={styles.button}>
        <Text style={styles.buttonText}>Post Vibe</Text>
      </TouchableOpacity>

      {vibes.map((v, i) => (
        <View key={i} style={styles.vibeItem}>
          <Text style={styles.username}>👤 {v.username}</Text>
          <Text>{v.text}</Text>
          <Text style={styles.timestamp}>{v.createdAt?.toDate?.()?.toLocaleString?.() || 'Just now'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#7c3aed',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  vibeItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
  },
  username: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default HomeFeed;
