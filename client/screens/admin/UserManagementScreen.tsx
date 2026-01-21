import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Pressable, Alert, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
  is_active: boolean;
  couple_id: string | null;
}

export default function UserManagementScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
      console.log("Not an admin");
    }
  }, [profile?.id]);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data } = await supabase
        .from("Couples_profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setUsers(
          data.map((u) => ({
            id: u.id,
            email: u.email || "",
            name: u.name,
            role: u.role || "couple",
            created_at: u.created_at,
            is_active: u.is_active !== false,
            couple_id: u.couple_id,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading users:", error);
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

  const handleToggleStatus = (user: User) => {
    const action = user.is_active ? "disable" : "enable";
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${user.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: user.is_active ? "destructive" : "default",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("Couples_profiles")
                .update({ is_active: !user.is_active })
                .eq("id", user.id);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await loadData();
            } catch (error) {
              console.error("Error updating user:", error);
              Alert.alert("Error", "Failed to update user status.");
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "therapist":
        return GlowColors.accentPurple;
      case "admin":
        return GlowColors.gold;
      default:
        return GlowColors.accentBlue;
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          title="User Management"
          subtitle="Manage all user accounts"
          gradientColors={["rgba(74, 144, 217, 0.4)", "rgba(40, 80, 100, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={GlowColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={GlowColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{users.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {users.filter((u) => u.is_active).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Active</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>
              {users.filter((u) => u.couple_id).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>In Couples</ThemedText>
          </View>
        </View>

        {isLoading ? (
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color={GlowColors.textSecondary} />
            <ThemedText style={styles.emptyText}>No users found</ThemedText>
          </View>
        ) : (
          <View style={styles.userList}>
            {filteredUsers.map((user) => (
              <View key={user.id} style={[styles.userCard, !user.is_active && styles.userCardDisabled]}>
                <View style={styles.userHeader}>
                  <View style={[styles.userAvatar, { backgroundColor: getRoleColor(user.role) + "30" }]}>
                    <Feather name="user" size={18} color={getRoleColor(user.role)} />
                  </View>
                  <View style={styles.userInfo}>
                    <ThemedText style={styles.userName}>{user.name || "No name"}</ThemedText>
                    <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
                    <View style={styles.userMeta}>
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + "30" }]}>
                        <ThemedText style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                          {user.role}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.userDate}>{formatDate(user.created_at)}</ThemedText>
                    </View>
                  </View>
                  <Pressable
                    style={[
                      styles.statusToggle,
                      { backgroundColor: user.is_active ? GlowColors.cardGreen : GlowColors.cardRed },
                    ]}
                    onPress={() => handleToggleStatus(user)}
                  >
                    <Feather
                      name={user.is_active ? "check" : "x"}
                      size={14}
                      color={GlowColors.textPrimary}
                    />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: GlowColors.textPrimary,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: GlowColors.cardBlue,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: GlowColors.textSecondary,
    marginTop: 2,
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
  userList: {
    gap: Spacing.sm,
  },
  userCard: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  userCardDisabled: {
    opacity: 0.6,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    color: GlowColors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: GlowColors.textSecondary,
    marginTop: 1,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontFamily: "Nunito_600SemiBold",
    textTransform: "uppercase",
  },
  userDate: {
    fontSize: 10,
    color: GlowColors.textSecondary,
  },
  statusToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
