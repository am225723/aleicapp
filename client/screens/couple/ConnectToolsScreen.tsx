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

export default function ConnectToolsScreen() {
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
          <ThemedText style={styles.headerTitle}>Connect</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Communicate and grow together
          </ThemedText>
        </View>

        <GlowWidgetGrid>
          <GlowWidgetRow>
            <GlowWidget
              title="Echo & Empathy"
              subtitle="Active listening practice"
              icon="message-circle"
              iconColor={GlowColors.accentPink}
              backgroundColor={GlowColors.cardBrown}
              onPress={() => handleNavigate("EchoEmpathy")}
            />
            <GlowWidget
              title="Hold Me Tight"
              subtitle="EFT conversation prompts"
              icon="heart"
              iconColor={GlowColors.accentGreen}
              backgroundColor={GlowColors.cardGreen}
              onPress={() => handleNavigate("HoldMeTight")}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Demon Dialogues"
              subtitle="Identify negative cycles"
              icon="repeat"
              iconColor={GlowColors.accentOrange}
              backgroundColor={GlowColors.cardOrange}
              onPress={() => handleNavigate("DemonDialogues")}
            />
            <GlowWidget
              title="Four Horsemen"
              subtitle="Track conflict patterns"
              icon="alert-triangle"
              iconColor={GlowColors.gold}
              backgroundColor={GlowColors.cardDark}
              onPress={() => handleNavigate("FourHorsemen")}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Messages"
              subtitle="Chat with your therapist"
              icon="mail"
              iconColor={GlowColors.accentBlue}
              backgroundColor={GlowColors.cardBlue}
              onPress={() => handleNavigate("Messages")}
            />
            <GlowWidget
              title="Intimacy Map"
              subtitle="Explore your preferences"
              icon="layers"
              iconColor={GlowColors.accentRed}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("IntimacyMapping")}
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
