# 📱 Stockline – React Native Expo Assignment

> Built from the Stockline Figma kit as a take-home assignment, demonstrating a complete mobile app with authentication, protected routes, Firestore CRUD, and a responsive Stockline UI.

Developed by **Ibraheem Ganayim** – 📧 Ibraheem.Ganayim@gmail.com

---

## 1) Overview

Stockline is a React Native app (Expo) that showcases best practices for a modern mobile stack: Firebase Authentication, Firestore-backed data with secure ownership rules, optional Storage for images, and a clean, reusable UI inspired by the Stockline Figma kit. ⚡

Tech summary: React Native + Expo, React Navigation, Firebase (Auth, Firestore, Storage), AsyncStorage, custom hooks/contexts, and a component-driven design system.

---

## 2) Features

- 🔐 Email/Password authentication with session persistence
- 🔏 Protected routes (Auth stack vs App stack)
- 🔥 Firestore CRUD with real-time listeners and hooks
- 🖼️ Optional image uploads to Firebase Storage
- 📱 Responsive, reusable UI following the Stockline visual system
- 📡 Stable error handling and offline-friendly patterns
- ✅ Type-friendly setup and clean, readable code

---

## 3) Tech Stack

- React Native + Expo
- React Navigation (Stacks, Tabs)
- Firebase: Authentication, Firestore, Storage
- AsyncStorage for auth persistence
- Expo Image Picker, Vector Icons
- Custom hooks, contexts, and a small component library

---

## 4) Folder Structure

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

Top-level: `App.js`, `app.json`, `firebase.json`, `firestore.rules`, `storage.rules`, `metro.config.js`, `tsconfig.json`.

---

## 5) Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Xcode + iOS Simulator (macOS) for iOS
- Android Studio + Android Emulator for Android
- Expo CLI: `npm i -g @expo/cli`
- Firebase CLI: `npm i -g firebase-tools`

### Steps

1) Clone the repo
```bash
git clone https://github.com/ibraheemganayim/YallaBit.git
cd YallaBit
```

2) Install dependencies
```bash
npm install
```

3) Create `.env` and add Firebase keys
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
# Optional (local emulators during development)
EXPO_PUBLIC_FIREBASE_USE_EMULATORS=false
```

This project loads env via `@env` (see `babel.config.js`). Example:
```js
import { EXPO_PUBLIC_FIREBASE_API_KEY } from '@env';
```

4) Start the app
```bash
npm start
# then press i (iOS), a (Android), or w (Web)
```

Tips:
- Clear cache: `expo start -c`.
- Android emulator reaches localhost at `10.0.2.2`; iOS uses `127.0.0.1`.

---

## 6) Firebase Setup

1) Create a Firebase project and Web App in the Firebase Console
2) Enable Email/Password Authentication 🔐
3) Create a Firestore database 🔥
4) (Optional) Enable Storage for image uploads 🖼️
5) Paste the Web App config into `.env` (keys above)
6) Deploy Firestore rules
```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

---

## 7) Usage / Demo Flow

1) Signup → create an account with email/password
2) Login → access the protected app
3) Home → view items (real-time Firestore)
4) Create Item → add items, optionally upload an image
5) Item Details → view details and perform allowed actions
6) Profile → view/manage your profile and lists
7) Logout → sign out and return to the auth flow

---

## 8) Firestore Rules (ownership-based excerpt)

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }
    function isResourceOwner() { return isAuthenticated() && request.auth.uid == resource.data.userId; }

    match /users/{userId} {
      allow read, create, update: if isOwner(userId);
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

    match /watchlist/{id} {
      allow read, write: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }

    match /holdings/{id} {
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

See `firestore.rules` and `storage.rules` for the full versions. ✅

---

## 9) For Contributors

Welcome! To propose improvements:

1) Fork this repository to your GitHub account
2) Clone your fork and create a feature branch
```bash
git checkout -b feat/your-change
```
3) Install and run locally (see Setup & Installation)
4) Keep changes focused and follow the existing code style
5) Commit with clear messages and push your branch
```bash
git commit -m "feat: add X (short description)"
git push origin feat/your-change
```
6) Open a Pull Request against the main repository with a clear description, screenshots when relevant, and testing notes

---

## 10) Demo Video

[Watch the demo (placeholder)](https://www.loom.com/share/REPLACE_WITH_YOUR_VIDEO_LINK) 🎥

---

## 11) Contact

Developed by **Ibraheem Ganayim** – 📧 Ibraheem.Ganayim@gmail.com

---

Developed by **Ibraheem Ganayim** – 📧 Ibraheem.Ganayim@gmail.com


