import { supabase } from "@/lib/supabase";

export interface JournalEntry {
  id: string;
  couple_id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string | null;
  audio_url?: string | null;
  created_at: string;
}

export interface CreateJournalInput {
  couple_id: string;
  title: string;
  content: string;
  image_url?: string;
  audio_url?: string;
}

export async function listJournalEntries(coupleId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from("Couples_journal_entries")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }

  return data || [];
}

export async function createJournalEntry(input: CreateJournalInput): Promise<JournalEntry> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("Couples_journal_entries")
    .insert({
      couple_id: input.couple_id,
      user_id: userData.user.id,
      title: input.title,
      content: input.content,
      image_url: input.image_url || null,
      audio_url: input.audio_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating journal entry:", error);
    throw error;
  }

  return data;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from("Couples_journal_entries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
}
