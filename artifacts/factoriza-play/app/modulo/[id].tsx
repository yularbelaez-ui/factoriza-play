import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Linking,
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
import { MODULE_VIDEOS } from "@/data/moduleVideos";
import { ProcedureDiagram } from "@/components/ProcedureDiagram";

function getExerciseLevels(exercises: typeof MODULES[0]["exercises"]) {
  const perLevel = Math.ceil(exercises.length / 3);
  return [
    exercises.slice(0, perLevel),
    exercises.slice(perLevel, perLevel * 2),
    exercises.slice(perLevel * 2),
  ].filter((l) => l.length > 0);
}

/** Render a visual step-by-step example card */
function VisualExample({ steps, color }: { steps: string[]; color: string }) {
  const colors = useColors();
  return (
    <View style={[ve.container, { backgroundColor: color + "06", borderColor: color + "25" }]}>
      <Text style={[ve.label, { color }]}>📝 Resolución paso a paso</Text>
      {steps.map((step, i) => (
        <View key={i} style={ve.row}>
          <View style={[ve.badge, { backgroundColor: color }]}>
            <Text style={ve.badgeText}>{i + 1}</Text>
          </View>
          <View style={[ve.stepBox, { backgroundColor: color + "10", borderColor: color + "20" }]}>
            <Text style={[ve.stepText, { color: colors.foreground }]}>{step}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Visual formula display */
function FormulaDisplay({ formula, color }: { formula: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[fd.container, { backgroundColor: color + "12", borderColor: color + "50" }]}>
      <View style={fd.labelRow}>
        <View style={[fd.icon, { backgroundColor: color }]}>
          <Text style={fd.iconText}>f</Text>
        </View>
        <Text style={[fd.label, { color }]}>Fórmula clave</Text>
      </View>
      <Text style={[fd.formula, { color }]}>{formula}</Text>
    </View>
  );
}

/** Visual example with before→after boxes */
function ExampleVisual({ example, color }: { example: string; color: string }) {
  const colors = useColors();
  // Try to split on "=" or "→" for before/after
  const parts = example.split(/\s*[=→]\s*/);
  if (parts.length >= 2) {
    return (
      <View style={[ev.container, { borderColor: colors.border }]}>
        <Text style={[ev.label, { color: colors.mutedForeground }]}>✏️ Ejemplo resuelto</Text>
        <View style={ev.row}>
          <View style={[ev.box, { backgroundColor: color + "10", borderColor: color + "30" }]}>
            <Text style={[ev.boxLabel, { color: colors.mutedForeground }]}>Expresión</Text>
            <Text style={[ev.boxValue, { color }]}>{parts[0].trim()}</Text>
          </View>
          <View style={ev.arrow}>
            <Feather name="arrow-right" size={20} color={color} />
          </View>
          <View style={[ev.box, { backgroundColor: colors.success + "10", borderColor: colors.success + "30" }]}>
            <Text style={[ev.boxLabel, { color: colors.mutedForeground }]}>Resultado</Text>
            <Text style={[ev.boxValue, { color: colors.success }]}>{parts[parts.length - 1].trim()}</Text>
          </View>
        </View>
        {parts.length > 2 && (
          <Text style={[ev.intermediate, { color: colors.mutedForeground }]}>
            Proceso: {parts.slice(1, -1).join(" = ")}
          </Text>
        )}
      </View>
    );
  }
  return (
    <View style={[ev.container, { borderColor: colors.border }]}>
      <Text style={[ev.label, { color: colors.mutedForeground }]}>✏️ Ejemplo</Text>
      <Text style={[ev.boxValue, { color }]}>{example}</Text>
    </View>
  );
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
        <Text style={{ color: colors.foreground }}>Caso no encontrado</Text>
      </View>
    );
  }

  const prog = moduleProgress.find((p) => p.moduleId === module.id);
  const videos = MODULE_VIDEOS[module.id] ?? [];
  const completedLevels = prog?.completedLevels || [];
  const exerciseLevels = getExerciseLevels(module.exercises);

  const isLevelUnlocked = (levelIdx: number) => {
    if (levelIdx === 0) return true;
    return completedLevels.includes(levelIdx - 1);
  };

  const isLevelCompleted = (levelIdx: number) => completedLevels.includes(levelIdx);

  const completedExIds = new Set(currentStudent?.completedExercises || []);

  const getLevelProgress = (levelIdx: number) => {
    const exs = exerciseLevels[levelIdx];
    const done = exs.filter((e) => completedExIds.has(e.id)).length;
    return { done, total: exs.length };
  };

  const totalExercises = module.exercises.length;
  const doneExercises = module.exercises.filter(e => completedExIds.has(e.id)).length;
  const exerciseProgress = totalExercises > 0 ? Math.round((doneExercises / totalExercises) * 100) : 0;
  const isModuleCompleted = currentStudent?.completedModules.includes(module.id) ?? false;

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
        <Text style={[styles.backText, { color: colors.primary }]}>Casos</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: module.color, shadowColor: module.color }]}>
        <Text style={styles.headerIcon}>{module.icon}</Text>
        <View style={styles.headerTextArea}>
          <Text style={styles.headerLevel}>Caso {module.level}</Text>
          <Text style={styles.headerTitle}>{module.title}</Text>
          <Text style={styles.headerSub}>{module.subtitle}</Text>
        </View>
        <View style={[styles.xpBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={styles.xpText}>+{module.xpReward} XP</Text>
        </View>
      </View>

      {/* Progress bar */}
      {doneExercises > 0 && (
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: isModuleCompleted ? colors.success + "60" : colors.border }]}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.foreground }]}>
              {isModuleCompleted ? "✅ Módulo completado" : `Progreso: ${exerciseProgress}%`}
            </Text>
            <Text style={[styles.progressCount, { color: colors.mutedForeground }]}>
              {doneExercises}/{totalExercises} ejercicios
            </Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${exerciseProgress}%` as any, backgroundColor: isModuleCompleted ? colors.success : module.color }]} />
          </View>
        </View>
      )}

      {/* Real world */}
      <View style={[styles.realWorldCard, { backgroundColor: module.color + "10", borderColor: module.color + "30" }]}>
        <Feather name="globe" size={15} color={module.color} />
        <Text style={[styles.realWorldText, { color: colors.foreground }]}>
          <Text style={{ fontWeight: "700" }}>Aplicación real: </Text>
          {module.realWorldExample}
        </Text>
      </View>

      {/* ── Theory ── */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📖 Teoría y Ejemplos</Text>
      {module.theory.map((theory) => {
        const expanded = theoryExpanded.includes(theory.id);
        return (
          <View key={theory.id} style={[styles.theoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.theoryHeader} onPress={() => toggleTheory(theory.id)}>
              <View style={[styles.theoryHeaderIcon, { backgroundColor: module.color + "15" }]}>
                <Text style={{ fontSize: 14 }}>📘</Text>
              </View>
              <Text style={[styles.theoryTitle, { color: colors.foreground }]}>{theory.title}</Text>
              <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>

            {expanded && (
              <View style={styles.theoryBody}>
                {/* Content */}
                <View style={[styles.contentBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.theoryContent, { color: colors.foreground }]}>{theory.content}</Text>
                </View>

                {/* Formula - visual */}
                {theory.formula && <FormulaDisplay formula={theory.formula} color={module.color} />}

                {/* Example - visual before/after */}
                {theory.example && <ExampleVisual example={theory.example} color={module.color} />}

                {/* Visual hint */}
                {theory.visualHint && (
                  <View style={[styles.hintBox, { backgroundColor: colors.accent + "12", borderColor: colors.accent + "30" }]}>
                    <Text style={{ fontSize: 18 }}>💡</Text>
                    <Text style={[styles.hintText, { color: colors.foreground }]}>{theory.visualHint}</Text>
                  </View>
                )}

                {/* Steps - visual */}
                {theory.steps && theory.steps.length > 0 && (
                  <VisualExample steps={theory.steps} color={module.color} />
                )}
              </View>
            )}
          </View>
        );
      })}

      {videos.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🎬 Videos para repasar</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Revisa la teoría y después observa ejercicios resueltos del mismo caso.
          </Text>
          <View style={styles.videoList}>
            {videos.map((video) => (
              <TouchableOpacity
                key={`${video.kind}-${video.title}`}
                style={[styles.videoCard, { backgroundColor: colors.card, borderColor: module.color + "35" }]}
                onPress={() => Linking.openURL(video.url)}
                activeOpacity={0.8}
                accessibilityRole="link"
                accessibilityLabel={`Abrir video: ${video.title}`}
              >
                <View style={[styles.videoIcon, { backgroundColor: video.kind === "theory" ? module.color : "#dc2626" }]}>
                  <Feather name={video.kind === "theory" ? "book-open" : "play"} size={18} color="#fff" />
                </View>
                <View style={styles.videoInfo}>
                  <Text style={[styles.videoKind, { color: video.kind === "theory" ? module.color : "#dc2626" }]}>
                    {video.kind === "theory" ? "REPASO DE TEORÍA" : "EJERCICIOS RESUELTOS"}
                  </Text>
                  <Text style={[styles.videoTitle, { color: colors.foreground }]}>{video.title}</Text>
                  <Text style={[styles.videoChannel, { color: colors.mutedForeground }]}>{video.channel}</Text>
                </View>
                <Feather name="external-link" size={17} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Procedure Diagram */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🖼️ Diagrama del Procedimiento</Text>
      <ProcedureDiagram moduleId={module.id} color={module.color} />

      {/* ── Practicar ahora ── */}
      <TouchableOpacity
        style={[styles.practiceBtn, { backgroundColor: module.color, shadowColor: module.color }]}
        onPress={() => router.push(`/practica-modulo/${module.id}` as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.practiceBtnIcon}>🎯</Text>
        <View style={styles.practiceBtnInfo}>
          <Text style={styles.practiceBtnTitle}>Practicar ahora</Text>
          <Text style={styles.practiceBtnSub}>
            {totalExercises} ejercicios · fácil → difícil · aleatorio
          </Text>
        </View>
        <Feather name="play-circle" size={28} color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>

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
            <View style={styles.levelHeader}>
              <View style={[styles.levelIconBg, {
                backgroundColor: completed ? colors.success + "20" : unlocked ? module.color + "20" : colors.border,
              }]}>
                <Text style={styles.levelIcon}>
                  {completed ? "✅" : unlocked ? LEVEL_ICONS[levelIdx] : "🔒"}
                </Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={[styles.levelName, {
                  color: completed ? colors.success : unlocked ? module.color : colors.mutedForeground,
                }]}>
                  {LEVEL_NAMES[levelIdx] || `Nivel ${levelIdx + 1}`}
                </Text>
                <Text style={[styles.levelMeta, { color: colors.mutedForeground }]}>
                  {done}/{total} ejercicios completados
                </Text>
              </View>
              {unlocked && (
                <View style={[styles.levelBadge, {
                  backgroundColor: completed ? colors.success + "20" : module.color + "15",
                }]}>
                  <Text style={[styles.levelBadgeText, { color: completed ? colors.success : module.color }]}>
                    {completed ? "✓ Listo" : `${progress}%`}
                  </Text>
                </View>
              )}
            </View>

            {unlocked && progress > 0 && (
              <View style={[styles.levelProgressBg, { backgroundColor: colors.border }]}>
                <View style={[styles.levelProgressFill, {
                  width: `${progress}%` as any,
                  backgroundColor: completed ? colors.success : module.color,
                }]} />
              </View>
            )}

            {unlocked && levelExs.map((exercise, exIdx) => {
              const done = completedExIds.has(exercise.id);
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[styles.exerciseRow, {
                    backgroundColor: done ? colors.success + "08" : colors.background,
                    borderColor: done ? colors.success + "40" : colors.border,
                    opacity: done ? 0.72 : 1,
                  }]}
                  onPress={() => {
                    if (!done) router.push(`/ejercicio/${module.id}__${exercise.id}` as any);
                  }}
                  disabled={done}
                  activeOpacity={0.8}
                  accessibilityState={{ disabled: done }}
                >
                  <View style={[styles.exerciseNum, { backgroundColor: done ? colors.success : module.color }]}>
                    {done ? (
                      <Feather name="check" size={12} color="#fff" />
                    ) : (
                      <Text style={styles.exerciseNumText}>{levelOffset + exIdx + 1}</Text>
                    )}
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseQ, { color: colors.foreground }]} numberOfLines={2}>
                      {exercise.expression || exercise.question}
                    </Text>
                    {exercise.realWorld && (
                      <Text style={[styles.exerciseTag, { color: colors.mutedForeground }]}>
                        🌍 Contexto real
                      </Text>
                    )}
                    {done && (
                      <Text style={[styles.exerciseLocked, { color: colors.success }]}>
                        Completado · respuesta y evidencia registradas
                      </Text>
                    )}
                  </View>
                  <Feather name={done ? "lock" : "chevron-right"} size={16} color={done ? colors.success : colors.mutedForeground} />
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
        onPress={() => { markTheoryRead(module.id); router.back(); }}
        activeOpacity={0.85}
      >
        <Feather name="book-open" size={17} color="#fff" />
        <Text style={styles.markBtnText}>Teoría repasada ✓</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Visual Example styles ──────────────────────────────────────────
const ve = StyleSheet.create({
  container: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 8 },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  badge: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0, marginTop: 2 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  stepBox: { flex: 1, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 },
  stepText: { fontSize: 13, lineHeight: 18 },
});

const fd = StyleSheet.create({
  container: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 6 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { width: 24, height: 24, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  iconText: { color: "#fff", fontSize: 13, fontWeight: "900", fontStyle: "italic" },
  label: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  formula: { fontSize: 18, fontWeight: "900", letterSpacing: 0.3 },
});

const ev = StyleSheet.create({
  container: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 8 },
  label: { fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  box: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center" },
  boxLabel: { fontSize: 10, fontWeight: "600", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  boxValue: { fontSize: 15, fontWeight: "800", textAlign: "center" },
  arrow: { paddingHorizontal: 4 },
  intermediate: { fontSize: 11, textAlign: "center", fontStyle: "italic" },
});

// ── Main styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 4 },
  backText: { fontSize: 15, fontWeight: "600" },

  header: {
    borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center",
    gap: 14, marginBottom: 14, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  headerIcon: { fontSize: 36 },
  headerTextArea: { flex: 1 },
  headerLevel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  xpBadge: { borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10 },
  xpText: { color: "#fff", fontSize: 13, fontWeight: "800" },

  progressCard: { borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 12 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: "700" },
  progressCount: { fontSize: 12 },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  realWorldCard: { flexDirection: "row", gap: 10, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 20, alignItems: "flex-start" },
  realWorldText: { flex: 1, fontSize: 13, lineHeight: 18 },

  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 10, marginTop: 6 },
  sectionSub: { fontSize: 13, marginBottom: 14, marginTop: -6 },
  videoList: { gap: 10, marginBottom: 10 },
  videoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 11,
  },
  videoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  videoInfo: { flex: 1, gap: 2 },
  videoKind: { fontSize: 10, fontWeight: "800", letterSpacing: 0.45 },
  videoTitle: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  videoChannel: { fontSize: 11 },

  theoryCard: { borderRadius: 14, marginBottom: 10, borderWidth: 1, overflow: "hidden" },
  theoryHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  theoryHeaderIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  theoryTitle: { flex: 1, fontSize: 14, fontWeight: "700" },
  theoryBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  contentBox: { borderRadius: 10, padding: 12, borderWidth: 1 },
  theoryContent: { fontSize: 14, lineHeight: 21 },
  hintBox: { flexDirection: "row", gap: 8, borderRadius: 10, padding: 12, borderWidth: 1, alignItems: "flex-start" },
  hintText: { flex: 1, fontSize: 13, lineHeight: 18 },

  // Practice button
  practiceBtn: {
    borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center",
    gap: 14, marginBottom: 20, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  practiceBtnIcon: { fontSize: 32 },
  practiceBtnInfo: { flex: 1 },
  practiceBtnTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  practiceBtnSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },

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
  exerciseLocked: { fontSize: 11, fontWeight: "700", marginTop: 3 },

  lockedMsg: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  lockedText: { fontSize: 13 },

  markBtn: { borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 },
  markBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
