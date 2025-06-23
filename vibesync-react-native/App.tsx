import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Audio } from 'expo-av';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import JoinSessionScreen from './src/screens/JoinSessionScreen';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { HomeScreen, PostDetailScreen, ProfileScreen, LoginScreen } from './src/screens';

const db = getFirestore();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function SyncScreen() {
  const [youtubeId, setYoutubeId] = useState('');
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [localQueue, setLocalQueue] = useState([]);
  const [lyrics, setLyrics] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistId, setPlaylistId] = useState(null);
  const [comments, setComments] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isSynced, setIsSynced] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [reaction, setReaction] = useState(null);
  const [reactionFeed, setReactionFeed] = useState([]);

  const playLocal = async (uri) => {
    if (sound) await sound.unloadAsync();
    if (!auth.currentUser) return;
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: { uri } });
    setSound(newSound);
    await newSound.playAsync();
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const pickAudio = async () => {
    if (!auth.currentUser) return;
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result?.assets?.length) {
      const picked = result.assets[0];
      setPlaylist([...playlist, picked]);
    }
  };

  const playTrackAt = (index) => {
    if (playlist[index]) {
      setCurrentTrackIndex(index);
      playLocal(playlist[index].uri);
    }
  };

  const nextTrack = () => playTrackAt(currentTrackIndex + 1);
  const prevTrack = () => playTrackAt(Math.max(0, currentTrackIndex - 1));

  const handleYouTubeSearch = () => {
    const idMatch = search.match(/(?:\?v=|\/embed\/|\/v\/|youtu\.be\/)([\w-]{11})/);
    if (idMatch) {
      setYoutubeId(idMatch[1]);
      setPlaying(true);
    }
  };

  const fetchLyrics = async () => {
    const title = search.trim();
    if (!title) return;
    try {
      const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(title)}`);
      const data = await res.json();
      setLyrics(data.lyrics || 'Lyrics not found');
    } catch (e) {
      setLyrics('Error fetching lyrics');
    }
  };

  const savePlaylistToFirestore = async () => {
    if (playlist.length === 0 || !playlistTitle) return;
    if (!auth.currentUser) return;
    const tracks = playlist.map(p => ({ name: p.name, uri: p.uri }));
    const ref = await addDoc(collection(db, 'playlists'), {
      title: playlistTitle,
      userId: auth.currentUser.uid,
      tracks,
      rating: 0,
      createdAt: serverTimestamp(),
      comments: [],
    });
    setPlaylistId(ref.id);
  };

  const ratePlaylist = async (stars) => {
    if (!playlistId) return;
    if (!auth.currentUser) return;
    const ref = doc(db, 'playlists', playlistId);
    await updateDoc(ref, { rating: stars });
  };

  const commentOnPlaylist = async (text) => {
    if (!playlistId || !text) return;
    if (!auth.currentUser) return;
    const ref = doc(db, 'playlists', playlistId);
    await updateDoc(ref, {
      comments: arrayUnion({ userId: auth.currentUser.uid, text, timestamp: new Date().toISOString() })
    });
  };

  const startGroupSession = async () => {
    if (!auth.currentUser) return;
    const code = generateInviteCode();
    const ref = doc(db, 'groupSessions', auth.currentUser.uid);
    await setDoc(ref, {
      hostId: auth.currentUser.uid,
      trackUri: playlist[currentTrackIndex]?.uri,
      timestamp: Date.now(),
      isPlaying: true,
      participants: [auth.currentUser.uid],
      inviteCode: code
    });
    setSessionId(auth.currentUser.uid);
    setIsSynced(true);
    setInviteCode(code);
  };

  const sendReaction = async (emoji) => {
    if (!sessionId) return;
    await addDoc(collection(db, 'reactions'), {
      sessionId,
      userId: auth.currentUser.uid,
      emoji,
      timestamp: Date.now()
    });
    setReaction(emoji);
  };

  useEffect(() => {
    if (sessionId) {
      const unsubSession = onSnapshot(doc(db, 'groupSessions', sessionId), (docSnap) => {
        const data = docSnap.data();
        if (data && data.trackUri !== playlist[currentTrackIndex]?.uri) {
          const foundIndex = playlist.findIndex(p => p.uri === data.trackUri);
          if (foundIndex !== -1) playTrackAt(foundIndex);
        }
      });
      const unsubReactions = onSnapshot(
        query(collection(db, 'reactions'), orderBy('timestamp', 'desc')),
        snapshot => setReactionFeed(snapshot.docs.map(doc => doc.data()))
      );
      return () => {
        unsubSession();
        unsubReactions();
      };
    }
  }, [sessionId]);

  return (
    <ScrollView style={styles.container}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Paste YouTube link or type song title"
        style={styles.input}
      />
      <TouchableOpacity onPress={handleYouTubeSearch} style={styles.buttonBlack}>
        <Text style={styles.buttonText}>Play from YouTube</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={fetchLyrics} style={styles.buttonPurple}>
        <Text style={styles.buttonText}>Fetch Lyrics</Text>
      </TouchableOpacity>

      {youtubeId && (
        <YoutubePlayer
          height={220}
          play={playing}
          videoId={youtubeId}
          onChangeState={(e) => setPlaying(e === 'playing')}
        />
      )}

      <TouchableOpacity onPress={pickAudio} style={styles.buttonPink}>
        <Text style={styles.buttonText}>Pick Local Audio</Text>
      </TouchableOpacity>

      {playlist.length > 0 && (
        <>
          <FlatList
            data={playlist}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => playTrackAt(index)} style={styles.playlistItem}>
                <Text style={styles.playlistText}>🎵 {item.name || item.uri.split('/').pop()}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.controls}>
            <TouchableOpacity onPress={prevTrack}><Text>⏮ Prev</Text></TouchableOpacity>
            <TouchableOpacity onPress={stopAudio}><Text>⏹ Stop</Text></TouchableOpacity>
            <TouchableOpacity onPress={nextTrack}><Text>⏭ Next</Text></TouchableOpacity>
          </View>
        </>
      )}

      <TextInput
        value={playlistTitle}
        onChangeText={setPlaylistTitle}
        placeholder="Playlist Title"
        style={styles.input}
      />
      <TouchableOpacity onPress={savePlaylistToFirestore} style={styles.buttonGreen}>
        <Text style={styles.buttonText}>💾 Save Playlist</Text>
      </TouchableOpacity>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingTitle}>Rate this playlist</Text>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => ratePlaylist(star)}>
              <Text>{'⭐'.repeat(star)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput placeholder="Add comment..." onSubmitEditing={e => commentOnPlaylist(e.nativeEvent.text)} style={styles.commentInput} />
      </View>

      <TouchableOpacity onPress={startGroupSession} style={styles.buttonBlue}>
        <Text style={styles.buttonText}>🔄 Start Group Session</Text>
      </TouchableOpacity>

      {inviteCode ? (
        <View style={styles.inviteContainer}>
          <Text style={styles.inviteText}>🔗 Invite Code: {inviteCode}</Text>
          <Text style={styles.inviteSubText}>Share this with friends to sync!</Text>
        </View>
      ) : null}

      <View style={styles.reactionsContainer}>
        <Text style={styles.reactionsTitle}>🎉 React Live:</Text>
        <View style={styles.reactionsEmojis}>
          {['🔥', '❤️', '😂', '😮'].map(em => (
            <TouchableOpacity key={em} onPress={() => sendReaction(em)}>
              <Text style={styles.reactionEmoji}>{em}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={reactionFeed.slice(0, 5)}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <Text>{item.emoji}</Text>}
          horizontal
          style={styles.reactionFeed}
        />
      </View>

      <View style={styles.playlistActions}>
        <Text style={styles.playlistActionsTitle}>Playlist Actions</Text>
        <Text style={styles.playlistActionsSubtitle}>⭐ Users can rate, comment & share your playlist!</Text>
      </View>
    </ScrollView>
  );
}

function DiscoverPlaylistsScreen() {
  const [playlists, setPlaylists] = useState([]);
  useEffect(() => {
    const q = query(collection(db, 'playlists'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snapshot => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlaylists(results);
    });
    return unsub;
  }, []);

  return (
    <ScrollView style={styles.discoverContainer}>
      <Text style={styles.discoverTitle}>🔥 Discover Playlists</Text>
      {playlists.map((pl, i) => (
        <View key={i} style={styles.discoverItem}>
          <Text style={styles.discoverItemTitle}>🎧 {pl.title}</Text>
          <Text style={styles.discoverItemRating}>Rating: {pl.rating || 0}</Text>
          <Text style={styles.discoverItemComments}>{pl.comments?.length || 0} comments</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Discover') iconName = 'flame';
          else if (route.name === 'Sync') iconName = 'musical-notes';
          else if (route.name === 'Chat') iconName = 'chatbubble-outline';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverPlaylistsScreen} />
      <Tab.Screen name="Sync" component={SyncScreen} />
      <Tab.Screen 
        name="Join" 
        component={JoinSessionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            {/* <Stack.Screen name="EditProfile" component={EditProfileScreen} /> */}
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8, borderRadius: 4 },
  buttonBlack: { backgroundColor: 'black', padding: 12, borderRadius: 6, marginBottom: 8 },
  buttonPurple: { backgroundColor: '#6b21a8', padding: 12, borderRadius: 6, marginBottom: 16 },
  buttonPink: { backgroundColor: '#db2777', padding: 12, borderRadius: 6, marginBottom: 16 },
  buttonGreen: { backgroundColor: '#16a34a', padding: 12, borderRadius: 6, marginBottom: 8 },
  buttonBlue: { backgroundColor: '#2563eb', padding: 12, borderRadius: 6, marginTop: 16 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  playlistItem: { paddingVertical: 8 },
  playlistText: { color: '#2563eb' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  ratingContainer: { marginTop: 16, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 6 },
  ratingTitle: { fontWeight: '600', marginBottom: 8 },
  ratingStars: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  commentInput: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 },
  inviteContainer: { marginTop: 12 },
  inviteText: { fontSize: 14, color: '#374151' },
  inviteSubText: { fontSize: 12, color: '#6b7280' },
  reactionsContainer: { marginTop: 16 },
  reactionsTitle: { fontWeight: '600' },
  reactionsEmojis: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  reactionEmoji: { fontSize: 24 },
  reactionFeed: { marginTop: 8 },
  playlistActions: { marginTop: 24, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 6 },
  playlistActionsTitle: { fontSize: 18, fontWeight: '700' },
  playlistActionsSubtitle: { color: '#4b5563' },
  discoverContainer: { padding: 16 },
  discoverTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  discoverItem: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12 },
  discoverItemTitle: { fontWeight: '600' },
  discoverItemRating: { fontSize: 12, color: '#6b7280' },
  discoverItemComments: { fontSize: 12, fontStyle: 'italic', color: '#9ca3af' },
});
