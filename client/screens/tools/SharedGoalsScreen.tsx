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

interface SharedGoal {
  id: string;
  title: string;
  description: string | null;
  status: "backlog" | "in_progress" | "completed";
  target_date: string | null;
  created_at: string;
}

export default function SharedGoalsScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const coupleId = profile?.couple_id;

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["shared-goals", coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      const { data, error } = await supabase
        .from("shared_goals")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SharedGoal[];
    },
    enabled: !!coupleId,
  });

  const createGoalMutation = useMutation({
    mutationFn: async () => {
      if (!coupleId || !profile) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("shared_goals").insert({
        couple_id: coupleId,
        created_by: profile.id,
        title: title.trim(),
        description: description.trim() || null,
        status: "backlog",
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-goals", coupleId] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowForm(false);
      setTitle("");
      setDescription("");
    },
    onError: () => {
      Alert.alert("Error", "Failed to create goal");
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("shared_goals")
        .update({
          status,
          completed_at: status === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-goals", coupleId] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a goal title");
      return;
    }
    createGoalMutation.mutate();
  };

  const groupedGoals = {
    backlog: goals.filter((g) => g.status === "backlog"),
    in_progress: goals.filter((g) => g.status === "in_progress"),
    completed: goals.filter((g) => g.status === "completed"),
  };

  const GoalCard = ({ goal }: { goal: SharedGoal }) => (
    <Card
      style={[
        styles.goalCard,
        goal.status === "completed" && styles.completedCard,
      ]}
    >
      <ThemedText
        type="body"
        style={[
          styles.goalTitle,
          goal.status === "completed" && styles.completedTitle,
        ]}
      >
        {goal.title}
      </ThemedText>
      {goal.description ? (
        <ThemedText type="small" style={styles.goalDescription}>
          {goal.description}
        </ThemedText>
      ) : null}

      <View style={styles.statusButtons}>
        {goal.status === "backlog" && (
          <>
            <Pressable
              style={[styles.statusButton, { backgroundColor: theme.link }]}
              onPress={() => updateGoalMutation.mutate({ id: goal.id, status: "in_progress" })}
            >
              <ThemedText style={{ color: theme.buttonText, fontSize: 13 }}>
                Start
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.statusButton, { backgroundColor: theme.success }]}
              onPress={() => updateGoalMutation.mutate({ id: goal.id, status: "completed" })}
            >
              <ThemedText style={{ color: theme.buttonText, fontSize: 13 }}>
                Complete
              </ThemedText>
            </Pressable>
          </>
        )}
        {goal.status === "in_progress" && (
          <>
            <Pressable
              style={[styles.statusButton, { borderWidth: 1, borderColor: theme.border }]}
              onPress={() => updateGoalMutation.mutate({ id: goal.id, status: "backlog" })}
            >
              <ThemedText style={{ fontSize: 13 }}>Back to Backlog</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.statusButton, { backgroundColor: theme.success }]}
              onPress={() => updateGoalMutation.mutate({ id: goal.id, status: "completed" })}
            >
              <ThemedText style={{ color: theme.buttonText, fontSize: 13 }}>
                Complete
              </ThemedText>
            </Pressable>
          </>
        )}
        {goal.status === "completed" && (
          <Pressable
            style={[styles.statusButton, { borderWidth: 1, borderColor: theme.border }]}
            onPress={() => updateGoalMutation.mutate({ id: goal.id, status: "backlog" })}
          >
            <ThemedText style={{ fontSize: 13 }}>Reopen</ThemedText>
          </Pressable>
        )}
      </View>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Shared Goals
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Set and track goals together as a couple
        </ThemedText>

        {!showForm ? (
          <Button onPress={() => setShowForm(true)} style={styles.addButton}>
            + Add New Goal
          </Button>
        ) : (
          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Goal Title
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Save for vacation"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.label}>
                Description (Optional)
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details about this goal..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formButtons}>
              <Button
                onPress={() => {
                  setShowForm(false);
                  setTitle("");
                  setDescription("");
                }}
                style={styles.formButton}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSubmit}
                disabled={createGoalMutation.isPending}
                style={styles.formButton}
              >
                {createGoalMutation.isPending ? "Adding..." : "Add Goal"}
              </Button>
            </View>
          </Card>
        )}

        <View style={styles.column}>
          <View style={styles.columnHeader}>
            <Feather name="inbox" size={18} color={theme.text} />
            <ThemedText type="h4" style={styles.columnTitle}>
              Backlog ({groupedGoals.backlog.length})
            </ThemedText>
          </View>
          {groupedGoals.backlog.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        <View style={styles.column}>
          <View style={styles.columnHeader}>
            <Feather name="zap" size={18} color={theme.warning} />
            <ThemedText type="h4" style={styles.columnTitle}>
              In Progress ({groupedGoals.in_progress.length})
            </ThemedText>
          </View>
          {groupedGoals.in_progress.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        <View style={styles.column}>
          <View style={styles.columnHeader}>
            <Feather name="check-circle" size={18} color={theme.success} />
            <ThemedText type="h4" style={styles.columnTitle}>
              Completed ({groupedGoals.completed.length})
            </ThemedText>
          </View>
          {groupedGoals.completed.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>
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
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  formButton: {
    flex: 1,
  },
  column: {
    marginBottom: Spacing.xl,
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  columnTitle: {
    marginLeft: Spacing.sm,
  },
  goalCard: {
    marginBottom: Spacing.md,
  },
  goalTitle: {
    marginBottom: Spacing.xs,
  },
  goalDescription: {
    opacity: 0.7,
    marginBottom: Spacing.lg,
  },
  statusButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statusButton: {
    flex: 1,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  completedCard: {
    opacity: 0.7,
  },
  completedTitle: {
    textDecorationLine: "line-through",
  },
});
