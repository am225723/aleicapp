import { supabase } from "@/lib/supabase";

export interface WeeklyCheckin {
  id: string;
  couple_id: string;
  user_id: string;
  connection_rating: number;
  communication_rating: number;
  intimacy_rating: number;
  notes?: string | null;
  created_at: string;
}

export interface CreateWeeklyCheckinInput {
  couple_id: string;
  connection_rating: number;
  communication_rating: number;
  intimacy_rating: number;
  notes?: string;
}

export async function listWeeklyCheckins(coupleId: string): Promise<WeeklyCheckin[]> {
  const { data, error } = await supabase
    .from("Couples_weekly_checkins")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching weekly checkins:", error);
    throw error;
  }

  return data || [];
}

export async function createWeeklyCheckin(input: CreateWeeklyCheckinInput): Promise<WeeklyCheckin> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("Couples_weekly_checkins")
    .insert({
      couple_id: input.couple_id,
      user_id: userData.user.id,
      connection_rating: input.connection_rating,
      communication_rating: input.communication_rating,
      intimacy_rating: input.intimacy_rating,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating weekly checkin:", error);
    throw error;
  }

  return data;
}
