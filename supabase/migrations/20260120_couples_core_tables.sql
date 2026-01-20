-- Migration: Core Couples Tables for AsyncStorage replacement
-- Date: January 2026
-- Purpose: Create Supabase tables to replace AsyncStorage for gratitude, journal, rituals, etc.

-- Couples_gratitude_logs
CREATE TABLE IF NOT EXISTS "Couples_gratitude_logs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "Couples_gratitude_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view gratitude logs"
  ON "Couples_gratitude_logs" FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Therapist can view assigned couples gratitude logs"
  ON "Couples_gratitude_logs" FOR SELECT
  USING (couple_id IN (SELECT id FROM couples WHERE therapist_id = auth.uid()));

CREATE POLICY "Couple members can create gratitude logs"
  ON "Couples_gratitude_logs" FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can delete their own gratitude logs"
  ON "Couples_gratitude_logs" FOR DELETE
  USING (user_id = auth.uid());

-- Couples_journal_entries
CREATE TABLE IF NOT EXISTS "Couples_journal_entries" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "Couples_journal_entries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view journal entries"
  ON "Couples_journal_entries" FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Therapist can view assigned couples journal entries"
  ON "Couples_journal_entries" FOR SELECT
  USING (couple_id IN (SELECT id FROM couples WHERE therapist_id = auth.uid()));

CREATE POLICY "Couple members can create journal entries"
  ON "Couples_journal_entries" FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can delete their own journal entries"
  ON "Couples_journal_entries" FOR DELETE
  USING (user_id = auth.uid());

-- Couples_rituals
CREATE TABLE IF NOT EXISTS "Couples_rituals" (
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

ALTER TABLE "Couples_rituals" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view rituals"
  ON "Couples_rituals" FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Therapist can view assigned couples rituals"
  ON "Couples_rituals" FOR SELECT
  USING (couple_id IN (SELECT id FROM couples WHERE therapist_id = auth.uid()));

CREATE POLICY "Couple members can create rituals"
  ON "Couples_rituals" FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Couple members can update their rituals"
  ON "Couples_rituals" FOR UPDATE
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own rituals"
  ON "Couples_rituals" FOR DELETE
  USING (created_by = auth.uid());

-- Couples_date_nights
CREATE TABLE IF NOT EXISTS "Couples_date_nights" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_saved BOOLEAN DEFAULT FALSE,
  planned_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "Couples_date_nights" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view date nights"
  ON "Couples_date_nights" FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Couple members can create date nights"
  ON "Couples_date_nights" FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Couple members can update date nights"
  ON "Couples_date_nights" FOR UPDATE
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own date nights"
  ON "Couples_date_nights" FOR DELETE
  USING (created_by = auth.uid());

-- Couples_weekly_checkins
CREATE TABLE IF NOT EXISTS "Couples_weekly_checkins" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_rating INTEGER NOT NULL CHECK (connection_rating >= 1 AND connection_rating <= 10),
  communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 10),
  intimacy_rating INTEGER NOT NULL CHECK (intimacy_rating >= 1 AND intimacy_rating <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "Couples_weekly_checkins" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view weekly checkins"
  ON "Couples_weekly_checkins" FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Therapist can view assigned couples weekly checkins"
  ON "Couples_weekly_checkins" FOR SELECT
  USING (couple_id IN (SELECT id FROM couples WHERE therapist_id = auth.uid()));

CREATE POLICY "Couple members can create weekly checkins"
  ON "Couples_weekly_checkins" FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()) AND user_id = auth.uid());

-- Couples_calendar_events
CREATE TABLE IF NOT EXISTS "Couples_calendar_events" (
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

ALTER TABLE "Couples_calendar_events" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view calendar events"
  ON "Couples_calendar_events" FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Therapist can view assigned couples calendar events"
  ON "Couples_calendar_events" FOR SELECT
  USING (couple_id IN (SELECT id FROM couples WHERE therapist_id = auth.uid()));

CREATE POLICY "Couple members can create calendar events"
  ON "Couples_calendar_events" FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Couple members can update calendar events"
  ON "Couples_calendar_events" FOR UPDATE
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own calendar events"
  ON "Couples_calendar_events" FOR DELETE
  USING (created_by = auth.uid());

-- Couples_tool_entries
CREATE TABLE IF NOT EXISTS "Couples_tool_entries" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('pause', 'echo', 'holdme', 'checkin', 'four_horsemen')),
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "Couples_tool_entries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple members can view tool entries"
  ON "Couples_tool_entries" FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Therapist can view assigned couples tool entries"
  ON "Couples_tool_entries" FOR SELECT
  USING (couple_id IN (SELECT id FROM couples WHERE therapist_id = auth.uid()));

CREATE POLICY "Couple members can create tool entries"
  ON "Couples_tool_entries" FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()) AND user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gratitude_logs_couple ON "Couples_gratitude_logs"(couple_id);
CREATE INDEX IF NOT EXISTS idx_gratitude_logs_created ON "Couples_gratitude_logs"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_couple ON "Couples_journal_entries"(couple_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created ON "Couples_journal_entries"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rituals_couple ON "Couples_rituals"(couple_id);
CREATE INDEX IF NOT EXISTS idx_rituals_active ON "Couples_rituals"(is_active);
CREATE INDEX IF NOT EXISTS idx_date_nights_couple ON "Couples_date_nights"(couple_id);
CREATE INDEX IF NOT EXISTS idx_weekly_checkins_couple ON "Couples_weekly_checkins"(couple_id);
CREATE INDEX IF NOT EXISTS idx_weekly_checkins_created ON "Couples_weekly_checkins"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_couple ON "Couples_calendar_events"(couple_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON "Couples_calendar_events"(start_time);
CREATE INDEX IF NOT EXISTS idx_tool_entries_couple ON "Couples_tool_entries"(couple_id);
CREATE INDEX IF NOT EXISTS idx_tool_entries_type ON "Couples_tool_entries"(tool_type);
