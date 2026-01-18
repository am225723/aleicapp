export type UserRole = "client" | "therapist";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole | null;
  couple_id: string | null;
  therapist_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyCheckin {
  id: number;
  couple_id: string;
  user_id: string;
  week_start_date: string;
  is_private: boolean;
  mood_rating: number;
  connection_rating: number;
  stress_level: number;
  reflection: string;
  created_at: string;
}

export interface GratitudeEntry {
  id: number;
  couple_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_name?: string;
}

export interface LoveLanguageResult {
  id: number;
  user_id: string;
  couple_id: string;
  words_of_affirmation: number;
  quality_time: number;
  receiving_gifts: number;
  acts_of_service: number;
  physical_touch: number;
  primary_language: string;
  secondary_language: string;
  created_at: string;
}

export interface Message {
  id: number;
  couple_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

export interface VoiceMemo {
  id: number;
  couple_id: string;
  user_id: string;
  title: string;
  audio_url: string;
  duration_seconds: number;
  transcript?: string;
  ai_sentiment?: {
    summary?: string;
    mood?: string;
  };
  created_at: string;
}

export interface SharedGoal {
  id: number;
  couple_id: string;
  title: string;
  description?: string;
  status: "backlog" | "in_progress" | "completed";
  target_date?: string;
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  couple_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_by: string;
  created_at: string;
}

export interface Ritual {
  id: number;
  couple_id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  last_completed?: string;
  created_at: string;
}

export interface CoupleJournalEntry {
  id: number;
  couple_id: string;
  user_id: string;
  title: string;
  content: string;
  privacy_level: "private" | "partner" | "therapist";
  mood?: string;
  media_urls?: string[];
  created_at: string;
}

export interface AttachmentResult {
  id: number;
  user_id: string;
  couple_id: string;
  attachment_style: string;
  score?: number;
  dynamics_with_partner?: string;
  triggers?: string[];
  repair_strategies?: string[];
  created_at: string;
}

export interface EnneagramResult {
  id: number;
  user_id: string;
  couple_id: string;
  dominant_type: number;
  secondary_type?: number;
  created_at: string;
}

export interface InvitationCode {
  id: number;
  code: string;
  therapist_id: string;
  couple_id?: string;
  used: boolean;
  created_at: string;
  expires_at?: string;
}

export interface ConflictSession {
  id: string;
  user_id: string;
  couple_id: string;
  input_mode: "express" | "structured";
  free_text?: string;
  feeling: string;
  situation: string;
  because: string;
  request: string;
  firmness: number;
  enhanced_statement?: string;
  impact_preview?: string;
  ai_suggestions?: string[];
  title?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
