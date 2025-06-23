import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export function JoinSessionScreen() {
  const [inputCode, setInputCode] = useState('');
  const [foundSession, setFoundSession] = useState<Record<string, any> | null>(null);

  const handleJoin = async () => {
    const sessionsRef = collection(db, 'groupSessions');
    const q = query(sessionsRef, where('inviteCode', '==', inputCode));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const docData = querySnap.docs[0].data();
      // Validate and transform the data to expected shape
      if (docData.hostId) {
        setFoundSession(docData);
      } else {
        Alert.alert('Error', 'Invalid session data');
      }
      // Optional: Join the session or navigate
    } else {
      Alert.alert('No session found with that invite code');
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
      <TouchableOpacity onPress={handleJoin} style={styles.button}>
        <Text style={styles.buttonText}>Join Session</Text>
      </TouchableOpacity>
      {foundSession && <Text style={styles.successText}>✅ Session Found: Host {foundSession.hostId}</Text>}
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
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    marginTop: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  successText: {
    marginTop: 8,
    color: 'green',
  },
});

export default JoinSessionScreen;
