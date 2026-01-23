import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Therapist {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  is_active: boolean;
}

export default function TherapistManagementScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  const checkAdminRole = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data: roleData } = await supabase
        .from("Couples_user_roles")
        .select("role")
        .eq("user_id", profile.id)
        .eq("is_active", true)
        .single();

      if (roleData?.role === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.log("Not an admin");
    }
  }, [profile?.id]);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data } = await supabase
        .from("Couples_profiles")
        .select("*")
        .eq("role", "therapist")
        .order("created_at", { ascending: false });

      if (data) {
        setTherapists(
          data.map((t) => ({
            id: t.id,
            email: t.email || "",
            name: t.name,
            created_at: t.created_at,
            is_active: t.is_active !== false,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading therapists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useFocusEffect(
    useCallback(() => {
      checkAdminRole();
    }, [checkAdminRole])
  );

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        loadData();
      }
    }, [isAdmin, loadData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleToggleStatus = (therapist: Therapist) => {
    const action = therapist.is_active ? "deactivate" : "activate";
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Therapist`,
      `Are you sure you want to ${action} ${therapist.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: therapist.is_active ? "destructive" : "default",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("Couples_profiles")
                .update({ is_active: !therapist.is_active })
                .eq("id", therapist.id);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await loadData();
            } catch (error) {
              console.error("Error updating therapist:", error);
              Alert.alert("Error", "Failed to update therapist status.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlowBackground />
        <View style={styles.unauthorized}>
          <Feather name="lock" size={64} color={GlowColors.accentRed} />
          <ThemedText style={styles.unauthorizedTitle}>Access Denied</ThemedText>
          <ThemedText style={styles.unauthorizedText}>
            You don't have admin privileges.
          </ThemedText>
        </View>
      </View>
    );
  }

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
          title="Therapist Management"
          subtitle="Manage therapist accounts"
          gradientColors={["rgba(155, 89, 182, 0.4)", "rgba(80, 50, 100, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryValue}>{therapists.length}</ThemedText>
          <ThemedText style={styles.summaryLabel}>
            Total Therapists ({therapists.filter((t) => t.is_active).length} active)
          </ThemedText>
        </View>

        {isLoading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : therapists.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="user-check" size={48} color={GlowColors.textSecondary} />
            <ThemedText style={styles.emptyText}>No therapists found</ThemedText>
          </View>
        ) : (
          <View style={styles.therapistList}>
            {therapists.map((therapist) => (
              <View key={therapist.id} style={styles.therapistCard}>
                <View style={styles.therapistHeader}>
                  <View style={styles.therapistAvatar}>
                    <Feather name="user" size={20} color={GlowColors.accentPurple} />
                  </View>
                  <View style={styles.therapistInfo}>
                    <ThemedText style={styles.therapistName}>
                      {therapist.name || "No name"}
                    </ThemedText>
                    <ThemedText style={styles.therapistEmail}>{therapist.email}</ThemedText>
                    <ThemedText style={styles.therapistDate}>
                      Joined {formatDate(therapist.created_at)}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: therapist.is_active ? GlowColors.cardGreen : GlowColors.cardRed },
                    ]}
                  >
                    <ThemedText style={styles.statusText}>
                      {therapist.is_active ? "Active" : "Inactive"}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      { backgroundColor: therapist.is_active ? GlowColors.cardRed : GlowColors.cardGreen },
                    ]}
                    onPress={() => handleToggleStatus(therapist)}
                  >
                    <Feather
                      name={therapist.is_active ? "user-x" : "user-check"}
                      size={16}
                      color={GlowColors.textPrimary}
                    />
                    <ThemedText style={styles.actionButtonText}>
                      {therapist.is_active ? "Deactivate" : "Activate"}
                    </ThemedText>
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
  unauthorized: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginTop: Spacing.lg,
  },
  unauthorizedText: {
    fontSize: 16,
    color: GlowColors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: GlowColors.cardPurple,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  summaryValue: {
    fontSize: 36,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  summaryLabel: {
    fontSize: 14,
    color: GlowColors.textSecondary,
    marginTop: 4,
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
  therapistList: {
    gap: Spacing.md,
  },
  therapistCard: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  therapistHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  therapistAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GlowColors.cardPurple,
    alignItems: "center",
    justifyContent: "center",
  },
  therapistInfo: {
    flex: 1,
  },
  therapistName: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  therapistEmail: {
    fontSize: 13,
    color: GlowColors.textSecondary,
    marginTop: 2,
  },
  therapistDate: {
    fontSize: 11,
    color: GlowColors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Nunito_600SemiBold",
    color: GlowColors.textPrimary,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
    color: GlowColors.textPrimary,
  },
});
