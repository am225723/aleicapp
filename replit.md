# Couples Therapy Mobile App

## Overview
A native mobile app built with Expo React Native for couples therapy, featuring two distinct roles:
- **Couple (Client)**: Daily-use relationship tools, gratitude journaling, and progress tracking
- **Therapist**: Dashboard for managing couples, session prep summaries, and invite code generation

## Project Architecture

### Frontend (Expo React Native)
- **Location**: `client/` directory
- **Entry**: `client/App.tsx` with React Navigation and React Query
- **Navigation**: Role-based routing (AuthStack → RoleGate → CoupleTabs/TherapistTabs)

### Backend (Express.js)
- **Location**: `server/` directory
- **Port**: 5000
- **Purpose**: API endpoints and static landing page

### Data Storage
- **Authentication**: expo-secure-store (native) / AsyncStorage (web)
- **App Data**: AsyncStorage for local persistence
- **Types**: Stored in `client/lib/storage.ts`

## Key Features

### Couple Experience (5 tabs)
1. **Home**: Quick access to tools, recent activity feed
2. **Connect**: Gratitude entries and journal entries with image attachments
3. **Activities**: 
   - Pause Button (guided breathing with haptics)
   - Echo & Empathy (speaker/listener turn-taking)
   - Hold Me Tight (EFT-based conversation prompts)
   - Weekly Check-in (rating sliders)
4. **Plan**: Date night suggestions and customizable rituals
5. **Profile**: Account settings and stats

### Therapist Experience (4 tabs)
1. **Dashboard**: Overview stats and recent couple activity
2. **Couples**: List of managed couples with detail views
3. **Invites**: Generate and share invitation codes
4. **Profile**: Account settings

## File Structure
```
client/
├── App.tsx                 # App entry with providers
├── contexts/AuthContext.tsx # Authentication state
├── lib/
│   ├── auth.ts             # Secure token storage
│   ├── storage.ts          # AsyncStorage CRUD operations
│   └── query-client.ts     # React Query config
├── navigation/
│   ├── RootStackNavigator.tsx    # Main navigation
│   ├── AuthStackNavigator.tsx    # Login/signup flows
│   ├── CoupleTabNavigator.tsx    # 5-tab couple UI
│   └── TherapistTabNavigator.tsx # 4-tab therapist UI
├── screens/
│   ├── auth/               # Login, signup screens
│   ├── couple/             # Couple experience screens
│   ├── therapist/          # Therapist experience screens
│   └── tools/              # Interactive tool screens
├── components/             # Reusable UI components
└── constants/theme.ts      # Colors, spacing, typography
```

## Design System
- **Primary Color**: #8B9DC3 (Soft blue-gray)
- **Accent Color**: #E8A59C (Warm peach)
- **Login Theme**: Dark/Gold aesthetic with frosted glass
  - Gold Primary: #C9A962
  - Gold Light: #E5D4A1
  - Dark Background: #1A1A1C
- **Font**: Nunito (Google Fonts)
- **Icons**: Feather icons from @expo/vector-icons

## User Preferences
- Login page: Elegant dark theme with gold accents and frosted glass card
- Modern calming aesthetic with soft colors (app screens)
- Haptic feedback on key interactions
- Image attachments for gratitude/journal entries
- Role-based navigation (couple vs therapist)

## Running the App
1. **Backend**: `npm run server:dev` (port 5000)
2. **Frontend**: `npm run expo:dev` (port 8081)
3. **Test**: Scan QR code with Expo Go or open web at localhost:8081

## Recent Changes
- January 2026: Initial implementation of Couples Therapy app
  - Role-based authentication and navigation
  - Complete couple experience with 5 tabs and tool flows
  - Complete therapist experience with 4 tabs
  - Pause Button with animated breathing circles
  - Echo & Empathy conversation flow
  - Hold Me Tight guided prompts
  - Weekly check-in with rating sliders
  - Gratitude and journal entries with image picker
  - Date night suggestions and rituals management
  - Therapist invite code generation and sharing
