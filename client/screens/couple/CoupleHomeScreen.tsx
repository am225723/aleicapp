import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ToolCard } from "@/components/ToolCard";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getToolEntries, ToolEntry } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CoupleHomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [recentActivity, setRecentActivity] = useState<ToolEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  async function loadRecentActivity() {
    const entries = await getToolEntries();
    setRecentActivity(entries.slice(0, 5));
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadRecentActivity();
    setIsRefreshing(false);
  }

  const handleToolPress = (tool: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(tool as keyof RootStackParamList);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + 80 + Spacing.xl,
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <ThemedText type="h2">
          Welcome back, {user?.displayName || "there"}
        </ThemedText>
        {user?.partnerName ? (
          <ThemedText
            type="body"
            style={[styles.partnerText, { color: theme.textSecondary }]}
          >
            <Feather name="heart" size={14} color={Colors.light.accent} />{" "}
            Connected with {user.partnerName}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>

        <ToolCard
          title="Pause Button"
          description="Take a moment to calm and reconnect"
          icon="pause-circle"
          color={Colors.light.link}
          onPress={() => handleToolPress("PauseButton")}
        />

        <ToolCard
          title="Echo & Empathy"
          description="Practice active listening together"
          icon="message-circle"
          color={Colors.light.accent}
          onPress={() => handleToolPress("EchoEmpathy")}
        />

        <ToolCard
          title="Hold Me Tight"
          description="Guided conversation for deeper connection"
          icon="heart"
          color={Colors.light.success}
          onPress={() => handleToolPress("HoldMeTight")}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Check-in
        </ThemedText>

        <Card
          elevation={1}
          onPress={() => handleToolPress("WeeklyCheckin")}
          style={styles.checkinCard}
        >
          <View style={styles.checkinContent}>
            <View
              style={[
                styles.checkinIcon,
                { backgroundColor: Colors.light.warning + "20" },
              ]}
            >
              <Feather name="bar-chart-2" size={24} color={Colors.light.warning} />
            </View>
            <View style={styles.checkinText}>
              <ThemedText type="h4">Weekly Check-in</ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
              >
                How are you feeling this week?
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
        </Card>
      </View>

      {recentActivity.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Recent Activity
          </ThemedText>
          {recentActivity.map((entry) => (
            <Card key={entry.id} elevation={1} style={styles.activityCard}>
              <View style={styles.activityRow}>
                <Feather
                  name={
                    entry.toolType === "pause"
                      ? "pause-circle"
                      : entry.toolType === "echo"
                        ? "message-circle"
                        : entry.toolType === "holdme"
                          ? "heart"
                          : "bar-chart-2"
                  }
                  size={18}
                  color={Colors.light.link}
                />
                <ThemedText type="body" style={styles.activityText}>
                  {entry.toolType === "pause"
                    ? "Pause Button"
                    : entry.toolType === "echo"
                      ? "Echo & Empathy"
                      : entry.toolType === "holdme"
                        ? "Hold Me Tight"
                        : "Check-in"}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {new Date(entry.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            </Card>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  partnerText: {
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  checkinCard: {
    padding: Spacing.lg,
  },
  checkinContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkinIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  checkinText: {
    flex: 1,
  },
  activityCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  activityText: {
    flex: 1,
  },
});
