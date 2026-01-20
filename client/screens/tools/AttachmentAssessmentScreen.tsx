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

interface AttachmentResultData {
  id: string;
  user_id: string;
  couple_id: string | null;
  attachment_style: AttachmentStyle;
  scores: Record<string, number>;
  answers: Record<number, number>;
  created_at: string;
}

const attachmentDetails: Record<AttachmentStyle, {
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  characteristics: string[];
  howToGrow: string[];
  partnerTips: string[];
}> = {
  secure: {
    title: "Secure Attachment",
    icon: "shield",
    color: "#22C55E",
    bgColor: "rgba(34, 197, 94, 0.1)",
    description: "You feel comfortable with intimacy and independence. You can trust your partner and be trusted in return. You communicate openly and are generally satisfied in relationships.",
    characteristics: [
      "Comfortable with closeness and independence",
      "Trusting and trustworthy in relationships",
      "Able to communicate needs effectively",
      "Recover quickly from conflicts",
    ],
    howToGrow: [
      "Continue nurturing open communication",
      "Share vulnerabilities with confidence",
      "Be a safe haven for your partner",
      "Model healthy relationship behaviors",
      "Support partners with different attachment styles",
    ],
    partnerTips: [
      "Be consistent and reliable in your actions",
      "Express appreciation regularly",
      "Create space for both togetherness and independence",
      "Engage in deep conversations about feelings",
    ],
  },
  anxious: {
    title: "Anxious Attachment",
    icon: "heart",
    color: "#F97316",
    bgColor: "rgba(249, 115, 22, 0.1)",
    description: "You crave closeness and worry about your partner's availability. You may need more reassurance in relationships and can be highly attuned to changes in your partner's mood or behavior.",
    characteristics: [
      "Strong desire for closeness and intimacy",
      "Highly sensitive to partner's emotions",
      "May worry about relationship security",
      "Values reassurance and affirmation",
    ],
    howToGrow: [
      "Practice self-soothing techniques",
      "Communicate needs directly without testing",
      "Build trust through consistent actions",
      "Develop individual interests and identity",
      "Challenge anxious thoughts with evidence",
    ],
    partnerTips: [
      "Provide consistent reassurance and affection",
      "Be reliable and follow through on promises",
      "Don't dismiss their need for connection",
      "Create predictable routines together",
    ],
  },
  avoidant: {
    title: "Avoidant Attachment",
    icon: "shield-off",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.1)",
    description: "You value independence and may struggle with emotional closeness. You might pull away when things get too intimate, preferring self-reliance over depending on others.",
    characteristics: [
      "Values independence and self-sufficiency",
      "May feel uncomfortable with intense emotions",
      "Tends to minimize relationship importance",
      "Needs space to process feelings",
    ],
    howToGrow: [
      "Practice gradual vulnerability with safe people",
      "Recognize your partner's need for closeness",
      "Challenge discomfort with intimacy",
      "Stay present during emotional conversations",
      "Express appreciation verbally more often",
    ],
    partnerTips: [
      "Give them space without withdrawing love",
      "Be patient with emotional expression",
      "Avoid pressuring for immediate responses",
      "Appreciate their actions as expressions of love",
    ],
  },
  fearful: {
    title: "Fearful-Avoidant Attachment",
    icon: "alert-triangle",
    color: "#A855F7",
    bgColor: "rgba(168, 85, 247, 0.1)",
    description: "You want closeness but fear it at the same time. Past experiences may make trusting difficult, creating a push-pull dynamic in relationships.",
    characteristics: [
      "Desires intimacy but fears rejection",
      "May have conflicting relationship behaviors",
      "Sensitive to signs of abandonment",
      "Struggles with emotional regulation",
    ],
    howToGrow: [
      "Work on healing past wounds with support",
      "Take small steps toward trust building",
      "Consider professional therapeutic support",
      "Practice recognizing safety in relationships",
      "Develop secure relationships gradually",
    ],
    partnerTips: [
      "Be patient and consistent in your love",
      "Don't take their withdrawal personally",
      "Create a safe space for vulnerability",
      "Celebrate small steps toward intimacy",
    ],
  },
};

export default function AttachmentAssessmentScreen() {
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
  const [existingResult, setExistingResult] = useState<AttachmentResultData | null>(null);
  const [result, setResult] = useState<{
    style: AttachmentStyle;
    scores: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    const fetchExistingResult = async () => {
      if (!profile?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("attachment_results")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setExistingResult(data as AttachmentResultData);
        }
      } catch (err) {
        console.error("Error fetching attachment results:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingResult();
  }, [profile?.id]);

  const submitMutation = useMutation({
    mutationFn: async (data: { style: AttachmentStyle; scores: Record<string, number>; answers: Record<number, number> }) => {
      if (!profile) throw new Error("Not authenticated");
      const { error } = await supabase.from("attachment_results").insert({
        user_id: profile.id,
        couple_id: profile.couple_id ?? null,
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

    setResult({ style: maxCategory, scores });
    setShowResults(true);
    submitMutation.mutate({
      style: maxCategory,
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

  const renderResultsPage = (resultData: { style: AttachmentStyle; scores: Record<string, number> }) => {
    const details = attachmentDetails[resultData.style];
    const maxScore = Math.max(...Object.values(resultData.scores));

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
        <ThemedText type="h2" style={{ marginBottom: Spacing.md }}>Your Attachment Style</ThemedText>

        <Card style={StyleSheet.flatten([styles.primaryCard, { borderLeftColor: details.color, borderLeftWidth: 4 }])}>
          <View style={styles.languageHeader}>
            <View style={[styles.iconContainer, { backgroundColor: details.bgColor }]}>
              <Feather name={details.icon as any} size={24} color={details.color} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="h3" style={{ color: details.color }}>{details.title}</ThemedText>
            </View>
          </View>
          <ThemedText type="body" style={styles.description}>{details.description}</ThemedText>
        </Card>

        <Card style={styles.scoresCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>Score Breakdown</ThemedText>
          {Object.entries(resultData.scores)
            .sort((a, b) => b[1] - a[1])
            .map(([style, score]) => {
              const styleDetails = attachmentDetails[style as AttachmentStyle];
              const percentage = maxScore > 0 ? (score / (QUESTIONS.length * 5)) * 100 : 0;
              return (
                <View key={style} style={styles.scoreRow}>
                  <View style={styles.scoreLabel}>
                    <Feather name={styleDetails.icon as any} size={16} color={styleDetails.color} />
                    <ThemedText type="small" style={{ marginLeft: Spacing.sm, flex: 1 }}>{styleDetails.title}</ThemedText>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>{score}</ThemedText>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                    <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: styleDetails.color }]} />
                  </View>
                </View>
              );
            })}
        </Card>

        <Card style={styles.characteristicsCard}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={20} color={details.color} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>Key Characteristics</ThemedText>
          </View>
          {details.characteristics.map((item, index) => (
            <View key={index} style={styles.tipRow}>
              <Feather name="check" size={16} color={details.color} />
              <ThemedText type="body" style={styles.tipText}>{item}</ThemedText>
            </View>
          ))}
        </Card>

        <Card style={styles.tipsCard}>
          <View style={styles.sectionHeader}>
            <Feather name="trending-up" size={20} color={theme.success} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>Growth Path</ThemedText>
          </View>
          {details.howToGrow.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Feather name="check-circle" size={16} color={theme.success} />
              <ThemedText type="body" style={styles.tipText}>{tip}</ThemedText>
            </View>
          ))}
        </Card>

        <Card style={styles.partnerCard}>
          <View style={styles.sectionHeader}>
            <Feather name="heart" size={20} color={theme.link} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>Tips for Your Partner</ThemedText>
          </View>
          {details.partnerTips.map((tip, index) => (
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
    return renderResultsPage({
      style: existingResult.attachment_style,
      scores: existingResult.scores || { secure: 0, anxious: 0, avoidant: 0, fearful: 0 },
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
        <ThemedText type="h2">Attachment Assessment</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
          Discover your attachment style
        </ThemedText>

        <Card>
          <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
            This assessment helps you understand how you connect in relationships.
            Your attachment style influences how you bond, communicate, and respond
            to intimacy with your partner.
          </ThemedText>

          <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
            The four attachment styles are:
          </ThemedText>

          <View style={{ marginBottom: Spacing.lg }}>
            {Object.entries(attachmentDetails).map(([key, details]) => (
              <View key={key} style={styles.stylePreview}>
                <Feather name={details.icon as any} size={16} color={details.color} />
                <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>{details.title}</ThemedText>
              </View>
            ))}
          </View>

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
  characteristicsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  tipsCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  partnerCard: {
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
  stylePreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
});
