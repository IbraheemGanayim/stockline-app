# YallaBit - React Native Mobile Application

> A modern, feature-rich React Native + Expo application for sharing and discovering items in your community.

**Developed by:** [Ibraheem Ganayim](https://github.com/ibraheemganayim)  
**Version:** 1.0.0  
**Platform:** React Native + Expo  
**Backend:** Firebase (Auth + Firestore + Storage)

---

## 📱 Overview

YallaBit is a production-ready mobile application that allows users to share, discover, and manage items within their community. The app features a modern UI based on the Stockline design system, complete user authentication, real-time data synchronization, and comprehensive CRUD operations.

### ✨ Key Features

- **🔐 User Authentication**: Secure email/password authentication with session persistence
- **📱 Cross-Platform**: Optimized for both iOS and Android devices
- **🎨 Modern UI**: Clean, responsive design based on Stockline UI Kit
- **⚡ Real-time Data**: Live updates using Firestore real-time listeners
- **📸 Image Upload**: Firebase Storage integration for item images
- **🔍 Search & Filter**: Advanced search functionality with category filtering
- **👤 User Profiles**: Complete profile management with user statistics
- **🛡️ Security**: Comprehensive Firestore security rules and data validation
- **🎯 Type-safe**: Well-structured codebase with detailed documentation

---

## 🏗️ Architecture

### Project Structure

```
YallaBit/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Card.js         # Item display cards
│   │   ├── FormInput.js    # Form input with validation
│   │   ├── PrimaryButton.js # Customizable button component
│   │   ├── Screen.js       # Base screen wrapper
│   │   └── index.js        # Component exports
│   ├── contexts/           # React Context providers
│   │   └── AuthProvider.js # Authentication state management
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuthUser.js  # Authentication hook
│   │   ├── useCollection.js # Firestore collection hook
│   │   ├── useDoc.js       # Firestore document hook
│   │   └── index.js        # Hook exports
│   ├── navigation/         # React Navigation setup
│   │   ├── AppStack.js     # Authenticated user navigation
│   │   ├── AuthStack.js    # Authentication flow navigation
│   │   ├── RootNavigator.js # Main navigation controller
│   │   └── index.js        # Navigation exports
│   ├── screens/            # Screen components
│   │   ├── LoginScreen.js      # User login
│   │   ├── SignupScreen.js     # User registration
│   │   ├── HomeScreen.js       # Main item feed
│   │   ├── ItemDetailsScreen.js # Item detail view
│   │   ├── CreateItemScreen.js # Item creation form
│   │   ├── ProfileScreen.js    # User profile & items
│   │   ├── SettingsScreen.js   # App settings
│   │   └── index.js            # Screen exports
│   ├── services/           # External service integrations
│   │   ├── firebase.js     # Firebase configuration
│   │   ├── auth.js         # Authentication services
│   │   ├── db.js           # Firestore database operations
│   │   └── storage.js      # Firebase Storage operations
│   └── theme/              # Design system
│       ├── colors.js       # Color palette
│       ├── typography.js   # Text styles
│       ├── spacing.js      # Layout spacing
│       └── index.js        # Theme exports
├── firestore.rules         # Security rules
├── App.js                  # Main app entry point
├── package.json           # Dependencies
└── README.md              # This file
```

### Technology Stack

- **Frontend**: React Native + Expo
- **Navigation**: React Navigation v6
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context + Custom Hooks
- **UI Components**: Custom components based on Stockline design
- **Image Handling**: Expo Image Picker + Firebase Storage
- **Data Persistence**: AsyncStorage for session management

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS testing)
- Android Studio/Emulator (for Android testing)
- Firebase project with Authentication, Firestore, and Storage enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd YallaBit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   
   a. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   
   b. Enable Authentication with Email/Password provider
   
   c. Create a Firestore database
   
   d. Enable Firebase Storage
   
   e. Get your Firebase configuration

4. **Environment Configuration**
   
   a. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
   
   b. Update `.env` with your Firebase configuration:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Deploy Firestore Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

6. **Start the development server**
   ```bash
   npm start
   ```

### Running the App

- **iOS**: Press `i` in the terminal or scan the QR code with Camera app
- **Android**: Press `a` in the terminal or scan the QR code with Expo Go app
- **Web**: Press `w` in the terminal (limited functionality)

---

## 📱 App Features & Demo Flow

### Authentication Flow
1. **Login Screen**: Secure email/password authentication
2. **Signup Screen**: User registration with display name
3. **Session Persistence**: Automatic login on app restart
4. **Password Reset**: Email-based password recovery

### Main Application Flow
1. **Home Feed**: Browse all shared items with search and filtering
2. **Item Details**: View detailed item information with owner actions
3. **Create Item**: Add new items with image upload and categorization
4. **User Profile**: Manage account and view personal items
5. **Settings**: Account management and app configuration

### Key User Interactions
- **Browse Items**: Scroll through the community feed
- **Search**: Find items by title, description, or category
- **View Details**: Tap any item to see full details
- **Create Item**: Use the + tab to share new items
- **Manage Profile**: View and edit personal information
- **Item Management**: Edit or delete your own items

---

## 🛡️ Security & Data Protection

### Authentication Security
- Firebase Authentication with secure token management
- Session persistence with secure local storage
- Automatic token refresh and validation
- Protected routes requiring authentication

### Data Security
- Comprehensive Firestore security rules
- User-based data ownership validation
- Input sanitization and validation
- Secure image upload with file type validation

### Privacy Features
- Users can only edit/delete their own items
- Profile information is user-controlled
- Secure data transmission over HTTPS
- No sensitive data stored in local storage

---

## 🎨 Design System

### Color Palette
- **Primary**: #007AFF (iOS Blue)
- **Secondary**: #FF6B35 (Orange accent)
- **Neutral**: Gray scale from #FFFFFF to #212121
- **Semantic**: Success (Green), Warning (Orange), Error (Red)

### Typography
- **System Font**: Platform-native fonts
- **Scale**: 12px to 48px with consistent line heights
- **Weights**: Light (300) to Bold (700)

### Spacing
- **8px Grid System**: Consistent spacing multiples
- **Component Padding**: 16px standard
- **Section Margins**: 24px between sections

---

## 🧪 Testing & Quality Assurance

### Code Quality
- Comprehensive inline documentation
- Consistent naming conventions
- Error handling and user feedback
- Input validation and sanitization

### Testing Approach
- Manual testing on iOS and Android
- Authentication flow validation
- CRUD operations testing
- UI responsiveness testing
- Error handling verification

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "expo": "~53.0.22",
  "react": "19.0.0",
  "react-native": "0.79.6",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "firebase": "^10.7.1",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "@expo/vector-icons": "^14.0.0",
  "expo-image-picker": "~15.0.7",
  "expo-constants": "~16.0.2",
  "react-native-screens": "^4.2.0",
  "react-native-safe-area-context": "^4.10.5",
  "react-native-gesture-handler": "^2.16.1"
}
```

---

## 🚀 Deployment

### Building for Production

1. **Configure app.json**
   ```json
   {
     "expo": {
       "name": "YallaBit",
       "slug": "yallabit",
       "version": "1.0.0",
       "platforms": ["ios", "android"],
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash-icon.png"
       }
     }
   }
   ```

2. **Build for iOS**
   ```bash
   expo build:ios
   ```

3. **Build for Android**
   ```bash
   expo build:android
   ```

### Environment-Specific Configurations
- Production Firebase project
- App store assets and metadata
- Performance optimization
- Analytics integration (optional)

---

## 🤝 Contributing

This project was developed as a take-home assignment for YallaBit by **Ibraheem Ganayim**. All code, architecture decisions, and implementation details are original work.

### Development Guidelines
- Follow existing code patterns and conventions
- Maintain comprehensive documentation
- Implement proper error handling
- Write clean, readable code
- Test on both iOS and Android platforms

---

## 📄 License

This project is developed as part of a technical assessment for YallaBit. All rights reserved.

**Developer**: Ibraheem Ganayim  
**Contact**: [GitHub Profile](https://github.com/ibraheemganayim)

---

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Configuration Error**
   - Verify `.env` file contains correct Firebase config
   - Ensure Firebase project has Authentication and Firestore enabled
   - Check console for detailed error messages

2. **Navigation Issues**
   - Clear Metro cache: `expo start -c`
   - Restart development server
   - Verify all screen imports are correct

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check for any peer dependency warnings
   - Verify React Native and Expo CLI are up to date

### Getting Help

For technical issues related to this implementation, please refer to:
- Firebase Documentation
- React Navigation Documentation
- Expo Documentation
- React Native Documentation

---

**Built with ❤️ by Ibraheem Ganayim for YallaBit**
