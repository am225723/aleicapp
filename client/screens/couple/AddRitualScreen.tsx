import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { createRitual } from "@/services/ritualsService";

type Frequency = "daily" | "weekly" | "monthly";

export default function AddRitualScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) return;
    if (!profile?.couple_id) {
      setError("You must be part of a couple to create rituals.");
      return;
    }

    setIsLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await createRitual({
        couple_id: profile.couple_id,
        title: title.trim(),
        description: description.trim(),
        frequency,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (err) {
      console.error("Error creating ritual:", err);
      setError("Failed to create ritual. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const frequencies: { value: Frequency; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

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
        <ThemedText type="h3">Create a Ritual</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Build meaningful daily habits together
        </ThemedText>
      </View>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: Colors.light.error + "20" }]}>
          <ThemedText type="small" style={{ color: Colors.light.error }}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <Input
        label="Ritual Name"
        placeholder="e.g., Morning coffee together"
        value={title}
        onChangeText={setTitle}
      />

      <Input
        label="Description (optional)"
        placeholder="What does this ritual mean to you?"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.textArea}
        textAlignVertical="top"
      />

      <View style={styles.frequencySection}>
        <ThemedText type="small" style={styles.frequencyLabel}>
          How often?
        </ThemedText>
        <View style={styles.frequencyButtons}>
          {frequencies.map((freq) => (
            <Pressable
              key={freq.value}
              style={[
                styles.frequencyButton,
                {
                  backgroundColor:
                    frequency === freq.value
                      ? Colors.light.link
                      : theme.backgroundDefault,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFrequency(freq.value);
              }}
            >
              <ThemedText
                type="body"
                style={{
                  color:
                    frequency === freq.value ? "#FFFFFF" : theme.textSecondary,
                }}
              >
                {freq.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <Button
        onPress={handleSave}
        disabled={!title.trim() || isLoading}
        style={styles.saveButton}
      >
        {isLoading ? "Saving..." : "Create Ritual"}
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
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  frequencySection: {
    marginBottom: Spacing.xl,
  },
  frequencyLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  frequencyButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  saveButton: {
    marginTop: "auto",
  },
});
