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
import { XPBadge } from "@/components/XPBadge";
import { ProgressBar } from "@/components/ProgressBar";

export default function ModuloScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { markTheoryRead, currentStudent } = useApp();
  const isWeb = Platform.OS === "web";

  const module = MODULES.find((m) => m.id === id);
  const [theoryExpanded, setTheoryExpanded] = useState<string[]>([]);

  if (!module) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Módulo no encontrado</Text>
      </View>
    );
  }

  const completedEx = currentStudent.completedExercises.filter((ex) =>
    ex.startsWith(module.id)
  ).length;
  const totalEx = module.exercises.length;
  const progress = totalEx > 0 ? Math.round((completedEx / totalEx) * 100) : 0;

  const toggleTheory = (tid: string) => {
    setTheoryExpanded((prev) =>
      prev.includes(tid) ? prev.filter((t) => t !== tid) : [...prev, tid]
    );
  };

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
        <Text style={[styles.backText, { color: colors.primary }]}>
          Módulos
        </Text>
      </TouchableOpacity>

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: module.color, shadowColor: module.color },
        ]}
      >
        <Text style={styles.headerIcon}>{module.icon}</Text>
        <View style={styles.headerTextArea}>
          <Text style={styles.headerLevel}>Nivel {module.level}</Text>
          <Text style={styles.headerTitle}>{module.title}</Text>
          <Text style={styles.headerSub}>{module.subtitle}</Text>
        </View>
        <XPBadge xp={module.xpReward} size="sm" />
      </View>

      {/* Progress */}
      <View
        style={[
          styles.progressCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: colors.foreground }]}>
            Ejercicios completados
          </Text>
          <Text style={[styles.progressCount, { color: module.color }]}>
            {completedEx}/{totalEx}
          </Text>
        </View>
        <ProgressBar progress={progress} color={module.color} />
      </View>

      {/* Real World */}
      <View
        style={[
          styles.realWorldCard,
          { backgroundColor: module.color + "10", borderColor: module.color + "30" },
        ]}
      >
        <Feather name="globe" size={16} color={module.color} />
        <Text style={[styles.realWorldText, { color: colors.foreground }]}>
          <Text style={{ fontWeight: "700" }}>Aplicación real: </Text>
          {module.realWorldExample}
        </Text>
      </View>

      {/* Theory */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        📖 Teoría
      </Text>
      {module.theory.map((theory) => (
        <View
          key={theory.id}
          style={[
            styles.theoryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.theoryHeader}
            onPress={() => toggleTheory(theory.id)}
          >
            <Text style={[styles.theoryTitle, { color: colors.foreground }]}>
              {theory.title}
            </Text>
            <Feather
              name={theoryExpanded.includes(theory.id) ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
          {theoryExpanded.includes(theory.id) && (
            <View style={styles.theoryBody}>
              <Text style={[styles.theoryContent, { color: colors.foreground }]}>
                {theory.content}
              </Text>
              {theory.formula && (
                <View
                  style={[
                    styles.formulaBox,
                    { backgroundColor: module.color + "10", borderColor: module.color + "40" },
                  ]}
                >
                  <Text style={styles.formulaLabel}>📐 Fórmula:</Text>
                  <Text style={[styles.formula, { color: module.color }]}>
                    {theory.formula}
                  </Text>
                </View>
              )}
              {theory.example && (
                <View
                  style={[
                    styles.exampleBox,
                    { backgroundColor: colors.secondary, borderColor: colors.border },
                  ]}
                >
                  <Text style={styles.exampleLabel}>✏️ Ejemplo:</Text>
                  <Text style={[styles.example, { color: colors.foreground }]}>
                    {theory.example}
                  </Text>
                </View>
              )}
              {theory.visualHint && (
                <View
                  style={[
                    styles.hintBox,
                    { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" },
                  ]}
                >
                  <Text style={styles.hintLabel}>💡</Text>
                  <Text style={[styles.hintText, { color: colors.foreground }]}>
                    {theory.visualHint}
                  </Text>
                </View>
              )}
              {theory.steps && (
                <View style={styles.steps}>
                  {theory.steps.map((step, i) => (
                    <Text
                      key={i}
                      style={[styles.step, { color: colors.foreground }]}
                    >
                      {step}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {/* Exercises */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        💪 Ejercicios
      </Text>
      {module.exercises.map((exercise, index) => {
        const done = currentStudent.completedExercises.includes(exercise.id);
        return (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseRow,
              {
                backgroundColor: done
                  ? colors.success + "10"
                  : colors.card,
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
                <Feather name="check" size={14} color="#fff" />
              ) : (
                <Text style={styles.exerciseNumText}>{index + 1}</Text>
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
                <Text
                  style={[styles.exerciseTag, { color: colors.mutedForeground }]}
                >
                  🌍 Aplicación real
                </Text>
              )}
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={done ? colors.success : colors.mutedForeground}
            />
          </TouchableOpacity>
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
        <Feather name="book-open" size={18} color="#fff" />
        <Text style={styles.markBtnText}>Teoría repasada ✓</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 4,
  },
  backText: { fontSize: 15, fontWeight: "600" },
  header: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIcon: { fontSize: 36 },
  headerTextArea: { flex: 1 },
  headerLevel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2 },
  headerSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
  },
  progressCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: { fontSize: 13, fontWeight: "600" },
  progressCount: { fontSize: 15, fontWeight: "800" },
  realWorldCard: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  realWorldText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12, marginTop: 8 },
  theoryCard: {
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  theoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    justifyContent: "space-between",
  },
  theoryTitle: { fontSize: 15, fontWeight: "700", flex: 1, marginRight: 8 },
  theoryBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 12 },
  theoryContent: { fontSize: 14, lineHeight: 20 },
  formulaBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  formulaLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  formula: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  exampleBox: { borderRadius: 10, padding: 12, borderWidth: 1 },
  exampleLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  example: { fontSize: 14, fontWeight: "500" },
  hintBox: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  hintLabel: { fontSize: 16 },
  hintText: { flex: 1, fontSize: 13, lineHeight: 18 },
  steps: { gap: 6 },
  step: { fontSize: 13, lineHeight: 18 },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  exerciseNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseNumText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  exerciseInfo: { flex: 1 },
  exerciseQ: { fontSize: 14, fontWeight: "600" },
  exerciseTag: { fontSize: 11, marginTop: 3 },
  markBtn: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  markBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
