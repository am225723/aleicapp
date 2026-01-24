# MIGRATION_PLAN.md - AsyncStorage to Supabase Migration

## Overview
This document tracks the migration from AsyncStorage (local device storage) to Supabase (cloud database) for all user data.

## 1. Current AsyncStorage Usage

### File: `client/lib/storage.ts`
| Storage Key | Data Type | Operations | Current Screens |
|-------------|-----------|------------|-----------------|
| `gratitude_entries` | GratitudeEntry[] | get, add | ConnectScreen, AddGratitudeScreen |
| `journal_entries` | JournalEntry[] | get, add | ConnectScreen, AddJournalScreen |
| `rituals` | Ritual[] | get, add, update, delete | PlanScreen, AddRitualScreen |
| `date_nights` | DateNight[] | get, add, update | PlanScreen |
| `weekly_checkins` | WeeklyCheckin[] | get, add | CoupleDetailScreen, WeeklyCheckinScreen |
| `tool_entries` | ToolEntry[] | get, add | CoupleDetailScreen (therapist view) |
| `couples_data` | CoupleData[] | get, add | (used for therapist mock data) |
| `invites_data` | Invite[] | get, add | (used for therapist invites) |

## 2. Target Supabase Tables

Using the canonical `Couples_*` naming convention for consistency:

| Feature | Target Table | Status |
|---------|-------------|--------|
| Gratitude | `Couples_gratitude_logs` | **NEEDS CREATE** |
| Journal | `Couples_journal_entries` | **NEEDS CREATE** |
| Rituals | `Couples_rituals` | **NEEDS CREATE** |
| Date Nights | `Couples_date_nights` | **NEEDS CREATE** |
| Weekly Check-ins | `Couples_weekly_checkins` | **NEEDS CREATE** |
| Calendar Events | `Couples_calendar_events` | **NEEDS CREATE** |
| Tool Entries | `Couples_tool_entries` | **NEEDS CREATE** |

## 3. Schema Mapping

### Couples_gratitude_logs
```sql
CREATE TABLE "Couples_gratitude_logs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Couples_journal_entries
```sql
CREATE TABLE "Couples_journal_entries" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Couples_rituals
```sql
CREATE TABLE "Couples_rituals" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  scheduled_time TIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Couples_date_nights
```sql
CREATE TABLE "Couples_date_nights" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_saved BOOLEAN DEFAULT FALSE,
  planned_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Couples_weekly_checkins
```sql
CREATE TABLE "Couples_weekly_checkins" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_rating INTEGER NOT NULL CHECK (connection_rating >= 1 AND connection_rating <= 10),
  communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 10),
  intimacy_rating INTEGER NOT NULL CHECK (intimacy_rating >= 1 AND intimacy_rating <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Couples_calendar_events
```sql
CREATE TABLE "Couples_calendar_events" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  event_type TEXT DEFAULT 'general',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Couples_tool_entries
```sql
CREATE TABLE "Couples_tool_entries" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('pause', 'echo', 'holdme', 'checkin', 'four_horsemen')),
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. RLS Policies Required

Each table needs these policies:
- **SELECT**: Couple members can view their data, therapist can view assigned couples
- **INSERT**: Couple members can create entries
- **UPDATE**: Creator can update their entries (where applicable)
- **DELETE**: Creator can delete their entries (where applicable)

## 5. Service Modules to Create

| Service File | Table | Operations |
|-------------|-------|------------|
| `client/services/gratitudeService.ts` | Couples_gratitude_logs | list, create, delete |
| `client/services/journalService.ts` | Couples_journal_entries | list, create, delete |
| `client/services/ritualsService.ts` | Couples_rituals | list, create, update, delete |
| `client/services/dateNightsService.ts` | Couples_date_nights | list, create, update |
| `client/services/weeklyCheckinsService.ts` | Couples_weekly_checkins | list, create |
| `client/services/calendarService.ts` | Couples_calendar_events | list, create, update, delete |
| `client/services/toolEntriesService.ts` | Couples_tool_entries | list, create |

## 6. Screens to Update

| Screen | Current Storage | Migration Required |
|--------|----------------|-------------------|
| ConnectScreen | AsyncStorage | Use gratitudeService + journalService |
| AddGratitudeScreen | AsyncStorage | Use gratitudeService.create() |
| AddJournalScreen | AsyncStorage | Use journalService.create() |
| PlanScreen | AsyncStorage | Use ritualsService + dateNightsService |
| AddRitualScreen | AsyncStorage | Use ritualsService.create() |
| CoupleDetailScreen | AsyncStorage | Use toolEntriesService + weeklyCheckinsService |
| WeeklyCheckinScreen | AsyncStorage | Use weeklyCheckinsService.create() |
| CalendarScreen | API fetch | Use calendarService |

## 7. Validation Checklist

After migration:
- [ ] Create/read/delete gratitude entry persists across reinstall
- [ ] Create/read journal entry persists across reinstall
- [ ] Add ritual persists across reinstall
- [ ] Weekly check-in persists across reinstall
- [ ] Calendar events persist across devices
- [ ] Therapist can view couple's entries
- [ ] TypeScript compiles without errors
- [ ] App runs on Expo Go

## 8. Migration Order

1. Create Supabase tables with RLS (migration file)
2. Create service modules
3. Update screens one at a time:
   - Gratitude (ConnectScreen, AddGratitudeScreen)
   - Journal (ConnectScreen, AddJournalScreen)
   - Rituals (PlanScreen, AddRitualScreen)
   - Weekly Check-ins (WeeklyCheckinScreen, CoupleDetailScreen)
   - Date Nights (PlanScreen)
   - Calendar (CalendarScreen)
4. Remove old AsyncStorage code
5. Test all flows
