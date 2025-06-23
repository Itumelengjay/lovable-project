import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Clipboard } from 'react-native';

interface SharePlaylistProps {
  playlistId: string;
}

export function SharePlaylist({ playlistId }: SharePlaylistProps) {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(`https://vibesync.app/playlist/${playlistId}`);
  }, [playlistId]);

  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(shareUrl);
      Alert.alert('Success', 'Link copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔗 Share Playlist</Text>
      <TouchableOpacity 
        onPress={copyToClipboard}
        style={styles.linkContainer}
      >
        <Text style={styles.link}>{shareUrl}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  linkContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  link: {
    color: '#3b82f6',
    fontSize: 14,
  },
});

export default SharePlaylist;
