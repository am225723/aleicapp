-- Migration for missing screens tables
-- Created: 2026-01-20

-- Couples_moods table for MoodTrackerScreen
CREATE TABLE IF NOT EXISTS Couples_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL,
  mood_int INTEGER NOT NULL CHECK (mood_int >= 1 AND mood_int <= 10),
  notes TEXT
);

ALTER TABLE Couples_moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own moods" ON Couples_moods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their couple moods" ON Couples_moods
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

-- user_settings table for SettingsScreen
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB DEFAULT '{}',
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  share_checkins BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- compatibility_results table for CompatibilityScreen
CREATE TABLE IF NOT EXISTS compatibility_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  couple_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  scores JSONB DEFAULT '{}',
  summary TEXT
);

ALTER TABLE compatibility_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own compatibility results" ON compatibility_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their couple compatibility results" ON compatibility_results
  FOR SELECT USING (
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

-- daily_suggestions table for DailySuggestionScreen
CREATE TABLE IF NOT EXISTS daily_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  couple_id UUID NOT NULL,
  suggestion TEXT NOT NULL,
  steps JSONB DEFAULT '[]',
  is_saved BOOLEAN DEFAULT false
);

ALTER TABLE daily_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their couple suggestions" ON daily_suggestions
  FOR ALL USING (
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

-- Couples_chores table for ChoreChartScreen
CREATE TABLE IF NOT EXISTS Couples_chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  couple_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly'))
);

ALTER TABLE Couples_chores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their couple chores" ON Couples_chores
  FOR ALL USING (
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

-- user_roles table for Admin functionality
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'therapist', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update roles" ON user_roles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_couples_moods_couple_id ON Couples_moods(couple_id);
CREATE INDEX IF NOT EXISTS idx_couples_moods_user_id ON Couples_moods(user_id);
CREATE INDEX IF NOT EXISTS idx_couples_moods_created_at ON Couples_moods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_results_couple_id ON compatibility_results(couple_id);
CREATE INDEX IF NOT EXISTS idx_daily_suggestions_couple_id ON daily_suggestions(couple_id);
CREATE INDEX IF NOT EXISTS idx_couples_chores_couple_id ON Couples_chores(couple_id);
CREATE INDEX IF NOT EXISTS idx_couples_chores_status ON Couples_chores(status);
