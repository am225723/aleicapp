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
import { addRitual } from "@/lib/storage";

type Frequency = "daily" | "weekly" | "monthly";

export default function AddRitualScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await addRitual({
        coupleId: "couple-1",
        title: title.trim(),
        description: description.trim(),
        frequency,
        isActive: true,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
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
