import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";

import CoupleHomeScreen from "@/screens/couple/CoupleHomeScreen";
import CalmScreen from "@/screens/couple/CalmScreen";
import ConnectToolsScreen from "@/screens/couple/ConnectToolsScreen";
import DiscoverScreen from "@/screens/couple/DiscoverScreen";
import PlanToolsScreen from "@/screens/couple/PlanToolsScreen";

export type CoupleTabParamList = {
  CoupleHome: undefined;
  Calm: undefined;
  Connect: undefined;
  Discover: undefined;
  Plan: undefined;
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
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="home" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Calm"
        component={CalmScreen}
        options={{
          title: "Calm",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="wind" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Connect"
        component={ConnectToolsScreen}
        options={{
          title: "Connect",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="message-circle" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="search" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanToolsScreen}
        options={{
          title: "Plan",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather name="calendar" size={22} color={color} />
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
