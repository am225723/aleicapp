import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export type UserRole = "couple" | "therapist";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  partnerId?: string;
  partnerName?: string;
  therapistId?: string;
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return await AsyncStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveAuthToken(token: string): Promise<void> {
  await setItem(AUTH_TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await getItem(AUTH_TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await deleteItem(AUTH_TOKEN_KEY);
}

export async function saveUser(user: User): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  const userData = await getItem(USER_KEY);
  if (userData) {
    try {
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  }
  return null;
}

export async function clearUser(): Promise<void> {
  await deleteItem(USER_KEY);
}

export async function logout(): Promise<void> {
  await clearAuthToken();
  await clearUser();
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return token !== null;
}
