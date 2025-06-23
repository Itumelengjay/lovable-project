import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';

interface SessionData {
  hostId: string;
  inviteCode: string;
  isPlaying: boolean;
  participants: string[];
  timestamp: number;
  trackUri?: string;
}

export function JoinSessionScreen() {
  const [inputCode, setInputCode] = useState('');
  const [foundSession, setFoundSession] = useState<SessionData | null>(null);

  const handleJoin = async () => {
    const sessionsRef = collection(db, 'groupSessions');
    const q = query(sessionsRef, where('inviteCode', '==', inputCode));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const docData = querySnap.docs[0].data();
      // Validate and transform the data to match SessionData interface
      if (docData.hostId && docData.inviteCode && typeof docData.isPlaying === 'boolean' && Array.isArray(docData.participants)) {
        const sessionData: SessionData = {
          hostId: docData.hostId,
          inviteCode: docData.inviteCode,
          isPlaying: docData.isPlaying,
          participants: docData.participants,
          timestamp: docData.timestamp || Date.now(),
          trackUri: docData.trackUri
        };
        setFoundSession(sessionData);
        // Optional: Join the session or navigate
      } else {
        Alert.alert('Error', 'Invalid session data format');
      }
    } else {
      Alert.alert('Session Not Found', 'No session found with that invite code');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter Invite Code"
        value={inputCode}
        onChangeText={setInputCode}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleJoin} style={styles.joinButton}>
        <Text style={styles.buttonText}>Join Session</Text>
      </TouchableOpacity>
      {foundSession && (
        <Text style={styles.successText}>
          ✅ Session Found: Host {foundSession.hostId}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  joinButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  successText: {
    marginTop: 8,
    color: '#16a34a',
    fontWeight: '500',
  },
});

export default JoinSessionScreen;
