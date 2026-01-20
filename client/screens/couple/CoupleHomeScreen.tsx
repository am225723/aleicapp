import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { supabase } from "@/lib/supabase";
import { listGratitudeLogs, GratitudeLog } from "@/services/gratitudeService";
import { listWeeklyCheckins, WeeklyCheckin } from "@/services/weeklyCheckinsService";

const aleicLogo = require("../../assets/aleiclogo.png");
const heroImage = require("../../../attached_assets/stock_images/romantic_couple_silh_eb6a64a2.jpg");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DashboardColors = {
  background: "#0D0D0F",
  cardDark: "rgba(30, 35, 45, 0.85)",
  cardBlue: "rgba(45, 65, 100, 0.7)",
  cardBrown: "rgba(90, 60, 40, 0.7)",
  cardTeal: "rgba(40, 80, 80, 0.7)",
  gold: "#C9A962",
  goldLight: "#E5D4A1",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.7)",
  accentBlue: "#4A90D9",
  accentGreen: "#81C995",
  glowOrange: "rgba(255, 150, 50, 0.3)",
  glowBlue: "rgba(100, 150, 255, 0.2)",
};

interface DashboardWidget {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  backgroundColor: string;
  route: keyof RootStackParamList;
  size: "small" | "medium" | "large";
  badge?: string | number;
  action?: string;
}

export default function CoupleHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gratitudeCount, setGratitudeCount] = useState(0);
  const [weeklyCheckinStatus, setWeeklyCheckinStatus] = useState<string>("Start your first check-in");
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loveLanguageResult, setLoveLanguageResult] = useState<string | null>(null);
  const [loveMapStatus, setLoveMapStatus] = useState<string>("Start the quiz");

  const loadDashboardData = useCallback(async () => {
    if (!profile?.couple_id) return;

    try {
      const [gratitudeLogs, checkins] = await Promise.all([
        listGratitudeLogs(profile.couple_id),
        listWeeklyCheckins(profile.couple_id),
      ]);

      setGratitudeCount(gratitudeLogs.length);

      if (checkins.length > 0) {
        const lastCheckin = checkins[0];
        const lastDate = new Date(lastCheckin.created_at);
        const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince === 0) {
          setWeeklyCheckinStatus("Completed today");
        } else if (daysSince < 7) {
          setWeeklyCheckinStatus(`${daysSince} days ago`);
        } else {
          setWeeklyCheckinStatus("Due every Sunday");
        }
      }

      const { data: messages } = await supabase
        .from("therapist_messages")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (messages) {
        setRecentMessages(messages);
      }

      const { data: loveMapResult } = await supabase
        .from("love_map_results")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (loveMapResult && loveMapResult.length > 0) {
        setLoveMapStatus("Quiz completed");
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }, [profile?.couple_id]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  async function handleRefresh() {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadDashboardData();
    setIsRefreshing(false);
  }

  const handleWidgetPress = (route: keyof RootStackParamList) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(route as any);
  };

  const renderGlowBackground = () => (
    <View style={styles.glowContainer}>
      <LinearGradient
        colors={["transparent", DashboardColors.glowOrange, "transparent"]}
        style={styles.glowOrange}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <LinearGradient
        colors={["transparent", DashboardColors.glowBlue, "transparent"]}
        style={styles.glowBlue}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      />
    </View>
  );

  const renderHeroCard = () => (
    <View style={styles.heroCard}>
      <ImageBackground
        source={heroImage}
        style={styles.heroImage}
        imageStyle={styles.heroImageStyle}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)"]}
          style={styles.heroGradient}
        >
          <ThemedText style={styles.heroText}>
            Growing together, one connection at a time.
          </ThemedText>
        </LinearGradient>
      </ImageBackground>
    </View>
  );

  const renderWidget = (widget: DashboardWidget) => {
    const isLarge = widget.size === "large";
    const isMedium = widget.size === "medium";

    return (
      <Pressable
        key={widget.id}
        style={[
          styles.widget,
          isLarge ? styles.widgetLarge : isMedium ? styles.widgetMedium : styles.widgetSmall,
          { backgroundColor: widget.backgroundColor },
        ]}
        onPress={() => handleWidgetPress(widget.route)}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={styles.widgetContent}>
            <View style={styles.widgetHeader}>
              <View style={[styles.widgetIcon, { backgroundColor: widget.iconColor + "30" }]}>
                <Feather name={widget.icon} size={20} color={widget.iconColor} />
              </View>
              {widget.badge ? (
                <View style={styles.widgetBadge}>
                  <ThemedText style={styles.widgetBadgeText}>
                    {widget.badge}
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <ThemedText style={styles.widgetTitle}>{widget.title}</ThemedText>
            {widget.subtitle ? (
              <ThemedText style={styles.widgetSubtitle}>{widget.subtitle}</ThemedText>
            ) : null}
            {widget.action ? (
              <Pressable style={styles.widgetAction}>
                <Feather name="mic" size={14} color="#FFF" />
                <ThemedText style={styles.widgetActionText}>{widget.action}</ThemedText>
              </Pressable>
            ) : null}
          </View>
        </BlurView>
      </Pressable>
    );
  };

  const widgets: DashboardWidget[] = [
    {
      id: "messages",
      title: "Therapist Messages",
      subtitle: recentMessages.length > 0 ? `${recentMessages.length} messages` : "No messages yet",
      icon: "users",
      iconColor: DashboardColors.goldLight,
      backgroundColor: DashboardColors.cardBlue,
      route: "Messages",
      size: "medium",
    },
    {
      id: "voice",
      title: "Voice Memos",
      subtitle: "Send a loving message",
      icon: "mic",
      iconColor: DashboardColors.accentBlue,
      backgroundColor: DashboardColors.cardDark,
      route: "VoiceMemos",
      size: "medium",
      action: "Record",
    },
    {
      id: "lovemap",
      title: "Love Map Quiz",
      subtitle: loveMapStatus,
      icon: "map",
      iconColor: DashboardColors.gold,
      backgroundColor: DashboardColors.cardDark,
      route: "LoveMapQuiz",
      size: "small",
    },
    {
      id: "checkin",
      title: "Weekly Check-In",
      subtitle: weeklyCheckinStatus,
      icon: "check-square",
      iconColor: DashboardColors.goldLight,
      backgroundColor: DashboardColors.cardBlue,
      route: "WeeklyCheckin",
      size: "medium",
    },
    {
      id: "gratitude",
      title: "Gratitude Log",
      subtitle: gratitudeCount > 0 ? `${gratitudeCount} entries` : "Start journaling",
      icon: "coffee",
      iconColor: DashboardColors.gold,
      backgroundColor: DashboardColors.cardBrown,
      route: "Connect" as any,
      size: "small",
      badge: gratitudeCount > 0 ? `${gratitudeCount} entries` : undefined,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {renderGlowBackground()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={DashboardColors.gold}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image source={aleicLogo} style={styles.logo} contentFit="contain" />
          <ThemedText style={styles.headerTitle}>Relationship Dashboard</ThemedText>
        </View>

        {renderHeroCard()}

        <View style={styles.widgetGrid}>
          <View style={styles.widgetRow}>
            {renderWidget(widgets[0])}
            {renderWidget(widgets[1])}
          </View>
          <View style={styles.widgetRow}>
            {renderWidget(widgets[2])}
          </View>
          <View style={styles.widgetRow}>
            {renderWidget(widgets[3])}
            {renderWidget(widgets[4])}
          </View>
        </View>

        <View style={styles.quickActionsSection}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActionsRow}>
            <Pressable
              style={styles.quickAction}
              onPress={() => handleWidgetPress("PauseButton")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "rgba(139, 157, 195, 0.3)" }]}>
                <Feather name="pause-circle" size={24} color="#8B9DC3" />
              </View>
              <ThemedText style={styles.quickActionText}>Pause</ThemedText>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => handleWidgetPress("EchoEmpathy")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "rgba(232, 165, 156, 0.3)" }]}>
                <Feather name="message-circle" size={24} color="#E8A59C" />
              </View>
              <ThemedText style={styles.quickActionText}>Echo</ThemedText>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => handleWidgetPress("HoldMeTight")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "rgba(129, 201, 149, 0.3)" }]}>
                <Feather name="heart" size={24} color="#81C995" />
              </View>
              <ThemedText style={styles.quickActionText}>Hold Me</ThemedText>
            </Pressable>
            <Pressable
              style={styles.quickAction}
              onPress={() => handleWidgetPress("LoveLanguageQuiz")}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: "rgba(201, 169, 98, 0.3)" }]}>
                <Feather name="gift" size={24} color="#C9A962" />
              </View>
              <ThemedText style={styles.quickActionText}>Languages</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  glowOrange: {
    position: "absolute",
    bottom: "20%",
    left: "10%",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  glowBlue: {
    position: "absolute",
    top: "30%",
    right: "-10%",
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    color: DashboardColors.textSecondary,
    fontFamily: "Nunito_400Regular",
  },
  heroCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
    height: 180,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroImageStyle: {
    borderRadius: BorderRadius.lg,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  heroText: {
    color: DashboardColors.textPrimary,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  widgetGrid: {
    marginBottom: Spacing.xl,
  },
  widgetRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  widget: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  widgetSmall: {
    flex: 1,
    minHeight: 120,
  },
  widgetMedium: {
    flex: 1,
    minHeight: 150,
  },
  widgetLarge: {
    flex: 1,
    minHeight: 180,
  },
  widgetContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  widgetIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  widgetBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  widgetBadgeText: {
    fontSize: 11,
    color: DashboardColors.textPrimary,
  },
  widgetTitle: {
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    color: DashboardColors.textPrimary,
    marginTop: Spacing.sm,
  },
  widgetSubtitle: {
    fontSize: 12,
    color: DashboardColors.textSecondary,
    marginTop: 2,
  },
  widgetAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DashboardColors.accentBlue,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
    marginTop: Spacing.sm,
    gap: 4,
  },
  widgetActionText: {
    fontSize: 12,
    color: "#FFF",
    fontFamily: "Nunito_600SemiBold",
  },
  quickActionsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    color: DashboardColors.textPrimary,
    marginBottom: Spacing.md,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  quickActionText: {
    fontSize: 12,
    color: DashboardColors.textSecondary,
  },
});
