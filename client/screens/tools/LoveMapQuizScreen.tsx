import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
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
import { LOVE_MAP_QUESTIONS } from "@/constants/loveMapQuestions";
import { isFuzzyMatch, getFuzzyScore } from "@/lib/fuzzyMatch";

type Phase = "truths" | "guesses" | "results";

const QUESTIONS = LOVE_MAP_QUESTIONS;

interface TruthEntry {
  question_id: number;
  answer: string;
}

interface GuessEntry {
  question_id: number;
  guess: string;
}

interface ResultEntry {
  question_id: number;
  truth: string;
  guess: string;
  isMatch: boolean;
  score: number;
}

export default function LoveMapQuizScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [phase, setPhase] = useState<Phase>("truths");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [truths, setTruths] = useState<TruthEntry[]>([]);
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ResultEntry[] | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const handleSubmitTruth = () => {
    if (!answer.trim()) {
      Alert.alert("Required", "Please enter your answer");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newTruths = [...truths, { question_id: currentQuestion.id, answer: answer.trim() }];
    setTruths(newTruths);
    setAnswer("");

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert(
        "Phase 1 Complete!",
        "Now guess what your partner would answer for each question.",
        [{ text: "Continue", onPress: () => {
          setPhase("guesses");
          setCurrentIndex(0);
        }}]
      );
    }
  };

  const handleSubmitGuess = async () => {
    if (!answer.trim()) {
      Alert.alert("Required", "Please enter your guess");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newGuesses = [...guesses, { question_id: currentQuestion.id, guess: answer.trim() }];
    setGuesses(newGuesses);
    setAnswer("");

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSubmitting(true);
      try {
        // Calculate results with fuzzy matching
        const resultEntries: ResultEntry[] = QUESTIONS.map((q) => {
          const truth = truths.find((t) => t.question_id === q.id);
          const guess = newGuesses.find((g) => g.question_id === q.id);
          const truthAnswer = truth?.answer || "";
          const guessAnswer = guess?.guess || "";
          const isMatch = isFuzzyMatch(truthAnswer, guessAnswer);
          const score = getFuzzyScore(truthAnswer, guessAnswer);
          return {
            question_id: q.id,
            truth: truthAnswer,
            guess: guessAnswer,
            isMatch,
            score,
          };
        });

        const matchCount = resultEntries.filter((r) => r.isMatch).length;
        const overallScore = Math.round((matchCount / QUESTIONS.length) * 100);
        setMatchScore(overallScore);

        if (profile?.couple_id) {
          await supabase.from("Couples_love_map_results").insert({
            user_id: profile.id,
            couple_id: profile.couple_id,
            truths: truths,
            guesses: newGuesses,
            results: resultEntries,
            match_count: matchCount,
            total_questions: QUESTIONS.length,
            score_percentage: overallScore,
          });
        }
        setResults(resultEntries);
        setPhase("results");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error saving results:", error);
        Alert.alert("Error", "Failed to save results. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (phase === "results" && results) {
    const matchCount = results.filter((r) => r.isMatch).length;
    
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <View style={styles.resultHeader}>
            <View style={[styles.resultIcon, { backgroundColor: matchScore >= 70 ? theme.success : matchScore >= 40 ? theme.warning : theme.error }]}>
              <Feather name="heart" size={32} color="#fff" />
            </View>
            <ThemedText type="h2" style={styles.resultTitle}>
              {matchScore}% Match
            </ThemedText>
            <ThemedText type="body" style={[styles.resultSubtitle, { color: theme.textSecondary }]}>
              {matchCount} of {QUESTIONS.length} correct guesses
            </ThemedText>
            <ThemedText type="small" style={[styles.resultHint, { color: theme.textSecondary }]}>
              {matchScore >= 70
                ? "You know your partner well!"
                : matchScore >= 40
                ? "Good effort! Keep learning about each other."
                : "Keep exploring together!"}
            </ThemedText>
          </View>

          <ThemedText type="h4" style={styles.sectionTitle}>
            Your Answers & Guesses
          </ThemedText>

          {QUESTIONS.map((question) => {
            const result = results.find((r) => r.question_id === question.id);
            if (!result) return null;

            return (
              <Card key={question.id} style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <ThemedText type="h4" style={styles.questionTitle}>
                    {question.text}
                  </ThemedText>
                  <View style={[styles.matchBadge, { backgroundColor: result.isMatch ? theme.success + "20" : theme.error + "20" }]}>
                    <Feather
                      name={result.isMatch ? "check" : "x"}
                      size={14}
                      color={result.isMatch ? theme.success : theme.error}
                    />
                  </View>
                </View>
                
                <View style={styles.answerRow}>
                  <View style={[styles.answerBadge, { backgroundColor: theme.success + "20" }]}>
                    <ThemedText type="small" style={{ color: theme.success }}>
                      Your Truth
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={styles.answerText}>
                    {result.truth || "—"}
                  </ThemedText>
                </View>

                <View style={styles.answerRow}>
                  <View style={[styles.answerBadge, { backgroundColor: result.isMatch ? theme.link + "20" : theme.error + "20" }]}>
                    <ThemedText type="small" style={{ color: result.isMatch ? theme.link : theme.error }}>
                      Your Guess
                    </ThemedText>
                  </View>
                  <ThemedText type="body" style={styles.answerText}>
                    {result.guess || "—"}
                  </ThemedText>
                </View>

                <ThemedText type="small" style={[styles.matchScoreText, { color: theme.textSecondary }]}>
                  Similarity: {Math.round(result.score * 100)}%
                </ThemedText>
              </Card>
            );
          })}

          <Card style={styles.tipsCard}>
            <ThemedText type="h4" style={styles.tipsTitle}>
              What's Next?
            </ThemedText>
            <View style={styles.tipRow}>
              <Feather name="users" size={16} color={theme.success} />
              <ThemedText type="body" style={styles.tipText}>
                Share this quiz with your partner
              </ThemedText>
            </View>
            <View style={styles.tipRow}>
              <Feather name="message-circle" size={16} color={theme.success} />
              <ThemedText type="body" style={styles.tipText}>
                Compare answers together
              </ThemedText>
            </View>
            <View style={styles.tipRow}>
              <Feather name="refresh-cw" size={16} color={theme.success} />
              <ThemedText type="body" style={styles.tipText}>
                Take the quiz again in a few months
              </ThemedText>
            </View>
          </Card>

          <Button onPress={() => navigation.goBack()} style={styles.doneButton}>
            Done
          </Button>
        </ScrollView>
      </ThemedView>
    );
  }

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
        <ThemedText type="small" style={[styles.subtitle, { color: theme.textSecondary }]}>
          How well do you know your partner? (Gottman Method)
        </ThemedText>

        <View style={[styles.phaseBadge, { backgroundColor: phase === "truths" ? theme.success + "20" : theme.link + "20" }]}>
          <ThemedText type="body" style={{ color: phase === "truths" ? theme.success : theme.link, fontWeight: "600" }}>
            Phase {phase === "truths" ? "1" : "2"}: {phase === "truths" ? "Your Truths" : "Guess Your Partner"}
          </ThemedText>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.link, width: `${progress}%` },
              ]}
            />
          </View>
          <ThemedText type="small" style={[styles.progressText, { color: theme.textSecondary }]}>
            Question {currentIndex + 1} of {QUESTIONS.length}
          </ThemedText>
        </View>

        <Card style={styles.questionCard}>
          <ThemedText type="h4" style={styles.questionText}>
            {currentQuestion.text}
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
            value={answer}
            onChangeText={setAnswer}
            placeholder={phase === "truths" ? "Your answer..." : "What would they say?"}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Button
            onPress={phase === "truths" ? handleSubmitTruth : handleSubmitGuess}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              phase === "truths" ? "Submit Answer" : "Submit Guess"
            )}
          </Button>
        </Card>

        {phase === "truths" ? (
          <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
            Answer honestly about yourself. Your partner will try to guess your answers later.
          </ThemedText>
        ) : (
          <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
            Think about what your partner would say. This helps you understand their perspective.
          </ThemedText>
        )}
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
    marginBottom: Spacing.lg,
  },
  phaseBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
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
    textAlign: "center",
  },
  questionCard: {
    marginBottom: Spacing.lg,
  },
  questionText: {
    marginBottom: Spacing.xl,
    lineHeight: 26,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 120,
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  hint: {
    textAlign: "center",
    lineHeight: 20,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    marginBottom: Spacing.xs,
  },
  resultSubtitle: {
    textAlign: "center",
  },
  resultHint: {
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  resultCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  matchBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  matchScoreText: {
    marginTop: Spacing.sm,
    textAlign: "right",
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  resultCard: {
    marginBottom: Spacing.md,
  },
  questionTitle: {
    flex: 1,
    lineHeight: 24,
  },
  answerRow: {
    marginBottom: Spacing.sm,
  },
  answerBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  answerText: {
    lineHeight: 22,
  },
  tipsCard: {
    marginTop: Spacing.lg,
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
    marginBottom: Spacing.lg,
  },
});
