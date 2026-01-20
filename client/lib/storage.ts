import AsyncStorage from "@react-native-async-storage/async-storage";

const COUPLES_KEY = "couples_data";
const INVITES_KEY = "invites_data";

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
    COUPLES_KEY,
    INVITES_KEY,
  ]);
}
