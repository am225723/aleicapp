# Page Migration Map: Reference → ALEIC

This document tracks the migration status of all pages from the reference implementation to the ALEIC mobile app.

## Summary
- **Total Reference Pages**: 57
- **Existing in ALEIC**: 38
- **To Be Created**: 10
- **Skipped**: 9

---

## Migration Table

| Reference Page File | What It Does (1 sentence) | Target ALEIC Screen Path | Route Name in ALEIC | Status | If Skipped, Why | Notes |
|---------------------|---------------------------|--------------------------|---------------------|--------|-----------------|-------|
| `admin-dashboard.tsx` | Admin panel for system-wide management and user oversight | — | — | Skipped | Admin-only, not relevant to couple/therapist mobile experience | Would require admin role type |
| `analytics.tsx` | Displays usage analytics and engagement metrics for couples | `client/screens/couple/AnalyticsScreen.tsx` | Analytics | To Create | — | Needs Couples_tool_entries data aggregation |
| `attachment-assessment.tsx` | Multi-question assessment to determine attachment style | `client/screens/tools/AttachmentAssessmentScreen.tsx` | AttachmentAssessment | Existing | — | Saves to attachment_results table |
| `attachment-results.tsx` | Shows attachment style results with explanations | `client/screens/tools/AttachmentStyleScreen.tsx` | AttachmentStyle | Existing | — | Reads from attachment_results table |
| `auth.tsx` | Login and authentication handling | `client/screens/auth/LoginScreen.tsx` | Auth (stack) | Existing | — | Uses Supabase auth |
| `calendar.tsx` | Shared calendar for couple events and appointments | `client/screens/couple/CalendarScreen.tsx` | Calendar | Existing | — | Uses Couples_calendar_events table |
| `checkin-history.tsx` | Historical view of past weekly check-ins with trends | `client/screens/couple/CheckinHistoryScreen.tsx` | CheckinHistory | To Create | — | Reads from Couples_weekly_checkins table |
| `chore-chart.tsx` | Shared household chore assignment and tracking | `client/screens/tools/ChoreChartScreen.tsx` | ChoreChart | To Create | — | Needs new Couples_chores table |
| `client-dashboard.tsx` | Main couple dashboard with widgets and quick actions | `client/screens/couple/CoupleHomeScreen.tsx` | CoupleTabs.CoupleHome | Existing | — | Current home screen with widgets |
| `client-profile.tsx` | Couple user profile with settings and stats | `client/screens/couple/CoupleProfileScreen.tsx` | CoupleTabs.CoupleProfile | Existing | — | Account management screen |
| `client-settings.tsx` | Detailed settings for notifications, privacy, preferences | `client/screens/couple/SettingsScreen.tsx` | Settings | To Create | — | Separate from profile |
| `conflict-resolution.tsx` | Guided conflict resolution tool with structured steps | `client/screens/tools/ConflictResolutionScreen.tsx` | ConflictResolution | To Create | — | May save to Couples_tool_entries |
| `couple-compatibility.tsx` | Compatibility assessment comparing partner answers | `client/screens/tools/CompatibilityScreen.tsx` | Compatibility | To Create | — | Needs new compatibility_results table |
| `couple-journal.tsx` | Shared journal entries between partners | `client/screens/couple/ConnectScreen.tsx` | CoupleTabs.Connect | Existing | — | Combined with gratitude in Connect tab |
| `couple-setup.tsx` | Initial couple pairing and onboarding flow | `client/screens/auth/CoupleSetupScreen.tsx` | CoupleSetup | To Create | — | Post-signup partner linking |
| `couple-signup.tsx` | Couple registration and account creation | `client/screens/auth/CoupleSignupScreen.tsx` | Auth.CoupleSignup | Existing | — | Part of auth stack |
| `daily-suggestion.tsx` | AI-generated daily relationship suggestion | `client/screens/couple/DailySuggestionScreen.tsx` | DailySuggestion | To Create | — | Could use existing Edge Function pattern |
| `daily-tips.tsx` | Daily relationship tips and micro-lessons | `client/screens/couple/CoupleHomeScreen.tsx` | — | Existing | — | Integrated as widget in Home dashboard |
| `date-night.tsx` | Date night generator with AI suggestions | `client/screens/couple/DateNightScreen.tsx` | DateNight | Existing | — | Uses ai-date-night Edge Function |
| `demon-dialogues.tsx` | EFT tool for identifying negative interaction cycles | `client/screens/tools/DemonDialoguesScreen.tsx` | DemonDialogues | Existing | — | Saves to demon_dialogues table |
| `echo-empathy.tsx` | Reflective listening and empathy practice tool | `client/screens/tools/EchoEmpathyScreen.tsx` | EchoEmpathy | Existing | — | Conversation flow tool |
| `enneagram-assessment.tsx` | Enneagram personality type assessment quiz | `client/screens/tools/EnneagramAssessmentScreen.tsx` | EnneagramAssessment | Existing | — | Multi-question quiz |
| `enneagram-results.tsx` | Enneagram results with type description | `client/screens/tools/EnneagramScreen.tsx` | Enneagram | Existing | — | Saves to enneagram_results table |
| `financial-toolkit.tsx` | Money conversation prompts and financial planning | `client/screens/tools/FinancialToolkitScreen.tsx` | FinancialToolkit | Existing | — | Saves to financial_conversations table |
| `four-horsemen.tsx` | Gottman Four Horsemen identification and antidotes | `client/screens/tools/FourHorsemenScreen.tsx` | FourHorsemen | Existing | — | Educational tool with tracking |
| `gratitude-log.tsx` | Daily gratitude entries with optional images | `client/screens/couple/ConnectScreen.tsx` | CoupleTabs.Connect | Existing | — | Part of Connect tab |
| `growth-plan.tsx` | Personalized relationship growth plan with milestones | `client/screens/couple/GrowthPlanScreen.tsx` | GrowthPlan | To Create | — | Needs new growth_plans table |
| `hold-me-tight.tsx` | Sue Johnson's EFT conversation prompts | `client/screens/tools/HoldMeTightScreen.tsx` | HoldMeTight | Existing | — | Guided prompts tool |
| `ifs-intro.tsx` | Introduction to Internal Family Systems therapy | `client/screens/tools/IFSIntroScreen.tsx` | IFSIntro | Existing | — | Educational intro screen |
| `intimacy-mapping.tsx` | Multi-dimensional intimacy preferences mapping | `client/screens/tools/IntimacyMappingScreen.tsx` | IntimacyMapping | Existing | — | Saves to intimacy_maps table |
| `invitation-codes.tsx` | Therapist invite code generation and management | `client/screens/therapist/ManageInvitesScreen.tsx` | TherapistTabs.Invites | Existing | — | Therapist-only feature |
| `love-language-quiz.tsx` | Gary Chapman's 5 Love Languages assessment | `client/screens/couple/LoveLanguageQuizScreen.tsx` | LoveLanguageQuiz | Existing | — | Quiz with results |
| `love-language-results.tsx` | Love language results display and comparison | `client/screens/couple/LoveLanguageQuizScreen.tsx` | LoveLanguageQuiz | Existing | — | Combined in same screen |
| `love-map.tsx` | Gottman Love Map quiz with truths/guesses phases | `client/screens/tools/LoveMapQuizScreen.tsx` | LoveMapQuiz | Existing | — | Saves to love_map_results table |
| `meditation-library.tsx` | Guided meditation sessions with tracking | `client/screens/tools/MeditationLibraryScreen.tsx` | MeditationLibrary | Existing | — | Saves to meditation_sessions table |
| `messages.tsx` | Real-time messaging between couple and therapist | `client/screens/couple/MessagesScreen.tsx` | Messages | Existing | — | Uses therapist_messages table |
| `modules.tsx` | Activity hub with all relationship tools organized | `client/screens/couple/ActivitiesScreen.tsx` | CoupleTabs.Activities | Existing | — | Tool categories and navigation |
| `mood-tracker.tsx` | Daily mood logging with visualization | `client/screens/tools/MoodTrackerScreen.tsx` | MoodTracker | To Create | — | Needs new Couples_moods table |
| `not-found.tsx` | 404 error page for invalid routes | — | — | Skipped | Web-only, not needed in mobile navigation | React Navigation handles missing routes |
| `parenting-partners.tsx` | Parenting alignment discussions and agreements | `client/screens/tools/ParentingPartnersScreen.tsx` | ParentingPartners | Existing | — | Saves to parenting_discussions table |
| `pause-button.tsx` | Guided breathing and grounding exercise | `client/screens/tools/PauseButtonScreen.tsx` | PauseButton | Existing | — | Animated breathing circles |
| `progress-timeline.tsx` | Visual timeline of relationship milestones | `client/screens/couple/ProgressTimelineScreen.tsx` | ProgressTimeline | To Create | — | Aggregates multiple data sources |
| `reflection-prompts.tsx` | Daily/weekly reflection questions | `client/screens/couple/ConnectScreen.tsx` | — | Existing | — | Could be integrated into Connect tab |
| `rituals.tsx` | Recurring relationship rituals management | `client/screens/couple/PlanScreen.tsx` | CoupleTabs.Plan | Existing | — | Part of Plan tab |
| `session-notes.tsx` | Therapist session notes for couple review | — | — | Skipped | Therapist-only content creation, couples view in messages | Therapist creates via dashboard |
| `shared-goals.tsx` | Kanban-style shared goal tracking | `client/screens/tools/SharedGoalsScreen.tsx` | SharedGoals | Existing | — | Saves to shared_goals table |
| `shared-todos.tsx` | Shared to-do list for couple tasks | — | — | Skipped | Redundant with SharedGoals Kanban functionality | SharedGoals covers task tracking |
| `therapist-dashboard.tsx` | Therapist overview with couple stats | `client/screens/therapist/TherapistDashboardScreen.tsx` | TherapistTabs.Dashboard | Existing | — | Main therapist home |
| `therapist-management.tsx` | Admin tool for managing therapist accounts | — | — | Skipped | Admin-only functionality | Requires admin role |
| `therapist-profile.tsx` | Therapist profile and account settings | `client/screens/therapist/TherapistProfileScreen.tsx` | TherapistTabs.TherapistProfile | Existing | — | Therapist settings |
| `therapist-settings.tsx` | Detailed therapist preferences and notifications | `client/screens/therapist/TherapistProfileScreen.tsx` | — | Existing | — | Combined with profile screen |
| `therapist-signup.tsx` | Therapist registration and onboarding | `client/screens/auth/TherapistSignupScreen.tsx` | Auth.TherapistSignup | Existing | — | Part of auth stack |
| `therapist-thoughts.tsx` | Private therapist notes (not shared with couple) | — | — | Skipped | Therapist-only private notes, not mobile-relevant | Desktop/web feature only |
| `user-management.tsx` | Admin user management panel | — | — | Skipped | Admin-only functionality | Requires admin role |
| `values-vision.tsx` | Shared values exploration and vision statement | `client/screens/tools/ValuesVisionScreen.tsx` | ValuesVision | Existing | — | Saves to values_vision table |
| `voice-memos.tsx` | Audio recording and playback for couple | `client/screens/tools/VoiceMemosScreen.tsx` | VoiceMemos | Existing | — | Uses Supabase Storage |
| `weekly-checkin.tsx` | Weekly relationship health check with ratings | `client/screens/tools/WeeklyCheckinScreen.tsx` | WeeklyCheckin | Existing | — | Saves to Couples_weekly_checkins table |

---

## To Be Created (10 screens)

| Priority | Screen | Route Name | Dependencies |
|----------|--------|------------|--------------|
| 1 | AnalyticsScreen | Analytics | Couples_tool_entries aggregation queries |
| 2 | CheckinHistoryScreen | CheckinHistory | Couples_weekly_checkins read queries |
| 3 | MoodTrackerScreen | MoodTracker | New Couples_moods table |
| 4 | SettingsScreen | Settings | Notification preferences, privacy settings |
| 5 | ConflictResolutionScreen | ConflictResolution | Guided flow, optional persistence |
| 6 | CompatibilityScreen | Compatibility | New compatibility_results table |
| 7 | GrowthPlanScreen | GrowthPlan | New growth_plans table |
| 8 | ProgressTimelineScreen | ProgressTimeline | Multi-table aggregation |
| 9 | DailySuggestionScreen | DailySuggestion | AI Edge Function |
| 10 | ChoreChartScreen | ChoreChart | New Couples_chores table |
| 11 | CoupleSetupScreen | CoupleSetup | Partner linking flow |

---

## Skipped Pages (9 pages)

| Page | Reason |
|------|--------|
| admin-dashboard.tsx | Admin-only, not relevant to couple/therapist mobile experience |
| not-found.tsx | Web-only 404 page, React Navigation handles missing routes |
| session-notes.tsx | Therapist-only content creation feature |
| shared-todos.tsx | Redundant with SharedGoals Kanban functionality |
| therapist-management.tsx | Admin-only functionality |
| therapist-thoughts.tsx | Therapist-only private notes, desktop feature |
| user-management.tsx | Admin-only functionality |
| therapist-settings.tsx | Combined with TherapistProfileScreen |
| love-language-results.tsx | Combined with LoveLanguageQuizScreen |

---

## Notes

1. **Tab Navigation**: ALEIC uses 5 tabs (Home, Connect, Activities, Plan, Profile) which consolidates some reference pages
2. **Combined Screens**: Some reference pages are combined in ALEIC (e.g., gratitude + journal in Connect)
3. **Data Layer**: All screens use Supabase with Couples_* naming convention for tables
4. **Edge Functions**: AI features use Supabase Edge Functions with Perplexity API
