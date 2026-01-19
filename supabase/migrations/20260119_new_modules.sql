-- Voice Memos Table (with Supabase Storage for audio)
CREATE TABLE IF NOT EXISTS voice_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  storage_path TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  ai_sentiment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE voice_memos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their couple's voice memos"
  ON voice_memos FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create voice memos for their couple"
  ON voice_memos FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own voice memos"
  ON voice_memos FOR DELETE
  USING (user_id = auth.uid());

-- Shared Goals Table
CREATE TABLE IF NOT EXISTS shared_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'completed')),
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shared_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their couple's goals"
  ON shared_goals FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create goals for their couple"
  ON shared_goals FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their couple's goals"
  ON shared_goals FOR UPDATE
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their couple's goals"
  ON shared_goals FOR DELETE
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

-- Demon Dialogues Table (EFT negative patterns)
CREATE TABLE IF NOT EXISTS demon_dialogues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('pursue_withdraw', 'withdraw_withdraw', 'attack_attack')),
  trigger_situation TEXT NOT NULL,
  my_reaction TEXT,
  partner_reaction TEXT,
  underlying_feeling TEXT,
  attachment_need TEXT,
  alternative_response TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE demon_dialogues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their couple's demon dialogues"
  ON demon_dialogues FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create demon dialogues"
  ON demon_dialogues FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

-- Attachment Assessment Results
CREATE TABLE IF NOT EXISTS attachment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  attachment_style TEXT NOT NULL CHECK (attachment_style IN ('secure', 'anxious', 'avoidant', 'fearful')),
  scores JSONB NOT NULL,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE attachment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attachment results"
  ON attachment_results FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view partner's attachment results"
  ON attachment_results FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create their own attachment results"
  ON attachment_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Enneagram Assessment Results
CREATE TABLE IF NOT EXISTS enneagram_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  primary_type INTEGER NOT NULL CHECK (primary_type >= 1 AND primary_type <= 9),
  wing INTEGER CHECK (wing >= 1 AND wing <= 9),
  scores JSONB NOT NULL,
  answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE enneagram_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enneagram results"
  ON enneagram_results FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view partner's enneagram results"
  ON enneagram_results FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create their own enneagram results"
  ON enneagram_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- IFS Sessions (Internal Family Systems)
CREATE TABLE IF NOT EXISTS ifs_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('self_exploration', 'parts_mapping', 'dialogue')),
  parts_identified JSONB,
  core_self_notes TEXT,
  insights TEXT,
  action_items TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ifs_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own IFS sessions"
  ON ifs_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own IFS sessions"
  ON ifs_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Intimacy Mapping
CREATE TABLE IF NOT EXISTS intimacy_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('emotional', 'physical', 'intellectual', 'spiritual', 'recreational')),
  preferences JSONB NOT NULL,
  boundaries JSONB,
  desires JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE intimacy_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their couple's intimacy maps"
  ON intimacy_maps FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create intimacy maps"
  ON intimacy_maps FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own intimacy maps"
  ON intimacy_maps FOR UPDATE
  USING (user_id = auth.uid());

-- Love Map Results (Gottman)
CREATE TABLE IF NOT EXISTS love_map_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB NOT NULL,
  areas_to_explore JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE love_map_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their couple's love map results"
  ON love_map_results FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create love map results"
  ON love_map_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Meditation Progress
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  meditation_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meditation sessions"
  ON meditation_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create meditation sessions"
  ON meditation_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Parenting Topics
CREATE TABLE IF NOT EXISTS parenting_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  my_perspective TEXT,
  partner_perspective TEXT,
  agreed_approach TEXT,
  action_items JSONB,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_discussion', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE parenting_discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their couple's parenting discussions"
  ON parenting_discussions FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create parenting discussions"
  ON parenting_discussions FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their couple's parenting discussions"
  ON parenting_discussions FOR UPDATE
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

-- Financial Entries
CREATE TABLE IF NOT EXISTS financial_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL CHECK (topic IN ('budget', 'savings', 'debt', 'goals', 'spending', 'investments', 'other')),
  title TEXT NOT NULL,
  notes TEXT,
  decisions JSONB,
  action_items JSONB,
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE financial_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their couple's financial conversations"
  ON financial_conversations FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create financial conversations"
  ON financial_conversations FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their couple's financial conversations"
  ON financial_conversations FOR UPDATE
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

-- Values & Vision
CREATE TABLE IF NOT EXISTS values_vision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('core_values', 'life_vision', 'relationship_vision', 'family_vision', 'career_vision')),
  content TEXT NOT NULL,
  shared BOOLEAN DEFAULT FALSE,
  partner_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE values_vision ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their couple's values vision"
  ON values_vision FOR SELECT
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create values vision entries"
  ON values_vision FOR INSERT
  WITH CHECK (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update values vision entries"
  ON values_vision FOR UPDATE
  USING (couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()));

-- Therapist Messages (with realtime support)
CREATE TABLE IF NOT EXISTS therapist_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('therapist', 'client')),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE therapist_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view messages for their couples"
  ON therapist_messages FOR SELECT
  USING (
    couple_id IN (SELECT id FROM couples WHERE therapist_id = auth.uid())
    OR couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Therapists can send messages to their couples"
  ON therapist_messages FOR INSERT
  WITH CHECK (
    (sender_role = 'therapist' AND couple_id IN (SELECT id FROM couples WHERE therapist_id = auth.uid()))
    OR (sender_role = 'client' AND couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Users can mark messages as read"
  ON therapist_messages FOR UPDATE
  USING (
    couple_id IN (SELECT couple_id FROM profiles WHERE id = auth.uid())
    OR couple_id IN (SELECT id FROM couples WHERE therapist_id = auth.uid())
  );

-- Enable realtime for therapist_messages
ALTER PUBLICATION supabase_realtime ADD TABLE therapist_messages;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_memos_couple ON voice_memos(couple_id);
CREATE INDEX IF NOT EXISTS idx_shared_goals_couple ON shared_goals(couple_id);
CREATE INDEX IF NOT EXISTS idx_shared_goals_status ON shared_goals(status);
CREATE INDEX IF NOT EXISTS idx_demon_dialogues_couple ON demon_dialogues(couple_id);
CREATE INDEX IF NOT EXISTS idx_therapist_messages_couple ON therapist_messages(couple_id);
CREATE INDEX IF NOT EXISTS idx_therapist_messages_created ON therapist_messages(created_at);
