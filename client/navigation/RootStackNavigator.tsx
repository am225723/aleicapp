import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useScreenOptions } from "@/hooks/useScreenOptions";

import AuthStackNavigator from "@/navigation/AuthStackNavigator";
import CoupleTabNavigator from "@/navigation/CoupleTabNavigator";
import TherapistTabNavigator from "@/navigation/TherapistTabNavigator";

import PauseButtonScreen from "@/screens/tools/PauseButtonScreen";
import EchoEmpathyScreen from "@/screens/tools/EchoEmpathyScreen";
import HoldMeTightScreen from "@/screens/tools/HoldMeTightScreen";
import WeeklyCheckinScreen from "@/screens/tools/WeeklyCheckinScreen";
import FourHorsemenScreen from "@/screens/tools/FourHorsemenScreen";
import AddGratitudeScreen from "@/screens/couple/AddGratitudeScreen";
import AddJournalScreen from "@/screens/couple/AddJournalScreen";
import AddRitualScreen from "@/screens/couple/AddRitualScreen";
import MessagesScreen from "@/screens/couple/MessagesScreen";
import LoveLanguageQuizScreen from "@/screens/couple/LoveLanguageQuizScreen";
import CalendarScreen from "@/screens/couple/CalendarScreen";
import CoupleDetailScreen from "@/screens/therapist/CoupleDetailScreen";

import VoiceMemosScreen from "@/screens/tools/VoiceMemosScreen";
import SharedGoalsScreen from "@/screens/tools/SharedGoalsScreen";
import DemonDialoguesScreen from "@/screens/tools/DemonDialoguesScreen";
import AttachmentAssessmentScreen from "@/screens/tools/AttachmentAssessmentScreen";
import AttachmentStyleScreen from "@/screens/tools/AttachmentStyleScreen";
import EnneagramAssessmentScreen from "@/screens/tools/EnneagramAssessmentScreen";
import EnneagramScreen from "@/screens/tools/EnneagramScreen";
import IFSIntroScreen from "@/screens/tools/IFSIntroScreen";
import IFSScreen from "@/screens/tools/IFSScreen";
import IntimacyMappingScreen from "@/screens/tools/IntimacyMappingScreen";
import LoveMapQuizScreen from "@/screens/tools/LoveMapQuizScreen";
import MeditationLibraryScreen from "@/screens/tools/MeditationLibraryScreen";
import ParentingPartnersScreen from "@/screens/tools/ParentingPartnersScreen";
import FinancialToolkitScreen from "@/screens/tools/FinancialToolkitScreen";
import ValuesVisionScreen from "@/screens/tools/ValuesVisionScreen";
import TherapistMessagesScreen from "@/screens/therapist/TherapistMessagesScreen";
import DateNightScreen from "@/screens/couple/DateNightScreen";
import CoupleProfileScreen from "@/screens/couple/CoupleProfileScreen";

import AnalyticsScreen from "@/screens/couple/AnalyticsScreen";
import CheckinHistoryScreen from "@/screens/couple/CheckinHistoryScreen";
import SettingsScreen from "@/screens/couple/SettingsScreen";
import GrowthPlanScreen from "@/screens/couple/GrowthPlanScreen";
import ProgressTimelineScreen from "@/screens/couple/ProgressTimelineScreen";
import DailySuggestionScreen from "@/screens/couple/DailySuggestionScreen";
import MoodTrackerScreen from "@/screens/tools/MoodTrackerScreen";
import ConflictResolutionScreen from "@/screens/tools/ConflictResolutionScreen";
import CompatibilityScreen from "@/screens/tools/CompatibilityScreen";
import ChoreChartScreen from "@/screens/tools/ChoreChartScreen";
import CoupleSetupScreen from "@/screens/auth/CoupleSetupScreen";
import AdminDashboardScreen from "@/screens/admin/AdminDashboardScreen";
import TherapistManagementScreen from "@/screens/admin/TherapistManagementScreen";
import UserManagementScreen from "@/screens/admin/UserManagementScreen";

export type RootStackParamList = {
  Auth: undefined;
  CoupleTabs: undefined;
  TherapistTabs: undefined;
  PauseButton: undefined;
  EchoEmpathy: undefined;
  HoldMeTight: undefined;
  WeeklyCheckin: undefined;
  FourHorsemen: undefined;
  AddGratitude: undefined;
  AddJournal: undefined;
  AddRitual: undefined;
  Messages: undefined;
  LoveLanguageQuiz: undefined;
  Calendar: undefined;
  CoupleDetail: { coupleId: string };
  VoiceMemos: undefined;
  SharedGoals: undefined;
  DemonDialogues: undefined;
  AttachmentAssessment: undefined;
  AttachmentStyle: undefined;
  EnneagramAssessment: undefined;
  Enneagram: undefined;
  IFSIntro: undefined;
  IFS: undefined;
  IntimacyMapping: undefined;
  LoveMapQuiz: undefined;
  MeditationLibrary: undefined;
  ParentingPartners: undefined;
  FinancialToolkit: undefined;
  ValuesVision: undefined;
  TherapistMessages: undefined;
  DateNight: undefined;
  CoupleProfile: undefined;
  Analytics: undefined;
  CheckinHistory: undefined;
  Settings: undefined;
  GrowthPlan: undefined;
  ProgressTimeline: undefined;
  DailySuggestion: undefined;
  MoodTracker: undefined;
  ConflictResolution: undefined;
  Compatibility: undefined;
  ChoreChart: undefined;
  CoupleSetup: undefined;
  AdminDashboard: undefined;
  AdminTherapistManagement: undefined;
  AdminUserManagement: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { session, profile, isLoading } = useAuth();
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!session || !profile ? (
        <Stack.Screen
          name="Auth"
          component={AuthStackNavigator}
          options={{ headerShown: false }}
        />
      ) : profile.role === "therapist" ? (
        <>
          <Stack.Screen
            name="TherapistTabs"
            component={TherapistTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CoupleDetail"
            component={CoupleDetailScreen}
            options={{ headerTitle: "Couple Details" }}
          />
          <Stack.Screen
            name="TherapistMessages"
            component={TherapistMessagesScreen}
            options={{ headerTitle: "Messages" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="CoupleTabs"
            component={CoupleTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PauseButton"
            component={PauseButtonScreen}
            options={{
              presentation: "modal",
              headerTitle: "Pause",
            }}
          />
          <Stack.Screen
            name="EchoEmpathy"
            component={EchoEmpathyScreen}
            options={{
              presentation: "modal",
              headerTitle: "Echo & Empathy",
            }}
          />
          <Stack.Screen
            name="HoldMeTight"
            component={HoldMeTightScreen}
            options={{
              presentation: "modal",
              headerTitle: "Hold Me Tight",
            }}
          />
          <Stack.Screen
            name="WeeklyCheckin"
            component={WeeklyCheckinScreen}
            options={{
              presentation: "modal",
              headerTitle: "Weekly Check-in",
            }}
          />
          <Stack.Screen
            name="AddGratitude"
            component={AddGratitudeScreen}
            options={{
              presentation: "modal",
              headerTitle: "Add Gratitude",
            }}
          />
          <Stack.Screen
            name="AddJournal"
            component={AddJournalScreen}
            options={{
              presentation: "modal",
              headerTitle: "New Journal Entry",
            }}
          />
          <Stack.Screen
            name="AddRitual"
            component={AddRitualScreen}
            options={{
              presentation: "modal",
              headerTitle: "Add Ritual",
            }}
          />
          <Stack.Screen
            name="FourHorsemen"
            component={FourHorsemenScreen}
            options={{
              presentation: "modal",
              headerTitle: "Four Horsemen",
            }}
          />
          <Stack.Screen
            name="Messages"
            component={MessagesScreen}
            options={{
              headerTitle: "Messages",
            }}
          />
          <Stack.Screen
            name="LoveLanguageQuiz"
            component={LoveLanguageQuizScreen}
            options={{
              headerTitle: "Love Languages",
            }}
          />
          <Stack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              headerTitle: "Calendar",
            }}
          />
          <Stack.Screen
            name="VoiceMemos"
            component={VoiceMemosScreen}
            options={{ headerTitle: "Voice Memos" }}
          />
          <Stack.Screen
            name="SharedGoals"
            component={SharedGoalsScreen}
            options={{ headerTitle: "Shared Goals" }}
          />
          <Stack.Screen
            name="DemonDialogues"
            component={DemonDialoguesScreen}
            options={{ headerTitle: "Demon Dialogues" }}
          />
          <Stack.Screen
            name="AttachmentAssessment"
            component={AttachmentAssessmentScreen}
            options={{ headerTitle: "Attachment Assessment" }}
          />
          <Stack.Screen
            name="AttachmentStyle"
            component={AttachmentStyleScreen}
            options={{ headerTitle: "Attachment Styles" }}
          />
          <Stack.Screen
            name="EnneagramAssessment"
            component={EnneagramAssessmentScreen}
            options={{ headerTitle: "Enneagram Assessment" }}
          />
          <Stack.Screen
            name="Enneagram"
            component={EnneagramScreen}
            options={{ headerTitle: "Enneagram" }}
          />
          <Stack.Screen
            name="IFSIntro"
            component={IFSIntroScreen}
            options={{ headerTitle: "Internal Family Systems" }}
          />
          <Stack.Screen
            name="IFS"
            component={IFSScreen}
            options={{ headerTitle: "Parts Work" }}
          />
          <Stack.Screen
            name="IntimacyMapping"
            component={IntimacyMappingScreen}
            options={{ headerTitle: "Intimacy Mapping" }}
          />
          <Stack.Screen
            name="LoveMapQuiz"
            component={LoveMapQuizScreen}
            options={{ headerTitle: "Love Map Quiz" }}
          />
          <Stack.Screen
            name="MeditationLibrary"
            component={MeditationLibraryScreen}
            options={{ headerTitle: "Meditation" }}
          />
          <Stack.Screen
            name="ParentingPartners"
            component={ParentingPartnersScreen}
            options={{ headerTitle: "Parenting Partners" }}
          />
          <Stack.Screen
            name="FinancialToolkit"
            component={FinancialToolkitScreen}
            options={{ headerTitle: "Financial Toolkit" }}
          />
          <Stack.Screen
            name="ValuesVision"
            component={ValuesVisionScreen}
            options={{ headerTitle: "Values & Vision" }}
          />
          <Stack.Screen
            name="DateNight"
            component={DateNightScreen}
            options={{ headerTitle: "Date Night Generator" }}
          />
          <Stack.Screen
            name="CoupleProfile"
            component={CoupleProfileScreen}
            options={{ headerTitle: "Profile" }}
          />
          <Stack.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{ headerTitle: "Analytics" }}
          />
          <Stack.Screen
            name="CheckinHistory"
            component={CheckinHistoryScreen}
            options={{ headerTitle: "Check-in History" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerTitle: "Settings" }}
          />
          <Stack.Screen
            name="GrowthPlan"
            component={GrowthPlanScreen}
            options={{ headerTitle: "Growth Plan" }}
          />
          <Stack.Screen
            name="ProgressTimeline"
            component={ProgressTimelineScreen}
            options={{ headerTitle: "Progress Timeline" }}
          />
          <Stack.Screen
            name="DailySuggestion"
            component={DailySuggestionScreen}
            options={{ headerTitle: "Daily Suggestion" }}
          />
          <Stack.Screen
            name="MoodTracker"
            component={MoodTrackerScreen}
            options={{ headerTitle: "Mood Tracker" }}
          />
          <Stack.Screen
            name="ConflictResolution"
            component={ConflictResolutionScreen}
            options={{ headerTitle: "Conflict Resolution" }}
          />
          <Stack.Screen
            name="Compatibility"
            component={CompatibilityScreen}
            options={{ headerTitle: "Compatibility" }}
          />
          <Stack.Screen
            name="ChoreChart"
            component={ChoreChartScreen}
            options={{ headerTitle: "Chore Chart" }}
          />
          <Stack.Screen
            name="CoupleSetup"
            component={CoupleSetupScreen}
            options={{ headerTitle: "Link Partner" }}
          />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{ headerTitle: "Admin Dashboard" }}
          />
          <Stack.Screen
            name="AdminTherapistManagement"
            component={TherapistManagementScreen}
            options={{ headerTitle: "Manage Therapists" }}
          />
          <Stack.Screen
            name="AdminUserManagement"
            component={UserManagementScreen}
            options={{ headerTitle: "Manage Users" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
