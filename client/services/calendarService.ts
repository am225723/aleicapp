import { supabase } from "@/lib/supabase";

export interface CalendarEvent {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time?: string | null;
  location?: string | null;
  event_type: string;
  is_recurring: boolean;
  recurrence_rule?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarEventInput {
  couple_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  event_type?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
}

export interface UpdateCalendarEventInput {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  event_type?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
}

export async function listCalendarEvents(coupleId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("Couples_calendar_events")
    .select("*")
    .eq("couple_id", coupleId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }

  return data || [];
}

export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("Couples_calendar_events")
    .insert({
      couple_id: input.couple_id,
      created_by: userData.user.id,
      title: input.title,
      description: input.description || null,
      start_time: input.start_time,
      end_time: input.end_time || null,
      location: input.location || null,
      event_type: input.event_type || "general",
      is_recurring: input.is_recurring || false,
      recurrence_rule: input.recurrence_rule || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }

  return data;
}

export async function updateCalendarEvent(id: string, input: UpdateCalendarEventInput): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from("Couples_calendar_events")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating calendar event:", error);
    throw error;
  }

  return data;
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from("Couples_calendar_events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting calendar event:", error);
    throw error;
  }
}
