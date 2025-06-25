# Firebase Hosting Deployment Guide for Web Frontend

## Prerequisites
- Your project already has `firebase.ts` initialized with Firebase config.
- Firebase CLI installed globally:
  ```bash
  npm install -g firebase-tools
  ```

## Step-by-Step Setup

### 1. Login & Initialize Firebase Hosting
```bash
firebase login
firebase init hosting
```
- Choose: Use existing project
- Build folder: `dist` or `build` (depending on your bundler)
- Configure as SPA: Yes

### 2. Add Build & Deploy Scripts to `package.json`
```json
"scripts": {
  "build": "vite build",
  "deploy": "firebase deploy"
}
```

### 3. Build & Deploy
```bash
npm run build
firebase deploy
```

Your app will be live in seconds at:  
`https://<your-project>.web.app`

---

# Alternative Web Deployment: Vercel

## Setup
- Go to https://vercel.com
- Import your GitHub project repo
- Set Framework Preset: Vite or React
- Set build command: `npm run build`
- Set output directory: `dist`

Vercel will auto-deploy on every push to your main branch.

---

# Expo Deployment for Mobile (Android/iOS)

## Setup
- Install Expo CLI:
  ```bash
  npm install -g expo-cli
  ```
- Initialize or connect to existing app:
  ```bash
  expo init vibesync-app
  ```
- Add Firebase config into Expo
- Update `app.json` and ensure Firebase SDK works with Expo (use modular SDK)

## Run Locally
```bash
expo start
```

## Build APK/IPA
```bash
expo build:android   # or expo build:ios
```

## Publish OTA Update
```bash
expo publish
```

---

# Optional: CI/CD with GitHub Actions for Firebase Hosting

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Firebase Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "\${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          channelId: live
```

Make sure to add `FIREBASE_SERVICE_ACCOUNT` to your repo secrets.

---

This guide will help you deploy your web frontend and mobile app efficiently.
