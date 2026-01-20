import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const STEPS = [
  {
    id: "issue",
    title: "Define the Issue",
    subtitle: "What is the conflict about?",
    prompt: "Describe the issue clearly and objectively. Focus on the specific behavior or situation, not the person.",
    placeholder: "The issue is...",
  },
  {
    id: "feelings",
    title: "Express Feelings",
    subtitle: "How does this make you feel?",
    prompt: "Use 'I' statements to express your emotions. Avoid blame or accusations.",
    placeholder: "I feel... when...",
  },
  {
    id: "needs",
    title: "Identify Needs",
    subtitle: "What do you need?",
    prompt: "What underlying needs are not being met? What would help you feel better?",
    placeholder: "I need...",
  },
  {
    id: "requests",
    title: "Make Requests",
    subtitle: "What are you asking for?",
    prompt: "Be specific about what you'd like your partner to do differently.",
    placeholder: "I would like you to...",
  },
  {
    id: "agreement",
    title: "Find Agreement",
    subtitle: "What can you both commit to?",
    prompt: "Summarize what you've agreed on and the next steps.",
    placeholder: "We agree to...",
  },
];

export default function ConflictResolutionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const canProceed = responses[step.id]?.trim().length > 0;

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isLastStep) {
      await handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!profile?.couple_id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("Couples_tool_entries").insert({
        couple_id: profile.couple_id,
        user_id: profile.id,
        tool_name: "ConflictResolution",
        metadata: {
          steps: responses,
          completed_at: new Date().toISOString(),
        },
      });

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsComplete(true);
    } catch (error) {
      console.error("Error saving conflict resolution:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isComplete) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlowBackground />
        <View style={styles.completeContainer}>
          <View style={styles.completeIcon}>
            <Feather name="check-circle" size={64} color={GlowColors.accentGreen} />
          </View>
          <ThemedText style={styles.completeTitle}>Resolution Complete</ThemedText>
          <ThemedText style={styles.completeSubtitle}>
            You've worked through this conflict together. Remember to follow through on your agreements.
          </ThemedText>

          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryTitle}>Your Agreement</ThemedText>
            <ThemedText style={styles.summaryText}>{responses.agreement}</ThemedText>
          </View>

          <Pressable style={styles.doneButton} onPress={() => navigation.goBack()}>
            <ThemedText style={styles.doneButtonText}>Done</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressContainer}>
          {STEPS.map((_, index) => (
            <View
              key={index}
              style={[styles.progressDot, index <= currentStep && { backgroundColor: GlowColors.gold }]}
            />
          ))}
        </View>

        <ThemedText style={styles.stepNumber}>Step {currentStep + 1} of {STEPS.length}</ThemedText>
        <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
        <ThemedText style={styles.stepSubtitle}>{step.subtitle}</ThemedText>

        <View style={styles.promptCard}>
          <Feather name="info" size={16} color={GlowColors.gold} />
          <ThemedText style={styles.promptText}>{step.prompt}</ThemedText>
        </View>

        <TextInput
          style={styles.input}
          placeholder={step.placeholder}
          placeholderTextColor={GlowColors.textSecondary}
          value={responses[step.id] || ""}
          onChangeText={(text) => setResponses({ ...responses, [step.id]: text })}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <View style={styles.buttonRow}>
          {currentStep > 0 ? (
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Feather name="arrow-left" size={20} color={GlowColors.textPrimary} />
              <ThemedText style={styles.backButtonText}>Back</ThemedText>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            style={[styles.nextButton, !canProceed && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!canProceed || isSaving}
          >
            <ThemedText style={styles.nextButtonText}>
              {isSaving ? "Saving..." : isLastStep ? "Complete" : "Next"}
            </ThemedText>
            {!isLastStep ? <Feather name="arrow-right" size={20} color="#000" /> : null}
          </Pressable>
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
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  stepNumber: {
    fontSize: 14,
    color: GlowColors.gold,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: Spacing.xs,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: 16,
    color: GlowColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  promptCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: GlowColors.cardBrown,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  promptText: {
    flex: 1,
    fontSize: 14,
    color: GlowColors.textPrimary,
    lineHeight: 20,
  },
  input: {
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: GlowColors.textPrimary,
    fontSize: 16,
    minHeight: 150,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  backButtonText: {
    fontSize: 16,
    color: GlowColors.textPrimary,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  completeContainer: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  completeIcon: {
    marginBottom: Spacing.lg,
  },
  completeTitle: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  completeSubtitle: {
    fontSize: 16,
    color: GlowColors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    backgroundColor: GlowColors.cardGreen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: "100%",
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.gold,
    marginBottom: Spacing.sm,
  },
  summaryText: {
    fontSize: 16,
    color: GlowColors.textPrimary,
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: GlowColors.gold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#000",
  },
});
