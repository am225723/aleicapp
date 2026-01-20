import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import {
  GlowWidget,
  GlowWidgetGrid,
  GlowWidgetRow,
  GlowBackground,
  GlowColors,
  CategoryHeroCard,
} from "@/components/GlowWidget";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { listRituals } from "@/services/ritualsService";
import { listDateNights } from "@/services/dateNightsService";
import { listCalendarEvents } from "@/services/calendarService";
import { supabase } from "@/lib/supabase";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PlanToolsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [goalsCount, setGoalsCount] = useState(0);
  const [dateNightCount, setDateNightCount] = useState(0);
  const [ritualsCount, setRitualsCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [parentingCount, setParentingCount] = useState(0);
  const [financeCount, setFinanceCount] = useState(0);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const [rituals, dateNights, events] = await Promise.all([
        listRituals(profile.couple_id),
        listDateNights(profile.couple_id),
        listCalendarEvents(profile.couple_id),
      ]);

      setRitualsCount(rituals.length);
      setDateNightCount(dateNights.length);

      const upcoming = events
        .filter(e => new Date(e.start_time) >= new Date())
        .slice(0, 2)
        .map(e => ({
          icon: "calendar" as const,
          title: e.title,
          subtitle: new Date(e.start_time).toLocaleDateString(),
        }));
      setUpcomingEvents(upcoming);

      const { count: goalCount } = await supabase
        .from("shared_goals")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", profile.couple_id);
      setGoalsCount(goalCount || 0);

      const { count: parentCount } = await supabase
        .from("parenting_discussions")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", profile.couple_id);
      setParentingCount(parentCount || 0);

      const { count: finCount } = await supabase
        .from("financial_conversations")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", profile.couple_id);
      setFinanceCount(finCount || 0);

    } catch (error) {
      console.error("Error loading plan data:", error);
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

  const handleNavigate = (route: keyof RootStackParamList) => {
    navigation.navigate(route as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={GlowColors.gold}
          />
        }
      >
        <CategoryHeroCard
          title="Plan"
          subtitle="Build your future together"
          gradientColors={["rgba(129, 201, 149, 0.4)", "rgba(40, 80, 60, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        <GlowWidgetGrid>
          <GlowWidgetRow>
            <GlowWidget
              title="Shared Goals"
              subtitle="Track dreams together"
              icon="target"
              iconColor={GlowColors.accentGreen}
              backgroundColor={GlowColors.cardGreen}
              onPress={() => handleNavigate("SharedGoals")}
              badge={goalsCount > 0 ? `${goalsCount} goals` : undefined}
            />
            <GlowWidget
              title="Date Night"
              subtitle="AI-powered ideas"
              icon="heart"
              iconColor={GlowColors.accentPink}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("DateNight")}
              badge={dateNightCount > 0 ? `${dateNightCount} saved` : undefined}
              actionButton={{
                label: "Generate",
                icon: "zap",
              }}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Rituals"
              subtitle="Daily connection habits"
              icon="star"
              iconColor={GlowColors.gold}
              backgroundColor={GlowColors.cardBrown}
              onPress={() => handleNavigate("AddRitual")}
              badge={ritualsCount > 0 ? `${ritualsCount} active` : undefined}
            />
            <GlowWidget
              title="Calendar"
              subtitle="Shared schedule"
              icon="calendar"
              iconColor={GlowColors.accentBlue}
              backgroundColor={GlowColors.cardBlue}
              onPress={() => handleNavigate("Calendar")}
              previewItems={upcomingEvents.length > 0 ? upcomingEvents : undefined}
              size={upcomingEvents.length > 0 ? "large" : "medium"}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Parenting"
              subtitle="Align on family matters"
              icon="users"
              iconColor={GlowColors.accentPurple}
              backgroundColor={GlowColors.cardPurple}
              onPress={() => handleNavigate("ParentingPartners")}
              badge={parentingCount > 0 ? `${parentingCount} topics` : undefined}
            />
            <GlowWidget
              title="Finances"
              subtitle="Money conversations"
              icon="dollar-sign"
              iconColor={GlowColors.accentTeal}
              backgroundColor={GlowColors.cardTeal}
              onPress={() => handleNavigate("FinancialToolkit")}
              badge={financeCount > 0 ? `${financeCount} discussions` : undefined}
            />
          </GlowWidgetRow>
        </GlowWidgetGrid>
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
});
