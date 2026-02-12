import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CoupleData {
  id: string;
  partner1_name: string;
  partner2_name: string;
  status: string;
  last_active: string;
}

interface ToolEntry {
  id: string;
  tool_name: string;
  couple_id: string;
  created_at: string;
}

interface ThoughtItem {
  id: string;
  couple_id: string;
  content: string;
  is_completed: boolean;
  priority: string;
}

interface SessionNote {
  id: string;
  couple_id: string;
  title: string;
  session_date: string;
}

export default function TherapistDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [couples, setCouples] = useState<CoupleData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ToolEntry[]>([]);
  const [pendingThoughts, setPendingThoughts] = useState<ThoughtItem[]>([]);
  const [recentNotes, setRecentNotes] = useState<SessionNote[]>([]);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data: couplesData } = await supabase
        .from("Couples_couples")
        .select("id, partner1_id, partner2_id, status, updated_at, created_at")
        .order("updated_at", { ascending: false });

      if (couplesData && couplesData.length > 0) {
        const partnerIds = [
          ...couplesData.map((c) => c.partner1_id),
          ...couplesData.filter((c) => c.partner2_id).map((c) => c.partner2_id),
        ].filter(Boolean);

        const { data: profiles } = await supabase
          .from("Couples_profiles")
          .select("id, display_name, email")
          .in("id", partnerIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [
            p.id,
            p.display_name || p.email?.split("@")[0] || "Partner",
          ])
        );

        const enrichedCouples: CoupleData[] = couplesData.map((couple) => ({
          id: couple.id,
          partner1_name: profileMap.get(couple.partner1_id) || "Partner 1",
          partner2_name: couple.partner2_id
            ? profileMap.get(couple.partner2_id) || "Partner 2"
            : "Awaiting",
          status: couple.status || "pending",
          last_active: couple.updated_at || couple.created_at,
        }));

        setCouples(enrichedCouples);

        const coupleIds = couplesData.map((c) => c.id);

        const [activityResult, checkinsResult, thoughtsResult, notesResult] =
          await Promise.all([
            supabase
              .from("Couples_tool_entries")
              .select("id, tool_name, couple_id, created_at")
              .in("couple_id", coupleIds)
              .order("created_at", { ascending: false })
              .limit(10),
            supabase
              .from("Couples_weekly_checkins")
              .select("id")
              .in("couple_id", coupleIds),
            supabase
              .from("therapist_thoughts")
              .select("id, couple_id, content, is_completed, priority")
              .eq("therapist_id", profile.id)
              .eq("is_todo", true)
              .eq("is_completed", false)
              .order("created_at", { ascending: false })
              .limit(5),
            supabase
              .from("therapist_session_notes")
              .select("id, couple_id, title, session_date")
              .eq("therapist_id", profile.id)
              .order("session_date", { ascending: false })
              .limit(3),
          ]);

        setRecentActivity(activityResult.data || []);
        setTotalCheckins((checkinsResult.data || []).length);
        setPendingThoughts(thoughtsResult.data || []);
        setRecentNotes(notesResult.data || []);
      } else {
        setCouples([]);
        setRecentActivity([]);
        setTotalCheckins(0);
        setPendingThoughts([]);
        setRecentNotes([]);
      }
    } catch (error) {
      console.log("Error loading dashboard data:", error);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setIsRefreshing(false);
  }

  async function toggleThought(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await supabase
      .from("therapist_thoughts")
      .update({ is_completed: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    setPendingThoughts((prev) => prev.filter((t) => t.id !== id));
  }

  const thisWeekActivity = recentActivity.filter((entry) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(entry.created_at) >= weekAgo;
  });

  const displayName =
    profile?.full_name || profile?.email?.split("@")[0] || "Therapist";

  const getCoupleNames = (coupleId: string) => {
    const couple = couples.find((c) => c.id === coupleId);
    return couple
      ? `${couple.partner1_name} & ${couple.partner2_name}`
      : "Unknown";
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
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <ThemedText type="h2">Welcome, {displayName}</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Your practice overview
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
            Couples
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

      <View style={styles.statsRow}>
        <Card elevation={1} style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: Colors.light.accent + "20" },
            ]}
          >
            <Feather name="bar-chart-2" size={20} color={Colors.light.accent} />
          </View>
          <ThemedText type="h2" style={{ color: Colors.light.accent }}>
            {totalCheckins}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Check-ins
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.statCard}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: Colors.light.warning + "20" },
            ]}
          >
            <Feather name="edit-3" size={20} color={Colors.light.warning} />
          </View>
          <ThemedText type="h2" style={{ color: Colors.light.warning }}>
            {recentNotes.length}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Recent Notes
          </ThemedText>
        </Card>
      </View>

      {pendingThoughts.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Pending To-Dos
          </ThemedText>
          {pendingThoughts.map((thought) => (
            <Card key={thought.id} elevation={1} style={styles.todoCard}>
              <View style={styles.todoRow}>
                <Pressable
                  onPress={() => toggleThought(thought.id)}
                  style={[
                    styles.checkbox,
                    { borderColor: theme.border },
                  ]}
                  testID={`todo-checkbox-${thought.id}`}
                >
                  <View />
                </Pressable>
                <View style={styles.todoInfo}>
                  <ThemedText type="body" numberOfLines={2}>
                    {thought.content}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {getCoupleNames(thought.couple_id)}
                  </ThemedText>
                </View>
                {thought.priority === "high" ? (
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: Colors.light.error + "20" },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: Colors.light.error }}
                    >
                      High
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      {recentNotes.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Recent Session Notes
          </ThemedText>
          {recentNotes.map((note) => (
            <Pressable
              key={note.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("SessionNotes", {
                  coupleId: note.couple_id,
                });
              }}
            >
              <Card elevation={1} style={styles.noteCard}>
                <View style={styles.noteRow}>
                  <View
                    style={[
                      styles.noteIcon,
                      { backgroundColor: Colors.light.link + "20" },
                    ]}
                  >
                    <Feather name="file-text" size={16} color={Colors.light.link} />
                  </View>
                  <View style={styles.noteInfo}>
                    <ThemedText type="body">{note.title || "Untitled Note"}</ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {getCoupleNames(note.couple_id)} -{" "}
                      {new Date(note.session_date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={theme.textSecondary}
                  />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        <View style={styles.quickActionsGrid}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("CoupleDetail", {
                coupleId: couples[0]?.id || "",
              });
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Card elevation={1} style={styles.quickActionCard}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: Colors.light.link + "20" },
                ]}
              >
                <Feather name="eye" size={20} color={Colors.light.link} />
              </View>
              <ThemedText type="small" style={{ textAlign: "center" }}>
                View Couple
              </ThemedText>
            </Card>
          </Pressable>
        </View>
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Recent Activity
      </ThemedText>

      {recentActivity.length === 0 ? (
        <EmptyState
          image={require("../../../assets/images/empty-dashboard.png")}
          title="No recent activity"
          description="Your couples' tool usage will appear here"
        />
      ) : (
        recentActivity.map((entry) => (
          <Card key={entry.id} elevation={1} style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: Colors.light.accent + "20" },
                ]}
              >
                <Feather name="tool" size={16} color={Colors.light.accent} />
              </View>
              <View style={styles.activityInfo}>
                <ThemedText type="body">{entry.tool_name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {getCoupleNames(entry.couple_id)} -{" "}
                  {new Date(entry.created_at).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
          </Card>
        ))
      )}
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
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  todoCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  todoInfo: {
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  noteCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  noteInfo: {
    flex: 1,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  quickActionCard: {
    width: 100,
    alignItems: "center",
    padding: Spacing.lg,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
});
