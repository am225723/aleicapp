import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  target_date?: string;
}

interface GrowthPlan {
  id: string;
  title: string;
  milestones: Milestone[];
  status: string;
  created_at: string;
}

export default function GrowthPlanScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<GrowthPlan[]>([]);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const { data } = await supabase
        .from("growth_plans")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false });

      if (data) {
        setPlans(data);
      }
    } catch (error) {
      console.error("Error loading growth plans:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.couple_id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleCreatePlan = async () => {
    if (!profile?.couple_id || !newPlanTitle.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("growth_plans").insert({
        couple_id: profile.couple_id,
        created_by_user_id: profile.id,
        title: newPlanTitle.trim(),
        milestones: [],
        status: "active",
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewPlanTitle("");
      setShowNewPlan(false);
      await loadData();
    } catch (error) {
      console.error("Error creating plan:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMilestone = async (planId: string) => {
    if (!newMilestone.trim()) return;

    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const newMilestones = [
      ...plan.milestones,
      {
        id: Date.now().toString(),
        title: newMilestone.trim(),
        completed: false,
      },
    ];

    try {
      const { error } = await supabase
        .from("growth_plans")
        .update({ milestones: newMilestones })
        .eq("id", planId);

      if (error) throw error;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setNewMilestone("");
      await loadData();
    } catch (error) {
      console.error("Error adding milestone:", error);
    }
  };

  const handleToggleMilestone = async (planId: string, milestoneId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const newMilestones = plan.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    try {
      const { error } = await supabase
        .from("growth_plans")
        .update({ milestones: newMilestones })
        .eq("id", planId);

      if (error) throw error;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await loadData();
    } catch (error) {
      console.error("Error toggling milestone:", error);
    }
  };

  const getProgress = (milestones: Milestone[]) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={GlowColors.gold} />
        }
      >
        <CategoryHeroCard
          title="Growth Plan"
          subtitle="Build your relationship milestones"
          gradientColors={["rgba(129, 201, 149, 0.4)", "rgba(40, 80, 60, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        {!showNewPlan ? (
          <Pressable style={styles.newPlanButton} onPress={() => setShowNewPlan(true)}>
            <Feather name="plus" size={20} color={GlowColors.gold} />
            <ThemedText style={styles.newPlanButtonText}>Create New Plan</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.newPlanCard}>
            <TextInput
              style={styles.input}
              placeholder="Plan title (e.g., Improve Communication)"
              placeholderTextColor={GlowColors.textSecondary}
              value={newPlanTitle}
              onChangeText={setNewPlanTitle}
            />
            <View style={styles.buttonRow}>
              <Pressable style={styles.cancelButton} onPress={() => setShowNewPlan(false)}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.createButton, !newPlanTitle.trim() && styles.buttonDisabled]}
                onPress={handleCreatePlan}
                disabled={!newPlanTitle.trim() || isSaving}
              >
                <ThemedText style={styles.createButtonText}>{isSaving ? "Creating..." : "Create"}</ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        {isLoading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : plans.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="target" size={48} color={GlowColors.textSecondary} />
            <ThemedText style={styles.emptyText}>No growth plans yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Create a plan to track your relationship goals</ThemedText>
          </View>
        ) : (
          <View style={styles.plansList}>
            {plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <ThemedText style={styles.planTitle}>{plan.title}</ThemedText>
                  <View style={styles.progressBadge}>
                    <ThemedText style={styles.progressText}>{getProgress(plan.milestones)}%</ThemedText>
                  </View>
                </View>

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${getProgress(plan.milestones)}%` }]} />
                </View>

                <View style={styles.milestonesList}>
                  {plan.milestones.map((milestone) => (
                    <Pressable
                      key={milestone.id}
                      style={styles.milestoneItem}
                      onPress={() => handleToggleMilestone(plan.id, milestone.id)}
                    >
                      <View style={[styles.checkbox, milestone.completed && styles.checkboxChecked]}>
                        {milestone.completed ? <Feather name="check" size={14} color="#000" /> : null}
                      </View>
                      <ThemedText
                        style={[styles.milestoneText, milestone.completed && styles.milestoneCompleted]}
                      >
                        {milestone.title}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.addMilestoneRow}>
                  <TextInput
                    style={styles.milestoneInput}
                    placeholder="Add milestone..."
                    placeholderTextColor={GlowColors.textSecondary}
                    value={newMilestone}
                    onChangeText={setNewMilestone}
                  />
                  <Pressable
                    style={styles.addMilestoneButton}
                    onPress={() => handleAddMilestone(plan.id)}
                    disabled={!newMilestone.trim()}
                  >
                    <Feather name="plus" size={20} color={GlowColors.gold} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlowColors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  newPlanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: GlowColors.gold,
    borderStyle: "dashed",
  },
  newPlanButtonText: {
    fontSize: 16,
    color: GlowColors.gold,
    fontFamily: "Nunito_600SemiBold",
  },
  newPlanCard: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: GlowColors.textPrimary,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  cancelButton: {
    padding: Spacing.md,
  },
  cancelButtonText: {
    fontSize: 14,
    color: GlowColors.textSecondary,
  },
  createButton: {
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingText: {
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: GlowColors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  plansList: {
    gap: Spacing.lg,
  },
  planCard: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    flex: 1,
  },
  progressBadge: {
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: GlowColors.accentGreen,
    borderRadius: 2,
  },
  milestonesList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: GlowColors.accentGreen,
    borderColor: GlowColors.accentGreen,
  },
  milestoneText: {
    fontSize: 14,
    color: GlowColors.textPrimary,
    flex: 1,
  },
  milestoneCompleted: {
    textDecorationLine: "line-through",
    color: GlowColors.textSecondary,
  },
  addMilestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  milestoneInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    color: GlowColors.textPrimary,
    fontSize: 14,
  },
  addMilestoneButton: {
    padding: Spacing.sm,
  },
});
