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
- **App Data**: Supabase cloud database (migrated from AsyncStorage)
- **Services**: `client/services/` directory contains domain-specific Supabase service modules
- **Local Only**: `client/lib/storage.ts` - minimal therapist mock data (couples, invites)

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
│   ├── storage.ts          # Minimal local storage (therapist mock data only)
│   └── query-client.ts     # React Query config
├── services/               # Supabase service modules
│   ├── gratitudeService.ts     # Gratitude logs CRUD
│   ├── journalService.ts       # Journal entries CRUD
│   ├── ritualsService.ts       # Rituals CRUD
│   ├── dateNightsService.ts    # Date nights CRUD
│   ├── weeklyCheckinsService.ts # Weekly check-ins CRUD
│   ├── calendarService.ts      # Calendar events CRUD
│   ├── toolEntriesService.ts   # Tool usage tracking CRUD
│   └── index.ts               # Re-exports all services
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
The app uses Supabase for data persistence with the following tables:

### Core Couple Data Tables (Couples_* naming convention)
- `Couples_gratitude_logs` - Gratitude entries with optional images
- `Couples_journal_entries` - Journal entries with titles and images
- `Couples_rituals` - Recurring rituals with frequency tracking
- `Couples_date_nights` - Saved date night ideas
- `Couples_weekly_checkins` - Weekly connection/communication/intimacy ratings
- `Couples_calendar_events` - Shared calendar events
- `Couples_tool_entries` - Tool usage tracking for analytics

### Additional Module Tables
- `voice_memos` - Audio recordings with Supabase Storage
- `shared_goals` - Couple goal tracking (Kanban-style)
- `demon_dialogues` - EFT negative cycle patterns
- `love_language_results` - Love language quiz results with scores
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
- `Couples_moods` - Daily mood tracking (1-10 scale)
- `user_settings` - User notification/privacy preferences
- `compatibility_results` - Partner compatibility quiz answers
- `daily_suggestions` - AI-generated daily relationship tips
- `Couples_chores` - Shared household chore management
- `growth_plans` - Relationship growth plans with milestones
- `user_roles` - Admin/therapist role assignments

All tables have RLS policies for proper data isolation by couple_id.

### Admin Management (admin-only access)
- Admin Dashboard with system statistics
- Therapist Management for activating/deactivating therapists
- User Management for managing all user accounts
- Access controlled via `user_roles` table (role='admin')

## Recent Changes
- January 2026: Added new screens and admin system
  - New couple screens: Analytics, Check-in History, Mood Tracker, Settings, Growth Plan, Progress Timeline, Daily Suggestion
  - New tools: Conflict Resolution, Compatibility Assessment, Chore Chart
  - Couple Setup screen for partner linking with 6-digit invite codes
  - Admin system: Dashboard, Therapist Management, User Management (admin-only access)
  - Created documentation: docs/MISSING_SCREENS_IMPLEMENTED.md
- January 2026: Updated widget design and category screens
  - Enhanced GlowWidget component with action buttons, preview items, and status text
  - Added CategoryHeroCard component for gradient hero graphics at top of screens
  - All 4 category screens (Calm, Connect, Discover, Plan) now have hero graphics
  - Real-time data integration: widgets show counts, completion status, and previews
  - Pull-to-refresh on all category screens
  - Quiz results display on Discover screen (Love Language, Attachment, Enneagram, Love Map)
- January 2026: Enhanced assessment results pages
  - Love Language Quiz: 30 forced-choice questions with detailed results page
  - All assessments now use direct Supabase storage with consistent table structure
  - Attachment Assessment: Color-coded results with characteristics, growth tips, and partner guidance
  - Enneagram Assessment: Type descriptions with core motivations, strengths, and relationship insights
  - All results pages feature: score breakdowns, progress bars, retake functionality
  - Added loading states and existing results retrieval from Supabase
- January 2026: Navigation and quiz updates
  - Updated tab navigation to 5 tabs: Home, Connect, Activities, Plan, Profile
  - Rewrote Love Map Quiz with truths/guesses/results phases (Gottman method)
  - Added Date Night Generator screen with AI-powered suggestions via Supabase Edge Function
  - Added Date Night widget to Home dashboard
  - Date Night Generator uses Perplexity API for location-based personalized suggestions
- January 2026: Migrated core features from AsyncStorage to Supabase
  - Created 7 new Couples_* tables with RLS policies
  - Built dedicated service modules in client/services/
  - Updated all screens to use Supabase services with proper error handling
  - Cleaned up storage.ts, keeping only therapist mock data functions
  - Added loading states, error handling, and pull-to-refresh to all screens
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
