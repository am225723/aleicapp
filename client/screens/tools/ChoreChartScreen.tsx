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

interface Chore {
  id: string;
  title: string;
  description: string | null;
  assigned_to_user_id: string | null;
  due_date: string | null;
  status: "todo" | "in_progress" | "done";
  recurrence: string | null;
  created_at: string;
}

export default function ChoreChartScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chores, setChores] = useState<Chore[]>([]);
  const [showAddChore, setShowAddChore] = useState(false);
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const { data } = await supabase
        .from("Couples_chores")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false });

      if (data) {
        setChores(data);
      }
    } catch (error) {
      console.error("Error loading chores:", error);
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

  const handleAddChore = async () => {
    if (!profile?.couple_id || !newChoreTitle.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("Couples_chores").insert({
        couple_id: profile.couple_id,
        title: newChoreTitle.trim(),
        status: "todo",
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewChoreTitle("");
      setShowAddChore(false);
      await loadData();
    } catch (error) {
      console.error("Error adding chore:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (chore: Chore) => {
    const newStatus = chore.status === "done" ? "todo" : "done";

    try {
      const { error } = await supabase
        .from("Couples_chores")
        .update({ status: newStatus })
        .eq("id", chore.id);

      if (error) throw error;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await loadData();
    } catch (error) {
      console.error("Error updating chore:", error);
    }
  };

  const handleAssign = async (choreId: string) => {
    if (!profile?.id) return;

    try {
      const chore = chores.find((c) => c.id === choreId);
      const newAssigned = chore?.assigned_to_user_id === profile.id ? null : profile.id;

      const { error } = await supabase
        .from("Couples_chores")
        .update({ assigned_to_user_id: newAssigned })
        .eq("id", choreId);

      if (error) throw error;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await loadData();
    } catch (error) {
      console.error("Error assigning chore:", error);
    }
  };

  const handleDelete = (choreId: string) => {
    Alert.alert("Delete Chore", "Are you sure you want to delete this chore?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.from("Couples_chores").delete().eq("id", choreId);
            if (error) throw error;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await loadData();
          } catch (error) {
            console.error("Error deleting chore:", error);
          }
        },
      },
    ]);
  };

  const todoChores = chores.filter((c) => c.status !== "done");
  const doneChores = chores.filter((c) => c.status === "done");

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
          title="Chore Chart"
          subtitle="Share household responsibilities"
          gradientColors={["rgba(74, 144, 217, 0.4)", "rgba(40, 80, 100, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        {!showAddChore ? (
          <Pressable style={styles.addButton} onPress={() => setShowAddChore(true)}>
            <Feather name="plus" size={20} color={GlowColors.gold} />
            <ThemedText style={styles.addButtonText}>Add Chore</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.addCard}>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={GlowColors.textSecondary}
              value={newChoreTitle}
              onChangeText={setNewChoreTitle}
              autoFocus
            />
            <View style={styles.buttonRow}>
              <Pressable style={styles.cancelButton} onPress={() => setShowAddChore(false)}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.saveButton, (!newChoreTitle.trim() || isSaving) && styles.buttonDisabled]}
                onPress={handleAddChore}
                disabled={!newChoreTitle.trim() || isSaving}
              >
                <ThemedText style={styles.saveButtonText}>{isSaving ? "Adding..." : "Add"}</ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        <ThemedText style={styles.sectionTitle}>To Do ({todoChores.length})</ThemedText>

        {isLoading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : todoChores.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={32} color={GlowColors.accentGreen} />
            <ThemedText style={styles.emptyText}>All done!</ThemedText>
          </View>
        ) : (
          <View style={styles.choreList}>
            {todoChores.map((chore) => (
              <View key={chore.id} style={styles.choreItem}>
                <Pressable style={styles.checkbox} onPress={() => handleToggleStatus(chore)}>
                  <View style={styles.checkboxInner} />
                </Pressable>
                <View style={styles.choreInfo}>
                  <ThemedText style={styles.choreTitle}>{chore.title}</ThemedText>
                  {chore.assigned_to_user_id === profile?.id ? (
                    <View style={styles.assignedBadge}>
                      <ThemedText style={styles.assignedText}>Assigned to you</ThemedText>
                    </View>
                  ) : null}
                </View>
                <View style={styles.choreActions}>
                  <Pressable style={styles.actionButton} onPress={() => handleAssign(chore.id)}>
                    <Feather
                      name="user"
                      size={18}
                      color={chore.assigned_to_user_id === profile?.id ? GlowColors.gold : GlowColors.textSecondary}
                    />
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleDelete(chore.id)}>
                    <Feather name="trash-2" size={18} color={GlowColors.accentRed} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {doneChores.length > 0 ? (
          <>
            <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>
              Completed ({doneChores.length})
            </ThemedText>
            <View style={styles.choreList}>
              {doneChores.slice(0, 5).map((chore) => (
                <View key={chore.id} style={[styles.choreItem, styles.doneItem]}>
                  <Pressable style={[styles.checkbox, styles.checkboxDone]} onPress={() => handleToggleStatus(chore)}>
                    <Feather name="check" size={14} color="#000" />
                  </Pressable>
                  <ThemedText style={styles.choreTitleDone}>{chore.title}</ThemedText>
                </View>
              ))}
            </View>
          </>
        ) : null}
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
  addButton: {
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
  addButtonText: {
    fontSize: 16,
    color: GlowColors.gold,
    fontFamily: "Nunito_600SemiBold",
  },
  addCard: {
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
  saveButton: {
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.md,
  },
  loadingText: {
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: GlowColors.cardGreen,
    borderRadius: BorderRadius.lg,
  },
  emptyText: {
    fontSize: 16,
    color: GlowColors.textPrimary,
    marginTop: Spacing.sm,
    fontFamily: "Nunito_600SemiBold",
  },
  choreList: {
    gap: Spacing.sm,
  },
  choreItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  doneItem: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  checkboxDone: {
    backgroundColor: GlowColors.accentGreen,
    borderColor: GlowColors.accentGreen,
  },
  choreInfo: {
    flex: 1,
  },
  choreTitle: {
    fontSize: 15,
    color: GlowColors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
  },
  choreTitleDone: {
    flex: 1,
    fontSize: 15,
    color: GlowColors.textSecondary,
    textDecorationLine: "line-through",
  },
  assignedBadge: {
    marginTop: 4,
  },
  assignedText: {
    fontSize: 11,
    color: GlowColors.gold,
  },
  choreActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.xs,
  },
});
