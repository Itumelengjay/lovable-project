"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Sun, Moon, Home, Search, Users, User } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "discover", label: "Discover", icon: Search },
  { id: "sync", label: "Sync", icon: Users },
  { id: "profile", label: "Profile", icon: User },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return children;
      case "discover":
        return <div className="p-4 text-center">Discover Tab Content</div>;
      case "sync":
        return <div className="p-4 text-center">Sync Tab Content</div>;
      case "profile":
        return <div className="p-4 text-center">Profile Tab Content</div>;
      default:
        return children;
    }
  };

  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white dark:bg-black text-black dark:text-white min-h-screen flex flex-col">
        <div className="flex-1 overflow-auto">{renderContent()}</div>
        <nav className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center px-4 py-2">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center text-sm ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </nav>
      </body>
    </html>
  );
}
