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

export default function CoupleProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
  };

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "User";

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
        <View style={styles.avatarRow}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: Colors.light.link + "30" },
            ]}
          >
            <ThemedText type="h2" style={{ color: Colors.light.link }}>
              {displayName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          {profile?.couple_id ? (
            <>
              <View style={styles.heartIcon}>
                <Feather name="heart" size={20} color={Colors.light.accent} />
              </View>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: Colors.light.accent + "30" },
                ]}
              >
                <ThemedText type="h2" style={{ color: Colors.light.accent }}>
                  P
                </ThemedText>
              </View>
            </>
          ) : null}
        </View>

        <ThemedText type="h3" style={styles.name}>
          {displayName}
          {profile?.couple_id ? " & Partner" : ""}
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {profile?.email}
        </ThemedText>
      </Card>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Your Stats
        </ThemedText>

        <View style={styles.statsRow}>
          <Card elevation={1} style={styles.statCard}>
            <ThemedText type="h2" style={{ color: Colors.light.link }}>
              0
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Activities
            </ThemedText>
          </Card>

          <Card elevation={1} style={styles.statCard}>
            <ThemedText type="h2" style={{ color: Colors.light.accent }}>
              0
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Check-ins
            </ThemedText>
          </Card>

          <Card elevation={1} style={styles.statCard}>
            <ThemedText type="h2" style={{ color: Colors.light.success }}>
              0
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Days
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
            <Feather name="link" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={styles.settingText}>
              Partner Link
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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    marginHorizontal: Spacing.md,
  },
  name: {
    marginBottom: Spacing.xs,
  },
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
