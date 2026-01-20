import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuth } from "@/contexts/AuthContext";
import {
  listDateNights,
  createDateNight,
  DateNight,
} from "@/services/dateNightsService";
import {
  listRituals,
  updateRitual,
  Ritual,
} from "@/services/ritualsService";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();

  const [dateNights, setDateNights] = useState<DateNight[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dates" | "rituals">("dates");

  useEffect(() => {
    loadData();
  }, [profile?.couple_id]);

  async function loadData() {
    if (!profile?.couple_id) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const [dates, rits] = await Promise.all([
        listDateNights(profile.couple_id),
        listRituals(profile.couple_id),
      ]);
      setDateNights(dates);
      setRituals(rits);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load. Pull to refresh.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setIsRefreshing(false);
  }

  async function handleToggleRitual(id: string, isActive: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await updateRitual(id, { is_active: isActive });
      await loadData();
    } catch (err) {
      console.error("Error updating ritual:", err);
    }
  }

  const handleAddRitual = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("AddRitual");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.link} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.lg, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText type="h2">Plan</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Date nights and rituals
        </ThemedText>

        <View style={styles.tabs}>
          <Pressable
            style={[
              styles.tab,
              activeTab === "dates" && {
                backgroundColor: Colors.light.link,
              },
            ]}
            onPress={() => setActiveTab("dates")}
          >
            <ThemedText
              type="body"
              style={{
                color: activeTab === "dates" ? "#FFFFFF" : theme.textSecondary,
              }}
            >
              Date Nights
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === "rituals" && {
                backgroundColor: Colors.light.link,
              },
            ]}
            onPress={() => setActiveTab("rituals")}
          >
            <ThemedText
              type="body"
              style={{
                color:
                  activeTab === "rituals" ? "#FFFFFF" : theme.textSecondary,
              }}
            >
              Rituals
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 80 + Spacing.xl },
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {error ? (
          <Card elevation={1} style={styles.errorCard}>
            <Feather name="alert-circle" size={24} color={Colors.light.error} />
            <ThemedText type="body" style={{ color: Colors.light.error, marginTop: Spacing.sm }}>
              {error}
            </ThemedText>
          </Card>
        ) : null}

        {activeTab === "dates" ? (
          <>
            <Pressable
              style={[styles.generatorCard, { backgroundColor: theme.link }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("DateNight");
              }}
            >
              <View style={styles.generatorContent}>
                <View style={styles.generatorIcon}>
                  <Feather name="zap" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.generatorText}>
                  <ThemedText type="h4" style={{ color: "#FFFFFF" }}>
                    Date Night Generator
                  </ThemedText>
                  <ThemedText type="small" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Get AI-powered date ideas tailored to you
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color="#FFFFFF" />
              </View>
            </Pressable>

            {dateNights.length > 0 ? (
              <>
                <ThemedText type="h4" style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
                  Saved Dates
                </ThemedText>
                {dateNights.map((date) => (
                  <Card key={date.id} elevation={1} style={styles.dateCard}>
                    <ThemedText type="h4">{date.title}</ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {date.description}
                    </ThemedText>
                  </Card>
                ))}
              </>
            ) : null}
          </>
        ) : rituals.length > 0 ? (
          rituals.map((ritual) => (
            <Card key={ritual.id} elevation={1} style={styles.ritualCard}>
              <View style={styles.ritualContent}>
                <View style={styles.ritualText}>
                  <ThemedText type="h4">{ritual.title}</ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {ritual.description}
                  </ThemedText>
                  <View style={styles.ritualMeta}>
                    <View
                      style={[
                        styles.frequencyBadge,
                        { backgroundColor: Colors.light.link + "20" },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={{ color: Colors.light.link }}
                      >
                        {ritual.frequency}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                <Switch
                  value={ritual.is_active}
                  onValueChange={(value) =>
                    handleToggleRitual(ritual.id, value)
                  }
                  trackColor={{
                    false: theme.border,
                    true: Colors.light.success,
                  }}
                />
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            image={require("../../../assets/images/empty-plans.png")}
            title="No rituals yet"
            description="Create rituals to strengthen your daily connection"
          />
        )}
      </ScrollView>

      {activeTab === "rituals" ? (
        <Pressable
          style={[styles.fab, { backgroundColor: Colors.light.accent }]}
          onPress={handleAddRitual}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    flexGrow: 1,
  },
  errorCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  generatorCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  generatorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  generatorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  generatorText: {
    flex: 1,
  },
  dateCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  ritualCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  ritualContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  ritualText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  ritualMeta: {
    flexDirection: "row",
    marginTop: Spacing.sm,
  },
  frequencyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
