import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { getInvites, addInvite, Invite } from "@/lib/storage";

export default function ManageInvitesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { profile } = useAuth();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadInvites();
  }, []);

  async function loadInvites() {
    const data = await getInvites(profile?.id);
    setInvites(data);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadInvites();
    setIsRefreshing(false);
  }

  async function handleCreateInvite() {
    setIsCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await addInvite({
        therapistId: profile?.id || "therapist-1",
        expiresAt: expiresAt.toISOString(),
      });

      await loadInvites();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
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
        message: `Join me on Couples Therapy! Use this invitation code to connect: ${code}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const renderInvite = ({ item }: { item: Invite }) => {
    const expired = isExpired(item.expiresAt);
    const used = !!item.usedBy;

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
          Expires: {new Date(item.expiresAt).toLocaleDateString()}
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
