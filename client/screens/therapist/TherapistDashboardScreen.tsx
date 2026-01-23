import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

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

export default function TherapistDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile } = useAuth();

  const [couples, setCouples] = useState<CoupleData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ToolEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data: couplesData } = await supabase
        .from("Couples_couples")
        .select("id, partner1_id, partner2_id, status, updated_at, created_at")
        .eq("therapist_id", profile.id)
        .order("updated_at", { ascending: false });

      if (couplesData && couplesData.length > 0) {
        const partnerIds = [
          ...couplesData.map(c => c.partner1_id),
          ...couplesData.filter(c => c.partner2_id).map(c => c.partner2_id),
        ].filter(Boolean);

        const { data: profiles } = await supabase
          .from("Couples_profiles")
          .select("id, display_name, email")
          .in("id", partnerIds);

        const profileMap = new Map(
          (profiles || []).map(p => [p.id, p.display_name || p.email?.split("@")[0] || "Partner"])
        );

        const enrichedCouples: CoupleData[] = couplesData.map(couple => ({
          id: couple.id,
          partner1_name: profileMap.get(couple.partner1_id) || "Partner 1",
          partner2_name: couple.partner2_id 
            ? profileMap.get(couple.partner2_id) || "Partner 2"
            : "Awaiting",
          status: couple.status || "pending",
          last_active: couple.updated_at || couple.created_at,
        }));

        setCouples(enrichedCouples);

        const coupleIds = couplesData.map(c => c.id);
        const { data: activityData } = await supabase
          .from("Couples_tool_entries")
          .select("id, tool_name, couple_id, created_at")
          .in("couple_id", coupleIds)
          .order("created_at", { ascending: false })
          .limit(10);

        setRecentActivity(activityData || []);
      } else {
        setCouples([]);
        setRecentActivity([]);
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

  const thisWeekActivity = recentActivity.filter((entry) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(entry.created_at) >= weekAgo;
  });

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Therapist";

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
          Welcome, {displayName}
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
    marginBottom: Spacing.xl,
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
  sectionTitle: {
    marginBottom: Spacing.md,
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
