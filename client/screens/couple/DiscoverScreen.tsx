import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import {
  GlowWidget,
  GlowWidgetGrid,
  GlowWidgetRow,
  GlowBackground,
  GlowColors,
  CategoryHeroCard,
} from "@/components/GlowWidget";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const heroDiscover = require("../../assets/images/hero-discover.png");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LOVE_LANGUAGE_NAMES: Record<string, string> = {
  words_of_affirmation: "Words of Affirmation",
  acts_of_service: "Acts of Service",
  receiving_gifts: "Receiving Gifts",
  quality_time: "Quality Time",
  physical_touch: "Physical Touch",
};

const ATTACHMENT_NAMES: Record<string, string> = {
  secure: "Secure",
  anxious: "Anxious",
  avoidant: "Avoidant",
  disorganized: "Disorganized",
};

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loveLanguageResult, setLoveLanguageResult] = useState<string | null>(null);
  const [attachmentResult, setAttachmentResult] = useState<string | null>(null);
  const [enneagramResult, setEnneagramResult] = useState<string | null>(null);
  const [loveMapScore, setLoveMapScore] = useState<number | null>(null);
  const [ifsPartsCount, setIfsPartsCount] = useState(0);
  const [valuesStatus, setValuesStatus] = useState("Define your shared values");

  const loadData = useCallback(async () => {
    if (!profile?.id || !profile?.couple_id) return;

    try {
      const { data: loveLanguage } = await supabase
        .from("love_language_results")
        .select("primary_language")
        .eq("user_id", profile.id)
        .single();
      
      if (loveLanguage?.primary_language) {
        setLoveLanguageResult(LOVE_LANGUAGE_NAMES[loveLanguage.primary_language] || loveLanguage.primary_language);
      }

      const { data: attachment } = await supabase
        .from("attachment_results")
        .select("attachment_style")
        .eq("user_id", profile.id)
        .single();
      
      if (attachment?.attachment_style) {
        setAttachmentResult(ATTACHMENT_NAMES[attachment.attachment_style] || attachment.attachment_style);
      }

      const { data: enneagram } = await supabase
        .from("enneagram_results")
        .select("enneagram_type")
        .eq("user_id", profile.id)
        .single();
      
      if (enneagram?.enneagram_type) {
        setEnneagramResult(`Type ${enneagram.enneagram_type}`);
      }

      const { data: loveMap } = await supabase
        .from("love_map_results")
        .select("score")
        .eq("couple_id", profile.couple_id)
        .single();
      
      if (loveMap?.score !== undefined) {
        setLoveMapScore(loveMap.score);
      }

      const { count: ifsCount } = await supabase
        .from("ifs_sessions")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", profile.couple_id);
      setIfsPartsCount(ifsCount || 0);

      const { data: values } = await supabase
        .from("values_vision")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .single();
      
      if (values) {
        setValuesStatus("Vision created");
      }

    } catch (error) {
      console.error("Error loading discover data:", error);
    }
  }, [profile?.id, profile?.couple_id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={GlowColors.gold}
          />
        }
      >
        <CategoryHeroCard
          title="Discover"
          subtitle="Learn about yourself and each other"
          image={heroDiscover}
        />

        <GlowWidgetGrid>
          <GlowWidgetRow>
            <GlowWidget
              title="Love Language"
              subtitle={loveLanguageResult || "Take the quiz"}
              icon="heart"
              iconColor={GlowColors.accentRed}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("LoveLanguageQuiz")}
              badge={loveLanguageResult ? "Complete" : undefined}
              statusText={loveLanguageResult ? `Your language: ${loveLanguageResult}` : undefined}
            />
            <GlowWidget
              title="Attachment Style"
              subtitle={attachmentResult || "Discover your style"}
              icon="shield"
              iconColor={GlowColors.accentBlue}
              backgroundColor={GlowColors.cardBlue}
              onPress={() => handleNavigate("AttachmentStyle")}
              badge={attachmentResult ? "Complete" : undefined}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Enneagram"
              subtitle={enneagramResult || "Your personality type"}
              icon="target"
              iconColor={GlowColors.accentPurple}
              backgroundColor={GlowColors.cardPurple}
              onPress={() => handleNavigate("Enneagram")}
              badge={enneagramResult || undefined}
            />
            <GlowWidget
              title="Love Map Quiz"
              subtitle="How well do you know each other?"
              icon="map"
              iconColor={GlowColors.accentGreen}
              backgroundColor={GlowColors.cardGreen}
              onPress={() => handleNavigate("LoveMapQuiz")}
              badge={loveMapScore !== null ? `${loveMapScore}%` : undefined}
              statusText={loveMapScore !== null ? "Quiz completed" : "Gottman method"}
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
              badge={ifsPartsCount > 0 ? `${ifsPartsCount} parts` : undefined}
            />
            <GlowWidget
              title="Values & Vision"
              subtitle="What matters most"
              icon="compass"
              iconColor={GlowColors.gold}
              backgroundColor={GlowColors.cardBrown}
              onPress={() => handleNavigate("ValuesVision")}
              statusText={valuesStatus}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Compatibility"
              subtitle="How you work best together"
              icon="heart"
              iconColor={GlowColors.accentPink}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("Compatibility")}
              size="large"
              statusText="Based on your quiz results"
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
    paddingTop: Spacing.md,
  },
});
