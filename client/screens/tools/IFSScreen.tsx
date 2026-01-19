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

interface IFSSession {
  id: string;
  session_type: string;
  parts_identified: { name: string; role: string; emotion: string }[];
  core_self_notes: string | null;
  insights: string | null;
  created_at: string;
}

const PROMPTS = [
  "What part of you is showing up right now?",
  "What is this part trying to protect you from?",
  "What does this part need to feel safe?",
  "How can you show compassion to this part?",
  "What would your Self say to this part?",
];

export default function IFSScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [partName, setPartName] = useState("");
  const [partRole, setPartRole] = useState("");
  const [partEmotion, setPartEmotion] = useState("");
  const [parts, setParts] = useState<{ name: string; role: string; emotion: string }[]>([]);
  const [selfNotes, setSelfNotes] = useState("");
  const [insights, setInsights] = useState("");

  const { data: sessions = [] } = useQuery({
    queryKey: ["ifs-sessions", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("ifs_sessions")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as IFSSession[];
    },
    enabled: !!profile,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("ifs_sessions").insert({
        user_id: profile.id,
        couple_id: profile.couple_id,
        session_type: "parts_mapping",
        parts_identified: parts,
        core_self_notes: selfNotes.trim() || null,
        insights: insights.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ifs-sessions"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    },
    onError: () => {
      Alert.alert("Error", "Failed to save session");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setPartName("");
    setPartRole("");
    setPartEmotion("");
    setParts([]);
    setSelfNotes("");
    setInsights("");
  };

  const addPart = () => {
    if (!partName.trim()) return;
    setParts([...parts, { name: partName.trim(), role: partRole.trim(), emotion: partEmotion.trim() }]);
    setPartName("");
    setPartRole("");
    setPartEmotion("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (parts.length === 0 && !selfNotes.trim() && !insights.trim()) {
      Alert.alert("Error", "Please add at least one part or some notes");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Parts Work
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Explore and befriend your internal parts
        </ThemedText>

        <Card style={styles.promptCard}>
          <ThemedText type="body" style={styles.promptText}>
            {PROMPTS[Math.floor(Math.random() * PROMPTS.length)]}
          </ThemedText>
        </Card>

        {!showForm ? (
          <Button onPress={() => setShowForm(true)} style={styles.startButton}>
            Start New Session
          </Button>
        ) : (
          <Card style={styles.formCard}>
            <ThemedText type="h4" style={styles.formTitle}>
              Identify a Part
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Part Name
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={partName}
                onChangeText={setPartName}
                placeholder="e.g., The Critic, The Protector"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Its Role
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={partRole}
                onChangeText={setPartRole}
                placeholder="What does it do/protect?"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Core Emotion
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={partEmotion}
                onChangeText={setPartEmotion}
                placeholder="Fear, shame, anger..."
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <Button onPress={addPart} style={styles.addPartButton}>
              + Add This Part
            </Button>

            {parts.length > 0 ? (
              <View style={styles.partsSection}>
                <ThemedText type="body" style={styles.partsTitle}>
                  Parts Identified ({parts.length})
                </ThemedText>
                {parts.map((part, index) => (
                  <View key={index} style={[styles.partChip, { backgroundColor: theme.backgroundSecondary }]}>
                    <View style={styles.partInfo}>
                      <ThemedText type="body">{part.name}</ThemedText>
                      {part.role ? (
                        <ThemedText type="small" style={styles.partDetail}>
                          {part.role}
                        </ThemedText>
                      ) : null}
                    </View>
                    <Pressable onPress={() => removePart(index)}>
                      <Feather name="x" size={18} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Notes from Self
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={selfNotes}
                onChangeText={setSelfNotes}
                placeholder="What would your calm, curious Self say?"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Insights
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={insights}
                onChangeText={setInsights}
                placeholder="What did you learn?"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formButtons}>
              <Button onPress={resetForm} style={styles.formButton}>
                Cancel
              </Button>
              <Button
                onPress={handleSave}
                disabled={saveMutation.isPending}
                style={styles.formButton}
              >
                {saveMutation.isPending ? "Saving..." : "Save Session"}
              </Button>
            </View>
          </Card>
        )}

        {sessions.length > 0 ? (
          <View style={styles.historySection}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Recent Sessions
            </ThemedText>
            {sessions.map((session) => (
              <Card key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <ThemedText type="small" style={styles.sessionDate}>
                    {new Date(session.created_at).toLocaleDateString()}
                  </ThemedText>
                  <ThemedText type="small" style={styles.partsCount}>
                    {session.parts_identified?.length || 0} parts
                  </ThemedText>
                </View>
                {session.parts_identified?.map((part: any, idx: number) => (
                  <ThemedText key={idx} type="body" style={styles.sessionPart}>
                    {part.name}
                  </ThemedText>
                ))}
                {session.insights ? (
                  <ThemedText type="small" style={styles.sessionInsight}>
                    {session.insights}
                  </ThemedText>
                ) : null}
              </Card>
            ))}
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
  promptCard: {
    marginBottom: Spacing.xl,
  },
  promptText: {
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.9,
  },
  startButton: {
    marginBottom: Spacing.xl,
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  formTitle: {
    marginBottom: Spacing.lg,
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
    minHeight: 80,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  addPartButton: {
    marginBottom: Spacing.lg,
  },
  partsSection: {
    marginBottom: Spacing.xl,
  },
  partsTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  partChip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  partInfo: {
    flex: 1,
  },
  partDetail: {
    opacity: 0.6,
    marginTop: 2,
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
  sessionCard: {
    marginBottom: Spacing.md,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  sessionDate: {
    opacity: 0.6,
  },
  partsCount: {
    opacity: 0.6,
  },
  sessionPart: {
    marginBottom: Spacing.xs,
  },
  sessionInsight: {
    opacity: 0.7,
    marginTop: Spacing.sm,
    fontStyle: "italic",
  },
});
