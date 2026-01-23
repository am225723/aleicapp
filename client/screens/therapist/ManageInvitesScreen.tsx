import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Invite {
  id: string;
  code: string;
  therapist_id: string;
  couple_id: string | null;
  expires_at: string;
  used_by: string | null;
  used_at: string | null;
  is_active: boolean;
  created_at: string;
}

function generateCode(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

export default function ManageInvitesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile } = useAuth();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const loadInvites = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from("Couples_therapist_invites")
        .select("*")
        .eq("therapist_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error loading invites:", error.message);
        return;
      }

      setInvites(data || []);
    } catch (error) {
      console.log("Error loading invites:", error);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadInvites();
    }, [loadInvites])
  );

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadInvites();
    setIsRefreshing(false);
  }

  async function handleCreateInvite() {
    if (!profile?.id) return;

    setIsCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from("Couples_therapist_invites")
        .insert([{
          code: generateCode(),
          therapist_id: profile.id,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        }]);

      if (error) {
        console.log("Error creating invite:", error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      await loadInvites();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log("Error creating invite:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopyCode(code: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(code);
  }

  async function handleShareCode(code: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Join me on A.L.E.I.C.! Use this invitation code to connect: ${code}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const renderInvite = ({ item }: { item: Invite }) => {
    const expired = isExpired(item.expires_at);
    const used = !!item.used_by;

    return (
      <Card elevation={1} style={styles.inviteCard}>
        <View style={styles.inviteHeader}>
          <View
            style={[
              styles.codeContainer,
              {
                backgroundColor: expired || used
                  ? theme.border
                  : Colors.light.link + "20",
              },
            ]}
          >
            <ThemedText
              type="h3"
              style={{
                color: expired || used ? theme.textSecondary : Colors.light.link,
                letterSpacing: 2,
              }}
            >
              {item.code}
            </ThemedText>
          </View>

          <View style={styles.statusContainer}>
            {used ? (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: Colors.light.success + "20" },
                ]}
              >
                <Feather name="check" size={12} color={Colors.light.success} />
                <ThemedText
                  type="small"
                  style={{ color: Colors.light.success, marginLeft: 4 }}
                >
                  Used
                </ThemedText>
              </View>
            ) : expired ? (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: Colors.light.error + "20" },
                ]}
              >
                <Feather name="x" size={12} color={Colors.light.error} />
                <ThemedText
                  type="small"
                  style={{ color: Colors.light.error, marginLeft: 4 }}
                >
                  Expired
                </ThemedText>
              </View>
            ) : (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: Colors.light.success + "20" },
                ]}
              >
                <Feather name="clock" size={12} color={Colors.light.success} />
                <ThemedText
                  type="small"
                  style={{ color: Colors.light.success, marginLeft: 4 }}
                >
                  Active
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Expires: {new Date(item.expires_at).toLocaleDateString()}
        </ThemedText>

        {!expired && !used ? (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.border }]}
              onPress={() => handleCopyCode(item.code)}
            >
              <Feather name="copy" size={16} color={theme.text} />
              <ThemedText type="small" style={{ marginLeft: 6 }}>
                Copy
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                { backgroundColor: Colors.light.link + "20" },
              ]}
              onPress={() => handleShareCode(item.code)}
            >
              <Feather name="share" size={16} color={Colors.light.link} />
              <ThemedText
                type="small"
                style={{ marginLeft: 6, color: Colors.light.link }}
              >
                Share
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </Card>
    );
  };

  const renderEmpty = () => (
    <EmptyState
      image={require("../../../assets/images/empty-invites.png")}
      title="No invites yet"
      description="Create invitation codes to connect with your couples"
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.lg, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText type="h2">Invitations</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Invite codes for new couples
        </ThemedText>
      </View>

      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        renderItem={renderInvite}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 + Spacing.xl },
          invites.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 80 + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <Button onPress={handleCreateInvite} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create New Invite"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  inviteCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  inviteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  codeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusContainer: {},
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
});
