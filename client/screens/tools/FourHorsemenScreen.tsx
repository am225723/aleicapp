import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

type Horseman = "criticism" | "contempt" | "defensiveness" | "stonewalling";

const horsemen = [
  {
    type: "criticism" as Horseman,
    name: "Criticism",
    icon: "message-square" as const,
    description: "Attacking character instead of behavior",
    example: '"You always..." or "You never..."',
    antidote: 'Use gentle start-up: "I feel... when... I need..."',
  },
  {
    type: "contempt" as Horseman,
    name: "Contempt",
    icon: "frown" as const,
    description: "Treating partner with disrespect",
    example: "Sarcasm, eye-rolling, mockery",
    antidote: "Build culture of appreciation and respect",
  },
  {
    type: "defensiveness" as Horseman,
    name: "Defensiveness",
    icon: "shield" as const,
    description: "Warding off perceived attack",
    example: "Making excuses, playing victim",
    antidote: "Take responsibility, even for small part",
  },
  {
    type: "stonewalling" as Horseman,
    name: "Stonewalling",
    icon: "square" as const,
    description: "Shutting down and withdrawing",
    example: "Silent treatment, walking away",
    antidote: "Self-soothe, then reengage calmly",
  },
];

export default function FourHorsemenScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [selectedHorseman, setSelectedHorseman] = useState<Horseman | null>(null);
  const [situation, setSituation] = useState("");

  const logHorsemanMutation = useMutation({
    mutationFn: async (data: { horseman_type: Horseman; situation: string }) => {
      return apiRequest("POST", "/api/four-horsemen/log", data);
    },
    onSuccess: () => {
      setSelectedHorseman(null);
      setSituation("");
    },
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <ThemedText type="h2">Four Horsemen Tracker</ThemedText>
      <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
        Gottman's predictors of relationship distress
      </ThemedText>

      <Card style={[styles.warningCard, { backgroundColor: theme.warning + "15" }]}>
        <View style={styles.warningHeader}>
          <Feather name="alert-triangle" size={20} color={theme.warning} />
          <ThemedText type="h4" style={{ color: theme.warning, marginLeft: Spacing.sm }}>
            Why Track These?
          </ThemedText>
        </View>
        <ThemedText type="body" style={{ marginTop: Spacing.sm }}>
          The Four Horsemen are communication patterns that predict
          relationship problems. By noticing them, you can choose healthier
          responses.
        </ThemedText>
      </Card>

      {horsemen.map((horseman) => (
        <Card key={horseman.type} style={styles.horsemanCard}>
          <View style={styles.horsemanHeader}>
            <View style={[styles.iconCircle, { backgroundColor: theme.link + "20" }]}>
              <Feather name={horseman.icon} size={24} color={theme.link} />
            </View>
            <View style={styles.horsemanInfo}>
              <ThemedText type="h4">{horseman.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {horseman.description}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.exampleCard, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Example:
            </ThemedText>
            <ThemedText type="body" style={{ fontStyle: "italic" }}>
              {horseman.example}
            </ThemedText>
          </View>

          <View style={[styles.antidoteCard, { backgroundColor: theme.success + "15" }]}>
            <ThemedText type="small" style={{ color: theme.success }}>
              Antidote:
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {horseman.antidote}
            </ThemedText>
          </View>

          <Pressable
            style={[styles.noticeButton, { borderColor: theme.link }]}
            onPress={() => setSelectedHorseman(horseman.type)}
          >
            <ThemedText type="body" style={{ color: theme.link }}>
              I noticed this
            </ThemedText>
          </Pressable>
        </Card>
      ))}

      {selectedHorseman ? (
        <Card style={styles.logCard}>
          <ThemedText type="h4" style={{ color: theme.link, marginBottom: Spacing.sm }}>
            Log {horsemen.find((h) => h.type === selectedHorseman)?.name}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
            What happened? (No judgment - just awareness)
          </ThemedText>

          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={situation}
            onChangeText={setSituation}
            placeholder="Describe the situation..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.logButtons}>
            <Pressable
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={() => {
                setSelectedHorseman(null);
                setSituation("");
              }}
            >
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Cancel
              </ThemedText>
            </Pressable>
            <Button
              onPress={() => {
                logHorsemanMutation.mutate({
                  horseman_type: selectedHorseman,
                  situation,
                });
              }}
              disabled={!situation.trim() || logHorsemanMutation.isPending}
              style={{ flex: 1 }}
            >
              Log It
            </Button>
          </View>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  warningCard: {
    marginBottom: Spacing.xl,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  horsemanCard: {
    marginBottom: Spacing.lg,
  },
  horsemanHeader: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  horsemanInfo: {
    flex: 1,
  },
  exampleCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  antidoteCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  noticeButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  logCard: {
    marginTop: Spacing.lg,
  },
  textArea: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    minHeight: 100,
    marginBottom: Spacing.md,
  },
  logButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    height: Spacing.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
  },
});
