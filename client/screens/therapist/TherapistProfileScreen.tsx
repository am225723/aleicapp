import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function TherapistProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + 80 + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="h2">Profile</ThemedText>
      </View>

      <Card elevation={1} style={styles.profileCard}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: Colors.light.link + "30" },
          ]}
        >
          <ThemedText type="h1" style={{ color: Colors.light.link }}>
            {user?.displayName?.charAt(0) || "T"}
          </ThemedText>
        </View>

        <ThemedText type="h3" style={styles.name}>
          {user?.displayName || "Therapist"}
        </ThemedText>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: Colors.light.success + "20" },
          ]}
        >
          <Feather name="shield" size={14} color={Colors.light.success} />
          <ThemedText
            type="small"
            style={{ color: Colors.light.success, marginLeft: 6 }}
          >
            Licensed Therapist
          </ThemedText>
        </View>
        <ThemedText
          type="body"
          style={[styles.email, { color: theme.textSecondary }]}
        >
          {user?.email}
        </ThemedText>
      </Card>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Practice Overview
        </ThemedText>

        <View style={styles.statsRow}>
          <Card elevation={1} style={styles.statCard}>
            <ThemedText type="h2" style={{ color: Colors.light.link }}>
              0
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Active Couples
            </ThemedText>
          </Card>

          <Card elevation={1} style={styles.statCard}>
            <ThemedText type="h2" style={{ color: Colors.light.accent }}>
              0
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Sessions This Month
            </ThemedText>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Settings
        </ThemedText>

        <Card elevation={1} style={styles.settingsCard}>
          <Pressable style={styles.settingRow}>
            <Feather name="bell" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.settingText}>
              Notifications
            </ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.settingRow}>
            <Feather name="lock" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.settingText}>
              Privacy & Security
            </ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.settingRow}>
            <Feather name="help-circle" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.settingText}>
              Help & Support
            </ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.settingRow}>
            <Feather name="file-text" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.settingText}>
              Terms & Privacy Policy
            </ThemedText>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </Card>
      </View>

      <Button onPress={handleLogout} style={styles.logoutButton}>
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  profileCard: {
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  name: {
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  email: {},
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: "center",
  },
  settingsCard: {
    padding: 0,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  settingText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  logoutButton: {
    backgroundColor: Colors.light.error,
  },
});
