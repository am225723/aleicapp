import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ImageBackground,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/contexts/AuthContext";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { Spacing, BorderRadius } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const GOLD_PRIMARY = "#C9A962";
const GOLD_LIGHT = "#E5D4A1";
const GOLD_DARK = "#8B7635";
const DARK_BG = "#1A1A1C";
const GLASS_BG = "rgba(60, 60, 65, 0.65)";
const GLASS_BORDER = "rgba(200, 180, 120, 0.3)";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error: authError } = await signIn(email, password);

      if (authError) {
        setError(authError.message || "Login failed. Please try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setError("Login failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: DARK_BG }]}>
      <LinearGradient
        colors={["rgba(201, 169, 98, 0.15)", "transparent", "rgba(201, 169, 98, 0.1)"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
      >
        <View style={styles.glassCard}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.cardContent}>
            <Text style={styles.logoText}>Aleic</Text>

            <Text style={styles.tagline}>
              ASSISTED LEARNING FOR EMPATHETIC{"\n"}AND INSIGHTFUL COUPLES
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="path@connection.com"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <View style={styles.inputUnderline} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry
                  autoComplete="password"
                />
                <View style={styles.inputUnderline} />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [
                  styles.signInButton,
                  pressed && styles.signInButtonPressed,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.signInText}>
                  {isLoading ? "SIGNING IN..." : "SIGN IN"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>BEGIN YOUR JOURNEY</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.joinButton,
                pressed && styles.joinButtonPressed,
              ]}
              onPress={() => navigation.navigate("CoupleSignup")}
            >
              <Text style={styles.joinButtonText}>JOIN AS COUPLE</Text>
            </Pressable>

            <Pressable
              style={styles.recoverButton}
              onPress={() => navigation.navigate("TherapistSignup")}
            >
              <Text style={styles.recoverText}>JOIN AS THERAPIST</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  glassCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  cardContent: {
    padding: Spacing["2xl"],
    backgroundColor: GLASS_BG,
  },
  logoText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 52,
    color: GOLD_PRIMARY,
    textAlign: "center",
    marginBottom: Spacing.md,
    textShadowColor: "rgba(201, 169, 98, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    color: GOLD_LIGHT,
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: Spacing["3xl"],
    lineHeight: 20,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
    color: GOLD_LIGHT,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  input: {
    fontFamily: "Nunito_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
    paddingVertical: Spacing.sm,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: GOLD_DARK,
    marginTop: Spacing.xs,
  },
  errorText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "#E88B8B",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  signInButton: {
    borderWidth: 1.5,
    borderColor: GOLD_PRIMARY,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  signInButtonPressed: {
    backgroundColor: "rgba(201, 169, 98, 0.15)",
  },
  signInText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: GOLD_LIGHT,
    letterSpacing: 3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: GOLD_DARK,
  },
  dividerText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
    color: GOLD_LIGHT,
    letterSpacing: 2,
    marginHorizontal: Spacing.md,
  },
  joinButton: {
    borderWidth: 1.5,
    borderColor: GOLD_PRIMARY,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  joinButtonPressed: {
    backgroundColor: "rgba(201, 169, 98, 0.15)",
  },
  joinButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: GOLD_LIGHT,
    letterSpacing: 3,
  },
  recoverButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  recoverText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    color: GOLD_PRIMARY,
    letterSpacing: 1.5,
  },
});
