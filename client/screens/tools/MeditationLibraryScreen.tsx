import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing, BorderRadius } from "@/constants/theme";

const MEDITATIONS = [
  { id: "loving-kindness", name: "Loving Kindness", duration: 10, icon: "heart", description: "Send love to yourself and your partner" },
  { id: "body-scan", name: "Body Scan", duration: 15, icon: "activity", description: "Relax and connect with your body" },
  { id: "breathing", name: "Breathing Together", duration: 5, icon: "wind", description: "Synchronized breathing exercise" },
  { id: "gratitude", name: "Gratitude Meditation", duration: 8, icon: "gift", description: "Cultivate appreciation for your relationship" },
  { id: "forgiveness", name: "Forgiveness Practice", duration: 12, icon: "sunrise", description: "Release resentment and find peace" },
  { id: "connection", name: "Heart Connection", duration: 7, icon: "link", description: "Strengthen your emotional bond" },
];

export default function MeditationLibraryScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [activeMeditation, setActiveMeditation] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: sessions = [] } = useQuery({
    queryKey: ["meditation-sessions", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("meditation_sessions")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const logSessionMutation = useMutation({
    mutationFn: async (data: { type: string; duration: number }) => {
      if (!profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("meditation_sessions").insert({
        user_id: profile.id,
        couple_id: profile.couple_id,
        meditation_type: data.type,
        duration_minutes: data.duration,
        completed: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meditation-sessions"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const startMeditation = (id: string) => {
    setActiveMeditation(id);
    setTimer(0);
    setIsPlaying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const stopMeditation = () => {
    const meditation = MEDITATIONS.find((m) => m.id === activeMeditation);
    if (meditation && timer > 60) {
      logSessionMutation.mutate({
        type: activeMeditation!,
        duration: Math.ceil(timer / 60),
      });
    }
    setActiveMeditation(null);
    setIsPlaying(false);
    setTimer(0);
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  if (activeMeditation) {
    const meditation = MEDITATIONS.find((m) => m.id === activeMeditation);
    return (
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.meditationView,
            { paddingTop: headerHeight + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <View style={[styles.meditationIcon, { backgroundColor: theme.link }]}>
            <Feather name={meditation?.icon as any} size={48} color={theme.buttonText} />
          </View>

          <ThemedText type="h2" style={styles.meditationTitle}>
            {meditation?.name}
          </ThemedText>

          <ThemedText type="h1" style={[styles.timerText, { color: theme.link }]}>
            {formatTime(timer)}
          </ThemedText>

          <ThemedText type="body" style={styles.meditationDescription}>
            {meditation?.description}
          </ThemedText>

          <View style={styles.controlButtons}>
            <Pressable
              style={[styles.controlButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Feather
                name={isPlaying ? "pause" : "play"}
                size={32}
                color={theme.text}
              />
            </Pressable>

            <Button onPress={stopMeditation} style={styles.stopButton}>
              End Session
            </Button>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Meditation Library
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Mindfulness practices for couples
        </ThemedText>

        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <ThemedText type="h2" style={{ color: theme.link }}>
                {sessions.length}
              </ThemedText>
              <ThemedText type="small">Sessions</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.stat}>
              <ThemedText type="h2" style={{ color: theme.link }}>
                {totalMinutes}
              </ThemedText>
              <ThemedText type="small">Minutes</ThemedText>
            </View>
          </View>
        </Card>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Choose a Practice
        </ThemedText>

        {MEDITATIONS.map((meditation) => (
          <Card
            key={meditation.id}
            style={styles.meditationCard}
            onPress={() => startMeditation(meditation.id)}
          >
            <View style={styles.meditationHeader}>
              <View style={[styles.iconContainer, { backgroundColor: theme.link }]}>
                <Feather name={meditation.icon as any} size={20} color={theme.buttonText} />
              </View>
              <View style={styles.meditationInfo}>
                <ThemedText type="body" style={styles.meditationName}>
                  {meditation.name}
                </ThemedText>
                <ThemedText type="small" style={styles.durationText}>
                  {meditation.duration} min
                </ThemedText>
              </View>
              <Feather name="play-circle" size={24} color={theme.link} />
            </View>
            <ThemedText type="small" style={styles.descriptionText}>
              {meditation.description}
            </ThemedText>
          </Card>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  statsCard: {
    marginBottom: Spacing.xl,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  meditationCard: {
    marginBottom: Spacing.md,
  },
  meditationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  meditationInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  meditationName: {
    fontWeight: "600",
  },
  durationText: {
    opacity: 0.6,
  },
  descriptionText: {
    opacity: 0.7,
    marginLeft: 52,
  },
  meditationView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  meditationIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  meditationTitle: {
    marginBottom: Spacing.lg,
  },
  timerText: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  meditationDescription: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: Spacing["3xl"],
  },
  controlButtons: {
    alignItems: "center",
    gap: Spacing.xl,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    width: 200,
  },
});
