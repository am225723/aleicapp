import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/theme";

import TherapistDashboardScreen from "@/screens/therapist/TherapistDashboardScreen";
import CouplesListScreen from "@/screens/therapist/CouplesListScreen";
import ManageInvitesScreen from "@/screens/therapist/ManageInvitesScreen";
import TherapistProfileScreen from "@/screens/therapist/TherapistProfileScreen";

export type TherapistTabParamList = {
  Dashboard: undefined;
  CouplesList: undefined;
  ManageInvites: undefined;
  TherapistProfile: undefined;
};

const Tab = createBottomTabNavigator<TherapistTabParamList>();

export default function TherapistTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        tabBarActiveTintColor: Colors.light.link,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={TherapistDashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CouplesList"
        component={CouplesListScreen}
        options={{
          title: "Couples",
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageInvites"
        component={ManageInvitesScreen}
        options={{
          title: "Invites",
          tabBarIcon: ({ color, size }) => (
            <Feather name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TherapistProfile"
        component={TherapistProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});
