import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors, CategoryHeroCard } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface LoveLanguageResult {
  primary_language: string;
  secondary_language?: string;
  scores: Record<string, number>;
}

interface AttachmentResult {
  attachment_style: string;
  scores: Record<string, number>;
}

interface EnneagramResult {
  primary_type: number;
  scores: Record<string, number>;
}

interface PartnerData {
  name: string;
  loveLanguage: LoveLanguageResult | null;
  attachment: AttachmentResult | null;
  enneagram: EnneagramResult | null;
}

const LOVE_LANGUAGE_TIPS: Record<string, Record<string, { strength: string; tip: string }>> = {
  "Words of Affirmation": {
    "Words of Affirmation": {
      strength: "You both thrive on verbal encouragement and appreciation",
      tip: "Make daily compliments and affirmations a habit - you'll both feel deeply loved",
    },
    "Quality Time": {
      strength: "One expresses love through words, the other through presence",
      tip: "Combine focused conversations during quality time together",
    },
    "Acts of Service": {
      strength: "Words meet actions - a powerful combination",
      tip: "Say 'thank you' specifically when your partner helps you",
    },
    "Receiving Gifts": {
      strength: "Thoughtful words can accompany meaningful gifts",
      tip: "Write heartfelt notes to go with your partner's gifts",
    },
    "Physical Touch": {
      strength: "Verbal and physical connection complement each other",
      tip: "Whisper affirmations while embracing your partner",
    },
  },
  "Quality Time": {
    "Quality Time": {
      strength: "You both prioritize undivided attention and presence",
      tip: "Schedule regular date nights and protect that time fiercely",
    },
    "Acts of Service": {
      strength: "Time together can include working side by side",
      tip: "Do tasks together - it satisfies both quality time and service",
    },
    "Receiving Gifts": {
      strength: "Experiences together can be the greatest gift",
      tip: "Plan experience-based gifts like trips or activities",
    },
    "Physical Touch": {
      strength: "Being present and physically close is powerful",
      tip: "Hold hands during conversations and quality time",
    },
  },
  "Acts of Service": {
    "Acts of Service": {
      strength: "You both show love through helpful actions",
      tip: "Create a shared task list and take turns helping each other",
    },
    "Receiving Gifts": {
      strength: "Practical help can be a gift in itself",
      tip: "Give gifts that make life easier for your partner",
    },
    "Physical Touch": {
      strength: "Caring actions can include physical comfort",
      tip: "Offer massages or physical care after a long day",
    },
  },
  "Receiving Gifts": {
    "Receiving Gifts": {
      strength: "You both appreciate thoughtful symbols of love",
      tip: "Keep a list of things your partner mentions wanting",
    },
    "Physical Touch": {
      strength: "Physical gifts and touch create tangible love",
      tip: "Give gifts that encourage closeness like matching items",
    },
  },
  "Physical Touch": {
    "Physical Touch": {
      strength: "You both feel most loved through physical connection",
      tip: "Make daily touch rituals like morning hugs or evening cuddles",
    },
  },
};

const ATTACHMENT_DYNAMICS: Record<string, Record<string, { dynamic: string; challenge: string; growth: string }>> = {
  secure: {
    secure: {
      dynamic: "Mutual trust and healthy interdependence",
      challenge: "May take the relationship for granted",
      growth: "Continue nurturing your connection intentionally",
    },
    anxious: {
      dynamic: "Secure partner provides stability and reassurance",
      challenge: "May feel overwhelmed by partner's need for reassurance",
      growth: "Practice consistent communication and patience",
    },
    avoidant: {
      dynamic: "Secure partner models healthy intimacy",
      challenge: "May feel rejected when partner needs space",
      growth: "Respect autonomy while staying emotionally available",
    },
    fearful: {
      dynamic: "Secure partner creates a safe foundation",
      challenge: "Push-pull patterns can be confusing",
      growth: "Offer consistent love without taking distance personally",
    },
  },
  anxious: {
    anxious: {
      dynamic: "Deep emotional connection and understanding",
      challenge: "Can amplify each other's insecurities",
      growth: "Build individual self-soothing skills together",
    },
    avoidant: {
      dynamic: "Classic push-pull dynamic creates intensity",
      challenge: "One pursues while the other withdraws",
      growth: "Meet in the middle - less pursuing, more approaching",
    },
    fearful: {
      dynamic: "Both understand fear of abandonment",
      challenge: "Can trigger each other's wounds",
      growth: "Create clear communication patterns for security",
    },
  },
  avoidant: {
    avoidant: {
      dynamic: "Both value independence and space",
      challenge: "May struggle to build deep emotional intimacy",
      growth: "Schedule dedicated connection time regularly",
    },
    fearful: {
      dynamic: "Both understand the need for boundaries",
      challenge: "May both avoid difficult conversations",
      growth: "Practice small vulnerability exercises together",
    },
  },
  fearful: {
    fearful: {
      dynamic: "Deep understanding of each other's fears",
      challenge: "Can trigger each other into withdrawal",
      growth: "Build trust slowly through consistent actions",
    },
  },
};

const ENNEAGRAM_PAIRINGS: Record<string, { theme: string; strength: string; growth: string }> = {
  "1-1": { theme: "The Principled Partners", strength: "Shared commitment to integrity", growth: "Practice flexibility and self-compassion" },
  "1-2": { theme: "The Idealistic Helpers", strength: "Commitment meets generosity", growth: "Balance giving with receiving" },
  "1-3": { theme: "The Driven Duo", strength: "Excellence and achievement", growth: "Celebrate progress, not just perfection" },
  "1-4": { theme: "Ideals Meet Depth", strength: "High standards with emotional depth", growth: "Embrace imperfection as beauty" },
  "1-5": { theme: "Logic and Order", strength: "Thoughtful and principled", growth: "Share feelings more openly" },
  "1-6": { theme: "Loyal Reformers", strength: "Reliability and responsibility", growth: "Trust each other's judgment" },
  "1-7": { theme: "Structure Meets Freedom", strength: "Balance of discipline and fun", growth: "Find joy in the journey" },
  "1-8": { theme: "Power and Principle", strength: "Strong convictions together", growth: "Soften with each other" },
  "1-9": { theme: "Peace Through Purpose", strength: "Calm integrity", growth: "Address conflicts directly" },
  "2-2": { theme: "The Nurturing Pair", strength: "Deep care for each other", growth: "Ask for help yourselves" },
  "2-3": { theme: "Heart and Achievement", strength: "Support each other's goals", growth: "Connect beyond accomplishments" },
  "2-4": { theme: "Emotional Depth", strength: "Rich emotional understanding", growth: "Balance giving with receiving" },
  "2-5": { theme: "Heart Meets Mind", strength: "Emotional and intellectual balance", growth: "Respect different expression styles" },
  "2-6": { theme: "Loyal Supporters", strength: "Devoted and caring", growth: "Trust in each other's love" },
  "2-7": { theme: "Joy and Generosity", strength: "Fun-loving and caring", growth: "Stay grounded together" },
  "2-8": { theme: "Passionate Protectors", strength: "Fierce love and protection", growth: "Show vulnerability with each other" },
  "2-9": { theme: "Peaceful Hearts", strength: "Harmonious and caring", growth: "Express needs directly" },
  "3-3": { theme: "The Power Couple", strength: "Mutual drive and ambition", growth: "Connect beyond achievements" },
  "3-4": { theme: "Image and Authenticity", strength: "Success with emotional depth", growth: "Embrace authentic feelings" },
  "3-5": { theme: "Competence Partners", strength: "Excellence in different ways", growth: "Share feelings, not just facts" },
  "3-6": { theme: "Achievers with Security", strength: "Success with stability", growth: "Celebrate each other daily" },
  "3-7": { theme: "Enthusiastic Achievers", strength: "Energy and optimism", growth: "Slow down together" },
  "3-8": { theme: "Power Partners", strength: "Leadership and drive", growth: "Show vulnerability to each other" },
  "3-9": { theme: "Drive Meets Peace", strength: "Ambition with harmony", growth: "Both express preferences clearly" },
  "4-4": { theme: "Soulful Connection", strength: "Deep emotional understanding", growth: "Appreciate what you have" },
  "4-5": { theme: "Depth and Insight", strength: "Emotional and intellectual depth", growth: "Share inner worlds more often" },
  "4-6": { theme: "Authentic Security", strength: "Depth with loyalty", growth: "Balance intensity with stability" },
  "4-7": { theme: "Depth Meets Joy", strength: "Emotional richness with optimism", growth: "Embrace both dark and light" },
  "4-8": { theme: "Intensity Partners", strength: "Passionate and authentic", growth: "Soften with each other" },
  "4-9": { theme: "Depth and Peace", strength: "Emotional depth with calm", growth: "Address conflicts openly" },
  "5-5": { theme: "The Intellectuals", strength: "Shared love of learning", growth: "Practice emotional connection" },
  "5-6": { theme: "Thoughtful Security", strength: "Analytical with loyal", growth: "Share feelings more openly" },
  "5-7": { theme: "Curious Minds", strength: "Intellectual curiosity", growth: "Balance thinking with doing" },
  "5-8": { theme: "Power and Wisdom", strength: "Strength with insight", growth: "Share more vulnerability" },
  "5-9": { theme: "Peaceful Thinkers", strength: "Calm intellectual connection", growth: "Express needs actively" },
  "6-6": { theme: "The Committed Duo", strength: "Deep loyalty and trust", growth: "Trust yourselves and each other" },
  "6-7": { theme: "Security Meets Adventure", strength: "Grounded optimism", growth: "Balance caution with spontaneity" },
  "6-8": { theme: "Strength and Loyalty", strength: "Protective partnership", growth: "Soften defenses with each other" },
  "6-9": { theme: "Loyal and Peaceful", strength: "Committed harmony", growth: "Make decisions together" },
  "7-7": { theme: "Adventure Partners", strength: "Joy and spontaneity", growth: "Face difficult feelings together" },
  "7-8": { theme: "Power and Fun", strength: "High energy and enthusiasm", growth: "Slow down and connect deeply" },
  "7-9": { theme: "Easy-going Joy", strength: "Positive and harmonious", growth: "Address problems directly" },
  "8-8": { theme: "Powerful Pair", strength: "Strength and directness", growth: "Practice tenderness with each other" },
  "8-9": { theme: "Strength Meets Peace", strength: "Protection with calm", growth: "Both express needs clearly" },
  "9-9": { theme: "The Peacekeepers", strength: "Harmony and acceptance", growth: "Voice your individual desires" },
};

const TYPE_NAMES: Record<number, string> = {
  1: "Reformer", 2: "Helper", 3: "Achiever", 4: "Individualist", 5: "Investigator",
  6: "Loyalist", 7: "Enthusiast", 8: "Challenger", 9: "Peacemaker",
};

export default function CompatibilityScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { profile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myData, setMyData] = useState<PartnerData | null>(null);
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);

  const loadData = useCallback(async () => {
    if (!profile?.couple_id || !profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: coupleProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("couple_id", profile.couple_id);

      const myProfile = coupleProfiles?.find((p) => p.id === profile.id);
      const partnerProfile = coupleProfiles?.find((p) => p.id !== profile.id);

      const [myLoveLang, myAttachment, myEnneagram] = await Promise.all([
        supabase
          .from("love_language_results")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("attachment_results")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("enneagram_results")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
      ]);

      setMyData({
        name: myProfile?.full_name || "You",
        loveLanguage: myLoveLang.data,
        attachment: myAttachment.data,
        enneagram: myEnneagram.data,
      });

      if (partnerProfile) {
        const [partnerLoveLang, partnerAttachment, partnerEnneagram] = await Promise.all([
          supabase
            .from("love_language_results")
            .select("*")
            .eq("user_id", partnerProfile.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("attachment_results")
            .select("*")
            .eq("user_id", partnerProfile.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from("enneagram_results")
            .select("*")
            .eq("user_id", partnerProfile.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single(),
        ]);

        setPartnerData({
          name: partnerProfile.full_name || "Partner",
          loveLanguage: partnerLoveLang.data,
          attachment: partnerAttachment.data,
          enneagram: partnerEnneagram.data,
        });
      }
    } catch (error) {
      console.log("Error loading compatibility data:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [profile?.couple_id, profile?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getLoveLanguagePairing = () => {
    if (!myData?.loveLanguage?.primary_language || !partnerData?.loveLanguage?.primary_language) {
      return null;
    }
    const myLang = myData.loveLanguage.primary_language;
    const partnerLang = partnerData.loveLanguage.primary_language;
    return LOVE_LANGUAGE_TIPS[myLang]?.[partnerLang] || LOVE_LANGUAGE_TIPS[partnerLang]?.[myLang];
  };

  const getAttachmentPairing = () => {
    if (!myData?.attachment?.attachment_style || !partnerData?.attachment?.attachment_style) {
      return null;
    }
    const myStyle = myData.attachment.attachment_style;
    const partnerStyle = partnerData.attachment.attachment_style;
    return ATTACHMENT_DYNAMICS[myStyle]?.[partnerStyle] || ATTACHMENT_DYNAMICS[partnerStyle]?.[myStyle];
  };

  const getEnneagramPairing = () => {
    if (!myData?.enneagram?.primary_type || !partnerData?.enneagram?.primary_type) {
      return null;
    }
    const type1 = Math.min(myData.enneagram.primary_type, partnerData.enneagram.primary_type);
    const type2 = Math.max(myData.enneagram.primary_type, partnerData.enneagram.primary_type);
    return ENNEAGRAM_PAIRINGS[`${type1}-${type2}`];
  };

  const getCompletionStatus = () => {
    const myComplete = !!(myData?.loveLanguage && myData?.attachment && myData?.enneagram);
    const partnerComplete = !!(partnerData?.loveLanguage && partnerData?.attachment && partnerData?.enneagram);
    return { myComplete, partnerComplete, bothComplete: myComplete && partnerComplete };
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlowBackground />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Analyzing your compatibility...</ThemedText>
        </View>
      </View>
    );
  }

  const { myComplete, partnerComplete, bothComplete } = getCompletionStatus();
  const loveLangPairing = getLoveLanguagePairing();
  const attachmentPairing = getAttachmentPairing();
  const enneagramPairing = getEnneagramPairing();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GlowColors.gold} />}
      >
        <CategoryHeroCard
          title="Compatibility Insights"
          subtitle="How you work best together"
          gradientColors={["rgba(201, 169, 98, 0.4)", "rgba(100, 80, 40, 0.5)", "rgba(13, 13, 15, 0.95)"]}
        />

        {!bothComplete ? (
          <View style={styles.incompleteSection}>
            <GlassCard tone="amber" title="Complete Your Assessments" icon="clipboard">
              <ThemedText style={styles.incompleteText}>
                For full compatibility insights, both partners need to complete:
              </ThemedText>
              <View style={styles.assessmentList}>
                <AssessmentStatus
                  name="Love Language Quiz"
                  myDone={!!myData?.loveLanguage}
                  partnerDone={!!partnerData?.loveLanguage}
                  onPress={() => navigation.navigate("LoveLanguageQuiz")}
                />
                <AssessmentStatus
                  name="Attachment Style"
                  myDone={!!myData?.attachment}
                  partnerDone={!!partnerData?.attachment}
                  onPress={() => navigation.navigate("AttachmentAssessment")}
                />
                <AssessmentStatus
                  name="Enneagram"
                  myDone={!!myData?.enneagram}
                  partnerDone={!!partnerData?.enneagram}
                  onPress={() => navigation.navigate("EnneagramAssessment")}
                />
              </View>
            </GlassCard>
          </View>
        ) : null}

        {myData?.loveLanguage && partnerData?.loveLanguage && loveLangPairing ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Love Languages</ThemedText>
            <GlassCard tone="blue" title="How You Give & Receive Love" icon="heart">
              <View style={styles.pairingHeader}>
                <View style={styles.pairingItem}>
                  <ThemedText style={styles.partnerName}>{myData.name}</ThemedText>
                  <ThemedText style={styles.resultValue}>{myData.loveLanguage.primary_language}</ThemedText>
                </View>
                <Feather name="heart" size={20} color={GlowColors.gold} />
                <View style={styles.pairingItem}>
                  <ThemedText style={styles.partnerName}>{partnerData.name}</ThemedText>
                  <ThemedText style={styles.resultValue}>{partnerData.loveLanguage.primary_language}</ThemedText>
                </View>
              </View>
              <View style={styles.insightBox}>
                <View style={styles.insightRow}>
                  <Feather name="star" size={16} color="#81C995" />
                  <ThemedText style={styles.insightLabel}>Strength</ThemedText>
                </View>
                <ThemedText style={styles.insightText}>{loveLangPairing.strength}</ThemedText>
              </View>
              <View style={styles.insightBox}>
                <View style={styles.insightRow}>
                  <Feather name="zap" size={16} color={GlowColors.gold} />
                  <ThemedText style={styles.insightLabel}>Tip for Connection</ThemedText>
                </View>
                <ThemedText style={styles.insightText}>{loveLangPairing.tip}</ThemedText>
              </View>
            </GlassCard>
          </View>
        ) : null}

        {myData?.attachment && partnerData?.attachment && attachmentPairing ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Attachment Dynamics</ThemedText>
            <GlassCard tone="green" title="How You Connect" icon="link">
              <View style={styles.pairingHeader}>
                <View style={styles.pairingItem}>
                  <ThemedText style={styles.partnerName}>{myData.name}</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {myData.attachment.attachment_style.charAt(0).toUpperCase() +
                      myData.attachment.attachment_style.slice(1)}
                  </ThemedText>
                </View>
                <Feather name="link" size={20} color={GlowColors.gold} />
                <View style={styles.pairingItem}>
                  <ThemedText style={styles.partnerName}>{partnerData.name}</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    {partnerData.attachment.attachment_style.charAt(0).toUpperCase() +
                      partnerData.attachment.attachment_style.slice(1)}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.insightBox}>
                <View style={styles.insightRow}>
                  <Feather name="users" size={16} color="#81C995" />
                  <ThemedText style={styles.insightLabel}>Your Dynamic</ThemedText>
                </View>
                <ThemedText style={styles.insightText}>{attachmentPairing.dynamic}</ThemedText>
              </View>
              <View style={styles.insightBox}>
                <View style={styles.insightRow}>
                  <Feather name="alert-triangle" size={16} color="#E8A59C" />
                  <ThemedText style={styles.insightLabel}>Watch Out For</ThemedText>
                </View>
                <ThemedText style={styles.insightText}>{attachmentPairing.challenge}</ThemedText>
              </View>
              <View style={styles.insightBox}>
                <View style={styles.insightRow}>
                  <Feather name="trending-up" size={16} color={GlowColors.gold} />
                  <ThemedText style={styles.insightLabel}>Growth Together</ThemedText>
                </View>
                <ThemedText style={styles.insightText}>{attachmentPairing.growth}</ThemedText>
              </View>
            </GlassCard>
          </View>
        ) : null}

        {myData?.enneagram && partnerData?.enneagram && enneagramPairing ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Personality Pairing</ThemedText>
            <GlassCard tone="amber" title={enneagramPairing.theme} icon="compass">
              <View style={styles.pairingHeader}>
                <View style={styles.pairingItem}>
                  <ThemedText style={styles.partnerName}>{myData.name}</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    Type {myData.enneagram.primary_type} - {TYPE_NAMES[myData.enneagram.primary_type]}
                  </ThemedText>
                </View>
                <Feather name="compass" size={20} color={GlowColors.gold} />
                <View style={styles.pairingItem}>
                  <ThemedText style={styles.partnerName}>{partnerData.name}</ThemedText>
                  <ThemedText style={styles.resultValue}>
                    Type {partnerData.enneagram.primary_type} - {TYPE_NAMES[partnerData.enneagram.primary_type]}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.insightBox}>
                <View style={styles.insightRow}>
                  <Feather name="star" size={16} color="#81C995" />
                  <ThemedText style={styles.insightLabel}>Your Strength</ThemedText>
                </View>
                <ThemedText style={styles.insightText}>{enneagramPairing.strength}</ThemedText>
              </View>
              <View style={styles.insightBox}>
                <View style={styles.insightRow}>
                  <Feather name="trending-up" size={16} color={GlowColors.gold} />
                  <ThemedText style={styles.insightLabel}>Growth Path</ThemedText>
                </View>
                <ThemedText style={styles.insightText}>{enneagramPairing.growth}</ThemedText>
              </View>
            </GlassCard>
          </View>
        ) : null}

        {bothComplete ? (
          <View style={styles.summarySection}>
            <ThemedText style={styles.sectionTitle}>Working Best Together</ThemedText>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryText}>
                Based on your combined results, focus on these key practices:
              </ThemedText>
              <View style={styles.tipsList}>
                {loveLangPairing ? (
                  <View style={styles.tipItem}>
                    <Feather name="check-circle" size={16} color={GlowColors.gold} />
                    <ThemedText style={styles.tipText}>{loveLangPairing.tip}</ThemedText>
                  </View>
                ) : null}
                {attachmentPairing ? (
                  <View style={styles.tipItem}>
                    <Feather name="check-circle" size={16} color={GlowColors.gold} />
                    <ThemedText style={styles.tipText}>{attachmentPairing.growth}</ThemedText>
                  </View>
                ) : null}
                {enneagramPairing ? (
                  <View style={styles.tipItem}>
                    <Feather name="check-circle" size={16} color={GlowColors.gold} />
                    <ThemedText style={styles.tipText}>{enneagramPairing.growth}</ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function GlassCard({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: string;
  tone: "blue" | "green" | "amber";
  children: React.ReactNode;
}) {
  const TONE_COLORS = {
    blue: {
      outer: ["rgba(130,190,255,0.42)", "rgba(70,120,255,0.10)"],
      inner: ["rgba(255,255,255,0.20)", "rgba(255,255,255,0.05)"],
      glow: "rgba(120, 180, 255, 0.45)",
      bgTint: "rgba(20, 40, 70, 0.35)",
    },
    green: {
      outer: ["rgba(120,255,200,0.38)", "rgba(50,180,140,0.10)"],
      inner: ["rgba(255,255,255,0.20)", "rgba(255,255,255,0.05)"],
      glow: "rgba(120, 255, 200, 0.38)",
      bgTint: "rgba(15, 55, 45, 0.32)",
    },
    amber: {
      outer: ["rgba(255,210,120,0.42)", "rgba(255,140,40,0.10)"],
      inner: ["rgba(255,255,255,0.20)", "rgba(255,255,255,0.05)"],
      glow: "rgba(255, 190, 120, 0.40)",
      bgTint: "rgba(70, 45, 20, 0.34)",
    },
  };

  const c = TONE_COLORS[tone];

  return (
    <View style={[styles.glassCardWrap, { shadowColor: c.glow }]}>
      <LinearGradient colors={c.outer as [string, string]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.glassOuter}>
        <View style={styles.glassClip}>
          <BlurView intensity={28} tint="dark" style={styles.glassBlur}>
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: c.bgTint }]} />
            <LinearGradient
              colors={c.inner as [string, string]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.innerSheen}
            />
            <LinearGradient
              colors={["rgba(255,255,255,0.33)", "rgba(255,255,255,0.0)"]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.2, y: 1 }}
              style={styles.topHighlight}
            />
            <View style={styles.glassHeader}>
              <View style={styles.glassIcon}>
                <Feather name={icon as any} size={20} color="rgba(255,255,255,0.9)" />
              </View>
              <ThemedText style={styles.glassTitle}>{title}</ThemedText>
            </View>
            <View style={styles.glassBody}>{children}</View>
          </BlurView>
        </View>
      </LinearGradient>
    </View>
  );
}

function AssessmentStatus({
  name,
  myDone,
  partnerDone,
  onPress,
}: {
  name: string;
  myDone: boolean;
  partnerDone: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.assessmentRow} onPress={onPress}>
      <ThemedText style={styles.assessmentName}>{name}</ThemedText>
      <View style={styles.assessmentIcons}>
        <View style={[styles.statusDot, myDone && styles.statusDotDone]}>
          <ThemedText style={styles.statusDotText}>You</ThemedText>
        </View>
        <View style={[styles.statusDot, partnerDone && styles.statusDotDone]}>
          <ThemedText style={styles.statusDotText}>Partner</ThemedText>
        </View>
      </View>
      {!myDone ? <Feather name="chevron-right" size={18} color={GlowColors.gold} /> : null}
    </Pressable>
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
    paddingTop: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: GlowColors.textSecondary,
    fontSize: 16,
  },
  incompleteSection: {
    marginBottom: Spacing.lg,
  },
  incompleteText: {
    color: GlowColors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  assessmentList: {
    gap: Spacing.sm,
  },
  assessmentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  assessmentName: {
    flex: 1,
    color: GlowColors.textPrimary,
    fontSize: 14,
  },
  assessmentIcons: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  statusDot: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  statusDotDone: {
    backgroundColor: "rgba(129, 201, 149, 0.3)",
  },
  statusDotText: {
    color: GlowColors.textSecondary,
    fontSize: 10,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: GlowColors.textPrimary,
    marginBottom: Spacing.md,
  },
  glassCardWrap: {
    borderRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  glassOuter: {
    borderRadius: 22,
    padding: 1.25,
  },
  glassClip: {
    borderRadius: 22,
    overflow: "hidden",
  },
  glassBlur: {
    borderRadius: 22,
    padding: Spacing.lg,
  },
  innerSheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
  topHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 18,
    opacity: 0.7,
  },
  glassHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  glassIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  glassTitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
  },
  glassBody: {
    gap: Spacing.md,
  },
  pairingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pairingItem: {
    flex: 1,
    alignItems: "center",
  },
  partnerName: {
    color: GlowColors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  resultValue: {
    color: GlowColors.textPrimary,
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
  },
  insightBox: {
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  insightLabel: {
    color: GlowColors.textSecondary,
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  insightText: {
    color: GlowColors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  summarySection: {
    marginTop: Spacing.md,
  },
  summaryCard: {
    backgroundColor: GlowColors.cardBrown,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(201, 169, 98, 0.3)",
  },
  summaryText: {
    color: GlowColors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  tipsList: {
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  tipText: {
    flex: 1,
    color: GlowColors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
});
