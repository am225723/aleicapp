import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Session, User, AuthError } from "@supabase/supabase-js";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

const CREDENTIALS_KEY = "aleic_biometric_credentials";
const BIOMETRIC_ENABLED_KEY = "aleic_biometric_enabled";

interface BiometricCredentials {
  email: string;
  password: string;
}

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
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  biometricType: LocalAuthentication.AuthenticationType | null;
  enableBiometric: (email: string, password: string) => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  signInWithBiometric: () => Promise<{ error: AuthError | null }>;
  getBiometricTypeName: () => string;
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
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType | null>(null);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const available = hasHardware && isEnrolled;
      setIsBiometricAvailable(available);

      if (available) {
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.length > 0) {
          if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
          } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType(LocalAuthentication.AuthenticationType.FINGERPRINT);
          } else {
            setBiometricType(supportedTypes[0]);
          }
        }
      }

      const enabledStatus = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      setIsBiometricEnabled(enabledStatus === "true" && available);
    } catch (error) {
      console.log("Error checking biometric support:", error);
      setIsBiometricAvailable(false);
    }
  };

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

  const enableBiometric = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!isBiometricAvailable) return false;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const credentials: BiometricCredentials = { email, password };
        await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(credentials));
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
        setIsBiometricEnabled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error enabling biometric:", error);
      return false;
    }
  }, [isBiometricAvailable]);

  const disableBiometric = useCallback(async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      setIsBiometricEnabled(false);
    } catch (error) {
      console.log("Error disabling biometric:", error);
    }
  }, []);

  const signInWithBiometric = useCallback(async (): Promise<{ error: AuthError | null }> => {
    if (!isBiometricAvailable || !isBiometricEnabled) {
      return { error: { message: "Biometric not available or enabled", name: "BiometricError" } as AuthError };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in to ALEIC",
        cancelLabel: "Use Password",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const storedCredentials = await SecureStore.getItemAsync(CREDENTIALS_KEY);
        if (storedCredentials) {
          const credentials = JSON.parse(storedCredentials) as BiometricCredentials;
          return await signIn(credentials.email, credentials.password);
        }
        return { error: { message: "No stored credentials found", name: "CredentialsError" } as AuthError };
      }
      return { error: { message: result.error || "Biometric authentication failed", name: "BiometricError" } as AuthError };
    } catch (error) {
      console.log("Error authenticating with biometric:", error);
      return { error: { message: "Biometric authentication failed", name: "BiometricError" } as AuthError };
    }
  }, [isBiometricAvailable, isBiometricEnabled, signIn]);

  const getBiometricTypeName = useCallback((): string => {
    if (Platform.OS === "ios") {
      if (biometricType === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
        return "Face ID";
      }
      return "Touch ID";
    }
    if (biometricType === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
      return "Face Recognition";
    }
    return "Fingerprint";
  }, [biometricType]);

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
        isBiometricAvailable,
        isBiometricEnabled,
        biometricType,
        enableBiometric,
        disableBiometric,
        signInWithBiometric,
        getBiometricTypeName,
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
