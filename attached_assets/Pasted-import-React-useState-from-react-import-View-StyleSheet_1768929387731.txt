import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { LoveLanguageResult } from "@/types";
import { apiRequest } from "@/lib/query-client";

const questions = [
  {
    id: 1,
    text: "I feel most loved when...",
    options: [
      { language: "words_of_affirmation", text: "My partner tells me they love me" },
      { language: "quality_time", text: "We spend quality time together" },
      { language: "receiving_gifts", text: "My partner gives me thoughtful gifts" },
      { language: "acts_of_service", text: "My partner helps me with tasks" },
      { language: "physical_touch", text: "We cuddle or hold hands" },
    ],
  },
  {
    id: 2,
    text: "I appreciate it most when...",
    options: [
      { language: "words_of_affirmation", text: "I receive compliments and encouragement" },
      { language: "quality_time", text: "We have uninterrupted conversations" },
      { language: "receiving_gifts", text: "I get surprise presents" },
      { language: "acts_of_service", text: "Chores are done without asking" },
      { language: "physical_touch", text: "I get hugs and kisses" },
    ],
  },
  {
    id: 3,
    text: "My ideal date would be...",
    options: [
      { language: "words_of_affirmation", text: "Sharing our feelings and dreams" },
      { language: "quality_time", text: "A long walk together" },
      { language: "receiving_gifts", text: "Exchanging meaningful gifts" },
      { language: "acts_of_service", text: "Having my partner plan everything" },
      { language: "physical_touch", text: "Dancing close together" },
    ],
  },
  {
    id: 4,
    text: "I feel disconnected when...",
    options: [
      { language: "words_of_affirmation", text: "I don't hear positive words" },
      { language: "quality_time", text: "We're too busy for each other" },
      { language: "receiving_gifts", text: "Special occasions are forgotten" },
      { language: "acts_of_service", text: "I have to do everything alone" },
      { language: "physical_touch", text: "There's no physical affection" },
    ],
  },
  {
    id: 5,
    text: "I show love by...",
    options: [
      { language: "words_of_affirmation", text: "Expressing my feelings verbally" },
      { language: "quality_time", text: "Making time for my partner" },
      { language: "receiving_gifts", text: "Giving thoughtful presents" },
      { language: "acts_of_service", text: "Doing things to help" },
      { language: "physical_touch", text: "Physical affection" },
    ],
  },
];

type Language =
  | "words_of_affirmation"
  | "quality_time"
  | "receiving_gifts"
  | "acts_of_service"
  | "physical_touch";

const languageNames: Record<Language, string> = {
  words_of_affirmation: "Words of Affirmation",
  quality_time: "Quality Time",
  receiving_gifts: "Receiving Gifts",
  acts_of_service: "Acts of Service",
  physical_touch: "Physical Touch",
};

export default function LoveLanguageQuizScreen() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<Language, number>>({
    words_of_affirmation: 0,
    quality_time: 0,
    receiving_gifts: 0,
    acts_of_service: 0,
    physical_touch: 0,
  });

  const { data: existingResult } = useQuery<LoveLanguageResult>({
    queryKey: ["/api/love-language/user", profile?.id],
    enabled: !!profile?.id,
  });

  const saveResultMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/love-language", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/love-language/user", profile?.id],
      });
      setQuizStarted(false);
      setCurrentQuestion(0);
      setAnswers({
        words_of_affirmation: 0,
        quality_time: 0,
        receiving_gifts: 0,
        acts_of_service: 0,
        physical_touch: 0,
      });
    },
  });

  const handleAnswer = (language: Language) => {
    const newAnswers = { ...answers, [language]: answers[language] + 1 };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const sorted = Object.entries(newAnswers).sort((a, b) => b[1] - a[1]);
      const primary = languageNames[sorted[0][0] as Language];
      const secondary = languageNames[sorted[1][0] as Language];

      saveResultMutation.mutate({
        ...newAnswers,
        primary_language: primary,
        secondary_language: secondary,
      });
    }
  };

  if (existingResult && !quizStarted) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <ThemedText type="h2">Your Love Language</ThemedText>

        <Card style={styles.resultsCard}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Primary Love Language
          </ThemedText>
          <ThemedText type="h3" style={{ color: theme.link, marginBottom: Spacing.lg }}>
            {existingResult.primary_language}
          </ThemedText>

          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Secondary Love Language
          </ThemedText>
          <ThemedText type="h4" style={{ color: theme.accent, marginBottom: Spacing.lg }}>
            {existingResult.secondary_language}
          </ThemedText>

          <View style={styles.scoresSection}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.sm }}>
              Breakdown
            </ThemedText>
            {Object.entries(languageNames).map(([key, name]) => (
              <View key={key} style={styles.scoreRow}>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  {name}:
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {existingResult[key as Language] || 0}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>

        <Button onPress={() => setQuizStarted(true)}>Retake Quiz</Button>
      </ScrollView>
    );
  }

  if (!quizStarted) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <ThemedText type="h2">Love Language Quiz</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
          Discover how you give and receive love
        </ThemedText>

        <Card>
          <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
            This quiz will help you understand your primary and secondary love
            languages. Answer honestly about what makes you feel most loved
            and valued in your relationship.
          </ThemedText>

          <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
            The five love languages are:
          </ThemedText>

          <View style={{ marginBottom: Spacing.lg }}>
            {Object.values(languageNames).map((name) => (
              <ThemedText key={name} type="body" style={{ marginBottom: Spacing.xs }}>
                - {name}
              </ThemedText>
            ))}
          </View>

          <Button onPress={() => setQuizStarted(true)}>Start Quiz</Button>
        </Card>
      </ScrollView>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: theme.link },
          ]}
        />
      </View>

      <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
        Question {currentQuestion + 1} of {questions.length}
      </ThemedText>

      <Card style={{ marginTop: Spacing.md }}>
        <ThemedText type="h4" style={{ marginBottom: Spacing.lg }}>
          {question.text}
        </ThemedText>

        <View style={{ gap: Spacing.sm }}>
          {question.options.map((option, index) => (
            <Pressable
              key={index}
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleAnswer(option.language as Language)}
            >
              <ThemedText type="body">{option.text}</ThemedText>
            </Pressable>
          ))}
        </View>
      </Card>
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
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  resultsCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  scoresSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  optionButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
