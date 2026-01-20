import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface MoodEntry {
  id: string;
  created_at: string;
  mood_int: number;
  notes: string | null;
}

const MOOD_EMOJIS = ["", "", "", "", "", "", "", "", "", ""];
const MOOD_LABELS = ["Awful", "Terrible", "Bad", "Low", "Meh", "Okay", "Good", "Great", "Amazing", "Perfect"];

export default function MoodTrackerScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [todayLogged, setTodayLogged] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const { data } = await supabase
        .from("Couples_moods")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false })
        .limit(14);

      if (data) {
        setMoods(data);
        const today = new Date().toDateString();
        const hasToday = data.some((m) => new Date(m.created_at).toDateString() === today);
        setTodayLogged(hasToday);
      }
    } catch (error) {
      console.error("Error loading moods:", error);
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

  const handleMoodSelect = (mood: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(mood);
  };

  const handleSave = async () => {
    if (!profile?.couple_id || !profile?.id || selectedMood === null) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("Couples_moods").insert({
        couple_id: profile.couple_id,
        user_id: profile.id,
        mood_int: selectedMood,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedMood(null);
      setNotes("");
      setTodayLogged(true);
      await loadData();
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return GlowColors.accentGreen;
    if (mood >= 5) return GlowColors.gold;
    if (mood >= 3) return GlowColors.accentOrange;
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
          title="Mood Tracker"
          subtitle="How are you feeling today?"
          gradientColors={["rgba(243, 156, 18, 0.4)", "rgba(100, 70, 40, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        {!todayLogged ? (
          <View style={styles.logSection}>
            <ThemedText style={styles.sectionTitle}>Log Your Mood</ThemedText>

            <View style={styles.moodGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
                <Pressable
                  key={mood}
                  style={[
                    styles.moodButton,
                    selectedMood === mood && { backgroundColor: getMoodColor(mood), borderColor: getMoodColor(mood) },
                  ]}
                  onPress={() => handleMoodSelect(mood)}
                >
                  <ThemedText style={styles.moodNumber}>{mood}</ThemedText>
                </Pressable>
              ))}
            </View>

            {selectedMood !== null ? (
              <ThemedText style={[styles.moodLabel, { color: getMoodColor(selectedMood) }]}>
                {MOOD_LABELS[selectedMood - 1]}
              </ThemedText>
            ) : null}

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              placeholderTextColor={GlowColors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <Pressable
              style={[styles.saveButton, (!selectedMood || isSaving) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!selectedMood || isSaving}
            >
              <ThemedText style={styles.saveButtonText}>{isSaving ? "Saving..." : "Log Mood"}</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.loggedMessage}>
            <Feather name="check-circle" size={32} color={GlowColors.accentGreen} />
            <ThemedText style={styles.loggedText}>You've logged your mood today!</ThemedText>
          </View>
        )}

        <ThemedText style={styles.sectionTitle}>Recent Moods</ThemedText>

        {isLoading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : moods.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="smile" size={48} color={GlowColors.textSecondary} />
            <ThemedText style={styles.emptyText}>No moods logged yet</ThemedText>
          </View>
        ) : (
          <View style={styles.moodList}>
            {moods.map((mood) => (
              <View key={mood.id} style={styles.moodItem}>
                <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(mood.mood_int) }]}>
                  <ThemedText style={styles.moodIndicatorText}>{mood.mood_int}</ThemedText>
                </View>
                <View style={styles.moodInfo}>
                  <ThemedText style={styles.moodDate}>{formatDate(mood.created_at)}</ThemedText>
                  {mood.notes ? <ThemedText style={styles.moodNotes}>{mood.notes}</ThemedText> : null}
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
  logSection: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.md,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  moodButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  moodNumber: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  moodLabel: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  notesInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: GlowColors.textPrimary,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: Spacing.md,
  },
  saveButton: {
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  loggedMessage: {
    backgroundColor: GlowColors.cardGreen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  loggedText: {
    fontSize: 16,
    color: GlowColors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
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
  moodList: {
    gap: Spacing.sm,
  },
  moodItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  moodIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  moodIndicatorText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  moodInfo: {
    flex: 1,
  },
  moodDate: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: GlowColors.textPrimary,
  },
  moodNotes: {
    fontSize: 13,
    color: GlowColors.textSecondary,
    marginTop: 2,
  },
});
