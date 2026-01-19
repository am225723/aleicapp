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
3. **Activities**: Comprehensive relationship tools including:
   - **Calming & Grounding**: Pause Button (guided breathing), Meditation Library
   - **Communication**: Echo & Empathy, Hold Me Tight (EFT), Voice Memos, Demon Dialogues
   - **Assessments**: Love Language Quiz, Attachment Styles, Enneagram, Love Map Quiz (Gottman)
   - **Deep Work**: Internal Family Systems (IFS), Intimacy Mapping, Values & Vision
   - **Reflection**: Weekly Check-in, Gratitude, Journal
   - **Therapeutic Tools**: Four Horsemen (Gottman)
   - **Life Together**: Shared Goals, Parenting Partners, Financial Toolkit
   - **Planning**: Shared Calendar, Messages
4. **Plan**: Date night suggestions and customizable rituals
5. **Profile**: Account settings and stats

### Therapist Experience (4 tabs)
1. **Dashboard**: Overview stats and recent couple activity
2. **Couples**: List of managed couples with detail views
3. **Invites**: Generate and share invitation codes
4. **Profile**: Account settings
5. **Messages**: Real-time messaging with couples (via CoupleDetail)

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

## Supabase Database Tables
The app uses Supabase for data persistence with the following module tables:
- `voice_memos` - Audio recordings with Supabase Storage
- `shared_goals` - Couple goal tracking (Kanban-style)
- `demon_dialogues` - EFT negative cycle patterns
- `attachment_results` - Attachment style assessments
- `enneagram_results` - Enneagram type results
- `ifs_sessions` - Internal Family Systems parts work
- `intimacy_maps` - Intimacy preference mapping
- `love_map_results` - Gottman Love Map quiz results
- `meditation_sessions` - Meditation practice logs
- `parenting_discussions` - Parenting alignment discussions
- `financial_conversations` - Financial conversation logs
- `values_vision` - Shared values and vision entries
- `therapist_messages` - Therapist-couple messaging

All tables have RLS policies for proper data isolation.

## Recent Changes
- January 2026: Major feature expansion
  - Added 14 new relationship tools with Supabase persistence
  - Voice Memos with audio recording, Storage upload, and playback
  - Shared Goals with Kanban-style tracking
  - Demon Dialogues for EFT negative cycle identification
  - Attachment Style assessment and results
  - Enneagram personality assessment
  - Internal Family Systems (IFS) parts work
  - Intimacy Mapping across 5 dimensions
  - Love Map Quiz (Gottman method)
  - Meditation Library with session tracking
  - Parenting Partners alignment tool
  - Financial Toolkit for money conversations
  - Values & Vision sharing
  - Therapist Messages with realtime subscriptions
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
