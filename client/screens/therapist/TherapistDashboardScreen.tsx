import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { getCouples, getToolEntries, CoupleData, ToolEntry } from "@/lib/storage";

export default function TherapistDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [couples, setCouples] = useState<CoupleData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ToolEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [couplesData, activityData] = await Promise.all([
      getCouples(),
      getToolEntries(),
    ]);
    setCouples(couplesData);
    setRecentActivity(activityData.slice(0, 10));
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setIsRefreshing(false);
  }

  const thisWeekActivity = recentActivity.filter((entry) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(entry.createdAt) >= weekAgo;
  });

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
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <ThemedText type="h2">
          Welcome, {user?.displayName || "Therapist"}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Your couples dashboard
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        <Card elevation={1} style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: Colors.light.link + "20" },
            ]}
          >
            <Feather name="users" size={20} color={Colors.light.link} />
          </View>
          <ThemedText type="h2" style={{ color: Colors.light.link }}>
            {couples.length}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Active Couples
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: Colors.light.success + "20" },
            ]}
          >
            <Feather name="activity" size={20} color={Colors.light.success} />
          </View>
          <ThemedText type="h2" style={{ color: Colors.light.success }}>
            {thisWeekActivity.length}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            This Week
          </ThemedText>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Recent Couple Activity
        </ThemedText>

        {recentActivity.length > 0 ? (
          recentActivity.slice(0, 5).map((entry) => (
            <Card key={entry.id} elevation={1} style={styles.activityCard}>
              <View style={styles.activityRow}>
                <View
                  style={[
                    styles.activityIcon,
                    {
                      backgroundColor:
                        entry.toolType === "pause"
                          ? Colors.light.link + "20"
                          : entry.toolType === "echo"
                            ? Colors.light.accent + "20"
                            : entry.toolType === "holdme"
                              ? Colors.light.success + "20"
                              : Colors.light.warning + "20",
                    },
                  ]}
                >
                  <Feather
                    name={
                      entry.toolType === "pause"
                        ? "pause-circle"
                        : entry.toolType === "echo"
                          ? "message-circle"
                          : entry.toolType === "holdme"
                            ? "heart"
                            : "bar-chart-2"
                    }
                    size={16}
                    color={
                      entry.toolType === "pause"
                        ? Colors.light.link
                        : entry.toolType === "echo"
                          ? Colors.light.accent
                          : entry.toolType === "holdme"
                            ? Colors.light.success
                            : Colors.light.warning
                    }
                  />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText type="body">
                    {entry.toolType === "pause"
                      ? "Pause Button"
                      : entry.toolType === "echo"
                        ? "Echo & Empathy"
                        : entry.toolType === "holdme"
                          ? "Hold Me Tight"
                          : "Weekly Check-in"}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    Couple completed exercise
                  </ThemedText>
                </View>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {new Date(entry.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            image={require("../../../assets/images/empty-dashboard.png")}
            title="No activity yet"
            description="Activity from your couples will appear here"
          />
        )}
      </View>
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
  subtitle: {
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  activityCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
});
