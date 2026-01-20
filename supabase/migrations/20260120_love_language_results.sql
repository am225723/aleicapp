-- Love Language Results Table
-- This migration creates the table for storing love language quiz results

CREATE TABLE IF NOT EXISTS "love_language_results" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL,
  couple_id UUID NULL,
  primary_language TEXT NOT NULL,
  secondary_language TEXT NULL,
  scores JSONB NOT NULL,
  answers JSONB NULL
);

CREATE INDEX IF NOT EXISTS idx_love_language_results_user_id ON love_language_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_love_language_results_couple_id ON love_language_results(couple_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE love_language_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own results
CREATE POLICY "Users can insert own love language results"
  ON love_language_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own results
CREATE POLICY "Users can view own love language results"
  ON love_language_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can view partner results (same couple_id)
CREATE POLICY "Users can view partner love language results"
  ON love_language_results
  FOR SELECT
  USING (
    couple_id IS NOT NULL AND
    couple_id IN (
      SELECT couple_id FROM profiles WHERE id = auth.uid()
    )
  );
