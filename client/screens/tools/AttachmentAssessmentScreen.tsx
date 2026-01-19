import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Spacing, BorderRadius } from "@/constants/theme";

const QUESTIONS = [
  { id: 1, text: "I find it easy to depend on romantic partners.", category: "secure" },
  { id: 2, text: "I worry about being abandoned or left alone.", category: "anxious" },
  { id: 3, text: "I am comfortable being close to others.", category: "secure" },
  { id: 4, text: "I prefer not to show a partner how I feel deep down.", category: "avoidant" },
  { id: 5, text: "I often worry that my partner doesn't really love me.", category: "anxious" },
  { id: 6, text: "I feel comfortable sharing my private thoughts with my partner.", category: "secure" },
  { id: 7, text: "I find it difficult to trust my partner completely.", category: "avoidant" },
  { id: 8, text: "I get uncomfortable when my partner wants to be very close.", category: "avoidant" },
  { id: 9, text: "I need a lot of reassurance that I am loved.", category: "anxious" },
  { id: 10, text: "I am nervous when partners get too close to me.", category: "avoidant" },
  { id: 11, text: "It helps to turn to my partner in times of need.", category: "secure" },
  { id: 12, text: "I want to get close but I keep pulling back.", category: "fearful" },
];

type AttachmentStyle = "secure" | "anxious" | "avoidant" | "fearful";

export default function AttachmentAssessmentScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AttachmentStyle | null>(null);

  const submitMutation = useMutation({
    mutationFn: async (data: { style: AttachmentStyle; scores: Record<string, number>; answers: Record<number, number> }) => {
      if (!profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("attachment_results").insert({
        user_id: profile.id,
        couple_id: profile.couple_id,
        attachment_style: data.style,
        scores: data.scores,
        answers: data.answers,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachment-results"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestion].id]: value };
    setAnswers(newAnswers);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: Record<number, number>) => {
    const scores: Record<string, number> = { secure: 0, anxious: 0, avoidant: 0, fearful: 0 };

    QUESTIONS.forEach((q) => {
      const answer = finalAnswers[q.id] || 3;
      scores[q.category] += answer;
    });

    const maxCategory = Object.entries(scores).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as AttachmentStyle;

    setResult(maxCategory);
    submitMutation.mutate({
      style: maxCategory,
      scores,
      answers: finalAnswers,
    });
  };

  const getStyleInfo = (style: AttachmentStyle) => {
    const info = {
      secure: {
        title: "Secure Attachment",
        description: "You feel comfortable with intimacy and independence. You can trust your partner and be trusted in return.",
        tips: ["Continue nurturing open communication", "Share vulnerabilities with confidence", "Be a safe haven for your partner"],
      },
      anxious: {
        title: "Anxious Attachment",
        description: "You crave closeness and worry about your partner's availability. You may need more reassurance in relationships.",
        tips: ["Practice self-soothing techniques", "Communicate needs directly", "Build trust through consistent actions"],
      },
      avoidant: {
        title: "Avoidant Attachment",
        description: "You value independence and may struggle with emotional closeness. You might pull away when things get too intimate.",
        tips: ["Practice gradual vulnerability", "Recognize your partner's need for closeness", "Challenge discomfort with intimacy"],
      },
      fearful: {
        title: "Fearful-Avoidant Attachment",
        description: "You want closeness but fear it at the same time. Past experiences may make trusting difficult.",
        tips: ["Work on healing past wounds", "Take small steps toward trust", "Consider professional support"],
      },
    };
    return info[style];
  };

  if (result) {
    const styleInfo = getStyleInfo(result);
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <View style={styles.resultContainer}>
            <View style={[styles.resultIcon, { backgroundColor: theme.link }]}>
              <Feather name="heart" size={32} color={theme.buttonText} />
            </View>
            <ThemedText type="h2" style={styles.resultTitle}>
              {styleInfo.title}
            </ThemedText>
            <ThemedText type="body" style={styles.resultDescription}>
              {styleInfo.description}
            </ThemedText>

            <Card style={styles.tipsCard}>
              <ThemedText type="h4" style={styles.tipsTitle}>
                Growth Tips
              </ThemedText>
              {styleInfo.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Feather name="check-circle" size={16} color={theme.success} />
                  <ThemedText type="body" style={styles.tipText}>
                    {tip}
                  </ThemedText>
                </View>
              ))}
            </Card>

            <Button
              onPress={() => navigation.goBack()}
              style={styles.doneButton}
            >
              Done
            </Button>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText type="h2" style={styles.title}>
          Attachment Assessment
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Discover your attachment style
        </ThemedText>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.link, width: `${progress}%` },
              ]}
            />
          </View>
          <ThemedText type="small" style={styles.progressText}>
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </ThemedText>
        </View>

        <Card style={styles.questionCard}>
          <ThemedText type="h4" style={styles.questionText}>
            {question.text}
          </ThemedText>

          <View style={styles.optionsContainer}>
            {[
              { value: 1, label: "Strongly Disagree" },
              { value: 2, label: "Disagree" },
              { value: 3, label: "Neutral" },
              { value: 4, label: "Agree" },
              { value: 5, label: "Strongly Agree" },
            ].map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  { borderColor: theme.border },
                  answers[question.id] === option.value && {
                    backgroundColor: theme.link,
                    borderColor: theme.link,
                  },
                ]}
                onPress={() => handleAnswer(option.value)}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    answers[question.id] === option.value && { color: theme.buttonText },
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
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
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    opacity: 0.6,
    textAlign: "center",
  },
  questionCard: {
    marginBottom: Spacing.xl,
  },
  questionText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  optionText: {
    fontSize: 15,
  },
  resultContainer: {
    alignItems: "center",
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  resultTitle: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  resultDescription: {
    textAlign: "center",
    opacity: 0.8,
    marginBottom: Spacing.xl,
  },
  tipsCard: {
    width: "100%",
    marginBottom: Spacing.xl,
  },
  tipsTitle: {
    marginBottom: Spacing.lg,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  tipText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  doneButton: {
    width: "100%",
  },
});
