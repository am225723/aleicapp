import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "client" | "therapist";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole | null;
  couple_id: string | null;
  therapist_id: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData: { full_name: string; role: UserRole }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_TIMEOUT = 8000;

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (isMounted && isLoading) {
            console.log("Auth initialization timed out, proceeding without session");
            setIsLoading(false);
          }
        }, AUTH_TIMEOUT);

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.log("Error getting session:", { message: error.message, code: (error as any).code, details: (error as any).details });
          setIsLoading(false);
          return;
        }

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id, initialSession.user.email);
        } else {
          setIsLoading(false);
        }
        clearTimeout(timeoutId);

    } catch (error) {
        console.log("Auth initialization error:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from("Couples_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const userEmail = email || user?.email || session?.user?.email || "";
          const newProfile: Partial<Profile> = {
            id: userId,
            email: userEmail,
            full_name: null,
            role: null,
            couple_id: null,
            therapist_id: null,
            avatar_url: null,
          };
          
          const { data: insertedProfile, error: insertError } = await supabase
            .from("Couples_profiles")
            .insert([newProfile])
            .select()
            .single();

          if (!insertError && insertedProfile) {
            setProfile(insertedProfile);
          }
        } else {
          console.log("Error fetching profile:", { message: error.message, code: (error as any).code, details: (error as any).details, hint: (error as any).hint });
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.log("Error in fetchProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setIsLoading(false);
    }
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; role: UserRole }
  ) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (!error && data.user) {
      const newProfile = {
        id: data.user.id,
        email: email,
        full_name: userData.full_name,
        role: userData.role,
        couple_id: null,
        therapist_id: null,
        avatar_url: null,
      };

      await supabase.from("Couples_profiles").upsert([newProfile]);
    }

    if (error) {
      setIsLoading(false);
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isAuthenticated: session !== null,
        signIn,
        signUp,
        signOut,
        refreshProfile,
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
