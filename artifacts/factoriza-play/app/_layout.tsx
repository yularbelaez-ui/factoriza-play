import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGuard() {
  const { isAuthenticated, role, currentStudent } = useApp();
  const segments = useSegments();

  useEffect(() => {
    const inLoginScreen = segments[0] === "login";
    const inTabs = segments[0] === "(tabs)";
    const inDocente = segments[1] === "docente";
    const inDiagnostico = segments[0] === "diagnostico";

    if (!isAuthenticated && !inLoginScreen) {
      router.replace("/login");
    } else if (isAuthenticated && inLoginScreen) {
      if (role === "teacher") {
        router.replace("/(tabs)/docente");
      } else if (role === "student" && currentStudent && !currentStudent.diagnosticProfile) {
        router.replace("/diagnostico");
      } else {
        router.replace("/(tabs)" as any);
      }
    } else if (isAuthenticated && role === "teacher" && inTabs && !inDocente) {
      router.replace("/(tabs)/docente");
    } else if (
      isAuthenticated &&
      role === "student" &&
      currentStudent &&
      !currentStudent.diagnosticProfile &&
      !inDiagnostico
    ) {
      router.replace("/diagnostico");
    }
  }, [isAuthenticated, role, segments, currentStudent?.diagnosticProfile]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="diagnostico" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="modulo/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="ejercicio/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="evaluacion-modulo/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="practica/[categoria]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
