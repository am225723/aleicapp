import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
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

const FONT_LOAD_TIMEOUT = 3000;
const MAX_SPLASH_TIME = 4000;

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
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
    let didFinish = false;

    const forceReady = () => {
      if (!didFinish) {
        didFinish = true;
        setAppIsReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    };

    const maxTimeout = setTimeout(() => {
      console.log("Max splash time reached, forcing app ready");
      forceReady();
    }, MAX_SPLASH_TIME);

    async function prepare() {
      try {
        const timeoutPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log("Font loading timed out, proceeding anyway");
            resolve();
          }, FONT_LOAD_TIMEOUT);
        });

        const fontPromise = new Promise<void>((resolve) => {
          if (fontsLoaded || fontError) {
            resolve();
            return;
          }
          const checkFonts = () => {
            if (fontsLoaded || fontError) {
              resolve();
            } else {
              setTimeout(checkFonts, 100);
            }
          };
          checkFonts();
        });

        await Promise.race([fontPromise, timeoutPromise]);
      } catch (e) {
        console.log("Error during app preparation:", e);
      } finally {
        forceReady();
        clearTimeout(maxTimeout);
      }
    }

    prepare();

    return () => {
      clearTimeout(maxTimeout);
    };
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.root}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
