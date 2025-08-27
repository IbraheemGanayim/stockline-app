# YallaBit – React Native Expo Assignment

> A clean Expo React Native app with Firebase auth, Firestore CRUD, protected navigation, and a polished UI.

Developed by **Ibraheem Ganayim** as part of the YallaBit App Developer take-home assignment.

---

## Overview

YallaBit is a production-ready React Native application built with Expo that demonstrates a complete mobile workflow: authentication, protected routes, Firestore-backed CRUD, image uploads to Storage, and a responsive UI. It showcases solid app architecture and best practices tailored for a take-home assignment context. ⚡

---

## Features

- 🔐 **Email/Password Authentication** with session persistence
- 🔏 **Protected Navigation** (auth vs. app stacks)
- 🔥 **Firestore CRUD** with real-time listeners and hooks
- 🗃️ **Collections**: items, watchlist, holdings, portfolios, transactions
- 🖼️ **Image Uploads** to Firebase Storage
- 📡 **Offline-friendly** patterns and stable error handling
- 📱 **Responsive UI** with reusable components and consistent theming
- ✅ **Type-friendly setup** (TS config) and clean code structure

---

## Tech Stack

- React Native + Expo
- React Navigation (Stacks, Tabs)
- Firebase: Authentication, Firestore, Storage
- AsyncStorage for auth persistence
- Expo Image Picker, Vector Icons
- Custom hooks, contexts, and component library

---

## Folder Structure

```
src/
  components/
    Card.js
    FormInput.js
    PortfolioCard.js
    PrimaryButton.js
    Screen.js
    SectionHeader.js
    StockCard.js
    SuccessAnimation.js
    ValidationInput.js
    index.js
  contexts/
    AuthProvider.js
  firebase-config.ts
  hooks/
    index.js
    useAuthUser.js
    useCollection.js
    useDoc.js
    usePortfolio.js
    useTransactions.js
    useWatchlist.js
  navigation/
    AppStack.js
    AuthStack.js
    RootNavigator.js
    index.js
  screens/
    CreateItemScreen.js
    HomeScreen.js
    ItemDetailsScreen.js
    LoginScreen.js
    PortfolioScreen.js
    ProfileScreen.js
    SettingsScreen.js
    SignupScreen.js
    TransactionsScreen.js
    index.js
  services/
    auth.js
    connectionTest.js
    db.js
    firebase.js
    portfolio.js
    storage.js
    transactions.js
    watchlist.js
  theme/
    colors.js
    spacing.js
    typography.js
    index.js
  utils/
    validation.js
```

Additional top-level files: `App.js`, `app.json`, `firebase.json`, `firestore.rules`, `storage.rules`, `metro.config.js`, `tsconfig.json`.

---

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Xcode + iOS Simulator (macOS) for iOS
- Android Studio + Android Emulator for Android
- Expo CLI: `npm i -g @expo/cli`
- Firebase CLI: `npm i -g firebase-tools`

### 1) Clone the repo
```bash
git clone https://github.com/ibraheemganayim/YallaBit.git
cd YallaBit
```

### 2) Install dependencies
```bash
npm install
# or
yarn
```

### 3) Environment variables (.env)
Create a `.env` in the project root and paste your Firebase web app config:
```bash
touch .env
```
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
# Optional (for local emulators during development)
EXPO_PUBLIC_FIREBASE_USE_EMULATORS=false
```

This project loads env via `@env` (see `babel.config.js`). Example:
```js
import { EXPO_PUBLIC_FIREBASE_API_KEY } from '@env';
```

### 4) Firebase project and rules
- Create a Firebase project and a Web App in the Firebase Console.
- Enable Email/Password Auth, Firestore, and Storage.
- Login/select your project via CLI and deploy rules/indexes:
```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### 5) Run the app
```bash
npm start
# or directly
npm run ios
npm run android
```
Tips:
- Press i (iOS), a (Android), or w (Web) in the Expo terminal.
- Clear cache if needed: `expo start -c`.
- Android emulator uses `10.0.2.2` to reach localhost; iOS uses `127.0.0.1`.

---

## Firebase Setup

1) Create a Firebase project at the Firebase Console
2) Enable Authentication → Sign-in method → Email/Password (Enabled) 🔐
3) Create a Firestore database (Start in production or test mode) 🔥
4) Enable Firebase Storage for image uploads 🖼️
5) From Project settings → Your apps, copy the web app config and paste into `.env` using the keys above

Notes:
- The app reads env via `EXPO_PUBLIC_*` variables. With Expo, these are available at build time and via `process.env`/`@env`.
- Emulators can be toggled by setting `EXPO_PUBLIC_FIREBASE_USE_EMULATORS=true` in development.

---

## Usage

1) Signup → create an account with email/password
2) Login → enter credentials to access the app
3) Home → view items and lists (real-time Firestore)
4) Create Item → add a new item with optional image upload
5) Item Details → view details and perform allowed actions
6) Profile → view/manage your profile and lists
7) Logout → sign out to return to the auth flow

---

## Firestore Rules

These are the security rules used by the app (excerpt). Deploy with Firebase CLI as needed.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }
    function isResourceOwner() { return isAuthenticated() && request.auth.uid == resource.data.userId; }

    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false;
    }

    match /items/{itemId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isResourceOwner();
    }

    match /portfolios/{userId} {
      allow read, write: if isOwner(userId);
      match /{document=**} { allow read, write: if isOwner(userId); }
    }

    match /watchlist/{watchlistId} {
      allow read, write: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }

    match /holdings/{holdingId} {
      allow read, write: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }

    match /transactions/{userId} {
      allow read, write: if isOwner(userId);
      match /{document=**} { allow read, write: if isOwner(userId); }
    }

    match /{document=**} { allow read, write: if false; }
     }
   }
   ```

See `firestore.rules` and `storage.rules` in the repo for full rules. ✅

---

## Demo Video

[Watch the demo (placeholder)](https://www.loom.com/share/REPLACE_WITH_YOUR_VIDEO_LINK) 🎥

---

Developed by **Ibraheem Ganayim**  
Contact: Ibraheem.Ganayim@gmail.com
