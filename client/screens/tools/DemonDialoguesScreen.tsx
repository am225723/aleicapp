import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
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

type PatternType = "pursue_withdraw" | "withdraw_withdraw" | "attack_attack";

interface DemonDialogue {
  id: string;
  pattern_type: PatternType;
  trigger_situation: string;
  my_reaction: string | null;
  partner_reaction: string | null;
  underlying_feeling: string | null;
  attachment_need: string | null;
  alternative_response: string | null;
  created_at: string;
}

const PATTERNS: { type: PatternType; name: string; description: string; icon: string }[] = [
  {
    type: "pursue_withdraw",
    name: "Pursue-Withdraw",
    description: "One partner pushes for connection while the other pulls away",
    icon: "arrow-right",
  },
  {
    type: "withdraw_withdraw",
    name: "Withdraw-Withdraw",
    description: "Both partners pull away and avoid emotional engagement",
    icon: "minus",
  },
  {
    type: "attack_attack",
    name: "Attack-Attack",
    description: "Both partners become defensive and critical",
    icon: "zap",
  },
];

export default function DemonDialoguesScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<PatternType | null>(null);
  const [trigger, setTrigger] = useState("");
  const [myReaction, setMyReaction] = useState("");
  const [underlyingFeeling, setUnderlyingFeeling] = useState("");
  const [attachmentNeed, setAttachmentNeed] = useState("");
  const [alternative, setAlternative] = useState("");

  const coupleId = profile?.couple_id;

  const { data: dialogues = [], isLoading } = useQuery({
    queryKey: ["demon-dialogues", coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      const { data, error } = await supabase
        .from("demon_dialogues")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DemonDialogue[];
    },
    enabled: !!coupleId,
  });

  const createDialogueMutation = useMutation({
    mutationFn: async () => {
      if (!coupleId || !profile || !selectedPattern) throw new Error("Missing data");
      const { error } = await supabase.from("demon_dialogues").insert({
        couple_id: coupleId,
        user_id: profile.id,
        pattern_type: selectedPattern,
        trigger_situation: trigger.trim(),
        my_reaction: myReaction.trim() || null,
        underlying_feeling: underlyingFeeling.trim() || null,
        attachment_need: attachmentNeed.trim() || null,
        alternative_response: alternative.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demon-dialogues", coupleId] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    },
    onError: () => {
      Alert.alert("Error", "Failed to save entry");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setSelectedPattern(null);
    setTrigger("");
    setMyReaction("");
    setUnderlyingFeeling("");
    setAttachmentNeed("");
    setAlternative("");
  };

  const handleSubmit = () => {
    if (!selectedPattern || !trigger.trim()) {
      Alert.alert("Error", "Please select a pattern and describe the trigger");
      return;
    }
    createDialogueMutation.mutate();
  };

  const getPatternInfo = (type: PatternType) => PATTERNS.find((p) => p.type === type);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Demon Dialogues
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Identify negative cycles in your relationship (EFT)
        </ThemedText>

        <Card style={styles.infoCard}>
          <ThemedText type="body" style={styles.infoText}>
            "Demon Dialogues" are the negative patterns couples fall into during conflict. 
            Recognizing these patterns is the first step to breaking free from them.
          </ThemedText>
        </Card>

        {!showForm ? (
          <Button onPress={() => setShowForm(true)} style={styles.addButton}>
            + Log a Pattern
          </Button>
        ) : (
          <Card style={styles.formCard}>
            <ThemedText type="h4" style={styles.formTitle}>
              Identify the Pattern
            </ThemedText>

            <View style={styles.patternButtons}>
              {PATTERNS.map((pattern) => (
                <Pressable
                  key={pattern.type}
                  style={[
                    styles.patternButton,
                    { borderColor: theme.border },
                    selectedPattern === pattern.type && {
                      backgroundColor: theme.link,
                      borderColor: theme.link,
                    },
                  ]}
                  onPress={() => {
                    setSelectedPattern(pattern.type);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Feather
                    name={pattern.icon as any}
                    size={20}
                    color={selectedPattern === pattern.type ? theme.buttonText : theme.text}
                  />
                  <ThemedText
                    style={[
                      styles.patternName,
                      selectedPattern === pattern.type && { color: theme.buttonText },
                    ]}
                  >
                    {pattern.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {selectedPattern ? (
              <ThemedText type="small" style={styles.patternDescription}>
                {getPatternInfo(selectedPattern)?.description}
              </ThemedText>
            ) : null}

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                What triggered this pattern?
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={trigger}
                onChangeText={setTrigger}
                placeholder="Describe the situation..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                How did you react?
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={myReaction}
                onChangeText={setMyReaction}
                placeholder="Your reaction..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                What feeling was underneath?
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={underlyingFeeling}
                onChangeText={setUnderlyingFeeling}
                placeholder="e.g., fear, loneliness, rejection..."
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                What attachment need wasn't met?
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={attachmentNeed}
                onChangeText={setAttachmentNeed}
                placeholder="e.g., reassurance, connection, validation..."
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                What could you do differently?
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={alternative}
                onChangeText={setAlternative}
                placeholder="An alternative response..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formButtons}>
              <Button onPress={resetForm} style={styles.formButton}>
                Cancel
              </Button>
              <Button
                onPress={handleSubmit}
                disabled={createDialogueMutation.isPending}
                style={styles.formButton}
              >
                {createDialogueMutation.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </View>
          </Card>
        )}

        {dialogues.length > 0 ? (
          <View style={styles.historySection}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Your Pattern History
            </ThemedText>
            {dialogues.map((dialogue) => {
              const patternInfo = getPatternInfo(dialogue.pattern_type);
              return (
                <Card key={dialogue.id} style={styles.dialogueCard}>
                  <View style={styles.dialogueHeader}>
                    <View style={[styles.patternBadge, { backgroundColor: theme.link }]}>
                      <ThemedText style={{ color: theme.buttonText, fontSize: 12 }}>
                        {patternInfo?.name}
                      </ThemedText>
                    </View>
                    <ThemedText type="small" style={styles.dialogueDate}>
                      {new Date(dialogue.created_at).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={styles.dialogueTrigger}>
                    {dialogue.trigger_situation}
                  </ThemedText>
                  {dialogue.underlying_feeling ? (
                    <ThemedText type="small" style={styles.dialogueDetail}>
                      Feeling: {dialogue.underlying_feeling}
                    </ThemedText>
                  ) : null}
                  {dialogue.attachment_need ? (
                    <ThemedText type="small" style={styles.dialogueDetail}>
                      Need: {dialogue.attachment_need}
                    </ThemedText>
                  ) : null}
                </Card>
              );
            })}
          </View>
        ) : null}
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
  infoCard: {
    marginBottom: Spacing.xl,
  },
  infoText: {
    fontStyle: "italic",
    opacity: 0.8,
  },
  addButton: {
    marginBottom: Spacing.xl,
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  formTitle: {
    marginBottom: Spacing.lg,
  },
  patternButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  patternButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  patternName: {
    fontSize: 11,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  patternDescription: {
    opacity: 0.7,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  textArea: {
    minHeight: 70,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  formButton: {
    flex: 1,
  },
  historySection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  dialogueCard: {
    marginBottom: Spacing.md,
  },
  dialogueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  patternBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  dialogueDate: {
    opacity: 0.6,
  },
  dialogueTrigger: {
    marginBottom: Spacing.sm,
  },
  dialogueDetail: {
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
});
