import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type Mode = "choose" | "create" | "join";

export default function CoupleSetupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile, refreshProfile } = useAuth();

  const [mode, setMode] = useState<Mode>("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateCouple = async () => {
    if (!profile?.id) return;

    setIsLoading(true);
    try {
      const code = generateCode();

      const { data: couple, error: coupleError } = await supabase
        .from("couples")
        .insert({
          invite_code: code,
          created_by: profile.id,
        })
        .select()
        .single();

      if (coupleError) throw coupleError;

      const { error: profileError } = await supabase
        .from("Couples_profiles")
        .update({ couple_id: couple.id })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setGeneratedCode(code);
      await refreshProfile();
    } catch (error) {
      console.error("Error creating couple:", error);
      Alert.alert("Error", "Failed to create couple. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCouple = async () => {
    if (!profile?.id || !inviteCode.trim()) return;

    setIsLoading(true);
    try {
      const { data: couple, error: findError } = await supabase
        .from("couples")
        .select("*")
        .eq("invite_code", inviteCode.trim().toUpperCase())
        .single();

      if (findError || !couple) {
        Alert.alert("Invalid Code", "No couple found with this invite code.");
        return;
      }

      const { error: profileError } = await supabase
        .from("Couples_profiles")
        .update({ couple_id: couple.id })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success!", "You've been linked with your partner.");
      await refreshProfile();
      navigation.goBack();
    } catch (error) {
      console.error("Error joining couple:", error);
      Alert.alert("Error", "Failed to join couple. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await Clipboard.setStringAsync(generatedCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Copied!", "Invite code copied to clipboard.");
    }
  };

  if (generatedCode) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlowBackground />
        <View style={styles.centerContent}>
          <View style={styles.successIcon}>
            <Feather name="heart" size={48} color={GlowColors.accentPink} />
          </View>
          <ThemedText style={styles.title}>Your Couple is Ready!</ThemedText>
          <ThemedText style={styles.subtitle}>
            Share this code with your partner so they can join:
          </ThemedText>

          <View style={styles.codeCard}>
            <ThemedText style={styles.codeText}>{generatedCode}</ThemedText>
            <Pressable style={styles.copyButton} onPress={handleCopyCode}>
              <Feather name="copy" size={20} color={GlowColors.gold} />
              <ThemedText style={styles.copyButtonText}>Copy</ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.hint}>
            Your partner will enter this code in the app to link your accounts.
          </ThemedText>

          <Pressable style={styles.doneButton} onPress={() => navigation.goBack()}>
            <ThemedText style={styles.doneButtonText}>Done</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (mode === "choose") {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlowBackground />
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Feather name="users" size={48} color={GlowColors.gold} />
          </View>
          <ThemedText style={styles.title}>Link with Your Partner</ThemedText>
          <ThemedText style={styles.subtitle}>
            Connect your accounts to share your relationship journey.
          </ThemedText>

          <View style={styles.optionsContainer}>
            <Pressable style={styles.optionCard} onPress={() => setMode("create")}>
              <View style={[styles.optionIcon, { backgroundColor: GlowColors.cardGreen }]}>
                <Feather name="plus-circle" size={24} color={GlowColors.accentGreen} />
              </View>
              <View style={styles.optionText}>
                <ThemedText style={styles.optionTitle}>Create Couple</ThemedText>
                <ThemedText style={styles.optionSubtitle}>
                  Generate an invite code for your partner
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={GlowColors.textSecondary} />
            </Pressable>

            <Pressable style={styles.optionCard} onPress={() => setMode("join")}>
              <View style={[styles.optionIcon, { backgroundColor: GlowColors.cardBlue }]}>
                <Feather name="log-in" size={24} color={GlowColors.accentBlue} />
              </View>
              <View style={styles.optionText}>
                <ThemedText style={styles.optionTitle}>Join Partner</ThemedText>
                <ThemedText style={styles.optionSubtitle}>
                  Enter an invite code from your partner
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={GlowColors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (mode === "create") {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlowBackground />
        <View style={styles.centerContent}>
          <Pressable style={styles.backButton} onPress={() => setMode("choose")}>
            <Feather name="arrow-left" size={24} color={GlowColors.textPrimary} />
          </Pressable>

          <View style={[styles.iconContainer, { backgroundColor: GlowColors.cardGreen }]}>
            <Feather name="plus-circle" size={48} color={GlowColors.accentGreen} />
          </View>
          <ThemedText style={styles.title}>Create Your Couple</ThemedText>
          <ThemedText style={styles.subtitle}>
            We'll generate a unique invite code that you can share with your partner.
          </ThemedText>

          <Pressable
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleCreateCouple}
            disabled={isLoading}
          >
            <ThemedText style={styles.primaryButtonText}>
              {isLoading ? "Creating..." : "Generate Invite Code"}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />
      <View style={styles.centerContent}>
        <Pressable style={styles.backButton} onPress={() => setMode("choose")}>
          <Feather name="arrow-left" size={24} color={GlowColors.textPrimary} />
        </Pressable>

        <View style={[styles.iconContainer, { backgroundColor: GlowColors.cardBlue }]}>
          <Feather name="log-in" size={48} color={GlowColors.accentBlue} />
        </View>
        <ThemedText style={styles.title}>Join Your Partner</ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter the invite code your partner shared with you.
        </ThemedText>

        <TextInput
          style={styles.codeInput}
          placeholder="Enter 6-digit code"
          placeholderTextColor={GlowColors.textSecondary}
          value={inviteCode}
          onChangeText={(text) => setInviteCode(text.toUpperCase())}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <Pressable
          style={[styles.primaryButton, (!inviteCode.trim() || isLoading) && styles.buttonDisabled]}
          onPress={handleJoinCouple}
          disabled={!inviteCode.trim() || isLoading}
        >
          <ThemedText style={styles.primaryButtonText}>
            {isLoading ? "Joining..." : "Join Couple"}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlowColors.background,
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.lg,
    padding: Spacing.sm,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GlowColors.cardBrown,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GlowColors.cardRed,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  optionsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  optionSubtitle: {
    fontSize: 13,
    color: GlowColors.textSecondary,
    marginTop: 2,
  },
  codeCard: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
    width: "100%",
  },
  codeText: {
    fontSize: 40,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.gold,
    letterSpacing: 8,
    marginBottom: Spacing.md,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  copyButtonText: {
    fontSize: 14,
    color: GlowColors.gold,
    fontFamily: "Nunito_600SemiBold",
  },
  hint: {
    fontSize: 14,
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  codeInput: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    color: GlowColors.textPrimary,
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    letterSpacing: 4,
    width: "100%",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  primaryButton: {
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  doneButton: {
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
});
