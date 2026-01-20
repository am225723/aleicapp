import { supabase } from "@/lib/supabase";

export interface ToolEntry {
  id: string;
  couple_id: string;
  user_id: string;
  tool_type: "pause" | "echo" | "holdme" | "checkin" | "four_horsemen";
  payload: Record<string, unknown>;
  created_at: string;
}

export interface CreateToolEntryInput {
  couple_id: string;
  tool_type: "pause" | "echo" | "holdme" | "checkin" | "four_horsemen";
  payload: Record<string, unknown>;
}

export async function listToolEntries(coupleId: string): Promise<ToolEntry[]> {
  const { data, error } = await supabase
    .from("Couples_tool_entries")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tool entries:", error);
    throw error;
  }

  return data || [];
}

export async function listToolEntriesByType(coupleId: string, toolType: string): Promise<ToolEntry[]> {
  const { data, error } = await supabase
    .from("Couples_tool_entries")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("tool_type", toolType)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tool entries by type:", error);
    throw error;
  }

  return data || [];
}

export async function createToolEntry(input: CreateToolEntryInput): Promise<ToolEntry> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("Couples_tool_entries")
    .insert({
      couple_id: input.couple_id,
      user_id: userData.user.id,
      tool_type: input.tool_type,
      payload: input.payload,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating tool entry:", error);
    throw error;
  }

  return data;
}
