import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  TextInput,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type RouteProps = RouteProp<RootStackParamList, "CoupleDetail">;

const TABS = ["Overview", "Check-ins", "Assessments", "Notes", "Thoughts", "Config"] as const;
type TabName = (typeof TABS)[number];

const WIDGET_LIST = [
  "weekly-checkin",
  "love-languages",
  "gratitude",
  "shared-goals",
  "conversations",
  "love-map",
  "voice-memos",
  "calendar",
  "rituals",
];

const CATEGORY_COLORS: Record<string, string> = {
  note: Colors.light.link,
  observation: Colors.light.warning,
  clinical: Colors.light.accent,
  action: Colors.light.success,
  positive: Colors.light.success,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: Colors.light.error,
  normal: Colors.light.link,
  low: Colors.light.textSecondary,
};

export default function CoupleDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const coupleId = route.params.coupleId;

  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couple, setCouple] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [toolEntries, setToolEntries] = useState<any[]>([]);
  const [gratitudeLogs, setGratitudeLogs] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [loveLanguages, setLoveLanguages] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [sessionNotes, setSessionNotes] = useState<any[]>([]);
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  const [newThoughtText, setNewThoughtText] = useState("");
  const [configCardContent, setConfigCardContent] = useState("");
  const [configWidgets, setConfigWidgets] = useState<string[]>([]);
  const [savingConfig, setSavingConfig] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const [
        coupleRes,
        profilesRes,
        checkinsRes,
        toolsRes,
        gratitudeRes,
        moodsRes,
        loveRes,
        attachRes,
        notesRes,
        thoughtsRes,
        configRes,
      ] = await Promise.all([
        supabase.from("Couples_couples").select("*").eq("id", coupleId).single(),
        supabase.from("Couples_profiles").select("*").eq("couple_id", coupleId),
        supabase.from("Couples_weekly_checkins").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }),
        supabase.from("Couples_tool_entries").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }),
        supabase.from("Couples_gratitude_logs").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }).limit(5),
        supabase.from("Couples_moods").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }),
        supabase.from("love_language_results").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }),
        supabase.from("attachment_results").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }),
        supabase.from("therapist_session_notes").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }),
        supabase.from("therapist_thoughts").select("*").eq("couple_id", coupleId).order("created_at", { ascending: false }),
        supabase.from("therapist_couple_config").select("*").eq("couple_id", coupleId).maybeSingle(),
      ]);

      if (coupleRes.data) setCouple(coupleRes.data);
      if (profilesRes.data) setPartners(profilesRes.data);
      if (checkinsRes.data) setCheckins(checkinsRes.data);
      if (toolsRes.data) setToolEntries(toolsRes.data);
      if (gratitudeRes.data) setGratitudeLogs(gratitudeRes.data);
      if (moodsRes.data) setMoods(moodsRes.data);
      if (loveRes.data) setLoveLanguages(loveRes.data);
      if (attachRes.data) setAttachments(attachRes.data);
      if (notesRes.data) setSessionNotes(notesRes.data);
      if (thoughtsRes.data) setThoughts(thoughtsRes.data);
      if (configRes.data) {
        setConfig(configRes.data);
        setConfigCardContent(configRes.data.custom_card_content || "");
        setConfigWidgets(configRes.data.visible_widgets || []);
      }
    } catch (err) {
      console.error("Error loading couple data:", err);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [coupleId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const partner1 = partners.find((p: any) => p.user_id === couple?.partner1_id);
  const partner2 = partners.find((p: any) => p.user_id === couple?.partner2_id);
  const partner1Name = partner1?.display_name || partner1?.email || "Partner 1";
  const partner2Name = partner2?.display_name || partner2?.email || "Partner 2";

  const toggleThoughtComplete = async (thought: any) => {
    impactAsync(ImpactFeedbackStyle.Light);
    const { error: updateError } = await supabase
      .from("therapist_thoughts")
      .update({ is_completed: !thought.is_completed })
      .eq("id", thought.id);

    if (!updateError) {
      setThoughts((prev) =>
        prev.map((t) => (t.id === thought.id ? { ...t, is_completed: !t.is_completed } : t))
      );
    }
  };

  const addThought = async () => {
    if (!newThoughtText.trim() || !profile) return;
    impactAsync(ImpactFeedbackStyle.Light);
    const { data, error: insertError } = await supabase
      .from("therapist_thoughts")
      .insert({
        therapist_id: profile.id,
        couple_id: coupleId,
        content: newThoughtText.trim(),
        category: "note",
        is_todo: false,
        is_completed: false,
        priority: "normal",
      })
      .select()
      .single();

    if (!insertError && data) {
      setThoughts((prev) => [data, ...prev]);
      setNewThoughtText("");
    }
  };

  const saveConfig = async () => {
    if (!profile) return;
    setSavingConfig(true);
    impactAsync(ImpactFeedbackStyle.Medium);

    const payload = {
      therapist_id: profile.id,
      couple_id: coupleId,
      custom_card_content: configCardContent,
      visible_widgets: configWidgets,
    };

    if (config?.id) {
      await supabase
        .from("therapist_couple_config")
        .update(payload)
        .eq("id", config.id);
    } else {
      const { data } = await supabase
        .from("therapist_couple_config")
        .insert(payload)
        .select()
        .single();
      if (data) setConfig(data);
    }
    setSavingConfig(false);
  };

  const toggleWidget = (widget: string) => {
    setConfigWidgets((prev) =>
      prev.includes(widget) ? prev.filter((w) => w !== widget) : [...prev, widget]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.link} />
      </View>
    );
  }

  const totalCheckins = checkins.length;
  const avgMood =
    totalCheckins > 0
      ? (checkins.reduce((s: number, c: any) => s + (c.mood_rating || 0), 0) / totalCheckins).toFixed(1)
      : "0";
  const avgConnection =
    totalCheckins > 0
      ? (checkins.reduce((s: number, c: any) => s + (c.connection_rating || 0), 0) / totalCheckins).toFixed(1)
      : "0";
  const toolsUsedCount = toolEntries.length;
  const daysActive = couple
    ? Math.ceil((Date.now() - new Date(couple.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const toolUsageMap: Record<string, number> = {};
  toolEntries.forEach((e: any) => {
    const name = e.tool_name || "unknown";
    toolUsageMap[name] = (toolUsageMap[name] || 0) + 1;
  });

  const partner1Moods = moods.filter((m: any) => m.user_id === couple?.partner1_id);
  const partner2Moods = moods.filter((m: any) => m.user_id === couple?.partner2_id);
  const latestMood1 = partner1Moods.length > 0 ? partner1Moods[0] : null;
  const latestMood2 = partner2Moods.length > 0 ? partner2Moods[0] : null;

  const trendCheckins = checkins.slice(0, 8).reverse();

  const todoThoughts = thoughts.filter((t: any) => t.is_todo);
  const observationThoughts = thoughts.filter((t: any) => !t.is_todo);

  const partner1LoveLang = loveLanguages.find((l: any) => l.user_id === couple?.partner1_id);
  const partner2LoveLang = loveLanguages.find((l: any) => l.user_id === couple?.partner2_id);
  const partner1Attach = attachments.find((a: any) => a.user_id === couple?.partner1_id);
  const partner2Attach = attachments.find((a: any) => a.user_id === couple?.partner2_id);

  const renderProgressBar = (value: number, max: number, color: string) => (
    <View style={[styles.progressBarBg, { backgroundColor: color + "20" }]}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.coupleAvatars}>
        <View style={[styles.avatar, { backgroundColor: Colors.light.accent + "30" }]}>
          <ThemedText type="h4" style={{ color: Colors.light.accent }}>
            {getInitials(partner1Name)}
          </ThemedText>
        </View>
        <View style={[styles.avatar, { backgroundColor: Colors.light.link + "30" }]}>
          <ThemedText type="h4" style={{ color: Colors.light.link }}>
            {getInitials(partner2Name)}
          </ThemedText>
        </View>
      </View>
      <ThemedText type="h3" testID="text-couple-names">
        {partner1Name} {"&"} {partner2Name}
      </ThemedText>
      {couple ? (
        <View style={styles.headerMeta}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  couple.status === "active"
                    ? Colors.light.success + "20"
                    : Colors.light.warning + "20",
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color:
                  couple.status === "active" ? Colors.light.success : Colors.light.warning,
              }}
            >
              {couple.status || "unknown"}
            </ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {"Since " + new Date(couple.created_at).toLocaleDateString()}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.quickActions}>
        <Pressable
          testID="button-message"
          style={[styles.actionBtn, { backgroundColor: Colors.light.link + "15" }]}
          onPress={() => navigation.navigate("TherapistMessages")}
        >
          <Feather name="message-circle" size={16} color={Colors.light.link} />
          <ThemedText type="small" style={{ color: Colors.light.link, marginLeft: Spacing.xs }}>
            Message
          </ThemedText>
        </Pressable>
        <Pressable
          testID="button-add-note"
          style={[styles.actionBtn, { backgroundColor: Colors.light.accent + "15" }]}
          onPress={() => setActiveTab("Thoughts")}
        >
          <Feather name="edit-3" size={16} color={Colors.light.accent} />
          <ThemedText type="small" style={{ color: Colors.light.accent, marginLeft: Spacing.xs }}>
            Add Note
          </ThemedText>
        </Pressable>
        <Pressable
          testID="button-new-session"
          style={[styles.actionBtn, { backgroundColor: Colors.light.success + "15" }]}
          onPress={() => setActiveTab("Notes")}
        >
          <Feather name="file-plus" size={16} color={Colors.light.success} />
          <ThemedText type="small" style={{ color: Colors.light.success, marginLeft: Spacing.xs }}>
            New Session
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabBarScroll}
      contentContainerStyle={styles.tabBarContent}
    >
      {TABS.map((tab) => (
        <Pressable
          key={tab}
          testID={`tab-${tab.toLowerCase().replace(/\s/g, "-")}`}
          onPress={() => {
            impactAsync(ImpactFeedbackStyle.Light);
            setActiveTab(tab);
          }}
          style={[
            styles.tab,
            activeTab === tab
              ? { borderBottomColor: Colors.light.link, backgroundColor: Colors.light.link + "10" }
              : { borderBottomColor: "transparent" },
          ]}
        >
          <ThemedText
            type="small"
            style={
              activeTab === tab
                ? { color: Colors.light.link, fontWeight: "600" }
                : { color: theme.textSecondary }
            }
          >
            {tab}
          </ThemedText>
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderOverview = () => (
    <View>
      <View style={styles.statsGrid}>
        <Card elevation={1} style={styles.statCard}>
          <ThemedText type="h3" style={{ color: Colors.light.link }}>{String(totalCheckins)}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Check-ins</ThemedText>
        </Card>
        <Card elevation={1} style={styles.statCard}>
          <ThemedText type="h3" style={{ color: Colors.light.accent }}>{avgMood}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Avg Mood</ThemedText>
        </Card>
        <Card elevation={1} style={styles.statCard}>
          <ThemedText type="h3" style={{ color: Colors.light.success }}>{avgConnection}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Avg Connection</ThemedText>
        </Card>
        <Card elevation={1} style={styles.statCard}>
          <ThemedText type="h3" style={{ color: Colors.light.warning }}>{String(toolsUsedCount)}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Tools Used</ThemedText>
        </Card>
        <Card elevation={1} style={styles.statCard}>
          <ThemedText type="h3" style={{ color: Colors.light.link }}>{String(daysActive)}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Days Active</ThemedText>
        </Card>
      </View>

      {Object.keys(toolUsageMap).length > 0 ? (
        <Card elevation={1} style={styles.sectionCard}>
          <ThemedText type="h4" style={styles.sectionTitle}>Tool Usage Breakdown</ThemedText>
          {Object.entries(toolUsageMap).map(([name, count]) => (
            <View key={name} style={styles.toolUsageRow}>
              <ThemedText type="body" style={{ flex: 1 }}>{name}</ThemedText>
              <ThemedText type="body" style={{ color: Colors.light.link }}>{String(count)}</ThemedText>
            </View>
          ))}
        </Card>
      ) : null}

      {gratitudeLogs.length > 0 ? (
        <Card elevation={1} style={styles.sectionCard}>
          <ThemedText type="h4" style={styles.sectionTitle}>Recent Gratitude</ThemedText>
          {gratitudeLogs.map((log: any) => (
            <View key={log.id} style={styles.gratitudeItem}>
              <Feather name="heart" size={14} color={Colors.light.accent} />
              <ThemedText type="small" style={{ flex: 1, marginLeft: Spacing.sm }}>
                {log.content}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {new Date(log.created_at).toLocaleDateString()}
              </ThemedText>
            </View>
          ))}
        </Card>
      ) : null}

      <Card elevation={1} style={styles.sectionCard}>
        <ThemedText type="h4" style={styles.sectionTitle}>Latest Mood Scores</ThemedText>
        <View style={styles.moodComparison}>
          <View style={styles.moodPartner}>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
              {partner1Name}
            </ThemedText>
            <View style={[styles.moodCircle, { backgroundColor: Colors.light.accent + "20" }]}>
              <ThemedText type="h2" style={{ color: Colors.light.accent }}>
                {latestMood1 ? String(latestMood1.mood_score) : "-"}
              </ThemedText>
            </View>
            {latestMood1 ? (
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                {new Date(latestMood1.created_at).toLocaleDateString()}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.moodPartner}>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
              {partner2Name}
            </ThemedText>
            <View style={[styles.moodCircle, { backgroundColor: Colors.light.link + "20" }]}>
              <ThemedText type="h2" style={{ color: Colors.light.link }}>
                {latestMood2 ? String(latestMood2.mood_score) : "-"}
              </ThemedText>
            </View>
            {latestMood2 ? (
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                {new Date(latestMood2.created_at).toLocaleDateString()}
              </ThemedText>
            ) : null}
          </View>
        </View>
      </Card>

      {config?.custom_card_content ? (
        <Card elevation={2} style={styles.sectionCard}>
          <View style={styles.therapistCardHeader}>
            <Feather name="user" size={16} color={Colors.light.link} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>From Your Therapist</ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {config.custom_card_content}
          </ThemedText>
        </Card>
      ) : null}
    </View>
  );

  const renderCheckins = () => (
    <View>
      {trendCheckins.length > 1 ? (
        <Card elevation={1} style={styles.sectionCard}>
          <ThemedText type="h4" style={styles.sectionTitle}>Mood Trend (Last 8)</ThemedText>
          <View style={styles.trendContainer}>
            {trendCheckins.map((c: any, idx: number) => {
              const score = c.mood_rating || 0;
              const maxScore = 10;
              const bottomPos = (score / maxScore) * 60;
              return (
                <View key={c.id || idx} style={styles.trendDotWrapper}>
                  <View
                    style={[
                      styles.trendDot,
                      {
                        backgroundColor:
                          score >= 7 ? Colors.light.success : score >= 4 ? Colors.light.warning : Colors.light.error,
                        bottom: bottomPos,
                      },
                    ]}
                  />
                  {idx < trendCheckins.length - 1 ? (
                    <View style={[styles.trendLine, { bottom: bottomPos + 4 }]} />
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}

      {checkins.length === 0 ? (
        <Card elevation={1} style={styles.sectionCard}>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No check-ins recorded yet
          </ThemedText>
        </Card>
      ) : null}

      {checkins.map((checkin: any) => (
        <Card key={checkin.id} elevation={1} style={styles.checkinCard}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {new Date(checkin.created_at).toLocaleDateString()}
          </ThemedText>

          <View style={styles.checkinRow}>
            <ThemedText type="small" style={styles.checkinLabel}>Mood</ThemedText>
            <View style={{ flex: 1 }}>{renderProgressBar(checkin.mood_rating || 0, 10, Colors.light.accent)}</View>
            <ThemedText type="small" style={styles.checkinValue}>{String(checkin.mood_rating || 0)}</ThemedText>
          </View>

          <View style={styles.checkinRow}>
            <ThemedText type="small" style={styles.checkinLabel}>Connection</ThemedText>
            <View style={{ flex: 1 }}>{renderProgressBar(checkin.connection_rating || 0, 10, Colors.light.success)}</View>
            <ThemedText type="small" style={styles.checkinValue}>{String(checkin.connection_rating || 0)}</ThemedText>
          </View>

          <View style={styles.checkinRow}>
            <ThemedText type="small" style={styles.checkinLabel}>Stress</ThemedText>
            <View style={{ flex: 1 }}>{renderProgressBar(checkin.stress_level || 0, 10, Colors.light.warning)}</View>
            <ThemedText type="small" style={styles.checkinValue}>{String(checkin.stress_level || 0)}</ThemedText>
          </View>

          {checkin.reflection ? (
            <View style={styles.reflectionBox}>
              <ThemedText type="small" style={{ color: theme.textSecondary, fontStyle: "italic" }}>
                {checkin.reflection}
              </ThemedText>
            </View>
          ) : null}
        </Card>
      ))}
    </View>
  );

  const renderScoreBreakdown = (scores: any, color: string) => {
    if (!scores || typeof scores !== "object") return null;
    return (
      <View>
        {Object.entries(scores).map(([key, value]) => (
          <View key={key} style={styles.scoreRow}>
            <ThemedText type="small" style={{ flex: 1, textTransform: "capitalize" }}>{key}</ThemedText>
            <View style={{ flex: 1 }}>{renderProgressBar(Number(value) || 0, 100, color)}</View>
            <ThemedText type="small" style={{ width: 30, textAlign: "right" }}>{String(value)}</ThemedText>
          </View>
        ))}
      </View>
    );
  };

  const renderAssessments = () => (
    <View>
      <Card elevation={1} style={styles.sectionCard}>
        <ThemedText type="h4" style={styles.sectionTitle}>Love Languages</ThemedText>
        <View style={styles.comparisonGrid}>
          <View style={styles.comparisonCol}>
            <ThemedText type="body" style={{ color: Colors.light.accent, marginBottom: Spacing.sm, fontWeight: "600" }}>
              {partner1Name}
            </ThemedText>
            {partner1LoveLang ? (
              <View>
                <ThemedText type="small" style={{ marginBottom: Spacing.xs }}>
                  {"Primary: " + (partner1LoveLang.primary_language || "N/A")}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                  {"Secondary: " + (partner1LoveLang.secondary_language || "N/A")}
                </ThemedText>
                {renderScoreBreakdown(partner1LoveLang.scores, Colors.light.accent)}
              </View>
            ) : (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Not taken</ThemedText>
            )}
          </View>
          <View style={styles.comparisonDivider} />
          <View style={styles.comparisonCol}>
            <ThemedText type="body" style={{ color: Colors.light.link, marginBottom: Spacing.sm, fontWeight: "600" }}>
              {partner2Name}
            </ThemedText>
            {partner2LoveLang ? (
              <View>
                <ThemedText type="small" style={{ marginBottom: Spacing.xs }}>
                  {"Primary: " + (partner2LoveLang.primary_language || "N/A")}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                  {"Secondary: " + (partner2LoveLang.secondary_language || "N/A")}
                </ThemedText>
                {renderScoreBreakdown(partner2LoveLang.scores, Colors.light.link)}
              </View>
            ) : (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Not taken</ThemedText>
            )}
          </View>
        </View>
      </Card>

      <Card elevation={1} style={styles.sectionCard}>
        <ThemedText type="h4" style={styles.sectionTitle}>Attachment Styles</ThemedText>
        <View style={styles.comparisonGrid}>
          <View style={styles.comparisonCol}>
            <ThemedText type="body" style={{ color: Colors.light.accent, marginBottom: Spacing.sm, fontWeight: "600" }}>
              {partner1Name}
            </ThemedText>
            {partner1Attach ? (
              <View>
                <View style={[styles.styleBadge, { backgroundColor: Colors.light.accent + "20" }]}>
                  <ThemedText type="small" style={{ color: Colors.light.accent }}>
                    {partner1Attach.attachment_style || "N/A"}
                  </ThemedText>
                </View>
                {renderScoreBreakdown(partner1Attach.scores, Colors.light.accent)}
              </View>
            ) : (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Not taken</ThemedText>
            )}
          </View>
          <View style={styles.comparisonDivider} />
          <View style={styles.comparisonCol}>
            <ThemedText type="body" style={{ color: Colors.light.link, marginBottom: Spacing.sm, fontWeight: "600" }}>
              {partner2Name}
            </ThemedText>
            {partner2Attach ? (
              <View>
                <View style={[styles.styleBadge, { backgroundColor: Colors.light.link + "20" }]}>
                  <ThemedText type="small" style={{ color: Colors.light.link }}>
                    {partner2Attach.attachment_style || "N/A"}
                  </ThemedText>
                </View>
                {renderScoreBreakdown(partner2Attach.scores, Colors.light.link)}
              </View>
            ) : (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Not taken</ThemedText>
            )}
          </View>
        </View>
      </Card>
    </View>
  );

  const renderNotes = () => (
    <View>
      {sessionNotes.length === 0 ? (
        <Card elevation={1} style={styles.sectionCard}>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No session notes yet
          </ThemedText>
        </Card>
      ) : null}

      {sessionNotes.map((note: any) => (
        <Card key={note.id} elevation={1} style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {note.session_date
                ? new Date(note.session_date).toLocaleDateString()
                : new Date(note.created_at).toLocaleDateString()}
            </ThemedText>
            {note.session_type ? (
              <View style={[styles.tagBadge, { backgroundColor: Colors.light.link + "15" }]}>
                <ThemedText type="small" style={{ color: Colors.light.link }}>{note.session_type}</ThemedText>
              </View>
            ) : null}
          </View>
          <ThemedText type="h4" style={{ marginBottom: Spacing.xs }}>{note.title || "Untitled"}</ThemedText>
          <ThemedText
            type="small"
            numberOfLines={2}
            style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}
          >
            {note.content || ""}
          </ThemedText>

          {note.tags && note.tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {note.tags.map((tag: string, i: number) => (
                <View key={i} style={[styles.tagBadge, { backgroundColor: Colors.light.accent + "15" }]}>
                  <ThemedText type="small" style={{ color: Colors.light.accent }}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          {note.homework_assigned ? (
            <View style={styles.homeworkRow}>
              <Feather name="clipboard" size={14} color={Colors.light.warning} />
              <ThemedText
                type="small"
                numberOfLines={1}
                style={{ color: Colors.light.warning, marginLeft: Spacing.xs, flex: 1 }}
              >
                {note.homework_assigned}
              </ThemedText>
            </View>
          ) : null}
        </Card>
      ))}

      <Pressable
        testID="button-view-all-notes"
        style={[styles.viewAllBtn, { backgroundColor: Colors.light.link + "15" }]}
        onPress={() => navigation.navigate("TherapistMessages")}
      >
        <ThemedText type="body" style={{ color: Colors.light.link }}>View All Notes</ThemedText>
        <Feather name="arrow-right" size={18} color={Colors.light.link} />
      </Pressable>
    </View>
  );

  const renderThoughts = () => (
    <View>
      <View style={styles.addThoughtRow}>
        <TextInput
          testID="input-new-thought"
          style={[
            styles.thoughtInput,
            { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
          ]}
          placeholder="Add a quick thought..."
          placeholderTextColor={theme.textSecondary}
          value={newThoughtText}
          onChangeText={setNewThoughtText}
          onSubmitEditing={addThought}
          returnKeyType="done"
        />
        <Pressable
          testID="button-add-thought"
          style={[styles.addThoughtBtn, { backgroundColor: Colors.light.link }]}
          onPress={addThought}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>To-Do Items</ThemedText>
      {todoThoughts.length === 0 ? (
        <Card elevation={1} style={[styles.sectionCard, { marginBottom: Spacing.lg }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No to-do items
          </ThemedText>
        </Card>
      ) : null}
      {todoThoughts.map((t: any) => (
        <Card key={t.id} elevation={1} style={styles.thoughtCard}>
          <Pressable
            testID={`button-toggle-todo-${t.id}`}
            style={styles.thoughtRow}
            onPress={() => toggleThoughtComplete(t)}
          >
            <View
              style={[
                styles.checkbox,
                t.is_completed
                  ? { backgroundColor: Colors.light.success, borderColor: Colors.light.success }
                  : { borderColor: theme.textSecondary },
              ]}
            >
              {t.is_completed ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText
                type="body"
                style={t.is_completed ? { textDecorationLine: "line-through", color: theme.textSecondary } : undefined}
              >
                {t.content}
              </ThemedText>
            </View>
            <View style={styles.thoughtBadges}>
              <View style={[styles.priorityBadge, { backgroundColor: (PRIORITY_COLORS[t.priority] || Colors.light.link) + "20" }]}>
                <ThemedText type="small" style={{ color: PRIORITY_COLORS[t.priority] || Colors.light.link }}>
                  {t.priority || "normal"}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        </Card>
      ))}

      <ThemedText type="h4" style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Observations</ThemedText>
      {observationThoughts.length === 0 ? (
        <Card elevation={1} style={styles.sectionCard}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No observations yet
          </ThemedText>
        </Card>
      ) : null}
      {observationThoughts.map((t: any) => (
        <Card key={t.id} elevation={1} style={styles.thoughtCard}>
          <View style={styles.thoughtRow}>
            <Feather name="eye" size={16} color={CATEGORY_COLORS[t.category] || Colors.light.link} />
            <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm }}>{t.content}</ThemedText>
          </View>
          <View style={styles.thoughtBadges}>
            <View style={[styles.categoryBadge, { backgroundColor: (CATEGORY_COLORS[t.category] || Colors.light.link) + "20" }]}>
              <ThemedText type="small" style={{ color: CATEGORY_COLORS[t.category] || Colors.light.link }}>
                {t.category || "note"}
              </ThemedText>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: (PRIORITY_COLORS[t.priority] || Colors.light.link) + "20" }]}>
              <ThemedText type="small" style={{ color: PRIORITY_COLORS[t.priority] || Colors.light.link }}>
                {t.priority || "normal"}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            {new Date(t.created_at).toLocaleDateString()}
          </ThemedText>
        </Card>
      ))}
    </View>
  );

  const renderConfig = () => (
    <View>
      <Card elevation={1} style={styles.sectionCard}>
        <ThemedText type="h4" style={styles.sectionTitle}>Therapist Card Content</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
          This message will appear on the couple's dashboard
        </ThemedText>
        <TextInput
          testID="input-card-content"
          style={[
            styles.configTextInput,
            { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border },
          ]}
          placeholder="Write a message for this couple..."
          placeholderTextColor={theme.textSecondary}
          value={configCardContent}
          onChangeText={setConfigCardContent}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </Card>

      <Card elevation={1} style={styles.sectionCard}>
        <ThemedText type="h4" style={styles.sectionTitle}>Visible Widgets</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
          Toggle which widgets are visible on the couple's dashboard
        </ThemedText>
        {WIDGET_LIST.map((widget) => (
          <Pressable
            key={widget}
            testID={`toggle-widget-${widget}`}
            style={styles.widgetToggleRow}
            onPress={() => toggleWidget(widget)}
          >
            <View
              style={[
                styles.checkbox,
                configWidgets.includes(widget)
                  ? { backgroundColor: Colors.light.success, borderColor: Colors.light.success }
                  : { borderColor: theme.textSecondary },
              ]}
            >
              {configWidgets.includes(widget) ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
            </View>
            <ThemedText type="body" style={{ flex: 1, textTransform: "capitalize" }}>
              {widget.replace(/-/g, " ")}
            </ThemedText>
          </Pressable>
        ))}
      </Card>

      <Pressable
        testID="button-save-config"
        style={[styles.saveBtn, { backgroundColor: Colors.light.link }]}
        onPress={saveConfig}
        disabled={savingConfig}
      >
        {savingConfig ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.saveBtnContent}>
            <Feather name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Save Configuration</Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "Overview":
        return renderOverview();
      case "Check-ins":
        return renderCheckins();
      case "Assessments":
        return renderAssessments();
      case "Notes":
        return renderNotes();
      case "Thoughts":
        return renderThoughts();
      case "Config":
        return renderConfig();
      default:
        return null;
    }
  };

  return (
    <ScrollView
      testID="couple-detail-screen"
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.link} />
      }
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      {error ? (
        <Card elevation={1} style={styles.errorCard}>
          <Feather name="alert-circle" size={24} color={Colors.light.error} />
          <ThemedText type="body" style={{ color: Colors.light.error, marginTop: Spacing.sm }}>
            {error}
          </ThemedText>
        </Card>
      ) : null}

      {renderHeader()}
      {renderTabBar()}
      <View style={styles.tabContent}>{renderActiveTab()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  errorCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  coupleAvatars: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.xs,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  quickActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  tabBarScroll: {
    marginBottom: Spacing.lg,
    flexGrow: 0,
  },
  tabBarContent: {
    gap: Spacing.xs,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderRadius: BorderRadius.xs,
  },
  tabContent: {
    minHeight: 200,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: "47%",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  toolUsageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.backgroundSecondary,
  },
  gratitudeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  moodComparison: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  moodPartner: {
    alignItems: "center",
    flex: 1,
  },
  moodCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  therapistCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  trendContainer: {
    flexDirection: "row",
    height: 80,
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingTop: Spacing.sm,
  },
  trendDotWrapper: {
    flex: 1,
    alignItems: "center",
    position: "relative",
    height: 80,
  },
  trendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
  },
  trendLine: {
    position: "absolute",
    right: -10,
    width: 20,
    height: 2,
    backgroundColor: Colors.light.link + "40",
  },
  checkinCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
  },
  checkinRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  checkinLabel: {
    width: 80,
    color: Colors.light.textSecondary,
  },
  checkinValue: {
    width: 24,
    textAlign: "right",
  },
  reflectionBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.sm,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  comparisonGrid: {
    flexDirection: "row",
  },
  comparisonCol: {
    flex: 1,
  },
  comparisonDivider: {
    width: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    marginHorizontal: Spacing.md,
  },
  styleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  noteCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tagBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  homeworkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addThoughtRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  thoughtInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  addThoughtBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  thoughtCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  thoughtRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  thoughtBadges: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  configTextInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    minHeight: 100,
    fontSize: 14,
  },
  widgetToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  saveBtn: {
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  saveBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
