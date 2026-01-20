import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Pressable, Share } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Suggestion {
  id: string;
  suggestion: string;
  steps: string[];
  created_at: string;
  is_saved: boolean;
}

const SAMPLE_SUGGESTIONS = [
  {
    suggestion: "Plan a tech-free evening together",
    steps: [
      "Set a specific time to put devices away",
      "Choose an activity you both enjoy",
      "Focus on being present with each other",
      "Share appreciation before bed",
    ],
  },
  {
    suggestion: "Write a love letter to your partner",
    steps: [
      "Find a quiet moment to reflect",
      "Write about specific things you love",
      "Include a favorite memory",
      "Leave it somewhere they'll find it",
    ],
  },
  {
    suggestion: "Try something new together",
    steps: [
      "Discuss activities neither has tried",
      "Choose one that excites you both",
      "Schedule a date to try it",
      "Embrace the adventure together",
    ],
  },
  {
    suggestion: "Have a gratitude conversation",
    steps: [
      "Take turns sharing three things",
      "Be specific about what you appreciate",
      "Listen without interrupting",
      "End with a thank you",
    ],
  },
];

export default function DailySuggestionScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [todaySuggestion, setTodaySuggestion] = useState<Suggestion | null>(null);
  const [savedSuggestions, setSavedSuggestions] = useState<Suggestion[]>([]);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: todayData } = await supabase
        .from("daily_suggestions")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .gte("created_at", today)
        .order("created_at", { ascending: false })
        .limit(1);

      if (todayData && todayData.length > 0) {
        setTodaySuggestion(todayData[0]);
      }

      const { data: saved } = await supabase
        .from("daily_suggestions")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .eq("is_saved", true)
        .order("created_at", { ascending: false });

      if (saved) {
        setSavedSuggestions(saved);
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
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

  const handleGenerate = async () => {
    if (!profile?.couple_id) return;

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const randomSuggestion = SAMPLE_SUGGESTIONS[Math.floor(Math.random() * SAMPLE_SUGGESTIONS.length)];

      const { data, error } = await supabase
        .from("daily_suggestions")
        .insert({
          couple_id: profile.couple_id,
          suggestion: randomSuggestion.suggestion,
          steps: randomSuggestion.steps,
          is_saved: false,
        })
        .select()
        .single();

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTodaySuggestion(data);
    } catch (error) {
      console.error("Error generating suggestion:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!todaySuggestion) return;

    try {
      const { error } = await supabase
        .from("daily_suggestions")
        .update({ is_saved: !todaySuggestion.is_saved })
        .eq("id", todaySuggestion.id);

      if (error) throw error;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTodaySuggestion({ ...todaySuggestion, is_saved: !todaySuggestion.is_saved });
      await loadData();
    } catch (error) {
      console.error("Error saving suggestion:", error);
    }
  };

  const handleShare = async () => {
    if (!todaySuggestion) return;

    try {
      await Share.share({
        message: `Today's relationship tip: ${todaySuggestion.suggestion}\n\nSteps:\n${todaySuggestion.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
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
          title="Daily Suggestion"
          subtitle="Strengthen your bond every day"
          gradientColors={["rgba(243, 156, 18, 0.4)", "rgba(100, 70, 40, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        {!todaySuggestion ? (
          <View style={styles.generateCard}>
            <Feather name="sunrise" size={48} color={GlowColors.gold} />
            <ThemedText style={styles.generateTitle}>Get Today's Suggestion</ThemedText>
            <ThemedText style={styles.generateSubtitle}>
              Receive a personalized tip to strengthen your relationship
            </ThemedText>
            <Pressable
              style={[styles.generateButton, isGenerating && styles.buttonDisabled]}
              onPress={handleGenerate}
              disabled={isGenerating}
            >
              <Feather name="zap" size={20} color="#000" />
              <ThemedText style={styles.generateButtonText}>
                {isGenerating ? "Generating..." : "Generate Suggestion"}
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <View style={styles.todayBadge}>
                <Feather name="sun" size={14} color="#000" />
                <ThemedText style={styles.todayBadgeText}>Today's Tip</ThemedText>
              </View>
              <View style={styles.actionButtons}>
                <Pressable style={styles.iconButton} onPress={handleSave}>
                  <Feather
                    name={todaySuggestion.is_saved ? "heart" : "heart"}
                    size={20}
                    color={todaySuggestion.is_saved ? GlowColors.accentRed : GlowColors.textSecondary}
                  />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={handleShare}>
                  <Feather name="share" size={20} color={GlowColors.textSecondary} />
                </Pressable>
              </View>
            </View>

            <ThemedText style={styles.suggestionText}>{todaySuggestion.suggestion}</ThemedText>

            {todaySuggestion.steps && todaySuggestion.steps.length > 0 ? (
              <View style={styles.stepsContainer}>
                <ThemedText style={styles.stepsTitle}>How to do it:</ThemedText>
                {todaySuggestion.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
                    </View>
                    <ThemedText style={styles.stepText}>{step}</ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )}

        {savedSuggestions.length > 0 ? (
          <>
            <ThemedText style={styles.sectionTitle}>Saved Suggestions</ThemedText>
            <View style={styles.savedList}>
              {savedSuggestions.map((suggestion) => (
                <View key={suggestion.id} style={styles.savedItem}>
                  <Feather name="heart" size={16} color={GlowColors.accentRed} />
                  <ThemedText style={styles.savedText} numberOfLines={2}>
                    {suggestion.suggestion}
                  </ThemedText>
                </View>
              ))}
            </View>
          </>
        ) : null}
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
  generateCard: {
    backgroundColor: GlowColors.cardBrown,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  generateTitle: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginTop: Spacing.md,
  },
  generateSubtitle: {
    fontSize: 14,
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  suggestionCard: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  suggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  todayBadgeText: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  suggestionText: {
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.lg,
    lineHeight: 30,
  },
  stepsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  stepsTitle: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.gold,
    marginBottom: Spacing.md,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GlowColors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: GlowColors.textPrimary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.md,
  },
  savedList: {
    gap: Spacing.sm,
  },
  savedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  savedText: {
    flex: 1,
    fontSize: 14,
    color: GlowColors.textPrimary,
  },
});
