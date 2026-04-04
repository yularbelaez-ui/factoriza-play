import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MODULES } from "@/data/modules";

// Divide exercises into 3 levels
function getExerciseLevels(exercises: typeof MODULES[0]["exercises"]) {
  const perLevel = Math.ceil(exercises.length / 3);
  return [
    exercises.slice(0, perLevel),
    exercises.slice(perLevel, perLevel * 2),
    exercises.slice(perLevel * 2),
  ].filter((l) => l.length > 0);
}

export default function ModuloScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { markTheoryRead, currentStudent, moduleProgress } = useApp();
  const isWeb = Platform.OS === "web";
  const [theoryExpanded, setTheoryExpanded] = useState<string[]>([]);

  const module = MODULES.find((m) => m.id === id);
  if (!module) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Módulo no encontrado</Text>
      </View>
    );
  }

  const prog = moduleProgress.find((p) => p.moduleId === module.id);
  const completedLevels = prog?.completedLevels || [];
  const exerciseLevels = getExerciseLevels(module.exercises);

  // A level is unlocked if it's level 0, or if the previous level is completed
  const isLevelUnlocked = (levelIdx: number) => {
    if (levelIdx === 0) return true;
    return completedLevels.includes(levelIdx - 1);
  };

  // A level is completed if all its exercises are done by the student
  const isLevelCompleted = (levelIdx: number) => {
    return completedLevels.includes(levelIdx);
  };

  const completedExIds = new Set(currentStudent?.completedExercises || []);

  const getLevelProgress = (levelIdx: number) => {
    const exs = exerciseLevels[levelIdx];
    const done = exs.filter((e) => completedExIds.has(e.id)).length;
    return { done, total: exs.length };
  };

  const toggleTheory = (tid: string) => {
    setTheoryExpanded((prev) =>
      prev.includes(tid) ? prev.filter((t) => t !== tid) : [...prev, tid]
    );
  };

  const LEVEL_NAMES = ["Nivel Básico", "Nivel Intermedio", "Nivel Avanzado"];
  const LEVEL_ICONS = ["🌱", "🌿", "🌳"];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: isWeb ? 67 + 16 : insets.top + 16,
          paddingBottom: isWeb ? 34 + 32 : insets.bottom + 32,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="chevron-left" size={22} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Módulos</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: module.color, shadowColor: module.color }]}>
        <Text style={styles.headerIcon}>{module.icon}</Text>
        <View style={styles.headerTextArea}>
          <Text style={styles.headerLevel}>Nivel {module.level}</Text>
          <Text style={styles.headerTitle}>{module.title}</Text>
          <Text style={styles.headerSub}>{module.subtitle}</Text>
        </View>
        <View style={[styles.xpBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={styles.xpText}>+{module.xpReward} XP</Text>
        </View>
      </View>

      {/* Real world */}
      <View style={[styles.realWorldCard, { backgroundColor: module.color + "10", borderColor: module.color + "30" }]}>
        <Feather name="globe" size={15} color={module.color} />
        <Text style={[styles.realWorldText, { color: colors.foreground }]}>
          <Text style={{ fontWeight: "700" }}>Aplicación real: </Text>
          {module.realWorldExample}
        </Text>
      </View>

      {/* Theory */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📖 Teoría</Text>
      {module.theory.map((theory) => (
        <View key={theory.id} style={[styles.theoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.theoryHeader} onPress={() => toggleTheory(theory.id)}>
            <Text style={[styles.theoryTitle, { color: colors.foreground }]}>{theory.title}</Text>
            <Feather name={theoryExpanded.includes(theory.id) ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
          {theoryExpanded.includes(theory.id) && (
            <View style={styles.theoryBody}>
              <Text style={[styles.theoryContent, { color: colors.foreground }]}>{theory.content}</Text>
              {theory.formula && (
                <View style={[styles.formulaBox, { backgroundColor: module.color + "10", borderColor: module.color + "40" }]}>
                  <Text style={styles.boxLabel}>📐 Fórmula:</Text>
                  <Text style={[styles.formula, { color: module.color }]}>{theory.formula}</Text>
                </View>
              )}
              {theory.example && (
                <View style={[styles.exampleBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text style={styles.boxLabel}>✏️ Ejemplo:</Text>
                  <Text style={[styles.example, { color: colors.foreground }]}>{theory.example}</Text>
                </View>
              )}
              {theory.visualHint && (
                <View style={[styles.hintBox, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}>
                  <Text style={{ fontSize: 16 }}>💡</Text>
                  <Text style={[styles.hintText, { color: colors.foreground }]}>{theory.visualHint}</Text>
                </View>
              )}
              {theory.steps?.map((step, i) => (
                <Text key={i} style={[styles.step, { color: colors.foreground }]}>{step}</Text>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Exercise Levels */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        💪 Ejercicios por Nivel
      </Text>
      <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
        Completa cada nivel para desbloquear el siguiente
      </Text>

      {exerciseLevels.map((levelExs, levelIdx) => {
        const unlocked = isLevelUnlocked(levelIdx);
        const completed = isLevelCompleted(levelIdx);
        const { done, total } = getLevelProgress(levelIdx);
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        const levelOffset = exerciseLevels.slice(0, levelIdx).reduce((s, l) => s + l.length, 0);

        return (
          <View
            key={levelIdx}
            style={[
              styles.levelCard,
              {
                backgroundColor: unlocked ? colors.card : colors.secondary,
                borderColor: completed
                  ? colors.success + "60"
                  : unlocked
                  ? module.color + "40"
                  : colors.border,
              },
            ]}
          >
            {/* Level header */}
            <View style={styles.levelHeader}>
              <View
                style={[
                  styles.levelIconBg,
                  {
                    backgroundColor: completed
                      ? colors.success + "20"
                      : unlocked
                      ? module.color + "20"
                      : colors.border,
                  },
                ]}
              >
                <Text style={styles.levelIcon}>
                  {completed ? "✅" : unlocked ? LEVEL_ICONS[levelIdx] : "🔒"}
                </Text>
              </View>
              <View style={styles.levelInfo}>
                <Text
                  style={[
                    styles.levelName,
                    {
                      color: completed
                        ? colors.success
                        : unlocked
                        ? module.color
                        : colors.mutedForeground,
                    },
                  ]}
                >
                  {LEVEL_NAMES[levelIdx] || `Nivel ${levelIdx + 1}`}
                </Text>
                <Text style={[styles.levelMeta, { color: colors.mutedForeground }]}>
                  {done}/{total} ejercicios completados
                </Text>
              </View>
              {unlocked && (
                <View
                  style={[
                    styles.levelBadge,
                    {
                      backgroundColor: completed
                        ? colors.success + "20"
                        : module.color + "15",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.levelBadgeText,
                      { color: completed ? colors.success : module.color },
                    ]}
                  >
                    {completed ? "Completado" : `${progress}%`}
                  </Text>
                </View>
              )}
            </View>

            {/* Progress bar */}
            {unlocked && progress > 0 && (
              <View style={[styles.levelProgressBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.levelProgressFill,
                    {
                      width: `${progress}%` as any,
                      backgroundColor: completed ? colors.success : module.color,
                    },
                  ]}
                />
              </View>
            )}

            {/* Exercises list */}
            {unlocked &&
              levelExs.map((exercise, exIdx) => {
                const done = completedExIds.has(exercise.id);
                return (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      styles.exerciseRow,
                      {
                        backgroundColor: done ? colors.success + "08" : colors.background,
                        borderColor: done ? colors.success + "40" : colors.border,
                      },
                    ]}
                    onPress={() =>
                      router.push(`/ejercicio/${module.id}__${exercise.id}` as any)
                    }
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.exerciseNum,
                        { backgroundColor: done ? colors.success : module.color },
                      ]}
                    >
                      {done ? (
                        <Feather name="check" size={12} color="#fff" />
                      ) : (
                        <Text style={styles.exerciseNumText}>
                          {levelOffset + exIdx + 1}
                        </Text>
                      )}
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text
                        style={[styles.exerciseQ, { color: colors.foreground }]}
                        numberOfLines={2}
                      >
                        {exercise.expression || exercise.question}
                      </Text>
                      {exercise.realWorld && (
                        <Text style={[styles.exerciseTag, { color: colors.mutedForeground }]}>
                          🌍 Aplicación real
                        </Text>
                      )}
                    </View>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={done ? colors.success : colors.mutedForeground}
                    />
                  </TouchableOpacity>
                );
              })}

            {!unlocked && (
              <View style={styles.lockedMsg}>
                <Feather name="lock" size={14} color={colors.mutedForeground} />
                <Text style={[styles.lockedText, { color: colors.mutedForeground }]}>
                  Completa el nivel anterior para desbloquear
                </Text>
              </View>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.markBtn, { backgroundColor: module.color }]}
        onPress={() => {
          markTheoryRead(module.id);
          router.back();
        }}
        activeOpacity={0.85}
      >
        <Feather name="book-open" size={17} color="#fff" />
        <Text style={styles.markBtnText}>Teoría repasada ✓</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 4 },
  backText: { fontSize: 15, fontWeight: "600" },
  header: { borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  headerIcon: { fontSize: 36 },
  headerTextArea: { flex: 1 },
  headerLevel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  xpBadge: { borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
  xpText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  realWorldCard: { flexDirection: "row", gap: 10, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 20, alignItems: "flex-start" },
  realWorldText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 10, marginTop: 6 },
  sectionSub: { fontSize: 13, marginBottom: 14, marginTop: -6 },
  theoryCard: { borderRadius: 14, marginBottom: 10, borderWidth: 1, overflow: "hidden" },
  theoryHeader: { flexDirection: "row", alignItems: "center", padding: 14, justifyContent: "space-between" },
  theoryTitle: { fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  theoryBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  theoryContent: { fontSize: 14, lineHeight: 20 },
  formulaBox: { borderRadius: 10, padding: 12, borderWidth: 1 },
  exampleBox: { borderRadius: 10, padding: 12, borderWidth: 1 },
  hintBox: { flexDirection: "row", gap: 8, borderRadius: 10, padding: 12, borderWidth: 1, alignItems: "flex-start" },
  boxLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  formula: { fontSize: 16, fontWeight: "800" },
  example: { fontSize: 14, fontWeight: "500" },
  hintText: { flex: 1, fontSize: 13, lineHeight: 18 },
  step: { fontSize: 13, lineHeight: 18 },
  levelCard: { borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1.5 },
  levelHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  levelIconBg: { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  levelIcon: { fontSize: 22 },
  levelInfo: { flex: 1 },
  levelName: { fontSize: 15, fontWeight: "800" },
  levelMeta: { fontSize: 12, marginTop: 2 },
  levelBadge: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  levelBadgeText: { fontSize: 12, fontWeight: "700" },
  levelProgressBg: { height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 14 },
  levelProgressFill: { height: "100%", borderRadius: 2 },
  exerciseRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, gap: 10 },
  exerciseNum: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  exerciseNumText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  exerciseInfo: { flex: 1 },
  exerciseQ: { fontSize: 13, fontWeight: "600" },
  exerciseTag: { fontSize: 11, marginTop: 3 },
  lockedMsg: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  lockedText: { fontSize: 13 },
  markBtn: { borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 },
  markBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
