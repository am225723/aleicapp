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
import { addWeeklyCheckin, addToolEntry } from "@/lib/storage";

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

  const handleSubmit = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await addWeeklyCheckin({
        coupleId: profile?.couple_id || "couple-1",
        authorId: profile?.id || "user-1",
        authorName: profile?.full_name || "You",
        connectionRating,
        communicationRating,
        intimacyRating,
        notes,
      });

      await addToolEntry({
        coupleId: "couple-1",
        toolType: "checkin",
        payload: { connectionRating, communicationRating, intimacyRating },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
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
