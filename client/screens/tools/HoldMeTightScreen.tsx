import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { addToolEntry } from "@/lib/storage";

const CONVERSATIONS = [
  {
    title: "Recognizing the Cycle",
    prompt:
      "When we get into conflict, I notice I tend to... (withdraw, attack, get defensive). I do this because underneath I feel...",
    tip: "Be honest about your patterns without blame.",
  },
  {
    title: "Finding the Raw Spots",
    prompt:
      "The deeper fear or hurt underneath my reactions is... I worry that you might think I'm... or that you don't...",
    tip: "Vulnerability opens the door to connection.",
  },
  {
    title: "Sharing Attachment Needs",
    prompt:
      "What I really need from you in those moments is... When I feel safe with you, I need to know that...",
    tip: "Express needs, not complaints.",
  },
  {
    title: "Creating Safety",
    prompt:
      "I want you to know that you can always count on me to... When you're hurting, I want to be the person who...",
    tip: "Reassure your partner of your commitment.",
  },
  {
    title: "Bonding Through Story",
    prompt:
      "A moment when I felt really close to you was... What that moment meant to me was...",
    tip: "Positive memories strengthen your bond.",
  },
];

export default function HoldMeTightScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [step, setStep] = useState<"intro" | "conversation" | "complete">("intro");
  const [conversationIndex, setConversationIndex] = useState(0);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("conversation");
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (conversationIndex < CONVERSATIONS.length - 1) {
      setConversationIndex((prev) => prev + 1);
    } else {
      setStep("complete");
    }
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await addToolEntry({
      coupleId: "couple-1",
      toolType: "holdme",
      payload: { completedConversations: conversationIndex + 1 },
    });

    navigation.goBack();
  };

  const conversation = CONVERSATIONS[conversationIndex];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      {step !== "intro" && step !== "complete" ? (
        <View style={styles.progress}>
          {CONVERSATIONS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index <= conversationIndex
                      ? Colors.light.success
                      : theme.border,
                },
              ]}
            />
          ))}
        </View>
      ) : null}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === "intro" ? (
          <View style={styles.introContent}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: Colors.light.success + "20" },
              ]}
            >
              <Feather name="heart" size={40} color={Colors.light.success} />
            </View>
            <ThemedText type="h2" style={styles.title}>
              Hold Me Tight
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.description, { color: theme.textSecondary }]}
            >
              Based on EFT (Emotionally Focused Therapy), this guided
              conversation helps you explore deeper feelings and strengthen your
              bond.
            </ThemedText>

            <Card elevation={1} style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Feather name="clock" size={18} color={theme.textSecondary} />
                <ThemedText type="body" style={styles.infoText}>
                  ~20-30 minutes
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Feather name="list" size={18} color={theme.textSecondary} />
                <ThemedText type="body" style={styles.infoText}>
                  5 guided conversations
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Feather name="shield" size={18} color={theme.textSecondary} />
                <ThemedText type="body" style={styles.infoText}>
                  Safe space for vulnerability
                </ThemedText>
              </View>
            </Card>
          </View>
        ) : step === "conversation" ? (
          <View style={styles.conversationContent}>
            <View
              style={[
                styles.stepBadge,
                { backgroundColor: Colors.light.success + "20" },
              ]}
            >
              <ThemedText type="small" style={{ color: Colors.light.success }}>
                Step {conversationIndex + 1} of {CONVERSATIONS.length}
              </ThemedText>
            </View>

            <ThemedText type="h3" style={styles.conversationTitle}>
              {conversation.title}
            </ThemedText>

            <Card elevation={2} style={styles.promptCard}>
              <ThemedText type="body" style={styles.promptText}>
                "{conversation.prompt}"
              </ThemedText>
            </Card>

            <View
              style={[
                styles.tipContainer,
                { backgroundColor: Colors.light.warning + "15" },
              ]}
            >
              <Feather name="info" size={16} color={Colors.light.warning} />
              <ThemedText
                type="small"
                style={[styles.tipText, { color: theme.textSecondary }]}
              >
                {conversation.tip}
              </ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.completeContent}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: Colors.light.success + "20" },
              ]}
            >
              <Feather name="check-circle" size={40} color={Colors.light.success} />
            </View>
            <ThemedText type="h2" style={styles.title}>
              Beautiful Work
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.description, { color: theme.textSecondary }]}
            >
              You've completed the Hold Me Tight conversation. These moments of
              vulnerability create lasting bonds. Remember to return to these
              conversations when you need to reconnect.
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step === "intro" ? (
          <Button onPress={handleStart}>Begin Conversation</Button>
        ) : step === "conversation" ? (
          <Button onPress={handleNext}>
            {conversationIndex < CONVERSATIONS.length - 1
              ? "We're Ready for Next"
              : "Complete"}
          </Button>
        ) : (
          <Button onPress={handleFinish}>Finish & Save</Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  introContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  conversationContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  completeContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  infoCard: {
    width: "100%",
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  infoText: {
    marginLeft: Spacing.md,
  },
  stepBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xl,
  },
  conversationTitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  promptCard: {
    width: "100%",
    padding: Spacing.xl,
  },
  promptText: {
    fontStyle: "italic",
    lineHeight: 26,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
    width: "100%",
  },
  tipText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
});
