import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AttachmentResult {
  id: string;
  attachment_style: string;
  scores: Record<string, number>;
  created_at: string;
}

const STYLE_INFO: Record<string, { icon: string; color: string; description: string }> = {
  secure: {
    icon: "shield",
    color: "#81C995",
    description: "Comfortable with intimacy and independence",
  },
  anxious: {
    icon: "alert-circle",
    color: "#F6C177",
    description: "Seeks closeness and may worry about abandonment",
  },
  avoidant: {
    icon: "x-circle",
    color: "#E88B8B",
    description: "Values independence, may avoid emotional closeness",
  },
  fearful: {
    icon: "help-circle",
    color: "#A8B5D1",
    description: "Desires closeness but fears it",
  },
};

export default function AttachmentStyleScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { data: results = [] } = useQuery({
    queryKey: ["attachment-results", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("attachment_results")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AttachmentResult[];
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
          Attachment Styles
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Understanding how you connect in relationships
        </ThemedText>

        {latestResult ? (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View
                style={[
                  styles.resultIcon,
                  { backgroundColor: STYLE_INFO[latestResult.attachment_style]?.color || theme.link },
                ]}
              >
                <Feather
                  name={STYLE_INFO[latestResult.attachment_style]?.icon as any || "heart"}
                  size={24}
                  color="#fff"
                />
              </View>
              <View style={styles.resultInfo}>
                <ThemedText type="h4">
                  {latestResult.attachment_style.charAt(0).toUpperCase() +
                    latestResult.attachment_style.slice(1)} Attachment
                </ThemedText>
                <ThemedText type="small" style={styles.resultDate}>
                  Assessed {new Date(latestResult.created_at).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="body" style={styles.resultDescription}>
              {STYLE_INFO[latestResult.attachment_style]?.description}
            </ThemedText>
          </Card>
        ) : null}

        <Button
          onPress={() => navigation.navigate("AttachmentAssessment")}
          style={styles.assessButton}
        >
          {latestResult ? "Retake Assessment" : "Take Assessment"}
        </Button>

        <ThemedText type="h4" style={styles.sectionTitle}>
          The Four Attachment Styles
        </ThemedText>

        {Object.entries(STYLE_INFO).map(([key, info]) => (
          <Card key={key} style={styles.styleCard}>
            <View style={styles.styleHeader}>
              <View style={[styles.styleIcon, { backgroundColor: info.color }]}>
                <Feather name={info.icon as any} size={20} color="#fff" />
              </View>
              <ThemedText type="body" style={styles.styleName}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.styleDescription}>
              {info.description}
            </ThemedText>
          </Card>
        ))}

        <Card style={styles.infoCard}>
          <Feather name="info" size={20} color={theme.link} />
          <ThemedText type="small" style={styles.infoText}>
            Attachment styles can change over time with awareness and intentional work.
            Understanding your style is the first step toward more secure connections.
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
    marginBottom: Spacing.md,
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  resultInfo: {
    marginLeft: Spacing.md,
  },
  resultDate: {
    opacity: 0.6,
    marginTop: 2,
  },
  resultDescription: {
    opacity: 0.8,
  },
  assessButton: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  styleCard: {
    marginBottom: Spacing.md,
  },
  styleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  styleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  styleName: {
    marginLeft: Spacing.md,
    fontWeight: "600",
  },
  styleDescription: {
    opacity: 0.7,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.lg,
  },
  infoText: {
    flex: 1,
    marginLeft: Spacing.md,
    opacity: 0.8,
  },
});
