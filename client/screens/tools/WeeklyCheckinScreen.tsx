import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface WeeklyCheckin {
  id: string;
  couple_id: string;
  mood_rating: number;
  connection_rating: number;
  stress_level: number;
  reflection: string;
  is_private: boolean;
  created_at: string;
}

export default function WeeklyCheckinScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [moodRating, setMoodRating] = useState(5);
  const [connectionRating, setConnectionRating] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [reflection, setReflection] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<WeeklyCheckin[]>([]);
  const [loadingCheckins, setLoadingCheckins] = useState(true);

  useEffect(() => {
    loadRecentCheckins();
  }, [profile?.couple_id]);

  const loadRecentCheckins = async () => {
    if (!profile?.couple_id) return;

    try {
      const { data, error } = await supabase
        .from("Couples_weekly_checkins")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentCheckins(data || []);
    } catch (err) {
      console.error("Error loading check-ins:", err);
    } finally {
      setLoadingCheckins(false);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.couple_id) {
      setError("You must be part of a couple to submit check-ins.");
      return;
    }

    if (!reflection.trim()) {
      Alert.alert("Required", "Please add a reflection");
      return;
    }

    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error: insertError } = await supabase
        .from("Couples_weekly_checkins")
        .insert({
          couple_id: profile.couple_id,
          mood_rating: moodRating,
          connection_rating: connectionRating,
          stress_level: stressLevel,
          reflection: reflection.trim(),
          is_private: isPrivate,
        });

      if (insertError) throw insertError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Weekly check-in submitted!");
      setReflection("");
      loadRecentCheckins();
    } catch (err) {
      console.error("Error submitting check-in:", err);
      setError("Failed to submit. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const RatingButtons = ({
    label,
    value,
    onChange,
    color,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    color: string;
  }) => (
    <View style={styles.ratingGroup}>
      <ThemedText type="h4" style={styles.ratingLabel}>
        {label} (1-10)
      </ThemedText>
      <View style={styles.ratingButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
          <Pressable
            key={v}
            style={[
              styles.ratingButton,
              {
                backgroundColor: value === v ? color : theme.backgroundSecondary,
                borderColor: value === v ? color : theme.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(v);
            }}
          >
            <ThemedText
              type="small"
              style={{
                color: value === v ? "#FFFFFF" : theme.text,
                fontWeight: "600",
              }}
            >
              {v}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <ThemedText type="h2">Weekly Check-In</ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Share how you're feeling and strengthen your connection
      </ThemedText>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: Colors.light.error + "20" }]}>
          <ThemedText type="small" style={{ color: Colors.light.error }}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <Card style={styles.formCard}>
        <RatingButtons
          label="Mood"
          value={moodRating}
          onChange={setMoodRating}
          color={Colors.light.warning}
        />

        <RatingButtons
          label="Connection with Partner"
          value={connectionRating}
          onChange={setConnectionRating}
          color={Colors.light.accent}
        />

        <RatingButtons
          label="Stress Level"
          value={stressLevel}
          onChange={setStressLevel}
          color={Colors.light.error}
        />

        <View style={styles.inputGroup}>
          <ThemedText type="h4" style={styles.ratingLabel}>
            Reflection
          </ThemedText>
          <Input
            placeholder="What's on your mind this week?"
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[
            styles.privacyToggle,
            {
              backgroundColor: isPrivate ? theme.accent : theme.link,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsPrivate(!isPrivate);
          }}
        >
          <Feather
            name={isPrivate ? "lock" : "users"}
            size={18}
            color="#FFFFFF"
          />
          <ThemedText type="body" style={styles.privacyText}>
            {isPrivate ? "Private (Only You)" : "Shared (With Partner)"}
          </ThemedText>
        </Pressable>

        <Button onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Check-In"}
        </Button>
      </Card>

      {recentCheckins.length > 0 ? (
        <View style={styles.historySection}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Recent Check-Ins
          </ThemedText>
          {recentCheckins.map((checkin) => (
            <Card key={checkin.id} style={styles.checkinCard}>
              <View style={styles.checkinHeader}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {new Date(checkin.created_at).toLocaleDateString()}
                </ThemedText>
                {checkin.is_private ? (
                  <View style={[styles.privateBadge, { backgroundColor: theme.accent + "20" }]}>
                    <Feather name="lock" size={12} color={theme.accent} />
                    <ThemedText type="small" style={{ color: theme.accent, marginLeft: Spacing.xs }}>
                      Private
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <View style={styles.ratings}>
                <ThemedText type="small">
                  Mood: {checkin.mood_rating}/10
                </ThemedText>
                <ThemedText type="small">
                  Connection: {checkin.connection_rating}/10
                </ThemedText>
                <ThemedText type="small">
                  Stress: {checkin.stress_level}/10
                </ThemedText>
              </View>
              {checkin.reflection ? (
                <ThemedText type="body" style={styles.reflectionText}>
                  {checkin.reflection}
                </ThemedText>
              ) : null}
            </Card>
          ))}
        </View>
      ) : null}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  subtitle: {
    marginBottom: Spacing.lg,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  ratingGroup: {
    marginBottom: Spacing.xl,
  },
  ratingLabel: {
    marginBottom: Spacing.sm,
  },
  ratingButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  ratingButton: {
    minWidth: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    margin: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  privacyToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  privacyText: {
    color: "#FFFFFF",
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  historySection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  checkinCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  checkinHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  ratings: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  reflectionText: {
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
});
