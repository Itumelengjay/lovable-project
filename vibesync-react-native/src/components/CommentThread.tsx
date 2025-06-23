import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase';

interface Comment {
  userId: string;
  text: string;
  timestamp: string;
}

interface CommentThreadProps {
  playlistId: string;
}

export function CommentThread({ playlistId }: CommentThreadProps) {
  const [thread, setThread] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'playlists', playlistId);
    const unsubscribe = onSnapshot(ref, snap => {
      const data = snap.data() as DocumentData | undefined;
      if (data?.comments) {
        const sortedComments = [...data.comments].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setThread(sortedComments as Comment[]);
      }
      setLoading(false);
    }, error => {
      console.error('Error fetching comments:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [playlistId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 Comments ({thread.length})</Text>
      <ScrollView style={styles.scrollContainer}>
        {thread.length === 0 ? (
          <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
        ) : (
          thread.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.userName}>👤 {comment.userId}</Text>
                <Text style={styles.timestamp}>
                  {new Date(comment.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  scrollContainer: {
    maxHeight: 300,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
});

export default CommentThread;
