import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MODULES } from "@/data/modules";
import { ModuleCard } from "@/components/ModuleCard";

export default function ModulosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { unlockedModules, moduleProgress, currentStudent } = useApp();
  const isWeb = Platform.OS === "web";

  const getProgress = (moduleId: string) => {
    const prog = moduleProgress.find((p) => p.moduleId === moduleId);
    if (!prog) return 0;
    const done = currentStudent.completedExercises.filter((id) =>
      id.startsWith(moduleId)
    ).length;
    const total = MODULES.find((m) => m.id === moduleId)?.exercises.length || 5;
    return Math.round((done / total) * 100);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: isWeb ? 67 + 16 : insets.top + 16,
          paddingBottom: isWeb ? 34 + 80 : insets.bottom + 80,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        Módulos de Factorización
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Avanza de nivel en nivel dominando cada método
      </Text>

      <View
        style={[
          styles.infoBox,
          { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" },
        ]}
      >
        <Text style={[styles.infoText, { color: colors.primary }]}>
          🔒 Los módulos se desbloquean cuando tu docente los habilita
        </Text>
      </View>

      <View style={styles.moduleList}>
        {MODULES.map((module, index) => {
          const unlocked = unlockedModules.includes(module.id);
          const progress = getProgress(module.id);
          return (
            <ModuleCard
              key={module.id}
              module={module}
              unlocked={unlocked}
              progress={progress}
              onPress={() => {
                if (unlocked) router.push(`/modulo/${module.id}` as any);
              }}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 14, fontWeight: "400", marginBottom: 16 },
  infoBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: { fontSize: 13, fontWeight: "600" },
  moduleList: {},
});
