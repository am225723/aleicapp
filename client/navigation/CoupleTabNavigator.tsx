import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";

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

const TabColors = {
  background: "#0D0D0F",
  active: "#C9A962",
  inactive: "rgba(255, 255, 255, 0.5)",
  tabBar: "rgba(20, 22, 28, 0.95)",
};

export default function CoupleTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="CoupleHome"
      screenOptions={{
        tabBarActiveTintColor: TabColors.active,
        tabBarInactiveTintColor: TabColors.inactive,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: TabColors.tabBar,
            web: TabColors.tabBar,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 10,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Nunito_600SemiBold",
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="CoupleHome"
        component={CoupleHomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="home" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Connect"
        component={ConnectScreen}
        options={{
          title: "Connect",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="heart" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: "Activities",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="compass" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          title: "Plan",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="calendar" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="CoupleProfile"
        component={CoupleProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="user" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: "rgba(201, 169, 98, 0.15)",
    padding: 8,
    borderRadius: 12,
    marginBottom: -4,
  },
});
