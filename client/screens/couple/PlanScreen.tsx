import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Switch,
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
import {
  getDateNights,
  getRituals,
  addDateNight,
  updateRitual,
  DateNight,
  Ritual,
} from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const dateNightSuggestions = [
  { title: "Stargazing Night", description: "Find a quiet spot and watch the stars together" },
  { title: "Cooking Challenge", description: "Pick a cuisine and cook a meal together" },
  { title: "Movie Marathon", description: "Watch your favorite movies from when you first met" },
  { title: "Picnic in the Park", description: "Pack your favorite foods and enjoy outdoors" },
  { title: "Game Night", description: "Play board games or video games together" },
  { title: "Adventure Walk", description: "Explore a new neighborhood or trail" },
];

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [dateNights, setDateNights] = useState<DateNight[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"dates" | "rituals">("dates");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [dates, rits] = await Promise.all([getDateNights(), getRituals()]);
    setDateNights(dates);
    setRituals(rits);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setIsRefreshing(false);
  }

  async function handleSaveDateNight(suggestion: typeof dateNightSuggestions[0]) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addDateNight({
      coupleId: "couple-1",
      title: suggestion.title,
      description: suggestion.description,
      isSaved: true,
    });
    await loadData();
  }

  async function handleToggleRitual(id: string, isActive: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateRitual(id, { isActive });
    await loadData();
  }

  const handleAddRitual = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("AddRitual");
  };

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
        {activeTab === "dates" ? (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Ideas for You
            </ThemedText>
            {dateNightSuggestions.map((suggestion, index) => (
              <Card key={index} elevation={1} style={styles.suggestionCard}>
                <View style={styles.suggestionContent}>
                  <View style={styles.suggestionText}>
                    <ThemedText type="h4">{suggestion.title}</ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {suggestion.description}
                    </ThemedText>
                  </View>
                  <Pressable
                    style={[
                      styles.saveButton,
                      { backgroundColor: Colors.light.accent + "20" },
                    ]}
                    onPress={() => handleSaveDateNight(suggestion)}
                  >
                    <Feather
                      name="bookmark"
                      size={20}
                      color={Colors.light.accent}
                    />
                  </Pressable>
                </View>
              </Card>
            ))}

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
                  value={ritual.isActive}
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
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  suggestionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
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
