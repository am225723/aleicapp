import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import {
  GlowWidget,
  GlowWidgetGrid,
  GlowWidgetRow,
  GlowBackground,
  GlowColors,
} from "@/components/GlowWidget";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CalmScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const handleNavigate = (route: keyof RootStackParamList) => {
    navigation.navigate(route as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Calm</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Breathe, reflect, and find peace
          </ThemedText>
        </View>

        <GlowWidgetGrid>
          <GlowWidgetRow>
            <GlowWidget
              title="Pause Button"
              subtitle="Guided breathing exercise"
              icon="pause-circle"
              iconColor={GlowColors.accentBlue}
              backgroundColor={GlowColors.cardBlue}
              onPress={() => handleNavigate("PauseButton")}
            />
            <GlowWidget
              title="Meditation"
              subtitle="Mindfulness for couples"
              icon="sun"
              iconColor={GlowColors.accentPurple}
              backgroundColor={GlowColors.cardPurple}
              onPress={() => handleNavigate("MeditationLibrary")}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Weekly Check-in"
              subtitle="Rate your connection"
              icon="check-square"
              iconColor={GlowColors.goldLight}
              backgroundColor={GlowColors.cardTeal}
              onPress={() => handleNavigate("WeeklyCheckin")}
            />
            <GlowWidget
              title="Voice Memos"
              subtitle="Record loving messages"
              icon="mic"
              iconColor={GlowColors.accentRed}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("VoiceMemos")}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Gratitude"
              subtitle="Share what you appreciate"
              icon="gift"
              iconColor={GlowColors.gold}
              backgroundColor={GlowColors.cardBrown}
              onPress={() => handleNavigate("AddGratitude")}
            />
            <GlowWidget
              title="Journal"
              subtitle="Record your reflections"
              icon="book-open"
              iconColor={GlowColors.accentTeal}
              backgroundColor={GlowColors.cardGreen}
              onPress={() => handleNavigate("AddJournal")}
            />
          </GlowWidgetRow>
        </GlowWidgetGrid>
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
  },
  header: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: GlowColors.textSecondary,
    fontFamily: "Nunito_400Regular",
  },
});
