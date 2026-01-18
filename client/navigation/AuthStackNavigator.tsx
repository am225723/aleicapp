import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "@/screens/auth/LoginScreen";
import CoupleSignupScreen from "@/screens/auth/CoupleSignupScreen";
import TherapistSignupScreen from "@/screens/auth/TherapistSignupScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type AuthStackParamList = {
  Login: undefined;
  CoupleSignup: undefined;
  TherapistSignup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CoupleSignup"
        component={CoupleSignupScreen}
        options={{ headerTitle: "Join as a Couple" }}
      />
      <Stack.Screen
        name="TherapistSignup"
        component={TherapistSignupScreen}
        options={{ headerTitle: "Join as a Therapist" }}
      />
    </Stack.Navigator>
  );
}
