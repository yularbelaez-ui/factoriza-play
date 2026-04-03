import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Inicio</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="modulos">
        <Icon sf={{ default: "books.vertical", selected: "books.vertical.fill" }} />
        <Label>Módulos</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="comunidad">
        <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
        <Label>Comunidad</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="evaluacion">
        <Icon sf={{ default: "doc.text", selected: "doc.text.fill" }} />
        <Label>Evaluación</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="docente">
        <Icon sf={{ default: "person.badge.key", selected: "person.badge.key.fill" }} />
        <Label>Docente</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
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
      <Tabs.Screen
        name="docente"
        options={{
          title: "Docente",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.badge.key" tintColor={color} size={22} />
            ) : (
              <Feather name="briefcase" size={21} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
