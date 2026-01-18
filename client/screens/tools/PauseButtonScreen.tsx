import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Animated as RNAnimated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors } from "@/constants/theme";
import { addToolEntry } from "@/lib/storage";

const STEPS = [
  {
    title: "Breathe In",
    instruction: "Slowly breathe in through your nose for 4 seconds",
    duration: 4000,
  },
  {
    title: "Hold",
    instruction: "Hold your breath gently for 4 seconds",
    duration: 4000,
  },
  {
    title: "Breathe Out",
    instruction: "Slowly exhale through your mouth for 6 seconds",
    duration: 6000,
  },
  {
    title: "Rest",
    instruction: "Pause and notice how you feel",
    duration: 2000,
  },
];

export default function PauseButtonScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [timer, setTimer] = useState(0);

  const scaleAnim = useRef(new RNAnimated.Value(1)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0.5)).current;

  useEffect(() => {
    if (!isActive) return;

    const step = STEPS[currentStep];
    setTimer(step.duration / 1000);

    if (currentStep === 0) {
      RNAnimated.timing(scaleAnim, {
        toValue: 1.3,
        duration: step.duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
      RNAnimated.timing(opacityAnim, {
        toValue: 0.8,
        duration: step.duration,
        useNativeDriver: true,
      }).start();
    } else if (currentStep === 2) {
      RNAnimated.timing(scaleAnim, {
        toValue: 1,
        duration: step.duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
      RNAnimated.timing(opacityAnim, {
        toValue: 0.5,
        duration: step.duration,
        useNativeDriver: true,
      }).start();
    }

    const timerInterval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    const timeout = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (currentStep === STEPS.length - 1) {
        setCycleCount((prev) => prev + 1);
        setCurrentStep(0);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }, step.duration);

    return () => {
      clearTimeout(timeout);
      clearInterval(timerInterval);
    };
  }, [isActive, currentStep]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(true);
    setCurrentStep(0);
    setCycleCount(0);
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsActive(false);

    await addToolEntry({
      coupleId: "couple-1",
      toolType: "pause",
      payload: { cycles: cycleCount + 1 },
    });

    navigation.goBack();
  };

  const step = STEPS[currentStep];

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
      <View style={styles.content}>
        {isActive ? (
          <>
            <View style={styles.cycleIndicator}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Cycle {cycleCount + 1}
              </ThemedText>
            </View>

            <RNAnimated.View
              style={[
                styles.breathCircle,
                {
                  backgroundColor: Colors.light.link + "30",
                  borderColor: Colors.light.link,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <ThemedText type="h1" style={{ color: Colors.light.link }}>
                {timer}
              </ThemedText>
            </RNAnimated.View>

            <ThemedText type="h2" style={styles.stepTitle}>
              {step.title}
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.stepInstruction, { color: theme.textSecondary }]}
            >
              {step.instruction}
            </ThemedText>
          </>
        ) : (
          <>
            <View
              style={[
                styles.breathCircle,
                {
                  backgroundColor: Colors.light.link + "20",
                  borderColor: Colors.light.link,
                },
              ]}
            >
              <ThemedText type="h1" style={{ color: Colors.light.link }}>
                4
              </ThemedText>
            </View>

            <ThemedText type="h2" style={styles.stepTitle}>
              Take a Pause
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.stepInstruction, { color: theme.textSecondary }]}
            >
              When emotions run high, pause together. This guided breathing
              exercise helps you both calm down and reconnect.
            </ThemedText>
          </>
        )}
      </View>

      <View style={styles.footer}>
        {isActive ? (
          <Button onPress={handleFinish}>Finish & Save</Button>
        ) : (
          <Button onPress={handleStart}>Begin Breathing</Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  cycleIndicator: {
    position: "absolute",
    top: Spacing.xl,
  },
  breathCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
  },
  stepTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  stepInstruction: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
});
