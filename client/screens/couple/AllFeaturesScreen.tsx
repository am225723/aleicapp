import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlowBackground, GlowColors } from "@/components/GlowWidget";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuth } from "@/contexts/AuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FeatureItem {
  name: string;
  route: keyof RootStackParamList;
  icon: keyof typeof Feather.glyphMap;
  category: string;
  description: string;
}

const ALL_FEATURES: FeatureItem[] = [
  { name: "Pause Button", route: "PauseButton", icon: "pause-circle", category: "Calm", description: "Guided breathing exercises" },
  { name: "Meditation Library", route: "MeditationLibrary", icon: "sun", category: "Calm", description: "Mindfulness for couples" },
  { name: "Weekly Check-in", route: "WeeklyCheckin", icon: "check-square", category: "Calm", description: "Rate your connection" },
  { name: "Voice Memos", route: "VoiceMemos", icon: "mic", category: "Calm", description: "Send loving messages" },
  { name: "Gratitude Log", route: "AddGratitude", icon: "gift", category: "Calm", description: "Share appreciation" },
  { name: "Journal", route: "AddJournal", icon: "book-open", category: "Calm", description: "Record reflections" },
  { name: "Mood Tracker", route: "MoodTracker", icon: "smile", category: "Calm", description: "Track daily moods" },
  
  { name: "Echo & Empathy", route: "EchoEmpathy", icon: "message-circle", category: "Connect", description: "Active listening practice" },
  { name: "Hold Me Tight", route: "HoldMeTight", icon: "heart", category: "Connect", description: "EFT conversation" },
  { name: "Demon Dialogues", route: "DemonDialogues", icon: "repeat", category: "Connect", description: "Identify negative cycles" },
  { name: "Four Horsemen", route: "FourHorsemen", icon: "alert-triangle", category: "Connect", description: "Track conflict patterns" },
  { name: "Therapist Messages", route: "Messages", icon: "mail", category: "Connect", description: "Chat with therapist" },
  { name: "Intimacy Map", route: "IntimacyMapping", icon: "layers", category: "Connect", description: "Explore preferences" },
  { name: "Conflict Resolution", route: "ConflictResolution", icon: "flag", category: "Connect", description: "Resolve issues together" },
  
  { name: "Love Language Quiz", route: "LoveLanguageQuiz", icon: "heart", category: "Discover", description: "Find your love language" },
  { name: "Attachment Style", route: "AttachmentStyle", icon: "shield", category: "Discover", description: "Discover your style" },
  { name: "Attachment Assessment", route: "AttachmentAssessment", icon: "clipboard", category: "Discover", description: "Take the assessment" },
  { name: "Enneagram", route: "Enneagram", icon: "target", category: "Discover", description: "Personality type" },
  { name: "Enneagram Assessment", route: "EnneagramAssessment", icon: "edit", category: "Discover", description: "Take the test" },
  { name: "Love Map Quiz", route: "LoveMapQuiz", icon: "map", category: "Discover", description: "Gottman method quiz" },
  { name: "IFS Introduction", route: "IFSIntro", icon: "users", category: "Discover", description: "Parts work intro" },
  { name: "IFS Session", route: "IFS", icon: "user", category: "Discover", description: "Full IFS session" },
  { name: "Values & Vision", route: "ValuesVision", icon: "compass", category: "Discover", description: "What matters most" },
  { name: "Compatibility", route: "Compatibility", icon: "heart", category: "Discover", description: "How you work together" },
  
  { name: "Shared Goals", route: "SharedGoals", icon: "target", category: "Plan", description: "Track dreams together" },
  { name: "Date Night", route: "DateNight", icon: "heart", category: "Plan", description: "AI-powered ideas" },
  { name: "Rituals", route: "AddRitual", icon: "star", category: "Plan", description: "Daily connection habits" },
  { name: "Calendar", route: "Calendar", icon: "calendar", category: "Plan", description: "Shared schedule" },
  { name: "Parenting Partners", route: "ParentingPartners", icon: "users", category: "Plan", description: "Align on family" },
  { name: "Financial Toolkit", route: "FinancialToolkit", icon: "dollar-sign", category: "Plan", description: "Money conversations" },
  { name: "Chore Chart", route: "ChoreChart", icon: "check-square", category: "Plan", description: "Household tasks" },
  { name: "Growth Plan", route: "GrowthPlan", icon: "trending-up", category: "Plan", description: "Milestones together" },
  { name: "Daily Suggestion", route: "DailySuggestion", icon: "zap", category: "Plan", description: "Relationship tips" },
  
  { name: "Analytics", route: "Analytics", icon: "bar-chart-2", category: "Tools", description: "Insights and trends" },
  { name: "Check-in History", route: "CheckinHistory", icon: "clock", category: "Tools", description: "Past check-ins" },
  { name: "Progress Timeline", route: "ProgressTimeline", icon: "trending-up", category: "Tools", description: "Your journey" },
  { name: "Settings", route: "Settings", icon: "settings", category: "Tools", description: "App preferences" },
  { name: "Profile", route: "CoupleProfile", icon: "user", category: "Tools", description: "Your account" },
  { name: "Couple Setup", route: "CoupleSetup", icon: "link", category: "Tools", description: "Link with partner" },
  
  { name: "Admin Dashboard", route: "AdminDashboard", icon: "shield", category: "Admin", description: "System overview" },
  { name: "Therapist Management", route: "AdminTherapistManagement", icon: "briefcase", category: "Admin", description: "Manage therapists" },
  { name: "User Management", route: "AdminUserManagement", icon: "users", category: "Admin", description: "Manage users" },
];

const CATEGORIES = ["All", "Calm", "Connect", "Discover", "Plan", "Tools", "Admin"];

export default function AllFeaturesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFeatures = ALL_FEATURES.filter((feature) => {
    const matchesSearch = feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNavigate = (route: keyof RootStackParamList) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(route as any);
  };

  const FeatureCard = ({ feature }: { feature: FeatureItem }) => (
    <Pressable
      style={styles.featureCard}
      onPress={() => handleNavigate(feature.route)}
    >
      <View style={[styles.featureIcon, { backgroundColor: `${GlowColors.gold}20` }]}>
        <Feather name={feature.icon} size={20} color={GlowColors.gold} />
      </View>
      <View style={styles.featureContent}>
        <ThemedText style={styles.featureName}>{feature.name}</ThemedText>
        <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
      </View>
      <View style={styles.categoryBadge}>
        <ThemedText style={styles.categoryBadgeText}>{feature.category}</ThemedText>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlowBackground />

      <View style={styles.header}>
        <ThemedText style={styles.title}>All Features</ThemedText>
        <ThemedText style={styles.subtitle}>
          {filteredFeatures.length} features available
        </ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={GlowColors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search features..."
          placeholderTextColor={GlowColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={18} color={GlowColors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
        showsHorizontalScrollIndicator={false}
      >
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(category);
            }}
          >
            <ThemedText
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredFeatures.map((feature, index) => (
          <FeatureCard key={`${feature.route}-${index}`} feature={feature} />
        ))}

        {filteredFeatures.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color={GlowColors.textSecondary} />
            <ThemedText style={styles.emptyText}>No features found</ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlowColors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: GlowColors.gold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: GlowColors.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(201, 169, 98, 0.2)",
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: GlowColors.textPrimary,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: GlowColors.cardDark,
    borderWidth: 1,
    borderColor: "rgba(201, 169, 98, 0.2)",
  },
  categoryChipActive: {
    backgroundColor: GlowColors.gold,
    borderColor: GlowColors.gold,
  },
  categoryChipText: {
    fontSize: 14,
    color: GlowColors.textSecondary,
  },
  categoryChipTextActive: {
    color: GlowColors.background,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    marginTop: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: GlowColors.cardDark,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(201, 169, 98, 0.2)",
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureName: {
    fontSize: 16,
    fontWeight: "600",
    color: GlowColors.textPrimary,
  },
  featureDescription: {
    fontSize: 13,
    color: GlowColors.textSecondary,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: `${GlowColors.gold}20`,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: GlowColors.gold,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: GlowColors.textSecondary,
    marginTop: Spacing.md,
  },
});
