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
import { listGratitudeLogs } from "@/services/gratitudeService";
import { listJournalEntries } from "@/services/journalService";
import { listWeeklyCheckins } from "@/services/weeklyCheckinsService";
import { supabase } from "@/lib/supabase";

const heroCalm = require("../../assets/images/hero-calm.png");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CalmScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gratitudeCount, setGratitudeCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [checkinStatus, setCheckinStatus] = useState("Start your first check-in");
  const [meditationCount, setMeditationCount] = useState(0);
  const [voiceMemoCount, setVoiceMemoCount] = useState(0);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const [gratitudeLogs, journals, checkins] = await Promise.all([
        listGratitudeLogs(profile.couple_id),
        listJournalEntries(profile.couple_id),
        listWeeklyCheckins(profile.couple_id),
      ]);

      setGratitudeCount(gratitudeLogs.length);
      setJournalCount(journals.length);

      if (checkins.length > 0) {
        const latest = checkins[0];
        const date = new Date(latest.created_at);
        const isThisWeek = (new Date().getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
        setCheckinStatus(isThisWeek ? "Completed this week" : "Due this Sunday");
      }

      const { count: medCount } = await supabase
        .from("meditation_sessions")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", profile.couple_id);
      setMeditationCount(medCount || 0);

      const { count: memoCount } = await supabase
        .from("voice_memos")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", profile.couple_id);
      setVoiceMemoCount(memoCount || 0);

    } catch (error) {
      console.error("Error loading calm data:", error);
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
          title="Calm"
          subtitle="Breathe, reflect, and find peace together"
          image={heroCalm}
        />

        <GlowWidgetGrid>
          <GlowWidgetRow>
            <GlowWidget
              title="Pause Button"
              subtitle="Guided breathing"
              icon="pause-circle"
              iconColor={GlowColors.accentBlue}
              backgroundColor={GlowColors.cardBlue}
              onPress={() => handleNavigate("PauseButton")}
              actionButton={{
                label: "Breathe",
                icon: "wind",
              }}
            />
            <GlowWidget
              title="Meditation"
              subtitle="Mindfulness for couples"
              icon="sun"
              iconColor={GlowColors.accentPurple}
              backgroundColor={GlowColors.cardPurple}
              onPress={() => handleNavigate("MeditationLibrary")}
              badge={meditationCount > 0 ? `${meditationCount} sessions` : undefined}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Weekly Check-in"
              subtitle="Rate your connection"
              icon="check-square"
              iconColor={GlowColors.goldLight}
              backgroundColor={GlowColors.cardTeal}
              onPress={() => handleNavigate("WeeklyCheckin")}
              statusText={checkinStatus}
            />
            <GlowWidget
              title="Voice Memos"
              subtitle="Send a loving message"
              icon="mic"
              iconColor={GlowColors.accentRed}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("VoiceMemos")}
              badge={voiceMemoCount > 0 ? `${voiceMemoCount}` : undefined}
              actionButton={{
                label: "Record",
                icon: "mic",
              }}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Gratitude Log"
              subtitle="Share appreciation"
              icon="gift"
              iconColor={GlowColors.gold}
              backgroundColor={GlowColors.cardBrown}
              onPress={() => handleNavigate("AddGratitude")}
              badge={gratitudeCount > 0 ? `${gratitudeCount} entries` : undefined}
            />
            <GlowWidget
              title="Journal"
              subtitle="Record reflections"
              icon="book-open"
              iconColor={GlowColors.accentTeal}
              backgroundColor={GlowColors.cardGreen}
              onPress={() => handleNavigate("AddJournal")}
              badge={journalCount > 0 ? `${journalCount} entries` : undefined}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Mood Tracker"
              subtitle="Log how you're feeling"
              icon="smile"
              iconColor={GlowColors.accentPink}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("MoodTracker")}
              statusText="Track daily moods"
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
