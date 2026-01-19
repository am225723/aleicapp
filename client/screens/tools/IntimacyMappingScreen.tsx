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

type IntimacyCategory = "emotional" | "physical" | "intellectual" | "spiritual" | "recreational";

const CATEGORIES: { key: IntimacyCategory; name: string; icon: string; examples: string[] }[] = [
  { key: "emotional", name: "Emotional", icon: "heart", examples: ["Deep conversations", "Sharing fears", "Active listening"] },
  { key: "physical", name: "Physical", icon: "activity", examples: ["Touch preferences", "Affection styles", "Comfort zones"] },
  { key: "intellectual", name: "Intellectual", icon: "book", examples: ["Learning together", "Debating ideas", "Shared curiosity"] },
  { key: "spiritual", name: "Spiritual", icon: "sun", examples: ["Shared beliefs", "Meaning-making", "Rituals"] },
  { key: "recreational", name: "Recreational", icon: "smile", examples: ["Fun activities", "Hobbies", "Play styles"] },
];

interface IntimacyMap {
  id: string;
  category: IntimacyCategory;
  preferences: { likes: string[]; dislikes: string[] };
  notes: string | null;
  created_at: string;
}

export default function IntimacyMappingScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<IntimacyCategory | null>(null);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [newLike, setNewLike] = useState("");
  const [newDislike, setNewDislike] = useState("");
  const [notes, setNotes] = useState("");

  const { data: maps = [] } = useQuery({
    queryKey: ["intimacy-maps", profile?.couple_id],
    queryFn: async () => {
      if (!profile?.couple_id) return [];
      const { data, error } = await supabase
        .from("intimacy_maps")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as IntimacyMap[];
    },
    enabled: !!profile?.couple_id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !selectedCategory) throw new Error("Missing data");
      const { error } = await supabase.from("intimacy_maps").insert({
        user_id: profile.id,
        couple_id: profile.couple_id,
        category: selectedCategory,
        preferences: { likes, dislikes },
        notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intimacy-maps"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    },
    onError: () => {
      Alert.alert("Error", "Failed to save");
    },
  });

  const resetForm = () => {
    setSelectedCategory(null);
    setLikes([]);
    setDislikes([]);
    setNewLike("");
    setNewDislike("");
    setNotes("");
  };

  const addItem = (type: "like" | "dislike") => {
    if (type === "like" && newLike.trim()) {
      setLikes([...likes, newLike.trim()]);
      setNewLike("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === "dislike" && newDislike.trim()) {
      setDislikes([...dislikes, newDislike.trim()]);
      setNewDislike("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getCategoryMaps = (category: IntimacyCategory) => maps.filter((m) => m.category === category);

  if (!selectedCategory) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <ThemedText type="h2" style={styles.title}>
            Intimacy Mapping
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Map your preferences across different types of intimacy
          </ThemedText>

          {CATEGORIES.map((cat) => {
            const existingMaps = getCategoryMaps(cat.key);
            return (
              <Card
                key={cat.key}
                style={styles.categoryCard}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: theme.link }]}>
                    <Feather name={cat.icon as any} size={20} color={theme.buttonText} />
                  </View>
                  <View style={styles.categoryInfo}>
                    <ThemedText type="h4">{cat.name}</ThemedText>
                    {existingMaps.length > 0 ? (
                      <ThemedText type="small" style={styles.categoryCount}>
                        {existingMaps.length} entries
                      </ThemedText>
                    ) : null}
                  </View>
                  <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                </View>
                <ThemedText type="small" style={styles.categoryExamples}>
                  {cat.examples.join(" • ")}
                </ThemedText>
              </Card>
            );
          })}
        </ScrollView>
      </ThemedView>
    );
  }

  const category = CATEGORIES.find((c) => c.key === selectedCategory);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Pressable onPress={resetForm} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={theme.text} />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </Pressable>

        <ThemedText type="h2" style={styles.title}>
          {category?.name} Intimacy
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Share your preferences and boundaries
        </ThemedText>

        <Card style={styles.formCard}>
          <View style={styles.section}>
            <ThemedText type="body" style={styles.sectionTitle}>
              What I enjoy
            </ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, flex: 1 }]}
                value={newLike}
                onChangeText={setNewLike}
                placeholder="Add something you like..."
                placeholderTextColor={theme.textSecondary}
                onSubmitEditing={() => addItem("like")}
              />
              <Pressable
                style={[styles.addButton, { backgroundColor: theme.success }]}
                onPress={() => addItem("like")}
              >
                <Feather name="plus" size={20} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.chips}>
              {likes.map((item, idx) => (
                <View key={idx} style={[styles.chip, { backgroundColor: theme.success + "20" }]}>
                  <ThemedText type="small">{item}</ThemedText>
                  <Pressable onPress={() => setLikes(likes.filter((_, i) => i !== idx))}>
                    <Feather name="x" size={14} color={theme.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="body" style={styles.sectionTitle}>
              Boundaries / Dislikes
            </ThemedText>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, flex: 1 }]}
                value={newDislike}
                onChangeText={setNewDislike}
                placeholder="Add a boundary..."
                placeholderTextColor={theme.textSecondary}
                onSubmitEditing={() => addItem("dislike")}
              />
              <Pressable
                style={[styles.addButton, { backgroundColor: theme.error }]}
                onPress={() => addItem("dislike")}
              >
                <Feather name="plus" size={20} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.chips}>
              {dislikes.map((item, idx) => (
                <View key={idx} style={[styles.chip, { backgroundColor: theme.error + "20" }]}>
                  <ThemedText type="small">{item}</ThemedText>
                  <Pressable onPress={() => setDislikes(dislikes.filter((_, i) => i !== idx))}>
                    <Feather name="x" size={14} color={theme.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="body" style={styles.label}>
              Additional Notes
            </ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any other thoughts to share..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Button
            onPress={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || (likes.length === 0 && dislikes.length === 0)}
          >
            {saveMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </Card>
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
  categoryCard: {
    marginBottom: Spacing.md,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  categoryCount: {
    opacity: 0.6,
    marginTop: 2,
  },
  categoryExamples: {
    opacity: 0.7,
    marginLeft: 52,
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  addButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 80,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
});
