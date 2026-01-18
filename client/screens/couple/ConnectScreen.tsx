import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  Image,
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
  getGratitudeEntries,
  getJournalEntries,
  GratitudeEntry,
  JournalEntry,
} from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>(
    []
  );
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"gratitude" | "journal">(
    "gratitude"
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [gratitude, journal] = await Promise.all([
      getGratitudeEntries(),
      getJournalEntries(),
    ]);
    setGratitudeEntries(gratitude);
    setJournalEntries(journal);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setIsRefreshing(false);
  }

  const handleAddGratitude = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("AddGratitude");
  };

  const handleAddJournal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("AddJournal");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.lg, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText type="h2">Connect</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Share gratitude and reflections
        </ThemedText>

        <View style={styles.tabs}>
          <Pressable
            style={[
              styles.tab,
              activeTab === "gratitude" && {
                backgroundColor: Colors.light.link,
              },
            ]}
            onPress={() => setActiveTab("gratitude")}
          >
            <ThemedText
              type="body"
              style={{
                color:
                  activeTab === "gratitude" ? "#FFFFFF" : theme.textSecondary,
              }}
            >
              Gratitude
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              activeTab === "journal" && {
                backgroundColor: Colors.light.link,
              },
            ]}
            onPress={() => setActiveTab("journal")}
          >
            <ThemedText
              type="body"
              style={{
                color:
                  activeTab === "journal" ? "#FFFFFF" : theme.textSecondary,
              }}
            >
              Journal
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
        {activeTab === "gratitude" ? (
          gratitudeEntries.length > 0 ? (
            gratitudeEntries.map((entry) => (
              <Card key={entry.id} elevation={1} style={styles.entryCard}>
                <ThemedText type="body">{entry.content}</ThemedText>
                {entry.imageUri ? (
                  <Image
                    source={{ uri: entry.imageUri }}
                    style={styles.entryImage}
                  />
                ) : null}
                <View style={styles.entryMeta}>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {entry.authorName}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </ThemedText>
                </View>
              </Card>
            ))
          ) : (
            <EmptyState
              image={require("../../../assets/images/empty-gratitude.png")}
              title="No gratitude entries yet"
              description="Start sharing what you're grateful for in your relationship"
            />
          )
        ) : journalEntries.length > 0 ? (
          journalEntries.map((entry) => (
            <Card key={entry.id} elevation={1} style={styles.entryCard}>
              <ThemedText type="h4" style={styles.entryTitle}>
                {entry.title}
              </ThemedText>
              <ThemedText
                type="body"
                numberOfLines={3}
                style={{ color: theme.textSecondary }}
              >
                {entry.content}
              </ThemedText>
              {entry.imageUri ? (
                <Image
                  source={{ uri: entry.imageUri }}
                  style={styles.entryImage}
                />
              ) : null}
              <View style={styles.entryMeta}>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {entry.authorName}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {new Date(entry.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            image={require("../../../assets/images/empty-journal.png")}
            title="No journal entries yet"
            description="Record your thoughts and reflections together"
          />
        )}
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: Colors.light.accent }]}
        onPress={activeTab === "gratitude" ? handleAddGratitude : handleAddJournal}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
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
  entryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  entryTitle: {
    marginBottom: Spacing.sm,
  },
  entryImage: {
    width: "100%",
    height: 150,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  entryMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
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
