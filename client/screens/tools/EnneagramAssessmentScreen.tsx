import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

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

interface EnneagramResultData {
  id: string;
  user_id: string;
  couple_id: string | null;
  primary_type: number;
  scores: Record<number, number>;
  answers: Record<number, number>;
  created_at: string;
}

const enneagramDetails: Record<number, {
  name: string;
  title: string;
  color: string;
  bgColor: string;
  description: string;
  coreMotivation: string;
  strengths: string[];
  growthAreas: string[];
  inRelationships: string[];
}> = {
  1: {
    name: "The Reformer",
    title: "Type 1",
    color: "#64748B",
    bgColor: "rgba(100, 116, 139, 0.1)",
    description: "Principled, purposeful, self-controlled, and perfectionistic. You have a strong sense of right and wrong and strive to improve yourself and the world around you.",
    coreMotivation: "To be good, to have integrity, to be balanced, to improve everything",
    strengths: [
      "High ethical standards and integrity",
      "Organized and detail-oriented",
      "Committed to improvement",
      "Reliable and responsible",
    ],
    growthAreas: [
      "Practice self-compassion and forgiveness",
      "Embrace imperfection as part of life",
      "Learn to relax and have fun",
      "Accept that there are many right ways",
    ],
    inRelationships: [
      "Values commitment and loyalty",
      "May have high expectations of partner",
      "Shows love through acts of service",
      "Appreciates partners who help them relax",
    ],
  },
  2: {
    name: "The Helper",
    title: "Type 2",
    color: "#EC4899",
    bgColor: "rgba(236, 72, 153, 0.1)",
    description: "Generous, demonstrative, people-pleasing, and possessive. You are deeply caring and want to be loved by making yourself indispensable to others.",
    coreMotivation: "To feel loved, to express feelings, to be needed and appreciated",
    strengths: [
      "Warm, caring, and generous",
      "Highly attuned to others' needs",
      "Supportive and encouraging",
      "Creates emotional connections easily",
    ],
    growthAreas: [
      "Learn to receive as well as give",
      "Set healthy boundaries",
      "Recognize and express your own needs",
      "Practice self-care without guilt",
    ],
    inRelationships: [
      "Deeply devoted and nurturing",
      "May struggle to ask for help",
      "Shows love through acts of service",
      "Needs appreciation and acknowledgment",
    ],
  },
  3: {
    name: "The Achiever",
    title: "Type 3",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
    description: "Adaptable, excelling, driven, and image-conscious. You are success-oriented and highly focused on achievement and being seen as valuable.",
    coreMotivation: "To feel valuable and worthwhile, to be admired, to distinguish yourself",
    strengths: [
      "Driven and goal-oriented",
      "Adaptable and efficient",
      "Inspiring and motivating",
      "Confident and optimistic",
    ],
    growthAreas: [
      "Connect with authentic feelings",
      "Value yourself beyond achievements",
      "Slow down and be present",
      "Be vulnerable with loved ones",
    ],
    inRelationships: [
      "Brings energy and enthusiasm",
      "May prioritize work over relationship",
      "Shows love through shared success",
      "Needs a partner who sees the real them",
    ],
  },
  4: {
    name: "The Individualist",
    title: "Type 4",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.1)",
    description: "Expressive, dramatic, self-absorbed, and temperamental. You are emotionally deep and seek to understand the meaning of life and your unique identity.",
    coreMotivation: "To express yourself, to be unique, to find meaning and significance",
    strengths: [
      "Creative and emotionally deep",
      "Authentic and self-aware",
      "Compassionate toward suffering",
      "Appreciates beauty and aesthetics",
    ],
    growthAreas: [
      "Focus on what you have, not what's missing",
      "Take practical action on dreams",
      "Balance emotions with grounding",
      "See the ordinary as meaningful",
    ],
    inRelationships: [
      "Brings depth and emotional intensity",
      "Craves deep, meaningful connection",
      "Shows love through understanding",
      "Needs a partner who accepts all emotions",
    ],
  },
  5: {
    name: "The Investigator",
    title: "Type 5",
    color: "#06B6D4",
    bgColor: "rgba(6, 182, 212, 0.1)",
    description: "Perceptive, innovative, secretive, and isolated. You are an independent thinker who values knowledge and understanding the world around you.",
    coreMotivation: "To possess knowledge, to understand the world, to be competent",
    strengths: [
      "Analytical and insightful",
      "Independent and self-sufficient",
      "Objective and calm under pressure",
      "Deeply knowledgeable in areas of interest",
    ],
    growthAreas: [
      "Share your inner world with others",
      "Engage more with the physical world",
      "Trust your instincts, not just analysis",
      "Practice emotional expression",
    ],
    inRelationships: [
      "Brings thoughtfulness and perspective",
      "Needs significant alone time",
      "Shows love through loyalty and insight",
      "Appreciates partners who respect boundaries",
    ],
  },
  6: {
    name: "The Loyalist",
    title: "Type 6",
    color: "#14B8A6",
    bgColor: "rgba(20, 184, 166, 0.1)",
    description: "Engaging, responsible, anxious, and suspicious. You are loyal and security-oriented, always thinking ahead to prepare for potential problems.",
    coreMotivation: "To have security and support, to feel safe and belong",
    strengths: [
      "Loyal and committed",
      "Responsible and hardworking",
      "Good at troubleshooting",
      "Values community and belonging",
    ],
    growthAreas: [
      "Trust your own inner guidance",
      "Take action despite uncertainty",
      "Challenge worst-case thinking",
      "Build confidence in your abilities",
    ],
    inRelationships: [
      "Deeply loyal and protective",
      "May seek reassurance frequently",
      "Shows love through dedication",
      "Needs consistency and reliability",
    ],
  },
  7: {
    name: "The Enthusiast",
    title: "Type 7",
    color: "#F97316",
    bgColor: "rgba(249, 115, 22, 0.1)",
    description: "Spontaneous, versatile, acquisitive, and scattered. You are optimistic and adventurous, always seeking new experiences and possibilities.",
    coreMotivation: "To be satisfied and content, to have options, to avoid pain",
    strengths: [
      "Optimistic and enthusiastic",
      "Creative and quick-thinking",
      "Adventurous and spontaneous",
      "Brings joy and energy to others",
    ],
    growthAreas: [
      "Stay present with uncomfortable feelings",
      "Complete projects before starting new ones",
      "Find depth in existing experiences",
      "Practice commitment and follow-through",
    ],
    inRelationships: [
      "Brings fun and adventure",
      "May avoid difficult conversations",
      "Shows love through shared experiences",
      "Needs freedom and variety",
    ],
  },
  8: {
    name: "The Challenger",
    title: "Type 8",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
    description: "Self-confident, decisive, willful, and confrontational. You are powerful and assertive, protecting yourself and those you care about.",
    coreMotivation: "To protect yourself, to be in control, to determine your own path",
    strengths: [
      "Strong and decisive",
      "Protective of loved ones",
      "Direct and honest",
      "Natural leader and advocate",
    ],
    growthAreas: [
      "Show vulnerability to trusted people",
      "Listen before reacting",
      "Soften intensity when appropriate",
      "Trust others with control sometimes",
    ],
    inRelationships: [
      "Fiercely loyal and protective",
      "May dominate conversations",
      "Shows love through protection",
      "Needs a partner who stands their ground",
    ],
  },
  9: {
    name: "The Peacemaker",
    title: "Type 9",
    color: "#22C55E",
    bgColor: "rgba(34, 197, 94, 0.1)",
    description: "Receptive, reassuring, complacent, and resigned. You seek harmony and peace, often putting others' needs before your own to avoid conflict.",
    coreMotivation: "To have peace of mind, to maintain stability and harmony",
    strengths: [
      "Calm and easy-going",
      "Accepting and supportive",
      "Mediates conflicts naturally",
      "Creates harmony and unity",
    ],
    growthAreas: [
      "Assert your own needs and preferences",
      "Engage with healthy conflict",
      "Take action on your own priorities",
      "Stay awake to your own desires",
    ],
    inRelationships: [
      "Creates peaceful, harmonious bond",
      "May avoid expressing needs",
      "Shows love through acceptance",
      "Needs encouragement to speak up",
    ],
  },
};

export default function EnneagramAssessmentScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const queryClient = useQueryClient();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingResult, setExistingResult] = useState<EnneagramResultData | null>(null);
  const [result, setResult] = useState<{
    type: number;
    scores: Record<number, number>;
  } | null>(null);

  useEffect(() => {
    const fetchExistingResult = async () => {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("enneagram_results")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setExistingResult(data as EnneagramResultData);
        }
      } catch (err) {
        console.error("Error fetching enneagram results:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingResult();
  }, [profile?.id]);

  const submitMutation = useMutation({
    mutationFn: async (data: { type: number; scores: Record<number, number>; answers: Record<number, number> }) => {
      if (!profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("enneagram_results").insert({
        user_id: profile.id,
        couple_id: profile.couple_id ?? null,
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
    setResult({ type: resultType, scores });
    setShowResults(true);
    submitMutation.mutate({
      type: resultType,
      scores,
      answers: finalAnswers,
    });
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  const renderResultsPage = (resultData: { type: number; scores: Record<number, number> }) => {
    const details = enneagramDetails[resultData.type];
    const maxScore = Math.max(...Object.values(resultData.scores));
    const topTypes = Object.entries(resultData.scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
      >
        <ThemedText type="h2" style={{ marginBottom: Spacing.md }}>Your Enneagram Type</ThemedText>

        <Card style={StyleSheet.flatten([styles.primaryCard, { borderLeftColor: details.color, borderLeftWidth: 4 }])}>
          <View style={styles.typeHeader}>
            <View style={[styles.iconContainer, { backgroundColor: details.bgColor }]}>
              <ThemedText type="h2" style={{ color: details.color }}>{resultData.type}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>{details.title}</ThemedText>
              <ThemedText type="h3" style={{ color: details.color }}>{details.name}</ThemedText>
            </View>
          </View>
          <ThemedText type="body" style={styles.description}>{details.description}</ThemedText>
          <View style={[styles.motivationBox, { backgroundColor: details.bgColor }]}>
            <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.xs }}>Core Motivation</ThemedText>
            <ThemedText type="body">{details.coreMotivation}</ThemedText>
          </View>
        </Card>

        <Card style={styles.scoresCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Top Types</ThemedText>
          {topTypes.map(([typeNum, score]) => {
            const typeDetails = enneagramDetails[parseInt(typeNum)];
            const percentage = maxScore > 0 ? (score / (QUESTIONS.length * 5)) * 100 : 0;
            return (
              <View key={typeNum} style={styles.scoreRow}>
                <View style={styles.scoreLabel}>
                  <View style={[styles.typeNumber, { backgroundColor: typeDetails.bgColor }]}>
                    <ThemedText type="small" style={{ color: typeDetails.color, fontWeight: "600" }}>{typeNum}</ThemedText>
                  </View>
                  <ThemedText type="small" style={{ marginLeft: Spacing.sm, flex: 1 }}>{typeDetails.name}</ThemedText>
                  <ThemedText type="small" style={{ fontWeight: "600" }}>{score}</ThemedText>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                  <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: typeDetails.color }]} />
                </View>
              </View>
            );
          })}
        </Card>

        <Card style={styles.strengthsCard}>
          <View style={styles.sectionHeader}>
            <Feather name="award" size={20} color={details.color} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>Key Strengths</ThemedText>
          </View>
          {details.strengths.map((item, index) => (
            <View key={index} style={styles.tipRow}>
              <Feather name="check" size={16} color={details.color} />
              <ThemedText type="body" style={styles.tipText}>{item}</ThemedText>
            </View>
          ))}
        </Card>

        <Card style={styles.growthCard}>
          <View style={styles.sectionHeader}>
            <Feather name="trending-up" size={20} color={theme.success} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>Growth Path</ThemedText>
          </View>
          {details.growthAreas.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Feather name="check-circle" size={16} color={theme.success} />
              <ThemedText type="body" style={styles.tipText}>{tip}</ThemedText>
            </View>
          ))}
        </Card>

        <Card style={styles.relationshipCard}>
          <View style={styles.sectionHeader}>
            <Feather name="heart" size={20} color={theme.link} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>In Relationships</ThemedText>
          </View>
          {details.inRelationships.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Feather name="star" size={16} color={theme.warning} />
              <ThemedText type="body" style={styles.tipText}>{tip}</ThemedText>
            </View>
          ))}
        </Card>

        <Button onPress={resetQuiz} style={{ marginTop: Spacing.lg }}>
          Retake Assessment
        </Button>
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  if (showResults && result) {
    return renderResultsPage(result);
  }

  if (existingResult && !quizStarted) {
    const defaultScores: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) defaultScores[i] = 0;
    return renderResultsPage({
      type: existingResult.primary_type,
      scores: existingResult.scores || defaultScores,
    });
  }

  if (!quizStarted) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <ThemedText type="h2">Enneagram Assessment</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
          Discover your personality type
        </ThemedText>

        <Card>
          <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
            The Enneagram is a powerful personality system that describes nine
            distinct types. Understanding your type helps you recognize patterns
            in how you think, feel, and behave in relationships.
          </ThemedText>

          <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
            Answer honestly based on how you usually are, not how you wish to be.
          </ThemedText>

          <Button onPress={() => setQuizStarted(true)}>Start Assessment</Button>
        </Card>
      </ScrollView>
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
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.link, width: `${progress}%` }]} />
        </View>

        <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </ThemedText>

        <Card style={{ marginTop: Spacing.md }}>
          <ThemedText type="h4" style={{ textAlign: "center", marginBottom: Spacing.xl }}>
            {question.text}
          </ThemedText>

          <View style={{ gap: Spacing.md }}>
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
                  {
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => handleAnswer(option.value)}
              >
                <ThemedText type="body" style={{ textAlign: "center" }}>
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
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
  optionButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  primaryCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  typeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  description: {
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  motivationBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  scoresCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  scoreRow: {
    marginBottom: Spacing.md,
  },
  scoreLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  typeNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  strengthsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  growthCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  relationshipCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  tipText: {
    flex: 1,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
});
