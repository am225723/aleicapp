import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { createWeeklyCheckin } from "@/services/weeklyCheckinsService";
import { createToolEntry } from "@/services/toolEntriesService";

export default function WeeklyCheckinScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [connectionRating, setConnectionRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [intimacyRating, setIntimacyRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!profile?.couple_id) {
      setError("You must be part of a couple to submit check-ins.");
      return;
    }

    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createWeeklyCheckin({
        couple_id: profile.couple_id,
        connection_rating: connectionRating,
        communication_rating: communicationRating,
        intimacy_rating: intimacyRating,
        notes: notes.trim() || undefined,
      });

      await createToolEntry({
        couple_id: profile.couple_id,
        tool_type: "checkin",
        payload: { connectionRating, communicationRating, intimacyRating },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (err) {
      console.error("Error submitting check-in:", err);
      setError("Failed to submit. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingLabel = (rating: number): string => {
    if (rating <= 2) return "Needs attention";
    if (rating <= 4) return "Could be better";
    if (rating <= 6) return "Okay";
    if (rating <= 8) return "Good";
    return "Great";
  };

  const getRatingColor = (rating: number): string => {
    if (rating <= 3) return Colors.light.error;
    if (rating <= 5) return Colors.light.warning;
    if (rating <= 7) return Colors.light.link;
    return Colors.light.success;
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["2xl"],
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="h2">Weekly Check-in</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          How has your connection been this week?
        </ThemedText>
      </View>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: Colors.light.error + "20" }]}>
          <ThemedText type="small" style={{ color: Colors.light.error }}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.sliderSection}>
        <View style={styles.sliderHeader}>
          <View style={styles.sliderLabel}>
            <Feather name="heart" size={18} color={Colors.light.accent} />
            <ThemedText type="h4" style={styles.sliderTitle}>
              Connection
            </ThemedText>
          </View>
          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor(connectionRating) + "20" },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: getRatingColor(connectionRating) }}
            >
              {connectionRating}/10 - {getRatingLabel(connectionRating)}
            </ThemedText>
          </View>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={connectionRating}
          onValueChange={setConnectionRating}
          minimumTrackTintColor={Colors.light.accent}
          maximumTrackTintColor={theme.border}
          thumbTintColor={Colors.light.accent}
        />
      </View>

      <View style={styles.sliderSection}>
        <View style={styles.sliderHeader}>
          <View style={styles.sliderLabel}>
            <Feather name="message-circle" size={18} color={Colors.light.link} />
            <ThemedText type="h4" style={styles.sliderTitle}>
              Communication
            </ThemedText>
          </View>
          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor(communicationRating) + "20" },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: getRatingColor(communicationRating) }}
            >
              {communicationRating}/10 - {getRatingLabel(communicationRating)}
            </ThemedText>
          </View>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={communicationRating}
          onValueChange={setCommunicationRating}
          minimumTrackTintColor={Colors.light.link}
          maximumTrackTintColor={theme.border}
          thumbTintColor={Colors.light.link}
        />
      </View>

      <View style={styles.sliderSection}>
        <View style={styles.sliderHeader}>
          <View style={styles.sliderLabel}>
            <Feather name="sun" size={18} color={Colors.light.success} />
            <ThemedText type="h4" style={styles.sliderTitle}>
              Intimacy
            </ThemedText>
          </View>
          <View
            style={[
              styles.ratingBadge,
              { backgroundColor: getRatingColor(intimacyRating) + "20" },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: getRatingColor(intimacyRating) }}
            >
              {intimacyRating}/10 - {getRatingLabel(intimacyRating)}
            </ThemedText>
          </View>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={intimacyRating}
          onValueChange={setIntimacyRating}
          minimumTrackTintColor={Colors.light.success}
          maximumTrackTintColor={theme.border}
          thumbTintColor={Colors.light.success}
        />
      </View>

      <Input
        label="Additional Notes (optional)"
        placeholder="Anything else you'd like to share about this week..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        style={styles.textArea}
        textAlignVertical="top"
      />

      <Button onPress={handleSubmit} disabled={isLoading} style={styles.submitButton}>
        {isLoading ? "Submitting..." : "Submit Check-in"}
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  sliderSection: {
    marginBottom: Spacing["2xl"],
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sliderLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  sliderTitle: {
    marginLeft: Spacing.sm,
  },
  ratingBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  submitButton: {
    marginTop: "auto",
  },
});
