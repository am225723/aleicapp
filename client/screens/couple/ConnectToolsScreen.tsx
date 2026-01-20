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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ConnectToolsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [demonDialogueCount, setDemonDialogueCount] = useState(0);
  const [intimacyStatus, setIntimacyStatus] = useState("Explore your connection");
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const { data: messages, count: msgCount } = await supabase
        .from("therapist_messages")
        .select("*", { count: "exact" })
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false })
        .limit(3);
      
      setMessageCount(msgCount || 0);
      if (messages && messages.length > 0) {
        setRecentMessages(messages.slice(0, 2).map(m => ({
          icon: m.sender_role === "therapist" ? "user" : "heart",
          title: m.sender_role === "therapist" ? "Therapist" : "You",
          subtitle: m.content.substring(0, 30) + (m.content.length > 30 ? "..." : ""),
        })));
      }

      const { count: demonCount } = await supabase
        .from("demon_dialogues")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", profile.couple_id);
      setDemonDialogueCount(demonCount || 0);

      const { data: intimacy } = await supabase
        .from("intimacy_maps")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .single();
      
      if (intimacy) {
        setIntimacyStatus("Map created");
      }

    } catch (error) {
      console.error("Error loading connect data:", error);
    }
  }, [profile?.couple_id]);

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
          title="Connect"
          subtitle="Communicate and grow closer together"
          gradientColors={["rgba(232, 165, 156, 0.4)", "rgba(100, 60, 60, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        <GlowWidgetGrid>
          <GlowWidgetRow>
            <GlowWidget
              title="Echo & Empathy"
              subtitle="Active listening practice"
              icon="message-circle"
              iconColor={GlowColors.accentPink}
              backgroundColor={GlowColors.cardBrown}
              onPress={() => handleNavigate("EchoEmpathy")}
              actionButton={{
                label: "Start",
                icon: "play",
              }}
            />
            <GlowWidget
              title="Hold Me Tight"
              subtitle="EFT conversation"
              icon="heart"
              iconColor={GlowColors.accentGreen}
              backgroundColor={GlowColors.cardGreen}
              onPress={() => handleNavigate("HoldMeTight")}
              actionButton={{
                label: "Begin",
                icon: "heart",
              }}
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
              badge={demonDialogueCount > 0 ? `${demonDialogueCount} identified` : undefined}
            />
            <GlowWidget
              title="Four Horsemen"
              subtitle="Track conflict patterns"
              icon="alert-triangle"
              iconColor={GlowColors.gold}
              backgroundColor={GlowColors.cardDark}
              onPress={() => handleNavigate("FourHorsemen")}
              statusText="Gottman method"
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Therapist Messages"
              subtitle="Chat with your therapist"
              icon="mail"
              iconColor={GlowColors.accentBlue}
              backgroundColor={GlowColors.cardBlue}
              onPress={() => handleNavigate("Messages")}
              badge={messageCount > 0 ? messageCount : undefined}
              previewItems={recentMessages.length > 0 ? recentMessages : undefined}
              size="large"
            />
            <GlowWidget
              title="Intimacy Map"
              subtitle="Explore preferences"
              icon="layers"
              iconColor={GlowColors.accentRed}
              backgroundColor={GlowColors.cardRed}
              onPress={() => handleNavigate("IntimacyMapping")}
              statusText={intimacyStatus}
            />
          </GlowWidgetRow>

          <GlowWidgetRow>
            <GlowWidget
              title="Conflict Resolution"
              subtitle="Resolve issues together"
              icon="flag"
              iconColor={GlowColors.accentOrange}
              backgroundColor={GlowColors.cardOrange}
              onPress={() => handleNavigate("ConflictResolution")}
              statusText="5-step guided process"
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
