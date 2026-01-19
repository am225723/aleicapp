import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

const CONCEPTS = [
  {
    title: "The Self",
    description: "Your core essence - calm, curious, compassionate, and confident. The natural leader of your internal system.",
    icon: "sun",
  },
  {
    title: "Parts",
    description: "Different aspects of your personality that carry emotions, beliefs, and behaviors. Each part has a positive intention.",
    icon: "users",
  },
  {
    title: "Exiles",
    description: "Wounded parts carrying painful emotions from past experiences. They're often protected and hidden away.",
    icon: "lock",
  },
  {
    title: "Managers",
    description: "Parts that try to keep you functioning and prevent pain. They often control, plan, and criticize.",
    icon: "shield",
  },
  {
    title: "Firefighters",
    description: "Parts that react when exiles break through. They use distraction, numbing, or other extreme behaviors.",
    icon: "zap",
  },
];

export default function IFSIntroScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Internal Family Systems
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          A compassionate approach to understanding yourself
        </ThemedText>

        <Card style={styles.introCard}>
          <ThemedText type="body" style={styles.introText}>
            IFS helps you understand the different "parts" of yourself - 
            each with their own feelings, thoughts, and desires. By befriending 
            these parts, you can heal and grow in your relationships.
          </ThemedText>
        </Card>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Key Concepts
        </ThemedText>

        {CONCEPTS.map((concept) => (
          <Card key={concept.title} style={styles.conceptCard}>
            <View style={styles.conceptHeader}>
              <View style={[styles.conceptIcon, { backgroundColor: theme.link }]}>
                <Feather name={concept.icon as any} size={18} color={theme.buttonText} />
              </View>
              <ThemedText type="body" style={styles.conceptTitle}>
                {concept.title}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.conceptDescription}>
              {concept.description}
            </ThemedText>
          </Card>
        ))}

        <Card style={styles.relationshipCard}>
          <ThemedText type="h4" style={styles.cardTitle}>
            IFS for Couples
          </ThemedText>
          <ThemedText type="body" style={styles.cardText}>
            Understanding your parts helps you respond from Self rather than react 
            from a protective part. This creates more connection and less conflict 
            in your relationship.
          </ThemedText>
        </Card>

        <Button
          onPress={() => navigation.navigate("IFS")}
          style={styles.startButton}
        >
          Start Parts Work
        </Button>
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
    lineHeight: 24,
    opacity: 0.9,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  conceptCard: {
    marginBottom: Spacing.md,
  },
  conceptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  conceptIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  conceptTitle: {
    marginLeft: Spacing.md,
    fontWeight: "600",
  },
  conceptDescription: {
    opacity: 0.7,
    marginLeft: 44,
  },
  relationshipCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  cardText: {
    opacity: 0.8,
    lineHeight: 22,
  },
  startButton: {
    marginBottom: Spacing.xl,
  },
});
