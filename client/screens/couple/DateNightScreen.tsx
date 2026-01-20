import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const INTERESTS = [
  { id: "food", emoji: "fork-knife", label: "Dining & Food" },
  { id: "outdoors", emoji: "sun", label: "Outdoor Activities" },
  { id: "arts", emoji: "edit-3", label: "Arts & Culture" },
  { id: "entertainment", emoji: "film", label: "Entertainment" },
  { id: "relaxation", emoji: "coffee", label: "Relaxation" },
  { id: "adventure", emoji: "compass", label: "Adventure" },
  { id: "learning", emoji: "book-open", label: "Learning" },
  { id: "sports", emoji: "activity", label: "Sports & Fitness" },
  { id: "music", emoji: "music", label: "Music & Dance" },
  { id: "romance", emoji: "heart", label: "Romantic" },
  { id: "social", emoji: "users", label: "Social Activities" },
  { id: "home", emoji: "home", label: "At-Home Fun" },
];

interface DateIdea {
  title: string;
  description: string;
  location?: string;
  estimated_cost?: string;
}

function parseIdeasFromResponse(content: string): DateIdea[] {
  const ideas: DateIdea[] = [];
  const blocks = content.split(/✨/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length === 0) continue;

    const title = lines[0].trim().replace(/^\[|\]$/g, "");
    let description = "";
    let connectionTip = "";

    for (const line of lines.slice(1)) {
      const trimmed = line.trim();
      if (trimmed.startsWith("Description:")) {
        description = trimmed.replace("Description:", "").trim();
      } else if (trimmed.startsWith("Connection Tip:")) {
        connectionTip = trimmed.replace("Connection Tip:", "").trim();
      }
    }

    if (title) {
      ideas.push({
        title,
        description: description + (connectionTip ? `\n\nConnection Tip: ${connectionTip}` : ""),
      });
    }
  }

  if (ideas.length === 0 && content.trim()) {
    ideas.push({
      title: "Date Night Idea",
      description: content.trim(),
    });
  }

  return ideas;
}

export default function DateNightScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<DateIdea[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleGenerate = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert("Select Interests", "Please select at least one interest");
      return;
    }

    if (!location.trim()) {
      Alert.alert("Add Location", "Please enter your city or zip code");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedIdeas([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload = {
        interests: selectedInterests,
        time: "evening",
        zipCode: location.trim(),
        travelDistance: `${distance} miles`,
        activityLocation: "outdoors or indoors",
        price: "any",
        participants: "couple",
        energy: "medium",
      };

      const { data, error: fnError } = await supabase.functions.invoke("ai-date-night", {
        body: payload,
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to generate ideas");
      }

      if (data?.content) {
        const ideas = parseIdeasFromResponse(data.content);
        setGeneratedIdeas(ideas);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No ideas generated");
      }
    } catch (err) {
      console.error("Error generating date ideas:", err);
      setError(err instanceof Error ? err.message : "Failed to generate ideas");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <ThemedText type="h2">Date Night Generator</ThemedText>
      <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
        Get AI-powered date ideas tailored to your preferences
      </ThemedText>

      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Select Your Interests
        </ThemedText>
        <View style={styles.interestsGrid}>
          {INTERESTS.map((interest) => (
            <Pressable
              key={interest.id}
              style={[
                styles.interestButton,
                {
                  backgroundColor: selectedInterests.includes(interest.id)
                    ? theme.link
                    : theme.backgroundSecondary,
                  borderColor: selectedInterests.includes(interest.id)
                    ? theme.link
                    : theme.border,
                },
              ]}
              onPress={() => toggleInterest(interest.id)}
            >
              <Feather
                name={interest.emoji as any}
                size={16}
                color={selectedInterests.includes(interest.id) ? "#FFFFFF" : theme.text}
              />
              <ThemedText
                type="small"
                style={{
                  color: selectedInterests.includes(interest.id) ? "#FFFFFF" : theme.text,
                  marginLeft: Spacing.xs,
                }}
              >
                {interest.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Location
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter city or zip code"
          placeholderTextColor={theme.textSecondary}
        />

        <ThemedText type="h4" style={styles.distanceLabel}>
          Distance: {distance} miles
        </ThemedText>
        <View style={styles.distanceButtons}>
          {[5, 10, 15, 20, 30].map((d) => (
            <Pressable
              key={d}
              style={[
                styles.distanceButton,
                {
                  backgroundColor: distance === d ? theme.link : theme.backgroundSecondary,
                  borderColor: distance === d ? theme.link : theme.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDistance(d);
              }}
            >
              <ThemedText
                type="small"
                style={{ color: distance === d ? "#FFFFFF" : theme.text }}
              >
                {d}mi
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </Card>

      <Button
        onPress={handleGenerate}
        disabled={isGenerating}
        style={styles.generateButton}
      >
        {isGenerating ? "Generating..." : "Generate Date Ideas"}
      </Button>

      {isGenerating ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="small" color={theme.link} />
          <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
            Generating personalized date ideas...
          </ThemedText>
        </Card>
      ) : null}

      {error ? (
        <Card style={styles.errorCard}>
          <Feather name="alert-circle" size={20} color={Colors.light.error} />
          <ThemedText type="body" style={{ color: Colors.light.error, marginLeft: Spacing.sm }}>
            {error}
          </ThemedText>
        </Card>
      ) : null}

      {generatedIdeas.length > 0 ? (
        <View style={styles.ideasSection}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Your Date Ideas
          </ThemedText>
          {generatedIdeas.map((idea, index) => (
            <Card key={index} style={styles.ideaCard}>
              <ThemedText type="h4" style={styles.ideaTitle}>
                {idea.title}
              </ThemedText>
              <ThemedText type="body" style={styles.ideaDescription}>
                {idea.description}
              </ThemedText>
              {idea.location ? (
                <View style={styles.ideaMeta}>
                  <Feather name="map-pin" size={14} color={theme.textSecondary} />
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                    {idea.location}
                  </ThemedText>
                </View>
              ) : null}
              {idea.estimated_cost ? (
                <View style={styles.ideaMeta}>
                  <Feather name="dollar-sign" size={14} color={theme.textSecondary} />
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                    {idea.estimated_cost}
                  </ThemedText>
                </View>
              ) : null}
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
    padding: Spacing.lg,
  },
  subtitle: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  interestButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    margin: Spacing.xs,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  distanceLabel: {
    marginBottom: Spacing.sm,
  },
  distanceButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  distanceButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    margin: Spacing.xs,
  },
  generateButton: {
    marginBottom: Spacing.lg,
  },
  loadingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  loadingText: {
    marginLeft: Spacing.md,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  ideasSection: {
    marginTop: Spacing.md,
  },
  ideaCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  ideaTitle: {
    marginBottom: Spacing.xs,
  },
  ideaDescription: {
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  ideaMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
});
