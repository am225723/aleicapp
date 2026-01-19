import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing, BorderRadius } from "@/constants/theme";

type VisionCategory = "core_values" | "life_vision" | "relationship_vision" | "family_vision" | "career_vision";

interface ValuesVision {
  id: string;
  category: VisionCategory;
  content: string;
  shared: boolean;
  partner_response: string | null;
  created_at: string;
  user_id: string;
}

const CATEGORIES: { key: VisionCategory; name: string; icon: string; prompts: string[] }[] = [
  {
    key: "core_values",
    name: "Core Values",
    icon: "heart",
    prompts: ["What principles guide your life?", "What do you stand for?"],
  },
  {
    key: "life_vision",
    name: "Life Vision",
    icon: "compass",
    prompts: ["Where do you see yourself in 10 years?", "What does your ideal life look like?"],
  },
  {
    key: "relationship_vision",
    name: "Relationship Vision",
    icon: "users",
    prompts: ["What kind of partnership do you want?", "How do you want to grow together?"],
  },
  {
    key: "family_vision",
    name: "Family Vision",
    icon: "home",
    prompts: ["What does family mean to you?", "How do you envision your family life?"],
  },
  {
    key: "career_vision",
    name: "Career Vision",
    icon: "briefcase",
    prompts: ["What role does work play in your life?", "How do you balance career and relationship?"],
  },
];

export default function ValuesVisionScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<VisionCategory | null>(null);
  const [content, setContent] = useState("");

  const coupleId = profile?.couple_id;

  const { data: entries = [] } = useQuery({
    queryKey: ["values-vision", coupleId],
    queryFn: async () => {
      if (!coupleId) return [];
      const { data, error } = await supabase
        .from("values_vision")
        .select("*")
        .eq("couple_id", coupleId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ValuesVision[];
    },
    enabled: !!coupleId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!coupleId || !profile || !selectedCategory) throw new Error("Missing data");
      const { error } = await supabase.from("values_vision").insert({
        couple_id: coupleId,
        user_id: profile.id,
        category: selectedCategory,
        content: content.trim(),
        shared: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["values-vision"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedCategory(null);
      setContent("");
    },
    onError: () => {
      Alert.alert("Error", "Failed to save");
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please enter your thoughts");
      return;
    }
    createMutation.mutate();
  };

  const getCategoryEntries = (category: VisionCategory) =>
    entries.filter((e) => e.category === category);

  if (selectedCategory) {
    const category = CATEGORIES.find((c) => c.key === selectedCategory);
    const existingEntries = getCategoryEntries(selectedCategory);

    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <Pressable onPress={() => setSelectedCategory(null)} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={theme.text} />
            <ThemedText style={styles.backText}>Back</ThemedText>
          </Pressable>

          <ThemedText type="h2" style={styles.title}>
            {category?.name}
          </ThemedText>

          <Card style={styles.promptCard}>
            <ThemedText type="body" style={styles.promptTitle}>
              Reflection Prompts
            </ThemedText>
            {category?.prompts.map((prompt, idx) => (
              <View key={idx} style={styles.promptRow}>
                <Feather name="edit-3" size={14} color={theme.link} />
                <ThemedText type="small" style={styles.promptText}>
                  {prompt}
                </ThemedText>
              </View>
            ))}
          </Card>

          <Card style={styles.inputCard}>
            <ThemedText type="body" style={styles.label}>
              Share Your Thoughts
            </ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your vision here..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Button
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Saving..." : "Save & Share"}
            </Button>
          </Card>

          {existingEntries.length > 0 ? (
            <View style={styles.entriesSection}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Your Entries
              </ThemedText>
              {existingEntries.map((entry) => (
                <Card key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <ThemedText type="small" style={styles.entryDate}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </ThemedText>
                    {entry.user_id === profile?.id ? (
                      <View style={[styles.authorBadge, { backgroundColor: theme.link }]}>
                        <ThemedText style={{ color: theme.buttonText, fontSize: 10 }}>
                          You
                        </ThemedText>
                      </View>
                    ) : (
                      <View style={[styles.authorBadge, { backgroundColor: theme.accent }]}>
                        <ThemedText style={{ color: theme.buttonText, fontSize: 10 }}>
                          Partner
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText type="body" style={styles.entryContent}>
                    {entry.content}
                  </ThemedText>
                </Card>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Values & Vision
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Align on what matters most to you both
        </ThemedText>

        <Card style={styles.introCard}>
          <ThemedText type="body" style={styles.introText}>
            Sharing your deepest values and vision for the future creates 
            a foundation for a strong, aligned partnership. Take time to 
            reflect and share openly.
          </ThemedText>
        </Card>

        {CATEGORIES.map((category) => {
          const categoryEntries = getCategoryEntries(category.key);
          return (
            <Card
              key={category.key}
              style={styles.categoryCard}
              onPress={() => setSelectedCategory(category.key)}
            >
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: theme.link }]}>
                  <Feather name={category.icon as any} size={20} color={theme.buttonText} />
                </View>
                <View style={styles.categoryInfo}>
                  <ThemedText type="body" style={styles.categoryName}>
                    {category.name}
                  </ThemedText>
                  {categoryEntries.length > 0 ? (
                    <ThemedText type="small" style={styles.categoryCount}>
                      {categoryEntries.length} entries
                    </ThemedText>
                  ) : (
                    <ThemedText type="small" style={styles.categoryCount}>
                      Not yet explored
                    </ThemedText>
                  )}
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  backText: {
    marginLeft: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  introCard: {
    marginBottom: Spacing.xl,
  },
  introText: {
    opacity: 0.9,
    lineHeight: 24,
  },
  categoryCard: {
    marginBottom: Spacing.md,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  categoryName: {
    fontWeight: "600",
  },
  categoryCount: {
    opacity: 0.6,
    marginTop: 2,
  },
  promptCard: {
    marginBottom: Spacing.xl,
  },
  promptTitle: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  promptText: {
    flex: 1,
    marginLeft: Spacing.sm,
    opacity: 0.8,
  },
  inputCard: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 150,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  entriesSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  entryCard: {
    marginBottom: Spacing.md,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  entryDate: {
    opacity: 0.6,
  },
  authorBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  entryContent: {
    lineHeight: 22,
  },
});
