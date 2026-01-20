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

interface ToolStat {
  tool_name: string;
  count: number;
  last_used: string | null;
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalActions7d, setTotalActions7d] = useState(0);
  const [totalActions30d, setTotalActions30d] = useState(0);
  const [mostUsedTool, setMostUsedTool] = useState<string | null>(null);
  const [toolStats, setToolStats] = useState<ToolStat[]>([]);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: entries7d } = await supabase
        .from("Couples_tool_entries")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .gte("created_at", sevenDaysAgo);

      const { data: entries30d } = await supabase
        .from("Couples_tool_entries")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .gte("created_at", thirtyDaysAgo);

      setTotalActions7d(entries7d?.length || 0);
      setTotalActions30d(entries30d?.length || 0);

      if (entries30d && entries30d.length > 0) {
        const toolCounts: Record<string, { count: number; last_used: string | null }> = {};
        entries30d.forEach((entry: any) => {
          if (!toolCounts[entry.tool_name]) {
            toolCounts[entry.tool_name] = { count: 0, last_used: null };
          }
          toolCounts[entry.tool_name].count++;
          if (!toolCounts[entry.tool_name].last_used || entry.created_at > toolCounts[entry.tool_name].last_used!) {
            toolCounts[entry.tool_name].last_used = entry.created_at;
          }
        });

        const stats = Object.entries(toolCounts)
          .map(([tool_name, data]) => ({
            tool_name,
            count: data.count,
            last_used: data.last_used,
          }))
          .sort((a, b) => b.count - a.count);

        setToolStats(stats);
        if (stats.length > 0) {
          setMostUsedTool(stats[0].tool_name);
        }
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
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

  const formatToolName = (name: string) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString();
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
          title="Analytics"
          subtitle="Track your relationship journey"
          gradientColors={["rgba(74, 144, 217, 0.4)", "rgba(40, 80, 100, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: GlowColors.cardBlue }]}>
            <ThemedText style={styles.summaryValue}>{totalActions7d}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Last 7 days</ThemedText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: GlowColors.cardGreen }]}>
            <ThemedText style={styles.summaryValue}>{totalActions30d}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Last 30 days</ThemedText>
          </View>
        </View>

        {mostUsedTool ? (
          <View style={[styles.highlightCard, { backgroundColor: GlowColors.cardBrown }]}>
            <Feather name="award" size={24} color={GlowColors.gold} />
            <View style={styles.highlightContent}>
              <ThemedText style={styles.highlightLabel}>Most Used Tool</ThemedText>
              <ThemedText style={styles.highlightValue}>{formatToolName(mostUsedTool)}</ThemedText>
            </View>
          </View>
        ) : null}

        <ThemedText style={styles.sectionTitle}>Tool Usage (30 days)</ThemedText>

        {isLoading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : toolStats.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="bar-chart-2" size={48} color={GlowColors.textSecondary} />
            <ThemedText style={styles.emptyText}>No tool usage yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Start using relationship tools to see your analytics</ThemedText>
          </View>
        ) : (
          <View style={styles.toolList}>
            {toolStats.map((stat) => (
              <View key={stat.tool_name} style={styles.toolItem}>
                <View style={styles.toolInfo}>
                  <ThemedText style={styles.toolName}>{formatToolName(stat.tool_name)}</ThemedText>
                  <ThemedText style={styles.toolLastUsed}>Last used: {formatDate(stat.last_used)}</ThemedText>
                </View>
                <View style={styles.toolCount}>
                  <ThemedText style={styles.toolCountText}>{stat.count}</ThemedText>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${Math.min((stat.count / (toolStats[0]?.count || 1)) * 100, 100)}%`,
                        backgroundColor: GlowColors.gold,
                      },
                    ]}
                  />
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
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 32,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  summaryLabel: {
    fontSize: 14,
    color: GlowColors.textSecondary,
    marginTop: 4,
  },
  highlightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  highlightContent: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: 12,
    color: GlowColors.textSecondary,
  },
  highlightValue: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.md,
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
  toolList: {
    gap: Spacing.md,
  },
  toolItem: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  toolInfo: {
    marginBottom: Spacing.sm,
  },
  toolName: {
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    color: GlowColors.textPrimary,
  },
  toolLastUsed: {
    fontSize: 12,
    color: GlowColors.textSecondary,
    marginTop: 2,
  },
  toolCount: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
  },
  toolCountText: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.gold,
  },
  barContainer: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 3,
  },
});
