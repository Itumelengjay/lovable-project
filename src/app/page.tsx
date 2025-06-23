"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../App";

const backgroundStyles = [
  { id: "none", label: "None", className: "bg-white dark:bg-gray-800" },
  { id: "sunset", label: "Sunset", className: "bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400" },
  { id: "ocean", label: "Ocean", className: "bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400" },
  { id: "forest", label: "Forest", className: "bg-gradient-to-r from-green-400 via-lime-400 to-yellow-300" },
];

interface Vibe {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: any;
  likes: number;
  comments: number;
  shares: number;
  backgroundStyle: string;
}

interface MediaPost {
  id: string;
  userId: string;
  username: string;
  mediaUrl: string;
  mediaType: "photo" | "video";
  timestamp: any;
  likes: number;
  comments: number;
  shares: number;
}

interface LiveVibe {
  id: string;
  username: string;
  avatarUrl: string;
  isVibing: boolean;
}

export default function Home() {
  const [vibeText, setVibeText] = React.useState("");
  const [selectedBackground, setSelectedBackground] = React.useState("none");
  const [vibes, setVibes] = React.useState<Vibe[]>([]);
  const [mediaPosts, setMediaPosts] = React.useState<MediaPost[]>([]);
  const [liveVibes, setLiveVibes] = React.useState<LiveVibe[]>([]);

  React.useEffect(() => {
    const vibesQuery = query(collection(db, "vibes"), orderBy("timestamp", "desc"));
    const unsubscribeVibes = onSnapshot(vibesQuery, (snapshot) => {
      const vibesData: Vibe[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        vibesData.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          text: data.text,
          timestamp: data.timestamp,
          likes: data.likes,
          comments: data.comments,
          shares: data.shares,
          backgroundStyle: data.backgroundStyle,
        });
      });
      setVibes(vibesData);
    });

    const mediaQuery = query(collection(db, "mediaPosts"), orderBy("timestamp", "desc"));
    const unsubscribeMedia = onSnapshot(mediaQuery, (snapshot) => {
      const mediaData: MediaPost[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        mediaData.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          timestamp: data.timestamp,
          likes: data.likes,
          comments: data.comments,
          shares: data.shares,
        });
      });
      setMediaPosts(mediaData);
    });

    const liveVibesQuery = query(collection(db, "liveVibes"));
    const unsubscribeLiveVibes = onSnapshot(liveVibesQuery, (snapshot) => {
      const liveData: LiveVibe[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        liveData.push({
          id: doc.id,
          username: data.username,
          avatarUrl: data.avatarUrl,
          isVibing: data.isVibing,
        });
      });
      setLiveVibes(liveData);
    });

    return () => {
      unsubscribeVibes();
      unsubscribeMedia();
      unsubscribeLiveVibes();
    };
  }, []);

  const handlePost = async () => {
    if (vibeText.trim().length === 0) return;
    await addDoc(collection(db, "vibes"), {
      userId: "user_123",
      username: "Roger",
      text: vibeText,
      timestamp: serverTimestamp(),
      likes: 0,
      comments: 0,
      shares: 0,
      backgroundStyle: selectedBackground,
    });
    setVibeText("");
    setSelectedBackground("none");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Vibe Text Post Input */}
      <div className="mb-4">
        <textarea
          maxLength={280}
          rows={3}
          placeholder="What's your vibe today?"
          value={vibeText}
          onChange={(e) => setVibeText(e.target.value)}
          className={`w-full rounded-md p-3 resize-none border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white ${
            selectedBackground !== "none" ? backgroundStyles.find((b) => b.id === selectedBackground)?.className : ""
          }`}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex space-x-2">
            {backgroundStyles.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBackground(bg.id)}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedBackground === bg.id ? "border-blue-500" : "border-transparent"
                }`}
                style={{ background: bg.id === "none" ? "transparent" : undefined }}
                aria-label={`Select background ${bg.label}`}
              >
                {bg.id !== "none" && <div className={`w-full h-full rounded-full ${bg.className}`}></div>}
              </button>
            ))}
          </div>
          <button
            onClick={handlePost}
            disabled={vibeText.trim().length === 0}
            className="bg-blue-600 text-white px-4 py-1 rounded-md disabled:opacity-50"
          >
            Post
          </button>
        </div>
        <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
          {vibeText.length} / 280
        </div>
      </div>

      {/* Vibe Text Feed */}
      <div className="space-y-4 mb-6">
        {vibes.map((vibe) => (
          <div
            key={vibe.id}
            className={`p-4 rounded-lg shadow-sm ${
              vibe.backgroundStyle !== "none"
                ? backgroundStyles.find((b) => b.id === vibe.backgroundStyle)?.className
                : "bg-white dark:bg-gray-800"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-lg">{vibe.username}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(vibe.timestamp?.seconds * 1000), { addSuffix: true })}
              </div>
            </div>
            <div className="mb-3 whitespace-pre-wrap">{vibe.text}</div>
            <div className="flex space-x-6 text-gray-600 dark:text-gray-300 text-sm">
              <button className="flex items-center space-x-1 hover:text-red-500">
                <Heart className="w-4 h-4" />
                <span>{vibe.likes}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-blue-500">
                <MessageCircle className="w-4 h-4" />
                <span>{vibe.comments}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-green-500">
                <Share2 className="w-4 h-4" />
                <span>{vibe.shares}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Vibe Status */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Now Vibing</h2>
        <div className="flex space-x-4 overflow-x-auto">
          {liveVibes.map((live) => (
            <div key={live.id} className="flex flex-col items-center space-y-1">
              <img
                src={live.avatarUrl}
                alt={live.username}
                className="w-14 h-14 rounded-full border-2 border-blue-500"
              />
              <div className="text-sm font-medium">{live.username}</div>
              <button className="text-xs text-blue-600 hover:underline">Join</button>
            </div>
          ))}
        </div>
      </div>

      {/* Media Feed */}
      <div className="space-y-4">
        {mediaPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">{post.username}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.timestamp?.seconds * 1000), { addSuffix: true })}
              </div>
            </div>
            {post.mediaType === "photo" ? (
              <img src={post.mediaUrl} alt="media" className="rounded-md max-h-64 w-full object-cover" />
            ) : (
              <video controls className="rounded-md max-h-64 w-full">
                <source src={post.mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <div className="flex space-x-6 text-gray-600 dark:text-gray-300 text-sm mt-2">
              <button className="flex items-center space-x-1 hover:text-red-500">
                <Heart className="w-4 h-4" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-blue-500">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-green-500">
                <Share2 className="w-4 h-4" />
                <span>{post.shares}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
