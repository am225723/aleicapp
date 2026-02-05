import { useState, useEffect, useCallback } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const CREDENTIALS_KEY = "aleic_biometric_credentials";
const BIOMETRIC_ENABLED_KEY = "aleic_biometric_enabled";

interface BiometricCredentials {
  email: string;
  password: string;
}

interface UseBiometricAuthReturn {
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  biometricType: LocalAuthentication.AuthenticationType | null;
  isCheckingBiometric: boolean;
  enableBiometric: (email: string, password: string) => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<BiometricCredentials | null>;
  getBiometricTypeName: () => string;
}

export function useBiometricAuth(): UseBiometricAuthReturn {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType | null>(null);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(true);

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
    } finally {
      setIsCheckingBiometric(false);
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

  const authenticateWithBiometric = useCallback(async (): Promise<BiometricCredentials | null> => {
    if (!isBiometricAvailable || !isBiometricEnabled) return null;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in to ALEIC",
        cancelLabel: "Use Password",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const storedCredentials = await SecureStore.getItemAsync(CREDENTIALS_KEY);
        if (storedCredentials) {
          return JSON.parse(storedCredentials) as BiometricCredentials;
        }
      }
      return null;
    } catch (error) {
      console.log("Error authenticating with biometric:", error);
      return null;
    }
  }, [isBiometricAvailable, isBiometricEnabled]);

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

  return {
    isBiometricAvailable,
    isBiometricEnabled,
    biometricType,
    isCheckingBiometric,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    getBiometricTypeName,
  };
}
