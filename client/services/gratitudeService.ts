import { supabase } from "@/lib/supabase";

export interface GratitudeLog {
  id: string;
  couple_id: string;
  user_id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
}

export interface CreateGratitudeInput {
  couple_id: string;
  content: string;
  image_url?: string;
}

export async function listGratitudeLogs(coupleId: string): Promise<GratitudeLog[]> {
  const { data, error } = await supabase
    .from("Couples_gratitude_logs")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gratitude logs:", error);
    throw error;
  }

  return data || [];
}

export async function createGratitudeLog(input: CreateGratitudeInput): Promise<GratitudeLog> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("Couples_gratitude_logs")
    .insert({
      couple_id: input.couple_id,
      user_id: userData.user.id,
      content: input.content,
      image_url: input.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating gratitude log:", error);
    throw error;
  }

  return data;
}

export async function deleteGratitudeLog(id: string): Promise<void> {
  const { error } = await supabase
    .from("Couples_gratitude_logs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting gratitude log:", error);
    throw error;
  }
}
