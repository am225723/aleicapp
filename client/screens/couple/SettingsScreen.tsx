import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Switch, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface UserSettings {
  push_notifications: boolean;
  email_notifications: boolean;
  share_checkins: boolean;
  preferences: Record<string, any>;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    push_notifications: true,
    email_notifications: true,
    share_checkins: true,
    preferences: {},
  });

  const loadData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data } = await supabase.from("user_settings").select("*").eq("user_id", profile.id).single();

      if (data) {
        setSettings({
          push_notifications: data.push_notifications ?? true,
          email_notifications: data.email_notifications ?? true,
          share_checkins: data.share_checkins ?? true,
          preferences: data.preferences || {},
        });
      }
    } catch (error) {
      console.log("No settings found, using defaults");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggle = async (key: keyof UserSettings, value: boolean) => {
    if (!profile?.id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      const { error } = await supabase.from("user_settings").upsert({
        user_id: profile.id,
        push_notifications: newSettings.push_notifications,
        email_notifications: newSettings.email_notifications,
        share_checkins: newSettings.share_checkins,
        preferences: newSettings.preferences,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving settings:", error);
      setSettings(settings);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          signOut();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <CategoryHeroCard
          title="Settings"
          subtitle="Customize your experience"
          gradientColors={["rgba(155, 89, 182, 0.4)", "rgba(80, 50, 100, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Feather name="bell" size={20} color={GlowColors.textPrimary} />
              <View style={styles.settingText}>
                <ThemedText style={styles.settingLabel}>Push Notifications</ThemedText>
                <ThemedText style={styles.settingDescription}>Receive reminders and updates</ThemedText>
              </View>
            </View>
            <Switch
              value={settings.push_notifications}
              onValueChange={(value) => handleToggle("push_notifications", value)}
              trackColor={{ false: "rgba(255,255,255,0.2)", true: GlowColors.gold }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Feather name="mail" size={20} color={GlowColors.textPrimary} />
              <View style={styles.settingText}>
                <ThemedText style={styles.settingLabel}>Email Notifications</ThemedText>
                <ThemedText style={styles.settingDescription}>Weekly summaries and tips</ThemedText>
              </View>
            </View>
            <Switch
              value={settings.email_notifications}
              onValueChange={(value) => handleToggle("email_notifications", value)}
              trackColor={{ false: "rgba(255,255,255,0.2)", true: GlowColors.gold }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Privacy</ThemedText>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Feather name="eye" size={20} color={GlowColors.textPrimary} />
              <View style={styles.settingText}>
                <ThemedText style={styles.settingLabel}>Share Check-ins with Therapist</ThemedText>
                <ThemedText style={styles.settingDescription}>Allow therapist to view your check-ins</ThemedText>
              </View>
            </View>
            <Switch
              value={settings.share_checkins}
              onValueChange={(value) => handleToggle("share_checkins", value)}
              trackColor={{ false: "rgba(255,255,255,0.2)", true: GlowColors.gold }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>

          <Pressable style={styles.accountItem} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={GlowColors.accentRed} />
            <ThemedText style={[styles.accountItemText, { color: GlowColors.accentRed }]}>Log Out</ThemedText>
          </Pressable>
        </View>

        <ThemedText style={styles.versionText}>ALEIC v1.0.0</ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlowColors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.gold,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    color: GlowColors.textPrimary,
  },
  settingDescription: {
    fontSize: 12,
    color: GlowColors.textSecondary,
    marginTop: 2,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  accountItemText: {
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
  },
  versionText: {
    fontSize: 12,
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
