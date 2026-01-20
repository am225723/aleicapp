import { supabase } from "@/lib/supabase";

export interface Ritual {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  description?: string | null;
  frequency: "daily" | "weekly" | "monthly";
  scheduled_time?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRitualInput {
  couple_id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  scheduled_time?: string;
}

export interface UpdateRitualInput {
  title?: string;
  description?: string;
  frequency?: "daily" | "weekly" | "monthly";
  scheduled_time?: string;
  is_active?: boolean;
}

export async function listRituals(coupleId: string): Promise<Ritual[]> {
  const { data, error } = await supabase
    .from("Couples_rituals")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rituals:", error);
    throw error;
  }

  return data || [];
}

export async function createRitual(input: CreateRitualInput): Promise<Ritual> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("Couples_rituals")
    .insert({
      couple_id: input.couple_id,
      created_by: userData.user.id,
      title: input.title,
      description: input.description || null,
      frequency: input.frequency,
      scheduled_time: input.scheduled_time || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating ritual:", error);
    throw error;
  }

  return data;
}

export async function updateRitual(id: string, input: UpdateRitualInput): Promise<Ritual> {
  const { data, error } = await supabase
    .from("Couples_rituals")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating ritual:", error);
    throw error;
  }

  return data;
}

export async function deleteRitual(id: string): Promise<void> {
  const { error } = await supabase
    .from("Couples_rituals")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting ritual:", error);
    throw error;
  }
}
