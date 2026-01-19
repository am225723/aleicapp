import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Text,
  ImageBackground,
  Image,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/contexts/AuthContext";
import { AuthStackParamList } from "@/navigation/AuthStackNavigator";
import { Spacing } from "@/constants/theme";

const BG_IMAGE = require("../../assets/background-couple.jpg");
const ART_IMAGE = require("../../assets/gold-line-art.png");
const ALEIC_LOGO = require("../../assets/aleic-logo.png");

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const COLORS = {
  overlayDark: "rgba(26, 26, 36, 0.85)",
  goldPrimary: "#D4AF37",
  goldGradientLight: "#FDD663",
  goldGradientDark: "#C5991A",
  inputBg: "rgba(255, 255, 255, 0.05)",
  inputBorder: "rgba(255, 255, 255, 0.2)",
  textPrimary: "#F0F0F0",
  textPlaceholder: "#888888",
  glassBorder: "rgba(255, 255, 255, 0.1)",
};

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

  const renderSubtitle = () => {
    const words = [
      { large: "A", rest: "SSISTED" },
      { large: "L", rest: "EARNING" },
      { large: "", rest: "FOR" },
      { large: "E", rest: "MPATHETIC" },
    ];
    const words2 = [
      { large: "", rest: "AND" },
      { large: "I", rest: "NSIGHTFUL" },
      { large: "C", rest: "OUPLES" },
    ];

    return (
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleLine}>
          {words.map((word, idx) => (
            <Text key={idx}>
              {word.large ? (
                <Text style={styles.largeLetter}>{word.large}</Text>
              ) : null}
              <Text style={styles.subtitleText}>{word.rest} </Text>
            </Text>
          ))}
        </Text>
        <Text style={styles.subtitleLine}>
          {words2.map((word, idx) => (
            <Text key={idx}>
              {word.large ? (
                <Text style={styles.largeLetter}>{word.large}</Text>
              ) : null}
              <Text style={styles.subtitleText}>{word.rest} </Text>
            </Text>
          ))}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ImageBackground source={BG_IMAGE} style={StyleSheet.absoluteFill} resizeMode="cover">
        <View style={styles.darkOverlay} />
        
        <Image source={ART_IMAGE} style={styles.backgroundImageArt} resizeMode="contain" />

        <KeyboardAwareScrollViewCompat
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + Spacing["2xl"],
              paddingBottom: insets.bottom + Spacing["2xl"],
            },
          ]}
        >
          <View style={styles.glassCard}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.cardHighlight} />

            <View style={styles.cardContent}>
              <View style={styles.logoContainer}>
                <Image 
                  source={ALEIC_LOGO} 
                  style={styles.logoImage} 
                  resizeMode="contain" 
                />
              </View>

              {renderSubtitle()}

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="path@connection.com"
                    placeholderTextColor={COLORS.textPlaceholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                  <View style={styles.inputBorder} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="********"
                    placeholderTextColor={COLORS.textPlaceholder}
                    secureTextEntry
                    autoComplete="password"
                  />
                  <View style={styles.inputBorder} />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable
                  style={({ pressed }) => [
                    styles.signInButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.signInButtonText}>
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
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => navigation.navigate("CoupleSignup")}
              >
                <Text style={styles.joinButtonText}>JOIN AS COUPLE</Text>
              </Pressable>

              <Pressable
                style={styles.recoverButton}
                onPress={() => navigation.navigate("TherapistSignup")}
              >
                <Text style={styles.recoverText}>RECOVER ACCOUNT ACCESS?</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAwareScrollViewCompat>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A24",
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlayDark,
  },
  backgroundImageArt: {
    position: "absolute",
    width: "120%",
    height: 500,
    top: "10%",
    alignSelf: "center",
    opacity: 0.6,
    transform: [{ scale: 1.2 }],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  glassCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.inputBg,
  },
  cardContent: {
    padding: Spacing["2xl"],
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing["3xl"],
  },
  logoMask: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  logoText: {
    fontFamily: "GreatVibes_400Regular",
    fontSize: 64,
    textAlign: "center",
  },
  logoGradient: {
    flex: 1,
    width: "100%",
  },
  subtitleContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  subtitleLine: {
    flexDirection: "row",
    textAlign: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  subtitleText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 10,
    color: COLORS.goldPrimary,
    letterSpacing: 1.5,
  },
  largeLetter: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    color: COLORS.goldPrimary,
  },
  formContainer: {
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 10,
    color: COLORS.goldPrimary,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  input: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: Spacing.sm,
    backgroundColor: "transparent",
  },
  inputBorder: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginTop: 2,
  },
  errorText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: "#E88B8B",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  signInButton: {
    borderWidth: 1,
    borderColor: COLORS.goldPrimary,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  buttonPressed: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
  },
  signInButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    color: COLORS.goldPrimary,
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
    backgroundColor: COLORS.inputBorder,
    opacity: 0.5,
  },
  dividerText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 10,
    color: COLORS.goldPrimary,
    letterSpacing: 2,
    marginHorizontal: Spacing.md,
    opacity: 0.8,
  },
  joinButton: {
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.5)",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  joinButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    color: COLORS.goldPrimary,
    letterSpacing: 3,
    opacity: 0.9,
  },
  recoverButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  recoverText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 11,
    color: COLORS.goldPrimary,
    letterSpacing: 1.5,
    opacity: 0.6,
  },
});
