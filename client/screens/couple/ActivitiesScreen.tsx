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

  const handleToolPress = (tool: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(tool as keyof RootStackParamList);
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
          onPress={() => navigation.navigate("AddGratitude")}
        />

        <ToolCard
          title="Write in Journal"
          description="Record your thoughts and reflections"
          icon="book-open"
          color="#3498DB"
          onPress={() => navigation.navigate("AddJournal")}
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
          onPress={() => navigation.navigate("LoveLanguageQuiz")}
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
          onPress={() => navigation.navigate("FourHorsemen")}
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
          onPress={() => navigation.navigate("Calendar")}
        />

        <ToolCard
          title="Messages"
          description="Chat with your partner"
          icon="message-circle"
          color="#3498DB"
          onPress={() => navigation.navigate("Messages")}
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
