import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { role } = useApp();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  if (role === "teacher") {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
        initialRouteName="docente"
      >
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="modulos" options={{ href: null }} />
        <Tabs.Screen name="comunidad" options={{ href: null }} />
        <Tabs.Screen name="evaluacion" options={{ href: null }} />
        <Tabs.Screen name="docente" options={{ title: "Panel Docente" }} />
      </Tabs>
    );
  }

  // Student layout
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginBottom: isWeb ? 8 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Feather name="home" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="modulos"
        options={{
          title: "Módulos",
          tabBarIcon: ({ color }) => <Feather name="book-open" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="comunidad"
        options={{
          title: "Comunidad",
          tabBarIcon: ({ color }) => <Feather name="users" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="evaluacion"
        options={{
          title: "Evaluación",
          tabBarIcon: ({ color }) => <Feather name="clipboard" size={21} color={color} />,
        }}
      />
      {/* Hide teacher tab from students */}
      <Tabs.Screen name="docente" options={{ href: null }} />
    </Tabs>
  );
}
