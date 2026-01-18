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
