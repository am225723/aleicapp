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

type FinancialTopic = "budget" | "savings" | "debt" | "goals" | "spending" | "investments" | "other";

interface FinancialConversation {
  id: string;
  topic: FinancialTopic;
  title: string;
  notes: string | null;
  decisions: { text: string }[] | null;
  created_at: string;
}

const TOPICS: { key: FinancialTopic; name: string; icon: string }[] = [
  { key: "budget", name: "Budget", icon: "pie-chart" },
  { key: "savings", name: "Savings", icon: "trending-up" },
  { key: "debt", name: "Debt", icon: "credit-card" },
  { key: "goals", name: "Goals", icon: "target" },
  { key: "spending", name: "Spending", icon: "shopping-bag" },
  { key: "investments", name: "Investments", icon: "bar-chart-2" },
];

export default function FinancialToolkitScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<FinancialTopic>("budget");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [decisions, setDecisions] = useState<string[]>([]);
  const [newDecision, setNewDecision] = useState("");

  const coupleId = profile?.couple_id;

  const { data: conversations = [] } = useQuery({
    queryKey: ["financial-conversations", coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      const { data, error } = await supabase
        .from("financial_conversations")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FinancialConversation[];
    },
    enabled: !!coupleId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!coupleId || !profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("financial_conversations").insert({
        couple_id: coupleId,
        user_id: profile.id,
        topic: selectedTopic,
        title: title.trim(),
        notes: notes.trim() || null,
        decisions: decisions.length > 0 ? decisions.map((d) => ({ text: d })) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-conversations"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    },
    onError: () => {
      Alert.alert("Error", "Failed to save");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setTitle("");
    setNotes("");
    setDecisions([]);
    setNewDecision("");
  };

  const addDecision = () => {
    if (newDecision.trim()) {
      setDecisions([...decisions, newDecision.trim()]);
      setNewDecision("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    createMutation.mutate();
  };

  const getTopicInfo = (topic: FinancialTopic) => TOPICS.find((t) => t.key === topic);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Financial Toolkit
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Have productive money conversations
        </ThemedText>

        <Card style={styles.tipsCard}>
          <ThemedText type="body" style={styles.tipTitle}>
            Money Talk Tips
          </ThemedText>
          <View style={styles.tipRow}>
            <Feather name="check" size={14} color={theme.success} />
            <ThemedText type="small" style={styles.tipText}>
              Schedule regular financial check-ins
            </ThemedText>
          </View>
          <View style={styles.tipRow}>
            <Feather name="check" size={14} color={theme.success} />
            <ThemedText type="small" style={styles.tipText}>
              Focus on goals, not blame
            </ThemedText>
          </View>
          <View style={styles.tipRow}>
            <Feather name="check" size={14} color={theme.success} />
            <ThemedText type="small" style={styles.tipText}>
              Document decisions together
            </ThemedText>
          </View>
        </Card>

        {!showForm ? (
          <Button onPress={() => setShowForm(true)} style={styles.addButton}>
            + Log Financial Discussion
          </Button>
        ) : (
          <Card style={styles.formCard}>
            <ThemedText type="body" style={styles.label}>
              Topic
            </ThemedText>
            <View style={styles.topicButtons}>
              {TOPICS.map((t) => (
                <Pressable
                  key={t.key}
                  style={[
                    styles.topicButton,
                    { borderColor: theme.border },
                    selectedTopic === t.key && { backgroundColor: theme.link, borderColor: theme.link },
                  ]}
                  onPress={() => setSelectedTopic(t.key)}
                >
                  <Feather
                    name={t.icon as any}
                    size={16}
                    color={selectedTopic === t.key ? theme.buttonText : theme.text}
                  />
                  <ThemedText
                    style={[
                      styles.topicLabel,
                      selectedTopic === t.key && { color: theme.buttonText },
                    ]}
                  >
                    {t.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Title
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Monthly budget review"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Notes
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Key points discussed..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Decisions Made
              </ThemedText>
              <View style={styles.decisionInput}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, flex: 1 }]}
                  value={newDecision}
                  onChangeText={setNewDecision}
                  placeholder="Add a decision..."
                  placeholderTextColor={theme.textSecondary}
                  onSubmitEditing={addDecision}
                />
                <Pressable
                  style={[styles.addDecisionButton, { backgroundColor: theme.link }]}
                  onPress={addDecision}
                >
                  <Feather name="plus" size={20} color={theme.buttonText} />
                </Pressable>
              </View>
              {decisions.map((d, idx) => (
                <View key={idx} style={[styles.decisionChip, { backgroundColor: theme.success + "20" }]}>
                  <Feather name="check-circle" size={14} color={theme.success} />
                  <ThemedText type="small" style={styles.decisionText}>{d}</ThemedText>
                  <Pressable onPress={() => setDecisions(decisions.filter((_, i) => i !== idx))}>
                    <Feather name="x" size={14} color={theme.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.formButtons}>
              <Button onPress={resetForm} style={styles.formButton}>
                Cancel
              </Button>
              <Button
                onPress={handleSubmit}
                disabled={createMutation.isPending}
                style={styles.formButton}
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </View>
          </Card>
        )}

        {conversations.length > 0 ? (
          <View style={styles.historySection}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Past Discussions
            </ThemedText>
            {conversations.map((conv) => {
              const topicInfo = getTopicInfo(conv.topic);
              return (
                <Card key={conv.id} style={styles.convCard}>
                  <View style={styles.convHeader}>
                    <View style={[styles.convIcon, { backgroundColor: theme.link }]}>
                      <Feather name={topicInfo?.icon as any} size={16} color={theme.buttonText} />
                    </View>
                    <View style={styles.convInfo}>
                      <ThemedText type="body">{conv.title}</ThemedText>
                      <ThemedText type="small" style={styles.convDate}>
                        {new Date(conv.created_at).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  </View>
                  {conv.notes ? (
                    <ThemedText type="small" style={styles.convNotes}>
                      {conv.notes}
                    </ThemedText>
                  ) : null}
                  {conv.decisions && conv.decisions.length > 0 ? (
                    <View style={styles.convDecisions}>
                      {conv.decisions.map((d: any, idx: number) => (
                        <View key={idx} style={styles.convDecision}>
                          <Feather name="check" size={12} color={theme.success} />
                          <ThemedText type="small" style={styles.convDecisionText}>
                            {d.text}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
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
  tipsCard: {
    marginBottom: Spacing.xl,
  },
  tipTitle: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tipText: {
    marginLeft: Spacing.sm,
    opacity: 0.8,
  },
  addButton: {
    marginBottom: Spacing.xl,
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  topicButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  topicButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  topicLabel: {
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  decisionInput: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addDecisionButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  decisionChip: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  decisionText: {
    flex: 1,
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
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
  convCard: {
    marginBottom: Spacing.md,
  },
  convHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  convIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  convInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  convDate: {
    opacity: 0.6,
  },
  convNotes: {
    opacity: 0.7,
    marginBottom: Spacing.sm,
  },
  convDecisions: {
    marginTop: Spacing.sm,
  },
  convDecision: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  convDecisionText: {
    marginLeft: Spacing.sm,
  },
});
