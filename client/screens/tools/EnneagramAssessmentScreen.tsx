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
  { id: 1, text: "I strive for perfection and hold myself to high standards.", types: [1] },
  { id: 2, text: "I naturally sense what others need and want to help.", types: [2] },
  { id: 3, text: "Achievement and success are very important to me.", types: [3] },
  { id: 4, text: "I often feel different from others and value authenticity.", types: [4] },
  { id: 5, text: "I need time alone to think and recharge.", types: [5] },
  { id: 6, text: "I tend to anticipate what could go wrong.", types: [6] },
  { id: 7, text: "I love variety and dislike being limited.", types: [7] },
  { id: 8, text: "I'm comfortable taking charge and being direct.", types: [8] },
  { id: 9, text: "I prefer peace and avoid conflict when possible.", types: [9] },
  { id: 10, text: "I notice flaws and errors easily.", types: [1] },
  { id: 11, text: "I'm good at making others feel special.", types: [2] },
  { id: 12, text: "Image and how others perceive me matters.", types: [3] },
];

const TYPE_INFO: Record<number, { name: string; description: string }> = {
  1: { name: "The Reformer", description: "Principled, purposeful, self-controlled, and perfectionistic" },
  2: { name: "The Helper", description: "Generous, demonstrative, people-pleasing, and possessive" },
  3: { name: "The Achiever", description: "Adaptable, excelling, driven, and image-conscious" },
  4: { name: "The Individualist", description: "Expressive, dramatic, self-absorbed, and temperamental" },
  5: { name: "The Investigator", description: "Perceptive, innovative, secretive, and isolated" },
  6: { name: "The Loyalist", description: "Engaging, responsible, anxious, and suspicious" },
  7: { name: "The Enthusiast", description: "Spontaneous, versatile, acquisitive, and scattered" },
  8: { name: "The Challenger", description: "Self-confident, decisive, willful, and confrontational" },
  9: { name: "The Peacemaker", description: "Receptive, reassuring, complacent, and resigned" },
};

export default function EnneagramAssessmentScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<number | null>(null);

  const submitMutation = useMutation({
    mutationFn: async (data: { type: number; scores: Record<number, number>; answers: Record<number, number> }) => {
      if (!profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("enneagram_results").insert({
        user_id: profile.id,
        couple_id: profile.couple_id,
        primary_type: data.type,
        scores: data.scores,
        answers: data.answers,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enneagram-results"] });
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
    const scores: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) scores[i] = 0;

    QUESTIONS.forEach((q) => {
      const answer = finalAnswers[q.id] || 3;
      q.types.forEach((type) => {
        scores[type] += answer;
      });
    });

    const maxType = Object.entries(scores).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    const resultType = parseInt(maxType);
    setResult(resultType);
    submitMutation.mutate({
      type: resultType,
      scores,
      answers: finalAnswers,
    });
  };

  if (result) {
    const typeInfo = TYPE_INFO[result];
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
              <ThemedText type="h1" style={{ color: theme.buttonText }}>
                {result}
              </ThemedText>
            </View>
            <ThemedText type="h2" style={styles.resultTitle}>
              {typeInfo.name}
            </ThemedText>
            <ThemedText type="body" style={styles.resultDescription}>
              {typeInfo.description}
            </ThemedText>

            <Card style={styles.insightCard}>
              <ThemedText type="h4" style={styles.insightTitle}>
                In Relationships
              </ThemedText>
              <ThemedText type="body" style={styles.insightText}>
                Understanding your Enneagram type helps you recognize patterns 
                in how you relate to your partner and what you need for connection.
              </ThemedText>
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
          Enneagram Assessment
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Discover your personality type
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
              { value: 1, label: "Not at all" },
              { value: 2, label: "A little" },
              { value: 3, label: "Somewhat" },
              { value: 4, label: "Quite a bit" },
              { value: 5, label: "Very much" },
            ].map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  { borderColor: theme.border },
                ]}
                onPress={() => handleAnswer(option.value)}
              >
                <ThemedText style={styles.optionText}>
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
    width: 100,
    height: 100,
    borderRadius: 50,
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
  insightCard: {
    width: "100%",
    marginBottom: Spacing.xl,
  },
  insightTitle: {
    marginBottom: Spacing.md,
  },
  insightText: {
    opacity: 0.8,
  },
  doneButton: {
    width: "100%",
  },
});
