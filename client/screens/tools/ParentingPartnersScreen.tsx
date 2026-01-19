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

interface ParentingDiscussion {
  id: string;
  topic: string;
  my_perspective: string | null;
  agreed_approach: string | null;
  status: "open" | "in_discussion" | "resolved";
  created_at: string;
}

const COMMON_TOPICS = [
  "Screen time limits",
  "Discipline strategies",
  "Bedtime routines",
  "Education choices",
  "Chores and responsibilities",
  "Nutrition and eating habits",
  "Extracurricular activities",
  "Quality time balance",
];

export default function ParentingPartnersScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [perspective, setPerspective] = useState("");
  const [approach, setApproach] = useState("");

  const coupleId = profile?.couple_id;

  const { data: discussions = [] } = useQuery({
    queryKey: ["parenting-discussions", coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      const { data, error } = await supabase
        .from("parenting_discussions")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ParentingDiscussion[];
    },
    enabled: !!coupleId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!coupleId || !profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("parenting_discussions").insert({
        couple_id: coupleId,
        user_id: profile.id,
        topic: topic.trim(),
        my_perspective: perspective.trim() || null,
        agreed_approach: approach.trim() || null,
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parenting-discussions"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    },
    onError: () => {
      Alert.alert("Error", "Failed to save");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("parenting_discussions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parenting-discussions"] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setTopic("");
    setPerspective("");
    setApproach("");
  };

  const handleSubmit = () => {
    if (!topic.trim()) {
      Alert.alert("Error", "Please enter a topic");
      return;
    }
    createMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return theme.warning;
      case "in_discussion": return theme.link;
      case "resolved": return theme.success;
      default: return theme.textSecondary;
    }
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
          Parenting Partners
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Align on parenting decisions together
        </ThemedText>

        {!showForm ? (
          <Button onPress={() => setShowForm(true)} style={styles.addButton}>
            + New Discussion Topic
          </Button>
        ) : (
          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Topic
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={topic}
                onChangeText={setTopic}
                placeholder="What do you want to discuss?"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.quickTopics}>
              <ThemedText type="small" style={styles.quickLabel}>
                Common topics:
              </ThemedText>
              <View style={styles.topicChips}>
                {COMMON_TOPICS.slice(0, 4).map((t) => (
                  <Pressable
                    key={t}
                    style={[styles.topicChip, { backgroundColor: theme.backgroundSecondary }]}
                    onPress={() => setTopic(t)}
                  >
                    <ThemedText type="small">{t}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                My Perspective
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={perspective}
                onChangeText={setPerspective}
                placeholder="How do you see this issue?"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Proposed Approach (Optional)
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={approach}
                onChangeText={setApproach}
                placeholder="What approach might work?"
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
                onPress={handleSubmit}
                disabled={createMutation.isPending}
                style={styles.formButton}
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </View>
          </Card>
        )}

        {discussions.length > 0 ? (
          <View style={styles.discussionsSection}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Active Discussions
            </ThemedText>
            {discussions.map((discussion) => (
              <Card key={discussion.id} style={styles.discussionCard}>
                <View style={styles.discussionHeader}>
                  <ThemedText type="body" style={styles.discussionTopic}>
                    {discussion.topic}
                  </ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(discussion.status) }]}>
                    <ThemedText style={styles.statusText}>
                      {discussion.status.replace("_", " ")}
                    </ThemedText>
                  </View>
                </View>

                {discussion.my_perspective ? (
                  <ThemedText type="small" style={styles.perspectiveText}>
                    {discussion.my_perspective}
                  </ThemedText>
                ) : null}

                {discussion.agreed_approach ? (
                  <View style={[styles.approachBox, { backgroundColor: theme.success + "20" }]}>
                    <Feather name="check-circle" size={16} color={theme.success} />
                    <ThemedText type="small" style={styles.approachText}>
                      {discussion.agreed_approach}
                    </ThemedText>
                  </View>
                ) : null}

                <View style={styles.statusButtons}>
                  {discussion.status !== "resolved" && (
                    <Pressable
                      style={[styles.statusButton, { backgroundColor: theme.success }]}
                      onPress={() => updateStatusMutation.mutate({ id: discussion.id, status: "resolved" })}
                    >
                      <ThemedText style={{ color: "#fff", fontSize: 12 }}>
                        Mark Resolved
                      </ThemedText>
                    </Pressable>
                  )}
                  {discussion.status === "open" && (
                    <Pressable
                      style={[styles.statusButton, { backgroundColor: theme.link }]}
                      onPress={() => updateStatusMutation.mutate({ id: discussion.id, status: "in_discussion" })}
                    >
                      <ThemedText style={{ color: "#fff", fontSize: 12 }}>
                        Start Discussion
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
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
  addButton: {
    marginBottom: Spacing.xl,
  },
  formCard: {
    marginBottom: Spacing.xl,
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
  quickTopics: {
    marginBottom: Spacing.lg,
  },
  quickLabel: {
    opacity: 0.6,
    marginBottom: Spacing.sm,
  },
  topicChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  topicChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  formButton: {
    flex: 1,
  },
  discussionsSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  discussionCard: {
    marginBottom: Spacing.md,
  },
  discussionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  discussionTopic: {
    flex: 1,
    fontWeight: "600",
    marginRight: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    textTransform: "capitalize",
  },
  perspectiveText: {
    opacity: 0.7,
    marginBottom: Spacing.md,
  },
  approachBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  approachText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  statusButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statusButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});
