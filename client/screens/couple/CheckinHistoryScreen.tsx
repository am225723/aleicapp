import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { listWeeklyCheckins, WeeklyCheckin } from "@/services/weeklyCheckinsService";

export default function CheckinHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkins, setCheckins] = useState<WeeklyCheckin[]>([]);
  const [averages, setAverages] = useState({ connection: 0, communication: 0, intimacy: 0 });

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const data = await listWeeklyCheckins(profile.couple_id);
      setCheckins(data);

      if (data.length > 0) {
        const totals = data.reduce(
          (acc, c) => ({
            connection: acc.connection + c.connection_rating,
            communication: acc.communication + c.communication_rating,
            intimacy: acc.intimacy + c.intimacy_rating,
          }),
          { connection: 0, communication: 0, intimacy: 0 }
        );

        setAverages({
          connection: Math.round((totals.connection / data.length) * 10) / 10,
          communication: Math.round((totals.communication / data.length) * 10) / 10,
          intimacy: Math.round((totals.intimacy / data.length) * 10) / 10,
        });
      }
    } catch (error) {
      console.error("Error loading checkin history:", error);
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

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return GlowColors.accentGreen;
    if (rating >= 5) return GlowColors.gold;
    return GlowColors.accentRed;
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
          title="Check-in History"
          subtitle="Track your weekly connection"
          gradientColors={["rgba(129, 201, 149, 0.4)", "rgba(40, 80, 60, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        {checkins.length > 0 ? (
          <View style={styles.averagesRow}>
            <View style={[styles.averageCard, { backgroundColor: GlowColors.cardBlue }]}>
              <ThemedText style={styles.averageValue}>{averages.connection}</ThemedText>
              <ThemedText style={styles.averageLabel}>Avg Connection</ThemedText>
            </View>
            <View style={[styles.averageCard, { backgroundColor: GlowColors.cardGreen }]}>
              <ThemedText style={styles.averageValue}>{averages.communication}</ThemedText>
              <ThemedText style={styles.averageLabel}>Avg Communication</ThemedText>
            </View>
            <View style={[styles.averageCard, { backgroundColor: GlowColors.cardPurple }]}>
              <ThemedText style={styles.averageValue}>{averages.intimacy}</ThemedText>
              <ThemedText style={styles.averageLabel}>Avg Intimacy</ThemedText>
            </View>
          </View>
        ) : null}

        <ThemedText style={styles.sectionTitle}>Past Check-ins</ThemedText>

        {isLoading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : checkins.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={48} color={GlowColors.textSecondary} />
            <ThemedText style={styles.emptyText}>No check-ins yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Complete your first weekly check-in</ThemedText>
          </View>
        ) : (
          <View style={styles.checkinList}>
            {checkins.map((checkin) => (
              <View key={checkin.id} style={styles.checkinItem}>
                <View style={styles.checkinHeader}>
                  <ThemedText style={styles.checkinDate}>{formatDate(checkin.created_at)}</ThemedText>
                </View>
                <View style={styles.ratingsRow}>
                  <View style={styles.ratingItem}>
                    <Feather name="heart" size={16} color={getRatingColor(checkin.connection_rating)} />
                    <ThemedText style={[styles.ratingValue, { color: getRatingColor(checkin.connection_rating) }]}>
                      {checkin.connection_rating}
                    </ThemedText>
                    <ThemedText style={styles.ratingLabel}>Connection</ThemedText>
                  </View>
                  <View style={styles.ratingItem}>
                    <Feather name="message-circle" size={16} color={getRatingColor(checkin.communication_rating)} />
                    <ThemedText style={[styles.ratingValue, { color: getRatingColor(checkin.communication_rating) }]}>
                      {checkin.communication_rating}
                    </ThemedText>
                    <ThemedText style={styles.ratingLabel}>Communication</ThemedText>
                  </View>
                  <View style={styles.ratingItem}>
                    <Feather name="zap" size={16} color={getRatingColor(checkin.intimacy_rating)} />
                    <ThemedText style={[styles.ratingValue, { color: getRatingColor(checkin.intimacy_rating) }]}>
                      {checkin.intimacy_rating}
                    </ThemedText>
                    <ThemedText style={styles.ratingLabel}>Intimacy</ThemedText>
                  </View>
                </View>
                {checkin.notes ? <ThemedText style={styles.notes}>{checkin.notes}</ThemedText> : null}
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
  averagesRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  averageCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  averageValue: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  averageLabel: {
    fontSize: 10,
    color: GlowColors.textSecondary,
    marginTop: 2,
    textAlign: "center",
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
  checkinList: {
    gap: Spacing.md,
  },
  checkinItem: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  checkinHeader: {
    marginBottom: Spacing.sm,
  },
  checkinDate: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: GlowColors.gold,
  },
  ratingsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  ratingItem: {
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    marginTop: 4,
  },
  ratingLabel: {
    fontSize: 11,
    color: GlowColors.textSecondary,
    marginTop: 2,
  },
  notes: {
    fontSize: 13,
    color: GlowColors.textSecondary,
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
});
