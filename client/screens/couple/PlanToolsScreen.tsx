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

export default function PlanToolsScreen() {
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
          <ThemedText style={styles.headerTitle}>Plan</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Build your future together
          </ThemedText>
        </View>

        <GlowWidgetGrid>
          <GlowWidgetRow>
            <GlowWidget
              title="Shared Goals"
              subtitle="Track dreams together"
              icon="target"
              iconColor={GlowColors.accentGreen}
              backgroundColor={GlowColors.cardGreen}
              onPress={() => handleNavigate("SharedGoals")}
            />
            <GlowWidget
              title="Date Night"
              subtitle="AI-powered ideas"
              icon="heart"
              iconColor={GlowColors.accentPink}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("DateNight")}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Rituals"
              subtitle="Daily connection habits"
              icon="star"
              iconColor={GlowColors.gold}
              backgroundColor={GlowColors.cardBrown}
              onPress={() => handleNavigate("AddRitual")}
            />
            <GlowWidget
              title="Calendar"
              subtitle="Shared schedule"
              icon="calendar"
              iconColor={GlowColors.accentBlue}
              backgroundColor={GlowColors.cardBlue}
              onPress={() => handleNavigate("Calendar")}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Parenting"
              subtitle="Align on family matters"
              icon="users"
              iconColor={GlowColors.accentPurple}
              backgroundColor={GlowColors.cardPurple}
              onPress={() => handleNavigate("ParentingPartners")}
            />
            <GlowWidget
              title="Finances"
              subtitle="Money conversations"
              icon="dollar-sign"
              iconColor={GlowColors.accentTeal}
              backgroundColor={GlowColors.cardTeal}
              onPress={() => handleNavigate("FinancialToolkit")}
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
