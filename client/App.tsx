import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { GreatVibes_400Regular } from "@expo-google-fonts/great-vibes";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

const FONT_LOAD_TIMEOUT = 10000;

export default function App() {
  const [fontTimedOut, setFontTimedOut] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    GreatVibes_400Regular,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Font loading timed out, proceeding anyway");
      setFontTimedOut(true);
    }, FONT_LOAD_TIMEOUT);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const shouldHideSplash = fontsLoaded || fontError || fontTimedOut;
    
    if (shouldHideSplash) {
      SplashScreen.hideAsync().catch((err) => {
        console.log("Error hiding splash screen:", err);
      });
    }
  }, [fontsLoaded, fontError, fontTimedOut]);

  const readyToRender = fontsLoaded || fontError || fontTimedOut;

  if (!readyToRender) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
              <KeyboardProvider>
                <NavigationContainer>
                  <RootStackNavigator />
                </NavigationContainer>
                <StatusBar style="auto" />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
