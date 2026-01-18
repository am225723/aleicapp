import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
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

const PROMPTS = [
  "Something I've been feeling lately is...",
  "What I need from you right now is...",
  "I feel closest to you when...",
  "Something I've been hesitant to share is...",
  "I appreciate when you...",
  "I feel disconnected when...",
];

export default function EchoEmpathyScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [step, setStep] = useState<"intro" | "speaker" | "listener" | "complete">("intro");
  const [promptIndex, setPromptIndex] = useState(0);
  const [roundCount, setRoundCount] = useState(0);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("speaker");
  };

  const handleSpeakerDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep("listener");
  };

  const handleListenerDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRoundCount((prev) => prev + 1);

    if (promptIndex < PROMPTS.length - 1) {
      setPromptIndex((prev) => prev + 1);
      setStep("speaker");
    } else {
      setStep("complete");
    }
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await addToolEntry({
      coupleId: "couple-1",
      toolType: "echo",
      payload: { rounds: roundCount + 1, prompts: promptIndex + 1 },
    });

    navigation.goBack();
  };

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
      <View style={styles.progress}>
        {PROMPTS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  index <= promptIndex ? Colors.light.accent : theme.border,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {step === "intro" ? (
          <>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: Colors.light.accent + "20" },
              ]}
            >
              <Feather name="message-circle" size={40} color={Colors.light.accent} />
            </View>
            <ThemedText type="h2" style={styles.title}>
              Echo & Empathy
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.description, { color: theme.textSecondary }]}
            >
              Practice active listening by taking turns as speaker and listener.
              The speaker shares, and the listener reflects back what they heard.
            </ThemedText>

            <Card elevation={1} style={styles.instructionCard}>
              <View style={styles.instructionRow}>
                <View
                  style={[
                    styles.roleIcon,
                    { backgroundColor: Colors.light.link + "20" },
                  ]}
                >
                  <Feather name="mic" size={18} color={Colors.light.link} />
                </View>
                <View style={styles.instructionText}>
                  <ThemedText type="h4">Speaker</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Share your thoughts and feelings honestly
                  </ThemedText>
                </View>
              </View>

              <View style={styles.instructionDivider} />

              <View style={styles.instructionRow}>
                <View
                  style={[
                    styles.roleIcon,
                    { backgroundColor: Colors.light.success + "20" },
                  ]}
                >
                  <Feather name="headphones" size={18} color={Colors.light.success} />
                </View>
                <View style={styles.instructionText}>
                  <ThemedText type="h4">Listener</ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Reflect back what you heard without judgment
                  </ThemedText>
                </View>
              </View>
            </Card>
          </>
        ) : step === "speaker" ? (
          <>
            <View
              style={[
                styles.roleCircle,
                { backgroundColor: Colors.light.link + "20" },
              ]}
            >
              <Feather name="mic" size={32} color={Colors.light.link} />
            </View>
            <ThemedText type="h4" style={[styles.roleLabel, { color: Colors.light.link }]}>
              Speaker's Turn
            </ThemedText>
            <Card elevation={2} style={styles.promptCard}>
              <ThemedText type="h3" style={styles.promptText}>
                "{PROMPTS[promptIndex]}"
              </ThemedText>
            </Card>
            <ThemedText
              type="small"
              style={[styles.tipText, { color: theme.textSecondary }]}
            >
              Take your time. Share openly and honestly.
            </ThemedText>
          </>
        ) : step === "listener" ? (
          <>
            <View
              style={[
                styles.roleCircle,
                { backgroundColor: Colors.light.success + "20" },
              ]}
            >
              <Feather name="headphones" size={32} color={Colors.light.success} />
            </View>
            <ThemedText type="h4" style={[styles.roleLabel, { color: Colors.light.success }]}>
              Listener's Turn
            </ThemedText>
            <Card elevation={2} style={styles.promptCard}>
              <ThemedText type="body" style={styles.echoPrompt}>
                Reflect back what you heard. Start with:
              </ThemedText>
              <ThemedText type="h3" style={styles.promptText}>
                "What I hear you saying is..."
              </ThemedText>
            </Card>
            <ThemedText
              type="small"
              style={[styles.tipText, { color: theme.textSecondary }]}
            >
              Listen without interrupting. Validate their feelings.
            </ThemedText>
          </>
        ) : (
          <>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: Colors.light.success + "20" },
              ]}
            >
              <Feather name="check-circle" size={40} color={Colors.light.success} />
            </View>
            <ThemedText type="h2" style={styles.title}>
              Well Done!
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.description, { color: theme.textSecondary }]}
            >
              You completed {roundCount} rounds of active listening together.
              This practice strengthens your connection.
            </ThemedText>
          </>
        )}
      </View>

      <View style={styles.footer}>
        {step === "intro" ? (
          <Button onPress={handleStart}>Begin Exercise</Button>
        ) : step === "speaker" ? (
          <Button onPress={handleSpeakerDone}>I'm Done Sharing</Button>
        ) : step === "listener" ? (
          <Button onPress={handleListenerDone}>I've Reflected Back</Button>
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
    marginBottom: Spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  roleCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  roleLabel: {
    marginBottom: Spacing.xl,
    fontWeight: "600",
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  instructionCard: {
    width: "100%",
    padding: Spacing.lg,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  instructionText: {
    flex: 1,
  },
  instructionDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: Spacing.lg,
  },
  promptCard: {
    width: "100%",
    padding: Spacing.xl,
    alignItems: "center",
  },
  promptText: {
    textAlign: "center",
    fontStyle: "italic",
  },
  echoPrompt: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  tipText: {
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
});
