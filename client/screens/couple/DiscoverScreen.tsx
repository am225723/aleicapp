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

export default function DiscoverScreen() {
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
          <ThemedText style={styles.headerTitle}>Discover</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Learn about yourself and each other
          </ThemedText>
        </View>

        <GlowWidgetGrid>
          <GlowWidgetRow>
            <GlowWidget
              title="Love Language"
              subtitle="How you give and receive love"
              icon="heart"
              iconColor={GlowColors.accentRed}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("LoveLanguageQuiz")}
            />
            <GlowWidget
              title="Attachment Style"
              subtitle="Your bonding patterns"
              icon="shield"
              iconColor={GlowColors.accentBlue}
              backgroundColor={GlowColors.cardBlue}
              onPress={() => handleNavigate("AttachmentStyle")}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Enneagram"
              subtitle="Your personality type"
              icon="target"
              iconColor={GlowColors.accentPurple}
              backgroundColor={GlowColors.cardPurple}
              onPress={() => handleNavigate("Enneagram")}
            />
            <GlowWidget
              title="Love Map"
              subtitle="How well you know each other"
              icon="map"
              iconColor={GlowColors.accentGreen}
              backgroundColor={GlowColors.cardGreen}
              onPress={() => handleNavigate("LoveMapQuiz")}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="IFS Parts Work"
              subtitle="Explore your inner world"
              icon="users"
              iconColor={GlowColors.accentTeal}
              backgroundColor={GlowColors.cardTeal}
              onPress={() => handleNavigate("IFSIntro")}
            />
            <GlowWidget
              title="Values & Vision"
              subtitle="What matters most"
              icon="compass"
              iconColor={GlowColors.gold}
              backgroundColor={GlowColors.cardBrown}
              onPress={() => handleNavigate("ValuesVision")}
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
