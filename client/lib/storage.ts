import AsyncStorage from "@react-native-async-storage/async-storage";

const COUPLES_KEY = "couples_data";
const INVITES_KEY = "invites_data";
const TOOL_ENTRIES_KEY = "tool_entries_data";

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

/**
 * Generic storage for tool usage/history (Echo Empathy, Hold Me Tight, etc.)
 * Keep it flexible so screens can store whatever payload they need.
 */
export interface ToolEntry {
  id: string;
  tool: string; // e.g. "echo-empathy", "hold-me-tight"
  therapistId?: string;
  coupleId?: string;
  payload: Record<string, any>;
  createdAt: string;
}

function generateId(): string {
  // substr is deprecated-ish, but fine; keeping minimal change.
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function getItems<T>(key: string): Promise<T[]> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? (JSON.parse(data) as T[]) : [];
  } catch {
    return [];
  }
}

async function setItems<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

// Couples
export async function getCouples(): Promise<CoupleData[]> {
  return await getItems<CoupleData>(COUPLES_KEY);
}

export async function addCouple(
  couple: Omit<CoupleData, "id" | "createdAt" | "lastActive">,
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

// Invites
export async function getInvites(therapistId?: string): Promise<Invite[]> {
  const invites = await getItems<Invite>(INVITES_KEY);
  return therapistId ? invites.filter((i) => i.therapistId === therapistId) : invites;
}

export async function addInvite(
  invite: Omit<Invite, "id" | "createdAt" | "code">,
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

// Tool entries
export async function getToolEntries(filter?: {
  tool?: string;
  coupleId?: string;
  therapistId?: string;
}): Promise<ToolEntry[]> {
  const entries = await getItems<ToolEntry>(TOOL_ENTRIES_KEY);
  if (!filter) return entries;

  return entries.filter((e) => {
    if (filter.tool && e.tool !== filter.tool) return false;
    if (filter.coupleId && e.coupleId !== filter.coupleId) return false;
    if (filter.therapistId && e.therapistId !== filter.therapistId) return false;
    return true;
  });
}

export async function addToolEntry(
  entry: Omit<ToolEntry, "id" | "createdAt">,
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

// Nuke everything 😄
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([COUPLES_KEY, INVITES_KEY, TOOL_ENTRIES_KEY]);
}