
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cc0accb6b4184b7ab0d30df58bcf7a74',
  appName: 'vibesync-design-alchemy',
  webDir: 'dist',
  server: {
    url: 'https://cc0accb6-b418-4b7a-b0d3-0df58bcf7a74.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // Permissions configuration
    Permissions: {
      geolocation: true
    }
  },
  android: {
    allowMixedContent: true
  },
  ios: {
    limitsNavigationsToAppBoundDomains: false
  }
};

export default config;
