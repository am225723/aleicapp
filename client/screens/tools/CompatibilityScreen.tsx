import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const QUESTIONS = [
  { id: 1, text: "How important is quality time together?", category: "Quality Time" },
  { id: 2, text: "How do you prefer to handle conflicts?", category: "Communication" },
  { id: 3, text: "How important is physical affection?", category: "Intimacy" },
  { id: 4, text: "How do you feel about shared finances?", category: "Finance" },
  { id: 5, text: "How important is alone time?", category: "Independence" },
  { id: 6, text: "How do you express love?", category: "Love Language" },
  { id: 7, text: "How important is career vs. family?", category: "Life Goals" },
  { id: 8, text: "How do you handle stress?", category: "Coping" },
];

const OPTIONS = [
  { value: 1, label: "Not Important" },
  { value: 2, label: "Somewhat" },
  { value: 3, label: "Important" },
  { value: 4, label: "Very Important" },
  { value: 5, label: "Essential" },
];

interface ExistingResult {
  id: string;
  answers: Record<string, number>;
  scores: Record<string, number>;
  created_at: string;
}

export default function CompatibilityScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [existingResult, setExistingResult] = useState<ExistingResult | null>(null);
  const [partnerResult, setPartnerResult] = useState<ExistingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id || !profile?.id) return;

    try {
      const { data: myResult } = await supabase
        .from("compatibility_results")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .eq("user_id", profile.id)
        .single();

      if (myResult) {
        setExistingResult(myResult);
        setIsComplete(true);
      }

      const { data: partnerData } = await supabase
        .from("compatibility_results")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .neq("user_id", profile.id)
        .single();

      if (partnerData) {
        setPartnerResult(partnerData);
      }
    } catch (error) {
      console.log("No existing results");
    } finally {
      setIsLoading(false);
    }
  }, [profile?.couple_id, profile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleAnswer = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers({ ...answers, [QUESTIONS[currentQuestion].id]: value });

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleComplete({ ...answers, [QUESTIONS[currentQuestion].id]: value });
    }
  };

  const handleComplete = async (finalAnswers: Record<number, number>) => {
    if (!profile?.couple_id) return;

    setIsSaving(true);
    try {
      const categoryScores: Record<string, number> = {};
      QUESTIONS.forEach((q) => {
        const answer = finalAnswers[q.id] || 0;
        categoryScores[q.category] = answer;
      });

      const { error } = await supabase.from("compatibility_results").insert({
        couple_id: profile.couple_id,
        user_id: profile.id,
        answers: finalAnswers,
        scores: categoryScores,
        summary: "Compatibility assessment completed",
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadData();
    } catch (error) {
      console.error("Error saving compatibility:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    setExistingResult(null);
    setIsComplete(false);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const calculateCompatibility = () => {
    if (!existingResult?.scores || !partnerResult?.scores) return null;

    let totalDiff = 0;
    let count = 0;

    Object.keys(existingResult.scores).forEach((key) => {
      if (partnerResult.scores[key]) {
        totalDiff += Math.abs(existingResult.scores[key] - partnerResult.scores[key]);
        count++;
      }
    });

    if (count === 0) return null;
    const avgDiff = totalDiff / count;
    return Math.round((1 - avgDiff / 4) * 100);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlowBackground />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </View>
    );
  }

  if (isComplete && existingResult) {
    const compatibility = calculateCompatibility();

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlowBackground />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        >
          <CategoryHeroCard
            title="Compatibility Results"
            subtitle="Your relationship alignment"
            gradientColors={["rgba(232, 165, 156, 0.4)", "rgba(100, 60, 60, 0.5)", "rgba(13, 13, 15, 0.95)"]}
          />

          {partnerResult ? (
            <View style={styles.compatibilityCard}>
              <ThemedText style={styles.compatibilityScore}>{compatibility}%</ThemedText>
              <ThemedText style={styles.compatibilityLabel}>Compatibility Score</ThemedText>
            </View>
          ) : (
            <View style={styles.waitingCard}>
              <Feather name="clock" size={32} color={GlowColors.gold} />
              <ThemedText style={styles.waitingText}>Waiting for Partner</ThemedText>
              <ThemedText style={styles.waitingSubtext}>
                Your partner hasn't completed the assessment yet
              </ThemedText>
            </View>
          )}

          <ThemedText style={styles.sectionTitle}>Your Answers</ThemedText>
          <View style={styles.resultsList}>
            {QUESTIONS.map((q) => (
              <View key={q.id} style={styles.resultItem}>
                <ThemedText style={styles.resultCategory}>{q.category}</ThemedText>
                <View style={styles.resultScores}>
                  <View style={styles.scoreItem}>
                    <ThemedText style={styles.scoreLabel}>You</ThemedText>
                    <ThemedText style={styles.scoreValue}>{existingResult.scores[q.category]}/5</ThemedText>
                  </View>
                  {partnerResult ? (
                    <View style={styles.scoreItem}>
                      <ThemedText style={styles.scoreLabel}>Partner</ThemedText>
                      <ThemedText style={styles.scoreValue}>{partnerResult.scores[q.category]}/5</ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.retakeButton} onPress={handleRetake}>
            <ThemedText style={styles.retakeButtonText}>Retake Assessment</ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` },
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {currentQuestion + 1} of {QUESTIONS.length}
          </ThemedText>
        </View>

        <ThemedText style={styles.category}>{question.category}</ThemedText>
        <ThemedText style={styles.question}>{question.text}</ThemedText>

        <View style={styles.optionsContainer}>
          {OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.optionButton,
                answers[question.id] === option.value && styles.optionSelected,
              ]}
              onPress={() => handleAnswer(option.value)}
              disabled={isSaving}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  answers[question.id] === option.value && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlowColors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: GlowColors.textSecondary,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: GlowColors.gold,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: GlowColors.textSecondary,
    textAlign: "center",
  },
  category: {
    fontSize: 14,
    color: GlowColors.gold,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  question: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionButton: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    borderColor: GlowColors.gold,
    backgroundColor: GlowColors.cardBrown,
  },
  optionText: {
    fontSize: 16,
    color: GlowColors.textPrimary,
    textAlign: "center",
  },
  optionTextSelected: {
    fontFamily: "Nunito_700Bold",
  },
  compatibilityCard: {
    backgroundColor: GlowColors.cardGreen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  compatibilityScore: {
    fontSize: 56,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  compatibilityLabel: {
    fontSize: 16,
    color: GlowColors.textSecondary,
    marginTop: Spacing.sm,
  },
  waitingCard: {
    backgroundColor: GlowColors.cardBrown,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  waitingText: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginTop: Spacing.md,
  },
  waitingSubtext: {
    fontSize: 14,
    color: GlowColors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.md,
  },
  resultsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  resultItem: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  resultCategory: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: GlowColors.gold,
    marginBottom: Spacing.sm,
  },
  resultScores: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 12,
    color: GlowColors.textSecondary,
  },
  scoreValue: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
  },
  retakeButton: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: GlowColors.gold,
  },
  retakeButtonText: {
    fontSize: 16,
    color: GlowColors.gold,
    fontFamily: "Nunito_600SemiBold",
  },
});
