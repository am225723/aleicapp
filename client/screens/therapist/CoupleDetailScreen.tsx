import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  getToolEntries,
  getWeeklyCheckins,
  ToolEntry,
  WeeklyCheckin,
} from "@/lib/storage";

type RouteProps = RouteProp<RootStackParamList, "CoupleDetail">;

export default function CoupleDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProps>();

  const [toolEntries, setToolEntries] = useState<ToolEntry[]>([]);
  const [checkins, setCheckins] = useState<WeeklyCheckin[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [entries, checkinsData] = await Promise.all([
      getToolEntries(route.params.coupleId),
      getWeeklyCheckins(route.params.coupleId),
    ]);
    setToolEntries(entries);
    setCheckins(checkinsData);
  }

  const recentCheckins = checkins.slice(0, 4);
  const averageRatings = recentCheckins.length > 0 ? {
    connection: Math.round(
      recentCheckins.reduce((sum, c) => sum + c.connectionRating, 0) /
        recentCheckins.length
    ),
    communication: Math.round(
      recentCheckins.reduce((sum, c) => sum + c.communicationRating, 0) /
        recentCheckins.length
    ),
    intimacy: Math.round(
      recentCheckins.reduce((sum, c) => sum + c.intimacyRating, 0) /
        recentCheckins.length
    ),
  } : null;

  const toolUsage = {
    pause: toolEntries.filter((e) => e.toolType === "pause").length,
    echo: toolEntries.filter((e) => e.toolType === "echo").length,
    holdme: toolEntries.filter((e) => e.toolType === "holdme").length,
    checkin: toolEntries.filter((e) => e.toolType === "checkin").length,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <Card elevation={1} style={styles.summaryCard}>
        <ThemedText type="h4" style={styles.cardTitle}>
          Session Prep Summary
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {recentCheckins.length > 0
            ? `Based on ${recentCheckins.length} check-ins from the last 4 weeks`
            : "No recent check-ins available"}
        </ThemedText>

        {averageRatings ? (
          <View style={styles.ratingsContainer}>
            <View style={styles.ratingItem}>
              <View
                style={[
                  styles.ratingCircle,
                  { backgroundColor: Colors.light.accent + "20" },
                ]}
              >
                <ThemedText type="h3" style={{ color: Colors.light.accent }}>
                  {averageRatings.connection}
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Connection
              </ThemedText>
            </View>

            <View style={styles.ratingItem}>
              <View
                style={[
                  styles.ratingCircle,
                  { backgroundColor: Colors.light.link + "20" },
                ]}
              >
                <ThemedText type="h3" style={{ color: Colors.light.link }}>
                  {averageRatings.communication}
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Communication
              </ThemedText>
            </View>

            <View style={styles.ratingItem}>
              <View
                style={[
                  styles.ratingCircle,
                  { backgroundColor: Colors.light.success + "20" },
                ]}
              >
                <ThemedText type="h3" style={{ color: Colors.light.success }}>
                  {averageRatings.intimacy}
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Intimacy
              </ThemedText>
            </View>
          </View>
        ) : null}
      </Card>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Tool Usage (Last 4 Weeks)
        </ThemedText>

        <View style={styles.toolsGrid}>
          <Card elevation={1} style={styles.toolCard}>
            <View
              style={[
                styles.toolIcon,
                { backgroundColor: Colors.light.link + "20" },
              ]}
            >
              <Feather name="pause-circle" size={20} color={Colors.light.link} />
            </View>
            <ThemedText type="h3">{toolUsage.pause}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Pause Button
            </ThemedText>
          </Card>

          <Card elevation={1} style={styles.toolCard}>
            <View
              style={[
                styles.toolIcon,
                { backgroundColor: Colors.light.accent + "20" },
              ]}
            >
              <Feather
                name="message-circle"
                size={20}
                color={Colors.light.accent}
              />
            </View>
            <ThemedText type="h3">{toolUsage.echo}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Echo & Empathy
            </ThemedText>
          </Card>

          <Card elevation={1} style={styles.toolCard}>
            <View
              style={[
                styles.toolIcon,
                { backgroundColor: Colors.light.success + "20" },
              ]}
            >
              <Feather name="heart" size={20} color={Colors.light.success} />
            </View>
            <ThemedText type="h3">{toolUsage.holdme}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Hold Me Tight
            </ThemedText>
          </Card>

          <Card elevation={1} style={styles.toolCard}>
            <View
              style={[
                styles.toolIcon,
                { backgroundColor: Colors.light.warning + "20" },
              ]}
            >
              <Feather name="bar-chart-2" size={20} color={Colors.light.warning} />
            </View>
            <ThemedText type="h3">{toolUsage.checkin}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Check-ins
            </ThemedText>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Recent Activity
        </ThemedText>

        {toolEntries.slice(0, 5).map((entry) => (
          <Card key={entry.id} elevation={1} style={styles.activityCard}>
            <View style={styles.activityRow}>
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
                size={18}
                color={Colors.light.link}
              />
              <ThemedText type="body" style={styles.activityText}>
                {entry.toolType === "pause"
                  ? "Pause Button"
                  : entry.toolType === "echo"
                    ? "Echo & Empathy"
                    : entry.toolType === "holdme"
                      ? "Hold Me Tight"
                      : "Weekly Check-in"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {new Date(entry.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
          </Card>
        ))}

        {toolEntries.length === 0 ? (
          <Card elevation={1} style={styles.emptyCard}>
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, textAlign: "center" }}
            >
              No recent activity recorded
            </ThemedText>
          </Card>
        ) : null}
      </View>

      <Card elevation={1} style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Feather name="info" size={18} color={Colors.light.warning} />
          <ThemedText type="h4" style={styles.noteTitle}>
            Privacy Note
          </ThemedText>
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          To protect client privacy, only aggregate usage data and ratings are
          shown. Private journal entries and specific conversation content are
          not accessible.
        </ThemedText>
      </Card>
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
  summaryCard: {
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  ratingsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.xl,
  },
  ratingItem: {
    alignItems: "center",
  },
  ratingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  toolCard: {
    width: "47%",
    padding: Spacing.lg,
    alignItems: "center",
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  activityCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  activityText: {
    flex: 1,
  },
  emptyCard: {
    padding: Spacing.xl,
  },
  noteCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.warning + "10",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  noteTitle: {
    marginLeft: Spacing.sm,
  },
});
