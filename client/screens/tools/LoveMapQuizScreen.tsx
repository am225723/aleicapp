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
  { id: 1, text: "I know my partner's favorite way to spend an evening." },
  { id: 2, text: "I know what stresses my partner currently." },
  { id: 3, text: "I know my partner's dreams and aspirations." },
  { id: 4, text: "I know my partner's favorite movie." },
  { id: 5, text: "I know my partner's biggest fear." },
  { id: 6, text: "I know what my partner would do if they won the lottery." },
  { id: 7, text: "I know my partner's favorite meal." },
  { id: 8, text: "I know my partner's best friend's name." },
  { id: 9, text: "I know what makes my partner feel loved." },
  { id: 10, text: "I know my partner's favorite way to relax." },
  { id: 11, text: "I know what my partner is most proud of." },
  { id: 12, text: "I know my partner's favorite book or author." },
  { id: 13, text: "I know my partner's childhood nickname." },
  { id: 14, text: "I know my partner's favorite holiday or trip." },
  { id: 15, text: "I know what my partner worries about most." },
];

export default function LoveMapQuizScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: { score: number; answers: Record<number, boolean> }) => {
      if (!profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("love_map_results").insert({
        user_id: profile.id,
        couple_id: profile.couple_id,
        score: data.score,
        total_questions: QUESTIONS.length,
        answers: data.answers,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["love-map-results"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleAnswer = (value: boolean) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestion].id]: value };
    setAnswers(newAnswers);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const score = Object.values(newAnswers).filter(Boolean).length;
      submitMutation.mutate({ score, answers: newAnswers });
      setShowResult(true);
    }
  };

  const getResultMessage = (score: number) => {
    const percentage = (score / QUESTIONS.length) * 100;
    if (percentage >= 80) {
      return {
        title: "Excellent!",
        message: "You have a strong love map. You really know your partner well!",
        icon: "award",
      };
    } else if (percentage >= 60) {
      return {
        title: "Good Foundation",
        message: "You have a solid understanding of your partner. Keep exploring together!",
        icon: "thumbs-up",
      };
    } else if (percentage >= 40) {
      return {
        title: "Room to Grow",
        message: "There's an opportunity to deepen your connection. Ask more questions!",
        icon: "heart",
      };
    } else {
      return {
        title: "Time to Connect",
        message: "Use this as inspiration to learn more about your partner's inner world.",
        icon: "compass",
      };
    }
  };

  if (showResult) {
    const score = Object.values(answers).filter(Boolean).length;
    const result = getResultMessage(score);
    const percentage = Math.round((score / QUESTIONS.length) * 100);

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
              <Feather name={result.icon as any} size={32} color={theme.buttonText} />
            </View>

            <ThemedText type="h2" style={styles.resultTitle}>
              {result.title}
            </ThemedText>

            <View style={styles.scoreContainer}>
              <ThemedText type="h1" style={[styles.scoreText, { color: theme.link }]}>
                {score}/{QUESTIONS.length}
              </ThemedText>
              <ThemedText type="body" style={styles.percentageText}>
                {percentage}% accuracy
              </ThemedText>
            </View>

            <ThemedText type="body" style={styles.resultMessage}>
              {result.message}
            </ThemedText>

            <Card style={styles.tipsCard}>
              <ThemedText type="h4" style={styles.tipsTitle}>
                Deepen Your Love Map
              </ThemedText>
              <View style={styles.tipRow}>
                <Feather name="message-circle" size={16} color={theme.success} />
                <ThemedText type="body" style={styles.tipText}>
                  Ask open-ended questions daily
                </ThemedText>
              </View>
              <View style={styles.tipRow}>
                <Feather name="calendar" size={16} color={theme.success} />
                <ThemedText type="body" style={styles.tipText}>
                  Schedule weekly check-ins
                </ThemedText>
              </View>
              <View style={styles.tipRow}>
                <Feather name="book-open" size={16} color={theme.success} />
                <ThemedText type="body" style={styles.tipText}>
                  Share dreams and goals regularly
                </ThemedText>
              </View>
            </Card>

            <Button onPress={() => navigation.goBack()} style={styles.doneButton}>
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
          Love Map Quiz
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          How well do you know your partner? (Gottman)
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
            <Pressable
              style={[styles.optionButton, { backgroundColor: theme.success }]}
              onPress={() => handleAnswer(true)}
            >
              <Feather name="check" size={24} color="#fff" />
              <ThemedText style={styles.optionText}>Yes, I know this</ThemedText>
            </Pressable>

            <Pressable
              style={[styles.optionButton, { backgroundColor: theme.error }]}
              onPress={() => handleAnswer(false)}
            >
              <Feather name="x" size={24} color="#fff" />
              <ThemedText style={styles.optionText}>Not sure</ThemedText>
            </Pressable>
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
    marginBottom: Spacing["3xl"],
  },
  optionsContainer: {
    gap: Spacing.lg,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  scoreText: {
    marginBottom: Spacing.xs,
  },
  percentageText: {
    opacity: 0.6,
  },
  resultMessage: {
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
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  tipText: {
    marginLeft: Spacing.md,
  },
  doneButton: {
    width: "100%",
  },
});
