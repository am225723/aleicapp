import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
import { supabase } from "@/lib/supabase";

const heroTools = require("../../assets/images/hero-tools.png");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyticsStatus, setAnalyticsStatus] = useState("View your insights");
  const [checkinHistoryCount, setCheckinHistoryCount] = useState(0);
  const [progressStatus, setProgressStatus] = useState("Track your journey");

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const { count: checkinCount } = await supabase
        .from("Couples_weekly_checkins")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", profile.couple_id);
      setCheckinHistoryCount(checkinCount || 0);

      const { data: toolEntries } = await supabase
        .from("Couples_tool_entries")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (toolEntries && toolEntries.length > 0) {
        setAnalyticsStatus("Data available");
      }

    } catch (error) {
      console.error("Error loading tools data:", error);
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
          title="Tools"
          subtitle="Additional resources for your relationship"
          image={heroTools}
        />

        <GlowWidgetGrid>
          <GlowWidgetRow>
            <GlowWidget
              title="Analytics"
              subtitle="Insights and trends"
              icon="bar-chart-2"
              iconColor={GlowColors.accentBlue}
              backgroundColor={GlowColors.cardBlue}
              onPress={() => handleNavigate("Analytics")}
              statusText={analyticsStatus}
            />
            <GlowWidget
              title="Check-in History"
              subtitle="Past weekly check-ins"
              icon="clock"
              iconColor={GlowColors.accentPurple}
              backgroundColor={GlowColors.cardPurple}
              onPress={() => handleNavigate("CheckinHistory")}
              badge={checkinHistoryCount > 0 ? `${checkinHistoryCount}` : undefined}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Progress Timeline"
              subtitle="Your relationship journey"
              icon="trending-up"
              iconColor={GlowColors.accentGreen}
              backgroundColor={GlowColors.cardGreen}
              onPress={() => handleNavigate("ProgressTimeline")}
              statusText={progressStatus}
            />
            <GlowWidget
              title="Settings"
              subtitle="App preferences"
              icon="settings"
              iconColor={GlowColors.gold}
              backgroundColor={GlowColors.cardBrown}
              onPress={() => handleNavigate("Settings")}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Profile"
              subtitle="Your account"
              icon="user"
              iconColor={GlowColors.accentTeal}
              backgroundColor={GlowColors.cardTeal}
              onPress={() => handleNavigate("CoupleProfile")}
            />
            <GlowWidget
              title="Couple Setup"
              subtitle="Link with partner"
              icon="link"
              iconColor={GlowColors.accentPink}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("CoupleSetup")}
              statusText="Connect accounts"
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
