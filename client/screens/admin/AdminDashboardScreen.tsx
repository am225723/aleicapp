import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalUsers: number;
  totalCouples: number;
  totalTherapists: number;
  recentSignups: Array<{ id: string; email: string; created_at: string }>;
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCouples: 0,
    totalTherapists: 0,
    recentSignups: [],
  });

  const checkAdminRole = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", profile.id)
        .single();

      if (roleData?.role === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.log("Not an admin or role not found");
    }
  }, [profile?.id]);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { count: userCount } = await supabase
        .from("Couples_profiles")
        .select("*", { count: "exact", head: true });

      const { count: coupleCount } = await supabase
        .from("couples")
        .select("*", { count: "exact", head: true });

      const { count: therapistCount } = await supabase
        .from("Couples_profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "therapist");

      const { data: recentUsers } = await supabase
        .from("Couples_profiles")
        .select("id, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalUsers: userCount || 0,
        totalCouples: coupleCount || 0,
        totalTherapists: therapistCount || 0,
        recentSignups: recentUsers || [],
      });
    } catch (error) {
      console.error("Error loading admin stats:", error);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          title="Admin Dashboard"
          subtitle="System overview and management"
          gradientColors={["rgba(201, 169, 98, 0.4)", "rgba(100, 80, 60, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: GlowColors.cardBlue }]}>
            <Feather name="users" size={24} color={GlowColors.accentBlue} />
            <ThemedText style={styles.statValue}>{stats.totalUsers}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Users</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: GlowColors.cardGreen }]}>
            <Feather name="heart" size={24} color={GlowColors.accentGreen} />
            <ThemedText style={styles.statValue}>{stats.totalCouples}</ThemedText>
            <ThemedText style={styles.statLabel}>Couples</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: GlowColors.cardPurple }]}>
            <Feather name="user-check" size={24} color={GlowColors.accentPurple} />
            <ThemedText style={styles.statValue}>{stats.totalTherapists}</ThemedText>
            <ThemedText style={styles.statLabel}>Therapists</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionCard}
            onPress={() => navigation.navigate("AdminTherapistManagement")}
          >
            <Feather name="user-check" size={24} color={GlowColors.gold} />
            <ThemedText style={styles.actionText}>Manage Therapists</ThemedText>
          </Pressable>
          <Pressable
            style={styles.actionCard}
            onPress={() => navigation.navigate("AdminUserManagement")}
          >
            <Feather name="users" size={24} color={GlowColors.gold} />
            <ThemedText style={styles.actionText}>Manage Users</ThemedText>
          </Pressable>
        </View>

        <ThemedText style={styles.sectionTitle}>Recent Signups</ThemedText>
        {isLoading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : stats.recentSignups.length === 0 ? (
          <ThemedText style={styles.emptyText}>No recent signups</ThemedText>
        ) : (
          <View style={styles.signupList}>
            {stats.recentSignups.map((user) => (
              <View key={user.id} style={styles.signupItem}>
                <View style={styles.signupAvatar}>
                  <Feather name="user" size={16} color={GlowColors.textSecondary} />
                </View>
                <View style={styles.signupInfo}>
                  <ThemedText style={styles.signupEmail}>{user.email}</ThemedText>
                  <ThemedText style={styles.signupDate}>{formatDate(user.created_at)}</ThemedText>
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
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 11,
    color: GlowColors.textSecondary,
    marginTop: 2,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: 14,
    color: GlowColors.textPrimary,
    textAlign: "center",
    fontFamily: "Nunito_600SemiBold",
  },
  loadingText: {
    color: GlowColors.textSecondary,
    textAlign: "center",
  },
  emptyText: {
    color: GlowColors.textSecondary,
    textAlign: "center",
    padding: Spacing.lg,
  },
  signupList: {
    gap: Spacing.sm,
  },
  signupItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  signupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  signupInfo: {
    flex: 1,
  },
  signupEmail: {
    fontSize: 14,
    color: GlowColors.textPrimary,
    fontFamily: "Nunito_600SemiBold",
  },
  signupDate: {
    fontSize: 12,
    color: GlowColors.textSecondary,
    marginTop: 2,
  },
});
