import AsyncStorage from "@react-native-async-storage/async-storage";

const TOOL_ENTRIES_KEY = "tool_entries";
const GRATITUDE_ENTRIES_KEY = "gratitude_entries";
const JOURNAL_ENTRIES_KEY = "journal_entries";
const RITUALS_KEY = "rituals";
const DATE_NIGHTS_KEY = "date_nights";
const WEEKLY_CHECKINS_KEY = "weekly_checkins";
const COUPLES_KEY = "couples_data";
const INVITES_KEY = "invites_data";

export interface ToolEntry {
  id: string;
  coupleId: string;
  toolType: "pause" | "echo" | "holdme" | "checkin";
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface GratitudeEntry {
  id: string;
  coupleId: string;
  content: string;
  imageUri?: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

export interface JournalEntry {
  id: string;
  coupleId: string;
  title: string;
  content: string;
  imageUri?: string;
  audioUri?: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

export interface Ritual {
  id: string;
  coupleId: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  time?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DateNight {
  id: string;
  coupleId: string;
  title: string;
  description: string;
  isSaved: boolean;
  plannedDate?: string;
  createdAt: string;
}

export interface WeeklyCheckin {
  id: string;
  coupleId: string;
  authorId: string;
  authorName: string;
  connectionRating: number;
  communicationRating: number;
  intimacyRating: number;
  notes: string;
  createdAt: string;
}

export interface CoupleData {
  id: string;
  partner1Name: string;
  partner2Name: string;
  therapistId?: string;
  lastActive: string;
  createdAt: string;
}

export interface Invite {
  id: string;
  code: string;
  therapistId: string;
  coupleId?: string;
  expiresAt: string;
  usedBy?: string;
  createdAt: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function getItems<T>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function setItems<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

export async function getToolEntries(coupleId?: string): Promise<ToolEntry[]> {
  const entries = await getItems<ToolEntry>(TOOL_ENTRIES_KEY);
  if (coupleId) {
    return entries.filter((e) => e.coupleId === coupleId);
  }
  return entries;
}

export async function addToolEntry(
  entry: Omit<ToolEntry, "id" | "createdAt">
): Promise<ToolEntry> {
  const entries = await getItems<ToolEntry>(TOOL_ENTRIES_KEY);
  const newEntry: ToolEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  entries.unshift(newEntry);
  await setItems(TOOL_ENTRIES_KEY, entries);
  return newEntry;
}

export async function getGratitudeEntries(
  coupleId?: string
): Promise<GratitudeEntry[]> {
  const entries = await getItems<GratitudeEntry>(GRATITUDE_ENTRIES_KEY);
  if (coupleId) {
    return entries.filter((e) => e.coupleId === coupleId);
  }
  return entries;
}

export async function addGratitudeEntry(
  entry: Omit<GratitudeEntry, "id" | "createdAt">
): Promise<GratitudeEntry> {
  const entries = await getItems<GratitudeEntry>(GRATITUDE_ENTRIES_KEY);
  const newEntry: GratitudeEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  entries.unshift(newEntry);
  await setItems(GRATITUDE_ENTRIES_KEY, entries);
  return newEntry;
}

export async function getJournalEntries(
  coupleId?: string
): Promise<JournalEntry[]> {
  const entries = await getItems<JournalEntry>(JOURNAL_ENTRIES_KEY);
  if (coupleId) {
    return entries.filter((e) => e.coupleId === coupleId);
  }
  return entries;
}

export async function addJournalEntry(
  entry: Omit<JournalEntry, "id" | "createdAt">
): Promise<JournalEntry> {
  const entries = await getItems<JournalEntry>(JOURNAL_ENTRIES_KEY);
  const newEntry: JournalEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  entries.unshift(newEntry);
  await setItems(JOURNAL_ENTRIES_KEY, entries);
  return newEntry;
}

export async function getRituals(coupleId?: string): Promise<Ritual[]> {
  const rituals = await getItems<Ritual>(RITUALS_KEY);
  if (coupleId) {
    return rituals.filter((r) => r.coupleId === coupleId);
  }
  return rituals;
}

export async function addRitual(
  ritual: Omit<Ritual, "id" | "createdAt">
): Promise<Ritual> {
  const rituals = await getItems<Ritual>(RITUALS_KEY);
  const newRitual: Ritual = {
    ...ritual,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  rituals.unshift(newRitual);
  await setItems(RITUALS_KEY, rituals);
  return newRitual;
}

export async function updateRitual(
  id: string,
  updates: Partial<Ritual>
): Promise<Ritual | null> {
  const rituals = await getItems<Ritual>(RITUALS_KEY);
  const index = rituals.findIndex((r) => r.id === id);
  if (index !== -1) {
    rituals[index] = { ...rituals[index], ...updates };
    await setItems(RITUALS_KEY, rituals);
    return rituals[index];
  }
  return null;
}

export async function deleteRitual(id: string): Promise<void> {
  const rituals = await getItems<Ritual>(RITUALS_KEY);
  const filtered = rituals.filter((r) => r.id !== id);
  await setItems(RITUALS_KEY, filtered);
}

export async function getDateNights(coupleId?: string): Promise<DateNight[]> {
  const dateNights = await getItems<DateNight>(DATE_NIGHTS_KEY);
  if (coupleId) {
    return dateNights.filter((d) => d.coupleId === coupleId);
  }
  return dateNights;
}

export async function addDateNight(
  dateNight: Omit<DateNight, "id" | "createdAt">
): Promise<DateNight> {
  const dateNights = await getItems<DateNight>(DATE_NIGHTS_KEY);
  const newDateNight: DateNight = {
    ...dateNight,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  dateNights.unshift(newDateNight);
  await setItems(DATE_NIGHTS_KEY, dateNights);
  return newDateNight;
}

export async function updateDateNight(
  id: string,
  updates: Partial<DateNight>
): Promise<DateNight | null> {
  const dateNights = await getItems<DateNight>(DATE_NIGHTS_KEY);
  const index = dateNights.findIndex((d) => d.id === id);
  if (index !== -1) {
    dateNights[index] = { ...dateNights[index], ...updates };
    await setItems(DATE_NIGHTS_KEY, dateNights);
    return dateNights[index];
  }
  return null;
}

export async function getWeeklyCheckins(
  coupleId?: string
): Promise<WeeklyCheckin[]> {
  const checkins = await getItems<WeeklyCheckin>(WEEKLY_CHECKINS_KEY);
  if (coupleId) {
    return checkins.filter((c) => c.coupleId === coupleId);
  }
  return checkins;
}

export async function addWeeklyCheckin(
  checkin: Omit<WeeklyCheckin, "id" | "createdAt">
): Promise<WeeklyCheckin> {
  const checkins = await getItems<WeeklyCheckin>(WEEKLY_CHECKINS_KEY);
  const newCheckin: WeeklyCheckin = {
    ...checkin,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  checkins.unshift(newCheckin);
  await setItems(WEEKLY_CHECKINS_KEY, checkins);
  return newCheckin;
}

export async function getCouples(): Promise<CoupleData[]> {
  return await getItems<CoupleData>(COUPLES_KEY);
}

export async function addCouple(
  couple: Omit<CoupleData, "id" | "createdAt" | "lastActive">
): Promise<CoupleData> {
  const couples = await getItems<CoupleData>(COUPLES_KEY);
  const newCouple: CoupleData = {
    ...couple,
    id: generateId(),
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  couples.unshift(newCouple);
  await setItems(COUPLES_KEY, couples);
  return newCouple;
}

export async function getInvites(therapistId?: string): Promise<Invite[]> {
  const invites = await getItems<Invite>(INVITES_KEY);
  if (therapistId) {
    return invites.filter((i) => i.therapistId === therapistId);
  }
  return invites;
}

export async function addInvite(
  invite: Omit<Invite, "id" | "createdAt" | "code">
): Promise<Invite> {
  const invites = await getItems<Invite>(INVITES_KEY);
  const newInvite: Invite = {
    ...invite,
    id: generateId(),
    code: Math.random().toString(36).substr(2, 8).toUpperCase(),
    createdAt: new Date().toISOString(),
  };
  invites.unshift(newInvite);
  await setItems(INVITES_KEY, invites);
  return newInvite;
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    TOOL_ENTRIES_KEY,
    GRATITUDE_ENTRIES_KEY,
    JOURNAL_ENTRIES_KEY,
    RITUALS_KEY,
    DATE_NIGHTS_KEY,
    WEEKLY_CHECKINS_KEY,
    COUPLES_KEY,
    INVITES_KEY,
  ]);
}
