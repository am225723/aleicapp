import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { LoveLanguageResult } from "@/types";
import { apiRequest } from "@/lib/query-client";

type LoveLanguageType =
  | "Words of Affirmation"
  | "Quality Time"
  | "Receiving Gifts"
  | "Acts of Service"
  | "Physical Touch";

const quizQuestions = [
  {
    id: 1,
    optionA: { text: "I like to receive notes of affirmation from you", language: "Words of Affirmation" },
    optionB: { text: "I like it when you hug me", language: "Physical Touch" },
  },
  {
    id: 2,
    optionA: { text: "I like to spend one-on-one time with you", language: "Quality Time" },
    optionB: { text: "I feel loved when you give me practical help", language: "Acts of Service" },
  },
  {
    id: 3,
    optionA: { text: "I like it when you give me gifts", language: "Receiving Gifts" },
    optionB: { text: "I like taking long walks with you", language: "Quality Time" },
  },
  {
    id: 4,
    optionA: { text: "I feel loved when you do things to help me", language: "Acts of Service" },
    optionB: { text: "I feel loved when you hug or touch me", language: "Physical Touch" },
  },
  {
    id: 5,
    optionA: { text: "I feel loved when you give me a gift", language: "Receiving Gifts" },
    optionB: { text: "I like hearing you tell me that you appreciate me", language: "Words of Affirmation" },
  },
  {
    id: 6,
    optionA: { text: "I like being with you and doing things together", language: "Quality Time" },
    optionB: { text: "I like it when you compliment me", language: "Words of Affirmation" },
  },
  {
    id: 7,
    optionA: { text: "I feel loved when you give me something thoughtful", language: "Receiving Gifts" },
    optionB: { text: "I appreciate when you help me with my responsibilities", language: "Acts of Service" },
  },
  {
    id: 8,
    optionA: { text: "I feel loved when you put your arm around me", language: "Physical Touch" },
    optionB: { text: "I feel special when you tell me how much I mean to you", language: "Words of Affirmation" },
  },
  {
    id: 9,
    optionA: { text: "I value your help with my tasks", language: "Acts of Service" },
    optionB: { text: "I value receiving special gifts from you", language: "Receiving Gifts" },
  },
  {
    id: 10,
    optionA: { text: "I love spending uninterrupted time with you", language: "Quality Time" },
    optionB: { text: "I love it when you hold my hand", language: "Physical Touch" },
  },
  {
    id: 11,
    optionA: { text: "Your words of encouragement mean a lot to me", language: "Words of Affirmation" },
    optionB: { text: "I appreciate when you do my chores for me", language: "Acts of Service" },
  },
  {
    id: 12,
    optionA: { text: "I cherish small gifts you give me", language: "Receiving Gifts" },
    optionB: { text: "I like when we spend quality time together", language: "Quality Time" },
  },
  {
    id: 13,
    optionA: { text: "I feel loved when you tell me you believe in me", language: "Words of Affirmation" },
    optionB: { text: "I feel loved when you hold me close", language: "Physical Touch" },
  },
  {
    id: 14,
    optionA: { text: "I love getting unexpected gifts from you", language: "Receiving Gifts" },
    optionB: { text: "I love it when we sit and talk for hours", language: "Quality Time" },
  },
  {
    id: 15,
    optionA: { text: "I feel appreciated when you help me without being asked", language: "Acts of Service" },
    optionB: { text: "I feel appreciated when you kiss me", language: "Physical Touch" },
  },
  {
    id: 16,
    optionA: { text: "I like receiving your thoughtful presents", language: "Receiving Gifts" },
    optionB: { text: "I like hearing you say 'I love you'", language: "Words of Affirmation" },
  },
  {
    id: 17,
    optionA: { text: "I enjoy full attention during our conversations", language: "Quality Time" },
    optionB: { text: "I enjoy it when you take care of tasks for me", language: "Acts of Service" },
  },
  {
    id: 18,
    optionA: { text: "I feel special when you touch me affectionately", language: "Physical Touch" },
    optionB: { text: "I feel special when you surprise me with a gift", language: "Receiving Gifts" },
  },
  {
    id: 19,
    optionA: { text: "I like hearing compliments from you", language: "Words of Affirmation" },
    optionB: { text: "I like having your undivided attention", language: "Quality Time" },
  },
  {
    id: 20,
    optionA: { text: "I appreciate when you fix things around the house", language: "Acts of Service" },
    optionB: { text: "I appreciate when you massage my shoulders", language: "Physical Touch" },
  },
  {
    id: 21,
    optionA: { text: "Thoughtful gifts make me feel loved", language: "Receiving Gifts" },
    optionB: { text: "Kind words make me feel loved", language: "Words of Affirmation" },
  },
  {
    id: 22,
    optionA: { text: "I feel connected when we spend time together", language: "Quality Time" },
    optionB: { text: "I feel connected when you help me with projects", language: "Acts of Service" },
  },
  {
    id: 23,
    optionA: { text: "I love when you cuddle with me", language: "Physical Touch" },
    optionB: { text: "I love when you plan special dates for us", language: "Quality Time" },
  },
  {
    id: 24,
    optionA: { text: "Receiving a gift on special occasions means everything", language: "Receiving Gifts" },
    optionB: { text: "Hearing 'thank you' from you means everything", language: "Words of Affirmation" },
  },
  {
    id: 25,
    optionA: { text: "I value your help with daily responsibilities", language: "Acts of Service" },
    optionB: { text: "I value physical closeness with you", language: "Physical Touch" },
  },
  {
    id: 26,
    optionA: { text: "Your words of praise lift me up", language: "Words of Affirmation" },
    optionB: { text: "Receiving presents from you lifts me up", language: "Receiving Gifts" },
  },
  {
    id: 27,
    optionA: { text: "I love our deep conversations together", language: "Quality Time" },
    optionB: { text: "I love when you help me tackle my to-do list", language: "Acts of Service" },
  },
  {
    id: 28,
    optionA: { text: "Holding hands makes me feel connected to you", language: "Physical Touch" },
    optionB: { text: "Doing activities together makes me feel connected to you", language: "Quality Time" },
  },
  {
    id: 29,
    optionA: { text: "I feel appreciated when you notice my efforts", language: "Words of Affirmation" },
    optionB: { text: "I feel appreciated when you pitch in with housework", language: "Acts of Service" },
  },
  {
    id: 30,
    optionA: { text: "Small tokens of love mean so much to me", language: "Receiving Gifts" },
    optionB: { text: "Physical affection means so much to me", language: "Physical Touch" },
  },
];

const loveLanguageDetails: Record<
  LoveLanguageType,
  {
    icon: string;
    color: string;
    bgColor: string;
    description: string;
    howToGive: string[];
    activities: string[];
  }
> = {
  "Words of Affirmation": {
    icon: "message-circle",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.1)",
    description:
      "Feels most loved through verbal compliments, words of appreciation, and encouragement. Hearing 'I love you' and receiving genuine praise makes them feel valued and connected.",
    howToGive: [
      "Write love notes and leave them in unexpected places",
      "Send encouraging text messages throughout the day",
      "Verbally express appreciation for specific things they do",
      "Offer genuine compliments about their character",
      "Say 'I love you' regularly and meaningfully",
    ],
    activities: [
      "Write each other love letters to read aloud",
      "Create a jar of affirmations to read together weekly",
      "Share three things you appreciate about each other daily",
      "Write a heartfelt poem or song for each other",
    ],
  },
  "Quality Time": {
    icon: "clock",
    color: "#22C55E",
    bgColor: "rgba(34, 197, 94, 0.1)",
    description:
      "Feels most loved through undivided attention. Having meaningful conversations, sharing experiences together, and being fully present matters more than any gift or act of service.",
    howToGive: [
      "Put away phones and devices during time together",
      "Plan regular date nights with no distractions",
      "Engage in meaningful conversations about feelings and dreams",
      "Participate in activities you both enjoy together",
      "Make eye contact and actively listen when talking",
    ],
    activities: [
      "Take a weekly walk together without phones",
      "Cook a meal together from start to finish",
      "Start a hobby or class you can learn together",
      "Create a weekly 'us time' ritual",
    ],
  },
  "Receiving Gifts": {
    icon: "gift",
    color: "#A855F7",
    bgColor: "rgba(168, 85, 247, 0.1)",
    description:
      "Feels most loved through thoughtful gifts that show you were thinking of them. The gift itself matters less than the thought and effort behind it.",
    howToGive: [
      "Pick up small gifts when you think of them",
      "Remember special occasions and celebrate meaningfully",
      "Pay attention to things they mention wanting",
      "Give 'just because' gifts to show you were thinking of them",
      "Put thought into gift wrapping and presentation",
    ],
    activities: [
      "Create a 'thinking of you' gift box for each other",
      "Make handmade gifts or crafts for one another",
      "Start a tradition of monthly 'just because' surprises",
      "Plan a treasure hunt with meaningful small gifts",
    ],
  },
  "Acts of Service": {
    icon: "heart",
    color: "#F97316",
    bgColor: "rgba(249, 115, 22, 0.1)",
    description:
      "Feels most loved when their partner does helpful things for them. Actions speak louder than words - taking care of tasks and easing burdens shows true love and care.",
    howToGive: [
      "Take over a task they usually do without being asked",
      "Help with projects or responsibilities they're stressed about",
      "Make their morning routine easier",
      "Complete household chores before they need to ask",
      "Run errands or do tasks to ease their load",
    ],
    activities: [
      "Do a chore swap - each take over one of the other's tasks",
      "Plan a 'pamper day' where you handle all responsibilities",
      "Meal prep together for the entire week",
      "Organize or clean a shared space as a team",
    ],
  },
  "Physical Touch": {
    icon: "heart",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
    description:
      "Feels most loved through physical affection. Hugs, kisses, holding hands, and intimate touch create feelings of security and connection.",
    howToGive: [
      "Hold hands when walking or sitting together",
      "Give hugs and kisses regularly throughout the day",
      "Offer back rubs or massages",
      "Sit close together when relaxing",
      "Initiate physical affection throughout the day",
    ],
    activities: [
      "Give each other massages once a week",
      "Dance together in the living room",
      "Practice couples yoga or stretching routines",
      "Create a cuddling routine (morning, evening, or both)",
    ],
  },
};

const languageKeyMap: Record<LoveLanguageType, string> = {
  "Words of Affirmation": "words_of_affirmation",
  "Quality Time": "quality_time",
  "Receiving Gifts": "receiving_gifts",
  "Acts of Service": "acts_of_service",
  "Physical Touch": "physical_touch",
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
  const [answers, setAnswers] = useState<LoveLanguageType[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    scores: Record<LoveLanguageType, number>;
    primary: LoveLanguageType;
    secondary: LoveLanguageType;
  } | null>(null);

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
    },
  });

  const calculateScores = (selectedAnswers: LoveLanguageType[]) => {
    const scores: Record<LoveLanguageType, number> = {
      "Words of Affirmation": 0,
      "Quality Time": 0,
      "Receiving Gifts": 0,
      "Acts of Service": 0,
      "Physical Touch": 0,
    };

    selectedAnswers.forEach((answer) => {
      scores[answer]++;
    });

    const sortedLanguages = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [LoveLanguageType, number][];

    return {
      scores,
      primary: sortedLanguages[0][0],
      secondary: sortedLanguages[1][0],
    };
  };

  const handleAnswer = (language: LoveLanguageType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswers = [...answers, language];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const calculatedResults = calculateScores(newAnswers);
      setResults(calculatedResults);
      setShowResults(true);

      const apiData: Record<string, any> = {
        primary_language: calculatedResults.primary,
        secondary_language: calculatedResults.secondary,
      };
      Object.entries(calculatedResults.scores).forEach(([lang, score]) => {
        apiData[languageKeyMap[lang as LoveLanguageType]] = score;
      });
      saveResultMutation.mutate(apiData);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setResults(null);
  };

  const renderResultsPage = (resultData: { primary: LoveLanguageType; secondary: LoveLanguageType; scores: Record<LoveLanguageType, number> }) => {
    const primaryDetails = loveLanguageDetails[resultData.primary];
    const secondaryDetails = loveLanguageDetails[resultData.secondary];
    const maxScore = Math.max(...Object.values(resultData.scores));

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
      >
        <ThemedText type="h2" style={{ marginBottom: Spacing.md }}>Your Love Languages</ThemedText>

        <Card style={StyleSheet.flatten([styles.primaryCard, { borderLeftColor: primaryDetails.color, borderLeftWidth: 4 }])}>
          <View style={styles.languageHeader}>
            <View style={[styles.iconContainer, { backgroundColor: primaryDetails.bgColor }]}>
              <Feather name={primaryDetails.icon as any} size={24} color={primaryDetails.color} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Primary Love Language</ThemedText>
              <ThemedText type="h3" style={{ color: primaryDetails.color }}>{resultData.primary}</ThemedText>
            </View>
          </View>
          <ThemedText type="body" style={styles.description}>{primaryDetails.description}</ThemedText>
        </Card>

        <Card style={StyleSheet.flatten([styles.secondaryCard, { borderLeftColor: secondaryDetails.color, borderLeftWidth: 4 }])}>
          <View style={styles.languageHeader}>
            <View style={[styles.iconContainer, { backgroundColor: secondaryDetails.bgColor }]}>
              <Feather name={secondaryDetails.icon as any} size={20} color={secondaryDetails.color} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Secondary Love Language</ThemedText>
              <ThemedText type="h4" style={{ color: secondaryDetails.color }}>{resultData.secondary}</ThemedText>
            </View>
          </View>
        </Card>

        <Card style={styles.scoresCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Score Breakdown</ThemedText>
          {Object.entries(resultData.scores)
            .sort((a, b) => b[1] - a[1])
            .map(([lang, score]) => {
              const details = loveLanguageDetails[lang as LoveLanguageType];
              const percentage = maxScore > 0 ? (score / quizQuestions.length) * 100 : 0;
              return (
                <View key={lang} style={styles.scoreRow}>
                  <View style={styles.scoreLabel}>
                    <Feather name={details.icon as any} size={16} color={details.color} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.sm, flex: 1 }}>{lang}</ThemedText>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>{score}</ThemedText>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                    <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: details.color }]} />
                  </View>
                </View>
              );
            })}
        </Card>

        <Card style={styles.tipsCard}>
          <View style={styles.sectionHeader}>
            <Feather name="zap" size={20} color={primaryDetails.color} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>How Your Partner Can Show Love</ThemedText>
          </View>
          {primaryDetails.howToGive.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Feather name="check-circle" size={16} color={theme.success} />
              <ThemedText type="body" style={styles.tipText}>{tip}</ThemedText>
            </View>
          ))}
        </Card>

        <Card style={styles.activitiesCard}>
          <View style={styles.sectionHeader}>
            <Feather name="heart" size={20} color={primaryDetails.color} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>Activities to Try Together</ThemedText>
          </View>
          {primaryDetails.activities.map((activity, index) => (
            <View key={index} style={styles.tipRow}>
              <Feather name="star" size={16} color={theme.warning} />
              <ThemedText type="body" style={styles.tipText}>{activity}</ThemedText>
            </View>
          ))}
        </Card>

        <Button onPress={resetQuiz} style={{ marginTop: Spacing.lg }}>
          Retake Quiz
        </Button>
      </ScrollView>
    );
  };

  if (showResults && results) {
    return renderResultsPage(results);
  }

  if (existingResult && !quizStarted) {
    const existingScores: Record<LoveLanguageType, number> = {
      "Words of Affirmation": existingResult.words_of_affirmation || 0,
      "Quality Time": existingResult.quality_time || 0,
      "Receiving Gifts": existingResult.receiving_gifts || 0,
      "Acts of Service": existingResult.acts_of_service || 0,
      "Physical Touch": existingResult.physical_touch || 0,
    };

    return renderResultsPage({
      primary: existingResult.primary_language as LoveLanguageType,
      secondary: existingResult.secondary_language as LoveLanguageType,
      scores: existingScores,
    });
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
            languages. For each question, choose the option that feels more
            meaningful to you.
          </ThemedText>

          <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
            The five love languages are:
          </ThemedText>

          <View style={{ marginBottom: Spacing.lg }}>
            {Object.entries(loveLanguageDetails).map(([name, details]) => (
              <View key={name} style={styles.languagePreview}>
                <Feather name={details.icon as any} size={16} color={details.color} />
                <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>{name}</ThemedText>
              </View>
            ))}
          </View>

          <Button onPress={() => setQuizStarted(true)}>Start Quiz</Button>
        </Card>
      </ScrollView>
    );
  }

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

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
        Question {currentQuestion + 1} of {quizQuestions.length}
      </ThemedText>

      <Card style={{ marginTop: Spacing.md }}>
        <ThemedText type="h4" style={{ marginBottom: Spacing.xl, textAlign: "center" }}>
          Which feels more meaningful to you?
        </ThemedText>

        <View style={{ gap: Spacing.md }}>
          <Pressable
            style={[
              styles.optionButton,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={() => handleAnswer(question.optionA.language as LoveLanguageType)}
          >
            <ThemedText type="body" style={{ textAlign: "center" }}>
              {question.optionA.text}
            </ThemedText>
          </Pressable>

          <ThemedText type="small" style={{ textAlign: "center", color: theme.textSecondary }}>
            OR
          </ThemedText>

          <Pressable
            style={[
              styles.optionButton,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={() => handleAnswer(question.optionB.language as LoveLanguageType)}
          >
            <ThemedText type="body" style={{ textAlign: "center" }}>
              {question.optionB.text}
            </ThemedText>
          </Pressable>
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
  optionButton: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  primaryCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  secondaryCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  description: {
    lineHeight: 22,
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
  tipsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  activitiesCard: {
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
  languagePreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
});
