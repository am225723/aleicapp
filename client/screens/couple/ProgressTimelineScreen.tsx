import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { listWeeklyCheckins } from "@/services/weeklyCheckinsService";

interface TimelineEvent {
  id: string;
  type: "checkin" | "tool" | "milestone" | "goal";
  title: string;
  subtitle: string;
  date: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

export default function ProgressTimelineScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [groupedEvents, setGroupedEvents] = useState<Record<string, TimelineEvent[]>>({});

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const allEvents: TimelineEvent[] = [];

      const checkins = await listWeeklyCheckins(profile.couple_id);
      checkins.forEach((c) => {
        allEvents.push({
          id: `checkin-${c.id}`,
          type: "checkin",
          title: "Weekly Check-in",
          subtitle: `Connection: ${c.connection_rating}, Communication: ${c.communication_rating}`,
          date: c.created_at,
          icon: "check-square",
          color: GlowColors.accentGreen,
        });
      });

      const { data: toolEntries } = await supabase
        .from("Couples_tool_entries")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (toolEntries) {
        toolEntries.forEach((entry: any) => {
          allEvents.push({
            id: `tool-${entry.id}`,
            type: "tool",
            title: entry.tool_name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
            subtitle: "Tool completed",
            date: entry.created_at,
            icon: "tool",
            color: GlowColors.accentBlue,
          });
        });
      }

      const { data: goals } = await supabase
        .from("shared_goals")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .eq("status", "done");

      if (goals) {
        goals.forEach((goal: any) => {
          allEvents.push({
            id: `goal-${goal.id}`,
            type: "goal",
            title: "Goal Achieved",
            subtitle: goal.title,
            date: goal.updated_at || goal.created_at,
            icon: "target",
            color: GlowColors.gold,
          });
        });
      }

      const { data: plans } = await supabase
        .from("growth_plans")
        .select("*")
        .eq("couple_id", profile.couple_id);

      if (plans) {
        plans.forEach((plan: any) => {
          if (plan.milestones) {
            plan.milestones.forEach((milestone: any) => {
              if (milestone.completed) {
                allEvents.push({
                  id: `milestone-${plan.id}-${milestone.id}`,
                  type: "milestone",
                  title: "Milestone Reached",
                  subtitle: milestone.title,
                  date: plan.created_at,
                  icon: "flag",
                  color: GlowColors.accentPurple,
                });
              }
            });
          }
        });
      }

      allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(allEvents);

      const grouped: Record<string, TimelineEvent[]> = {};
      allEvents.forEach((event) => {
        const monthYear = new Date(event.date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
        }
        grouped[monthYear].push(event);
      });
      setGroupedEvents(grouped);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.couple_id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={GlowColors.gold} />
        }
      >
        <CategoryHeroCard
          title="Progress Timeline"
          subtitle="Your relationship journey"
          gradientColors={["rgba(155, 89, 182, 0.4)", "rgba(80, 50, 100, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        {isLoading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : events.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="clock" size={48} color={GlowColors.textSecondary} />
            <ThemedText style={styles.emptyText}>No events yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Start using tools to build your timeline</ThemedText>
          </View>
        ) : (
          <View style={styles.timeline}>
            {Object.entries(groupedEvents).map(([month, monthEvents]) => (
              <View key={month} style={styles.monthSection}>
                <ThemedText style={styles.monthTitle}>{month}</ThemedText>
                <View style={styles.eventsList}>
                  {monthEvents.map((event, index) => (
                    <View key={event.id} style={styles.eventRow}>
                      <View style={styles.timelineBar}>
                        <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                        {index < monthEvents.length - 1 ? <View style={styles.eventLine} /> : null}
                      </View>
                      <View style={styles.eventCard}>
                        <View style={styles.eventHeader}>
                          <View style={[styles.eventIcon, { backgroundColor: event.color + "30" }]}>
                            <Feather name={event.icon} size={16} color={event.color} />
                          </View>
                          <ThemedText style={styles.eventDate}>{formatDate(event.date)}</ThemedText>
                        </View>
                        <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                        <ThemedText style={styles.eventSubtitle}>{event.subtitle}</ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
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
  loadingText: {
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: GlowColors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  timeline: {
    gap: Spacing.xl,
  },
  monthSection: {
    gap: Spacing.md,
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.gold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  eventsList: {
    gap: 0,
  },
  eventRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  timelineBar: {
    alignItems: "center",
    width: 20,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  eventLine: {
    flex: 1,
    width: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 4,
  },
  eventCard: {
    flex: 1,
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  eventIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  eventDate: {
    fontSize: 12,
    color: GlowColors.textSecondary,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    color: GlowColors.textPrimary,
  },
  eventSubtitle: {
    fontSize: 13,
    color: GlowColors.textSecondary,
    marginTop: 2,
  },
});
