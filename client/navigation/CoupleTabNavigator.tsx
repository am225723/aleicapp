import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

import CoupleHomeScreen from "@/screens/couple/CoupleHomeScreen";
import ConnectScreen from "@/screens/couple/ConnectScreen";
import ActivitiesScreen from "@/screens/couple/ActivitiesScreen";
import PlanScreen from "@/screens/couple/PlanScreen";
import CoupleProfileScreen from "@/screens/couple/CoupleProfileScreen";

export type CoupleTabParamList = {
  CoupleHome: undefined;
  Connect: undefined;
  Activities: undefined;
  Plan: undefined;
  CoupleProfile: undefined;
};

const Tab = createBottomTabNavigator<CoupleTabParamList>();

export default function CoupleTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="CoupleHome"
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
        name="CoupleHome"
        component={CoupleHomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Connect"
        component={ConnectScreen}
        options={{
          title: "Connect",
          tabBarIcon: ({ color, size }) => (
            <Feather name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: "Activities",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.centerTab,
                {
                  backgroundColor: focused
                    ? Colors.light.accent
                    : Colors.light.link,
                },
              ]}
            >
              <Feather name="zap" size={22} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          title: "Plan",
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CoupleProfile"
        component={CoupleProfileScreen}
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

const styles = StyleSheet.create({
  centerTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
});
