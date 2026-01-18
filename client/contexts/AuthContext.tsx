import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getUser, saveUser, logout as authLogout, saveAuthToken } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const savedUser = await getUser();
      setUser(savedUser);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(userData: User, token: string) {
    await saveAuthToken(token);
    await saveUser(userData);
    setUser(userData);
  }

  async function logout() {
    await authLogout();
    setUser(null);
  }

  async function updateUser(updates: Partial<User>) {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await saveUser(updatedUser);
      setUser(updatedUser);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
