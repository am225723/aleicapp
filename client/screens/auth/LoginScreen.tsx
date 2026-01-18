import React, { useState } from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
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
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="h1" style={styles.title}>
          Couples Therapy
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Strengthen your connection, together
        </ThemedText>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        {error ? (
          <ThemedText
            type="small"
            style={[styles.error, { color: theme.error }]}
          >
            {error}
          </ThemedText>
        ) : null}

        <Button onPress={handleLogin} disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </View>

      <View style={styles.footer}>
        <ThemedText
          type="body"
          style={[styles.footerText, { color: theme.textSecondary }]}
        >
          Don't have an account?
        </ThemedText>

        <View style={styles.signupButtons}>
          <Pressable
            onPress={() => navigation.navigate("CoupleSignup")}
            style={[styles.signupButton, { borderColor: Colors.light.link }]}
          >
            <ThemedText type="body" style={{ color: Colors.light.link }}>
              Join as Couple
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("TherapistSignup")}
            style={[styles.signupButton, { borderColor: Colors.light.accent }]}
          >
            <ThemedText type="body" style={{ color: Colors.light.accent }}>
              Join as Therapist
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    marginBottom: Spacing["3xl"],
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    marginBottom: Spacing.lg,
  },
  signupButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  signupButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 24,
    borderWidth: 1.5,
  },
});
