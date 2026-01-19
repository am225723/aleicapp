import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ToolCard } from "@/components/ToolCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleToolPress = (tool: keyof RootStackParamList) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(tool as any);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + 80 + Spacing.xl,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="h2">Activities</ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Relationship tools and exercises
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Calming & Grounding
        </ThemedText>

        <ToolCard
          title="Pause Button"
          description="Take a timeout with guided breathing and calming exercises"
          icon="pause-circle"
          color={Colors.light.link}
          onPress={() => handleToolPress("PauseButton")}
        />

        <ToolCard
          title="Meditation Library"
          description="Guided mindfulness practices for couples"
          icon="sun"
          color="#9B59B6"
          onPress={() => handleToolPress("MeditationLibrary")}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Communication
        </ThemedText>

        <ToolCard
          title="Echo & Empathy"
          description="Practice active listening with speaker/listener roles"
          icon="message-circle"
          color={Colors.light.accent}
          onPress={() => handleToolPress("EchoEmpathy")}
        />

        <ToolCard
          title="Hold Me Tight"
          description="Deep conversation prompts based on EFT therapy"
          icon="heart"
          color={Colors.light.success}
          onPress={() => handleToolPress("HoldMeTight")}
        />

        <ToolCard
          title="Voice Memos"
          description="Record and share voice messages with your partner"
          icon="mic"
          color="#E74C3C"
          onPress={() => handleToolPress("VoiceMemos")}
        />

        <ToolCard
          title="Demon Dialogues"
          description="Identify negative cycle patterns in conflict"
          icon="repeat"
          color="#F39C12"
          onPress={() => handleToolPress("DemonDialogues")}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Assessments
        </ThemedText>

        <ToolCard
          title="Love Language Quiz"
          description="Discover how you give and receive love"
          icon="heart"
          color="#E74C3C"
          onPress={() => handleToolPress("LoveLanguageQuiz")}
        />

        <ToolCard
          title="Attachment Styles"
          description="Understand your attachment patterns"
          icon="shield"
          color="#3498DB"
          onPress={() => handleToolPress("AttachmentStyle")}
        />

        <ToolCard
          title="Enneagram"
          description="Explore your personality type"
          icon="target"
          color="#9B59B6"
          onPress={() => handleToolPress("Enneagram")}
        />

        <ToolCard
          title="Love Map Quiz"
          description="How well do you know your partner? (Gottman)"
          icon="map"
          color={Colors.light.success}
          onPress={() => handleToolPress("LoveMapQuiz")}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Deep Work
        </ThemedText>

        <ToolCard
          title="Internal Family Systems"
          description="Explore your internal parts for healing"
          icon="users"
          color="#1ABC9C"
          onPress={() => handleToolPress("IFSIntro")}
        />

        <ToolCard
          title="Intimacy Mapping"
          description="Map your preferences across types of intimacy"
          icon="layers"
          color="#E74C3C"
          onPress={() => handleToolPress("IntimacyMapping")}
        />

        <ToolCard
          title="Values & Vision"
          description="Align on what matters most to you both"
          icon="compass"
          color={Colors.light.link}
          onPress={() => handleToolPress("ValuesVision")}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Reflection
        </ThemedText>

        <ToolCard
          title="Weekly Check-in"
          description="Rate and reflect on your connection this week"
          icon="bar-chart-2"
          color={Colors.light.warning}
          onPress={() => handleToolPress("WeeklyCheckin")}
        />

        <ToolCard
          title="Add Gratitude"
          description="Share what you appreciate about your partner"
          icon="gift"
          color="#9B59B6"
          onPress={() => handleToolPress("AddGratitude")}
        />

        <ToolCard
          title="Write in Journal"
          description="Record your thoughts and reflections"
          icon="book-open"
          color="#3498DB"
          onPress={() => handleToolPress("AddJournal")}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Therapeutic Tools
        </ThemedText>

        <ToolCard
          title="Four Horsemen"
          description="Track Gottman's predictors of relationship distress"
          icon="alert-triangle"
          color="#F39C12"
          onPress={() => handleToolPress("FourHorsemen")}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Life Together
        </ThemedText>

        <ToolCard
          title="Shared Goals"
          description="Set and track goals together as a couple"
          icon="target"
          color={Colors.light.success}
          onPress={() => handleToolPress("SharedGoals")}
        />

        <ToolCard
          title="Parenting Partners"
          description="Align on parenting decisions together"
          icon="users"
          color={Colors.light.accent}
          onPress={() => handleToolPress("ParentingPartners")}
        />

        <ToolCard
          title="Financial Toolkit"
          description="Have productive money conversations"
          icon="dollar-sign"
          color="#27AE60"
          onPress={() => handleToolPress("FinancialToolkit")}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Planning
        </ThemedText>

        <ToolCard
          title="Shared Calendar"
          description="Plan dates and special moments together"
          icon="calendar"
          color="#1ABC9C"
          onPress={() => handleToolPress("Calendar")}
        />

        <ToolCard
          title="Messages"
          description="Chat with your partner"
          icon="message-circle"
          color="#3498DB"
          onPress={() => handleToolPress("Messages")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
});
