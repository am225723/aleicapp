import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing } from "@/constants/theme";

const TYPE_INFO: Record<number, { name: string; color: string }> = {
  1: { name: "The Reformer", color: "#8B9DC3" },
  2: { name: "The Helper", color: "#E8A59C" },
  3: { name: "The Achiever", color: "#81C995" },
  4: { name: "The Individualist", color: "#A8B5D1" },
  5: { name: "The Investigator", color: "#F6C177" },
  6: { name: "The Loyalist", color: "#E88B8B" },
  7: { name: "The Enthusiast", color: "#FFD93D" },
  8: { name: "The Challenger", color: "#FF6B6B" },
  9: { name: "The Peacemaker", color: "#6BCB77" },
};

export default function EnneagramScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { data: results = [] } = useQuery({
    queryKey: ["enneagram-results", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("enneagram_results")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const latestResult = results[0];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Enneagram
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          A powerful personality system for self-discovery
        </ThemedText>

        {latestResult ? (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.typeNumber,
                  { backgroundColor: TYPE_INFO[latestResult.primary_type]?.color || theme.link },
                ]}
              >
                <ThemedText type="h2" style={{ color: "#fff" }}>
                  {latestResult.primary_type}
                </ThemedText>
              </View>
              <View style={styles.resultInfo}>
                <ThemedText type="h4">
                  {TYPE_INFO[latestResult.primary_type]?.name}
                </ThemedText>
                <ThemedText type="small" style={styles.resultDate}>
                  Assessed {new Date(latestResult.created_at).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
          </Card>
        ) : null}

        <Button
          onPress={() => navigation.navigate("EnneagramAssessment")}
          style={styles.assessButton}
        >
          {latestResult ? "Retake Assessment" : "Take Assessment"}
        </Button>

        <ThemedText type="h4" style={styles.sectionTitle}>
          The Nine Types
        </ThemedText>

        <View style={styles.typesGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((type) => (
            <Card key={type} style={styles.typeCard}>
              <View
                style={[styles.typeIcon, { backgroundColor: TYPE_INFO[type].color }]}
              >
                <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>
                  {type}
                </ThemedText>
              </View>
              <ThemedText type="small" style={styles.typeName}>
                {TYPE_INFO[type].name.replace("The ", "")}
              </ThemedText>
            </Card>
          ))}
        </View>

        <Card style={styles.infoCard}>
          <ThemedText type="body" style={styles.infoText}>
            The Enneagram reveals our core motivations, fears, and desires. 
            Understanding your type and your partner's type can transform 
            how you communicate and connect.
          </ThemedText>
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
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  resultCard: {
    marginBottom: Spacing.xl,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  resultInfo: {
    marginLeft: Spacing.lg,
  },
  resultDate: {
    opacity: 0.6,
    marginTop: 2,
  },
  assessButton: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  typeCard: {
    width: "31%",
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  typeName: {
    textAlign: "center",
    fontSize: 11,
  },
  infoCard: {
    marginBottom: Spacing.xl,
  },
  infoText: {
    opacity: 0.8,
    lineHeight: 22,
  },
});
