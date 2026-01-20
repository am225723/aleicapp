import { supabase } from "@/lib/supabase";

export interface DateNight {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  description?: string | null;
  is_saved: boolean;
  planned_date?: string | null;
  created_at: string;
}

export interface CreateDateNightInput {
  couple_id: string;
  title: string;
  description?: string;
  is_saved?: boolean;
  planned_date?: string;
}

export interface UpdateDateNightInput {
  title?: string;
  description?: string;
  is_saved?: boolean;
  planned_date?: string;
}

export async function listDateNights(coupleId: string): Promise<DateNight[]> {
  const { data, error } = await supabase
    .from("Couples_date_nights")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching date nights:", error);
    throw error;
  }

  return data || [];
}

export async function createDateNight(input: CreateDateNightInput): Promise<DateNight> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("Couples_date_nights")
    .insert({
      couple_id: input.couple_id,
      created_by: userData.user.id,
      title: input.title,
      description: input.description || null,
      is_saved: input.is_saved || false,
      planned_date: input.planned_date || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating date night:", error);
    throw error;
  }

  return data;
}

export async function updateDateNight(id: string, input: UpdateDateNightInput): Promise<DateNight> {
  const { data, error } = await supabase
    .from("Couples_date_nights")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating date night:", error);
    throw error;
  }

  return data;
}

export async function deleteDateNight(id: string): Promise<void> {
  const { error } = await supabase
    .from("Couples_date_nights")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting date night:", error);
    throw error;
  }
}
