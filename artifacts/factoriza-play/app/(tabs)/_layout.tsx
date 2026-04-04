import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

function StudentTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

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
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={22} />
            ) : (
              <Feather name="home" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="modulos"
        options={{
          title: "Módulos",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="books.vertical" tintColor={color} size={22} />
            ) : (
              <Feather name="book-open" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="comunidad"
        options={{
          title: "Comunidad",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.3" tintColor={color} size={22} />
            ) : (
              <Feather name="users" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="evaluacion"
        options={{
          title: "Evaluación",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="doc.text" tintColor={color} size={22} />
            ) : (
              <Feather name="clipboard" size={21} color={color} />
            ),
        }}
      />
      {/* Hide teacher screen from students */}
      <Tabs.Screen
        name="docente"
        options={{ href: null }}
      />
    </Tabs>
  );
}

function TeacherTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          display: "none",
        },
      }}
    >
      {/* Hide all student tabs from teacher */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="modulos" options={{ href: null }} />
      <Tabs.Screen name="comunidad" options={{ href: null }} />
      <Tabs.Screen name="evaluacion" options={{ href: null }} />
      <Tabs.Screen
        name="docente"
        options={{ title: "Panel Docente" }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { role } = useApp();

  if (role === "teacher") {
    return <TeacherTabLayout />;
  }
  return <StudentTabLayout />;
}
