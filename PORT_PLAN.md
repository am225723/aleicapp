# Port Plan: Legacy → Current App Migration

## Overview
This document tracks the migration from `reference/couplestherapy-main/` to the current app.

---

## 1. Screen Inventory

### Legacy Client Screens (29 total)
| Screen | Current Status | Priority | Notes |
|--------|---------------|----------|-------|
| AttachmentAssessmentScreen | **MISSING** | High | Quiz for attachment style |
| AttachmentStyleScreen | **MISSING** | High | Results + info |
| CalendarScreen | **MISSING** | Medium | Shared calendar events |
| CoupleJournalScreen | **MISSING** | High | Journal with privacy levels |
| DashboardScreen | **EXISTS** (CoupleHomeScreen) | Done | Home screen |
| DateNightScreen | **EXISTS** (PlanScreen) | Done | Integrated in Plan tab |
| DemonDialoguesScreen | **MISSING** | Medium | Therapeutic tool (EFT) |
| EchoEmpathyScreen | **EXISTS** | Done | Speaker/listener exercise |
| EnneagramAssessmentScreen | **MISSING** | Medium | Personality quiz |
| EnneagramScreen | **MISSING** | Medium | Results + info |
| FinancialToolkitScreen | **MISSING** | Low | Budget/finance tools |
| FourHorsemenScreen | **MISSING** | Medium | Gottman method |
| GratitudeLogScreen | **EXISTS** (ConnectScreen) | Done | Gratitude entries |
| HoldMeTightScreen | **EXISTS** | Done | EFT prompts |
| IFSIntroScreen | **MISSING** | Medium | Internal Family Systems intro |
| IFSScreen | **MISSING** | Medium | IFS parts work |
| IntimacyMappingScreen | **MISSING** | Low | Intimacy exploration |
| LoveLanguageQuizScreen | **MISSING** | High | 5 love languages quiz |
| LoveMapQuizScreen | **MISSING** | High | Gottman love maps |
| MeditationLibraryScreen | **MISSING** | Low | Guided meditations |
| MessagesScreen | **MISSING** | High | Couple + therapist messaging |
| ParentingPartnersScreen | **MISSING** | Low | Co-parenting tools |
| PauseButtonScreen | **EXISTS** | Done | Breathing exercise |
| ProfileScreen | **EXISTS** | Done | User settings |
| RitualsScreen | **EXISTS** (PlanScreen) | Done | Integrated in Plan tab |
| SharedGoalsScreen | **MISSING** | Medium | Kanban-style goals |
| ValuesVisionScreen | **MISSING** | Low | Values exploration |
| VoiceMemosScreen | **MISSING** | Medium | Record/playback/upload |
| WeeklyCheckinScreen | **EXISTS** | Done | Rating sliders |

### Legacy Therapist Screens (6 total)
| Screen | Current Status | Priority | Notes |
|--------|---------------|----------|-------|
| CoupleDetailScreen | **EXISTS** | Done | Couple view |
| CoupleListScreen | **EXISTS** | Done | Couples management |
| InvitationCodesScreen | **EXISTS** (ManageInvitesScreen) | Done | Code generation |
| TherapistDashboardScreen | **EXISTS** | Done | Stats overview |
| TherapistMessagesScreen | **MISSING** | High | Message couples |
| TherapistProfileScreen | **EXISTS** | Done | Settings |

### Legacy Auth Screens (3 total)
| Screen | Current Status | Notes |
|--------|---------------|-------|
| CoupleSignupScreen | **EXISTS** | Done |
| LoginScreen | **EXISTS** | Done |
| TherapistSignupScreen | **EXISTS** | Done |

---

## 2. Screens to Port (Priority Order)

### Phase 1: Core Features (High Priority)
1. **MessagesScreen** - Realtime chat between couple + therapist
2. **TherapistMessagesScreen** - Therapist messaging view
3. **LoveLanguageQuizScreen** - 5 Love Languages assessment
4. **LoveMapQuizScreen** - Gottman Love Maps
5. **AttachmentAssessmentScreen** - Attachment style quiz
6. **AttachmentStyleScreen** - Results display
7. **CoupleJournalScreen** - Private/partner/therapist journal

### Phase 2: Therapeutic Tools (Medium Priority)
8. **DemonDialoguesScreen** - EFT patterns
9. **FourHorsemenScreen** - Gottman 4 horsemen
10. **IFSIntroScreen** - IFS intro
11. **IFSScreen** - IFS parts work
12. **EnneagramAssessmentScreen** - Enneagram quiz
13. **EnneagramScreen** - Results display
14. **SharedGoalsScreen** - Goal tracking
15. **CalendarScreen** - Shared events
16. **VoiceMemosScreen** - Audio recording

### Phase 3: Extended Features (Low Priority)
17. **FinancialToolkitScreen** - Budgeting
18. **IntimacyMappingScreen** - Intimacy tool
19. **MeditationLibraryScreen** - Guided audio
20. **ParentingPartnersScreen** - Co-parenting
21. **ValuesVisionScreen** - Values exploration

---

## 3. Supabase Integration

### Tables Required (from migrations)
| Table | Purpose | Used By |
|-------|---------|---------|
| Couples_profiles | User profiles + role | Auth, all screens |
| Couples_Messages | Chat messages | MessagesScreen |
| Couples_weekly_checkins | Weekly ratings | WeeklyCheckinScreen |
| Couples_gratitude_log | Gratitude entries | ConnectScreen |
| Couples_journal_entries | Private journals | CoupleJournalScreen |
| Couples_rituals | Couple rituals | PlanScreen |
| Couples_calendar_events | Shared events | CalendarScreen |
| Couples_shared_goals | Goal tracking | SharedGoalsScreen |
| Couples_voice_memos | Audio recordings | VoiceMemosScreen |
| Couples_love_language_results | Quiz results | LoveLanguageQuizScreen |
| Couples_attachment_assessments | Assessment data | AttachmentStyleScreen |
| Couples_enneagram_results | Enneagram data | EnneagramScreen |
| Couples_conflict_sessions | I-statements | Various |
| Couples_invitation_codes | Therapist invites | ManageInvitesScreen |

### Storage Buckets
- `voice-memos` - Audio files
- `attachments` - Images/files
- `profile-avatars` - User photos

---

## 4. Services Layer

### Required Files
- `client/lib/supabase.ts` - Supabase client with secure storage
- `client/hooks/useApi.ts` - Query helpers with auth
- `client/hooks/useRealtime.ts` - Realtime subscriptions
- `client/types/index.ts` - TypeScript interfaces

---

## 5. Navigation Updates

### New Couple Tab Routes
Add to ActivitiesScreen:
- Assessments section (Love Language, Attachment, Enneagram)
- Advanced tools (IFS, Demon Dialogues, Four Horsemen)

Add to RootStackNavigator:
- MessagesScreen (chat with header)
- All quiz/assessment screens
- All tool screens

### New Therapist Routes
Add to TherapistTabNavigator:
- Messages tab
Add to RootStackNavigator:
- CoupleMessagesScreen (therapist view)

---

## 6. Migration Checklist

- [ ] Copy supabase/ folder to repo root
- [ ] Create client/lib/supabase.ts
- [ ] Update AuthContext with real Supabase auth
- [ ] Create types file from legacy
- [ ] Create useApi and useRealtime hooks
- [ ] Port Phase 1 screens
- [ ] Port Phase 2 screens
- [ ] Port Phase 3 screens
- [ ] Update navigation
- [ ] Test all flows
- [ ] Update README

---

## 7. Environment Variables Required
```
EXPO_PUBLIC_SUPABASE_URL=<supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```
