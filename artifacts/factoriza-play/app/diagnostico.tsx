import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  buildDiagnosticProfile,
  DIAGNOSTIC_CATEGORY_INFO,
  DIAGNOSTIC_QUESTIONS,
  DiagnosticCategory,
} from "@/data/diagnostic";
import {
  PROFILE_DETAILS,
  normalizeProfileCode,
} from "@/data/learningRoutes";
import { ALL_TOPICS } from "@/data/sectionTopics";
import { MODULES } from "@/data/modules";
import {
  getPersonalizedRouteProgress,
  getPersonalizedStepProgress,
  getPersonalizedStepState,
  getPersonalizedStepTarget,
} from "@/data/personalizedRoutes";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Phase = "intro" | "questions" | "results";

function shuffleOptions(options: string[]): string[] {
  const copy = [...options];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const LEVEL_CONFIG = {
  básico: {
    emoji: "🌱",
    color: "#dc2626",
    label: "Nivel Básico",
    message:
      "Detectamos algunas áreas para fortalecer antes de factorizar. Tu plan de estudio comenzará con ejercicios de refuerzo aritmético.",
  },
  intermedio: {
    emoji: "🌿",
    color: "#d97706",
    label: "Nivel Intermedio",
    message:
      "Tienes bases sólidas en varios conceptos. Reforzaremos los puntos débiles identificados para que avances con confianza.",
  },
  avanzado: {
    emoji: "🌳",
    color: "#059669",
    label: "Nivel Avanzado",
    message:
      "¡Excelente base matemática! Estás listo para abordar la factorización directamente. El sistema resaltará áreas de perfeccionamiento.",
  },
};

export default function DiagnosticoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveDiagnosticProfile, startActivitySession, currentStudent } = useApp();
  const isWeb = Platform.OS === "web";

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    startActivitySession("diagnostico").then((result) => {
      if (result.ok && result.sessionId) setSessionId(result.sessionId);
    });
  }, []);

  const shuffledOptions = useMemo(
    () =>
      DIAGNOSTIC_QUESTIONS.map((q) => ({
        ...q,
        shuffledOptions: shuffleOptions(q.options),
      })),
    []
  );

  const currentQ = shuffledOptions[currentIdx];
  const totalQ = DIAGNOSTIC_QUESTIONS.length;
  const progress = Math.round(((currentIdx + 1) / totalQ) * 100);

  const profile = useMemo(() => {
    if (phase !== "results") return null;
    return buildDiagnosticProfile(answers);
  }, [phase, answers]);

  const handleStartDiagnostic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase("questions");
  };

  const handleSelectOption = (option: string) => {
    if (selectedOption) return;
    Haptics.selectionAsync();
    setSelectedOption(option);
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
    } else {
      setPhase("results");
    }
  };

  const handleFinish = async () => {
    if (!profile || saving) return;
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveDiagnosticProfile(profile, sessionId ?? `local-diagnostic-${Date.now()}`);
    router.replace("/" as any);
  };

  const padTop = isWeb ? 67 + 16 : insets.top + 16;
  const padBottom = isWeb ? 34 + 24 : insets.bottom + 24;

  // ── INTRO ───────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: padTop, paddingBottom: padBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={styles.heroBadgeEmoji}>🧠</Text>
        </View>

        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          Evaluación Diagnóstica
        </Text>
        <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
          Antes de comenzar, necesitamos conocer tu nivel de partida en los conceptos
          previos a la factorización algebraica.
        </Text>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="help-circle" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.foreground }]}>
                {totalQ} preguntas de opción múltiple
              </Text>
              <Text style={[styles.infoDesc, { color: colors.mutedForeground }]}>
                Una pregunta a la vez, sin retroceso
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.accent + "15" }]}>
              <Feather name="clock" size={18} color={colors.accent} />
            </View>
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.foreground }]}>
                Aproximadamente 5 minutos
              </Text>
              <Text style={[styles.infoDesc, { color: colors.mutedForeground }]}>
                Tómate tu tiempo, no hay límite de tiempo
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.success + "15" }]}>
              <Feather name="bar-chart-2" size={18} color={colors.success} />
            </View>
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: colors.foreground }]}>
                Perfil de aprendizaje personalizado
              </Text>
              <Text style={[styles.infoDesc, { color: colors.mutedForeground }]}>
                El resultado orienta tu recorrido de estudio
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.catTitle, { color: colors.foreground }]}>
          Áreas evaluadas:
        </Text>
        <View style={styles.catGrid}>
          {(Object.entries(DIAGNOSTIC_CATEGORY_INFO) as [DiagnosticCategory, typeof DIAGNOSTIC_CATEGORY_INFO[DiagnosticCategory]][]).map(
            ([key, info]) => (
              <View
                key={key}
                style={[
                  styles.catChip,
                  { backgroundColor: info.color + "15", borderColor: info.color + "30" },
                ]}
              >
                <Text style={styles.catChipIcon}>{info.icon}</Text>
                <Text style={[styles.catChipLabel, { color: info.color }]}>{info.label}</Text>
              </View>
            )
          )}
        </View>

        <View style={[styles.noteBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            Responde de forma honesta. Esta evaluación solo se realiza una vez y no afecta tu puntuación.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
          onPress={handleStartDiagnostic}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Iniciar evaluación</Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── QUESTIONS ───────────────────────────────────────────────────
  if (phase === "questions") {
    const catInfo = DIAGNOSTIC_CATEGORY_INFO[currentQ.category as DiagnosticCategory];
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: padTop, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
              {currentIdx + 1} / {totalQ}
            </Text>
            <Text style={[styles.progressPct, { color: colors.primary }]}>
              {progress}%
            </Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` as any, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <View style={[styles.catTag, { backgroundColor: catInfo.color + "15" }]}>
            <Text style={[styles.catTagText, { color: catInfo.color }]}>
              {catInfo.icon}  {catInfo.label}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.questionContent, { paddingBottom: padBottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Question card */}
          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.questionText, { color: colors.foreground }]}>
              {currentQ.question}
            </Text>
            {currentQ.expression && (
              <View style={[styles.expressionBox, { backgroundColor: catInfo.color + "12", borderColor: catInfo.color + "30" }]}>
                <Text style={[styles.expressionText, { color: catInfo.color }]}>
                  {currentQ.expression}
                </Text>
              </View>
            )}
          </View>

          {/* Options */}
          <Text style={[styles.optionsHint, { color: colors.mutedForeground }]}>
            Selecciona una respuesta:
          </Text>
          {currentQ.shuffledOptions.map((option) => {
            const isSelected = selectedOption === option;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: isSelected ? catInfo.color : colors.card,
                    borderColor: isSelected ? catInfo.color : colors.border,
                  },
                ]}
                onPress={() => handleSelectOption(option)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.optionDot,
                    {
                      backgroundColor: isSelected ? "rgba(255,255,255,0.3)" : colors.border,
                      borderColor: isSelected ? "rgba(255,255,255,0.5)" : colors.border,
                    },
                  ]}
                >
                  {isSelected && (
                    <View style={styles.optionDotFill} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: isSelected ? "#fff" : colors.foreground },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Next button */}
        <View style={[styles.nextBarOuter, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: isWeb ? 34 : insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[
              styles.nextBtn,
              {
                backgroundColor: selectedOption ? colors.primary : colors.border,
                opacity: selectedOption ? 1 : 0.6,
              },
            ]}
            onPress={handleNext}
            disabled={!selectedOption}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {currentIdx === totalQ - 1 ? "Ver mis resultados" : "Siguiente pregunta"}
            </Text>
            <Feather name={currentIdx === totalQ - 1 ? "check-circle" : "arrow-right"} size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── RESULTS ─────────────────────────────────────────────────────
  if (!profile) return null;
  const levelCfg = LEVEL_CONFIG[profile.level];
  const profileCode = normalizeProfileCode(profile.profile, profile.level);
  const profileDetails = PROFILE_DETAILS[profileCode];
  const personalizedRoute = profile.personalizedRoute;
  const personalizedProgressEvidence = currentStudent
    ? {
        exerciseResults: currentStudent.exerciseResults,
        completedExerciseIds: currentStudent.completedExercises,
        topicExerciseIds: Object.fromEntries(
          ALL_TOPICS.map((topic) => [topic.id, topic.exercises.map((exercise) => exercise.id)]),
        ),
        moduleExerciseIds: Object.fromEntries(
          MODULES.map((module) => [
            module.id,
            [...module.exercises, ...module.evaluationExercises].map((exercise) => exercise.id),
          ]),
        ),
      }
    : undefined;
  const routeProgress = getPersonalizedRouteProgress(
    personalizedRoute,
    currentStudent?.completedTopics ?? [],
    currentStudent?.completedModules ?? [],
    personalizedProgressEvidence,
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: padTop, paddingBottom: padBottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Score hero */}
      <View style={[styles.scoreBadge, { backgroundColor: levelCfg.color + "15", borderColor: levelCfg.color + "30" }]}>
        <Text style={styles.scoreBadgeEmoji}>{levelCfg.emoji}</Text>
        <Text style={[styles.scorePct, { color: levelCfg.color }]}>
          {profile.overallScore}%
        </Text>
        <Text style={[styles.scoreLevel, { color: levelCfg.color }]}>
          {levelCfg.label}
        </Text>
      </View>

      <Text style={[styles.resultsTitle, { color: colors.foreground }]}>
        Tu Perfil de Aprendizaje
      </Text>

      <View style={[styles.messageCard, { backgroundColor: levelCfg.color + "10", borderColor: levelCfg.color + "25" }]}>
        <Feather name="info" size={16} color={levelCfg.color} />
        <Text style={[styles.messageText, { color: colors.foreground }]}>
          {levelCfg.message}
        </Text>
      </View>

      <View style={[styles.profileCard, { backgroundColor: profileDetails.color + "12", borderColor: profileDetails.color + "35" }]}>
        <Text style={styles.profileIcon}>{profileDetails.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.profileLabel, { color: profileDetails.color }]}>{profileDetails.label}</Text>
        <Text style={[styles.profileSummary, { color: colors.foreground }]}>{profileDetails.summary}</Text>
        <Text style={[styles.profileSummary, { color: profileDetails.color, marginTop: 4 }]}>
          Misión: {profileDetails.mission}
        </Text>
        </View>
        <View style={[styles.profileThreshold, { backgroundColor: profileDetails.color + "18" }]}>
          <Text style={[styles.profileThresholdText, { color: profileDetails.color }]}>75%</Text>
        </View>
      </View>

      {/* Category breakdown */}
      <Text style={[styles.breakdownTitle, { color: colors.foreground }]}>
        Resultados por área:
      </Text>

      {profile.results.map((r) => {
        const info = DIAGNOSTIC_CATEGORY_INFO[r.category];
        const needsWork = r.score < 75;
        return (
          <View
            key={r.category}
            style={[
              styles.resultCard,
              { backgroundColor: colors.card, borderColor: needsWork ? info.color + "40" : colors.border },
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={[styles.resultIcon, { backgroundColor: info.color + "15" }]}>
                <Text style={styles.resultIconText}>{info.icon}</Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={[styles.resultLabel, { color: colors.foreground }]}>
                  {info.label}
                </Text>
                <Text style={[styles.resultDesc, { color: colors.mutedForeground }]}>
                  {info.description}
                </Text>
              </View>
              <View style={styles.resultScore}>
                <Text style={[styles.resultScorePct, { color: needsWork ? info.color : colors.success }]}>
                  {r.score}%
                </Text>
                <Text style={[styles.resultScoreFrac, { color: colors.mutedForeground }]}>
                  {r.correct}/{r.total}
                </Text>
              </View>
            </View>
            <View style={[styles.resultBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.resultBarFill,
                  {
                    width: `${r.score}%` as any,
                    backgroundColor: needsWork ? info.color : colors.success,
                  },
                ]}
              />
            </View>
            {needsWork && (
              <View style={[styles.resultTag, { backgroundColor: info.color + "12" }]}>
                <Feather name="alert-circle" size={11} color={info.color} />
                <Text style={[styles.resultTagText, { color: info.color }]}>
                  Área de refuerzo identificada
                </Text>
              </View>
            )}
          </View>
        );
      })}

      <Text style={[styles.breakdownTitle, { color: colors.foreground, marginTop: 10 }]}>
        🗺️ Tu ruta personalizada
      </Text>
      <View style={[styles.actionPlanCard, { backgroundColor: colors.card, borderColor: personalizedRoute.color + "45" }]}>
        <Text style={[styles.planIntro, { color: colors.mutedForeground }]}>
          {personalizedRoute.subtitle} Los módulos con un puntaje inferior al {personalizedRoute.threshold}% se agregan automáticamente.
        </Text>

        <View style={styles.routeProgressHeader}>
          <Text style={[styles.routeProgressLabel, { color: colors.foreground }]}>Progreso de la ruta completa</Text>
          <Text style={[styles.routeProgressValue, { color: personalizedRoute.color }]}>{routeProgress}%</Text>
        </View>
        <View style={[styles.routeProgressBg, { backgroundColor: colors.border }]}>
          <View style={[styles.routeProgressFill, { width: `${routeProgress}%` as any, backgroundColor: personalizedRoute.color }]} />
        </View>

        <Text style={[styles.routeGroupTitle, { color: colors.success }]}>Módulos que ya dominas</Text>
        {profile.moduleResults.filter((module) => !module.needsStrengthening).map((module) => (
          <View key={`mastered-${module.id}`} style={[styles.moduleResultRow, { backgroundColor: colors.success + "08" }]}>
            <Text style={styles.moduleResultIcon}>✓</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.moduleResultTitle, { color: colors.foreground }]}>{module.title}</Text>
              <Text style={[styles.moduleResultTopics, { color: colors.mutedForeground }]}>
                {module.topics.map((topic) => topic.label).join(" · ")}
              </Text>
            </View>
            <Text style={[styles.moduleResultScore, { color: colors.success }]}>{module.score}%</Text>
          </View>
        ))}
        {profile.moduleResults.every((module) => module.needsStrengthening) && (
          <Text style={[styles.planSub, { color: colors.mutedForeground }]}>Todavía no hay un módulo por encima del umbral.</Text>
        )}

        <Text style={[styles.routeGroupTitle, { color: colors.accent, marginTop: 10 }]}>Módulos que necesitas fortalecer</Text>
        {profile.moduleResults.filter((module) => module.needsStrengthening).map((module) => (
          <View key={`needs-${module.id}`} style={[styles.moduleResultRow, { backgroundColor: colors.accent + "08" }]}>
            <Text style={styles.moduleResultIcon}>↗</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.moduleResultTitle, { color: colors.foreground }]}>{module.title}</Text>
              <Text style={[styles.moduleResultTopics, { color: colors.mutedForeground }]}>
                {module.topics.filter((topic) => !topic.meetsThreshold).map((topic) => `${topic.label} ${topic.score}%`).join(" · ")}
              </Text>
            </View>
            <Text style={[styles.moduleResultScore, { color: colors.accent }]}>{module.score}%</Text>
          </View>
        ))}
        {profile.moduleResults.every((module) => !module.needsStrengthening) && (
          <Text style={[styles.planSub, { color: colors.mutedForeground }]}>No se detectaron módulos que requieran refuerzo.</Text>
        )}

        <Text style={[styles.routeGroupTitle, { color: colors.foreground, marginTop: 12 }]}>Secuencia personalizada</Text>
        {personalizedRoute.steps.map((step, index) => {
          const completedTopics = currentStudent?.completedTopics ?? [];
          const completedModules = currentStudent?.completedModules ?? [];
          const state = getPersonalizedStepState(
            personalizedRoute,
            index,
            completedTopics,
            completedModules,
          );
          const target = getPersonalizedStepTarget(personalizedRoute, index, completedTopics);
          const stepProgress = getPersonalizedStepProgress(
            step,
            completedTopics,
            completedModules,
            personalizedProgressEvidence,
          );
          return (
            <TouchableOpacity
              key={step.id}
              style={[styles.planStep, { backgroundColor: step.color + "08", borderColor: step.color + "22", opacity: state === "locked" ? 0.58 : 1 }]}
              onPress={() => {
                if (!target) return;
                if (target.kind === "topic") router.push(`/tema/${target.id}` as any);
                else router.push("/(tabs)/modulos" as any);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.planStepNum, { backgroundColor: state === "locked" ? colors.mutedForeground : step.color }]}>
                {state === "locked" ? <Feather name="lock" size={12} color="#fff" /> : <Text style={styles.planStepNumText}>{index + 1}</Text>}
              </View>
              <Text style={styles.planStepIcon}>{step.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planStepTitle, { color: colors.foreground }]}>{step.title}</Text>
                <Text style={[styles.planStepSub, { color: colors.mutedForeground }]}>
                  {stepProgress}% completado · {state === "locked" ? "Bloqueado" : step.description}
                </Text>
              </View>
              <Feather name={state === "locked" ? "lock" : "arrow-right"} size={14} color={state === "locked" ? colors.mutedForeground : step.color} />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
        <Feather name="trending-up" size={16} color={colors.primary} />
        <Text style={[styles.summaryText, { color: colors.foreground }]}>
          Este perfil guiará las recomendaciones de práctica cada vez que respondas incorrectamente un ejercicio.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: saving ? colors.border : colors.primary }]}
        onPress={handleFinish}
        disabled={saving}
        activeOpacity={0.85}
      >
        <Text style={styles.startBtnText}>
          {saving ? "Guardando..." : "Comenzar mi aprendizaje"}
        </Text>
        <Feather name="arrow-right" size={20} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  // Intro
  heroBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  heroBadgeEmoji: { fontSize: 44 },
  heroTitle: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 10 },
  heroSub: { fontSize: 14, lineHeight: 22, textAlign: "center", marginBottom: 24 },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14, marginBottom: 20 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  infoDesc: { fontSize: 12, lineHeight: 18 },
  catTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipIcon: { fontSize: 14 },
  catChipLabel: { fontSize: 12, fontWeight: "700" },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  // Questions
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 6,
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 12, fontWeight: "600" },
  progressPct: { fontSize: 12, fontWeight: "700" },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  catTag: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  catTagText: { fontSize: 12, fontWeight: "700" },
  questionContent: { paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  questionCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 4 },
  questionText: { fontSize: 16, fontWeight: "600", lineHeight: 24, marginBottom: 12 },
  expressionBox: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center" },
  expressionText: { fontSize: 26, fontWeight: "800", letterSpacing: 1 },
  optionsHint: { fontSize: 12, fontWeight: "500", marginTop: 4 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionDotFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
  optionText: { fontSize: 16, fontWeight: "700", flex: 1 },
  nextBarOuter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 14,
  },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  // Results
  scoreBadge: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 24,
    marginBottom: 20,
  },
  scoreBadgeEmoji: { fontSize: 48, marginBottom: 8 },
  scorePct: { fontSize: 48, fontWeight: "900", lineHeight: 52 },
  scoreLevel: { fontSize: 14, fontWeight: "700", marginTop: 4 },
  resultsTitle: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  messageCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  messageText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: "500" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  profileIcon: { fontSize: 28 },
  profileLabel: { fontSize: 15, fontWeight: "900", marginBottom: 2 },
  profileSummary: { fontSize: 12, lineHeight: 18, fontWeight: "500" },
  profileThreshold: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  profileThresholdText: { fontSize: 12, fontWeight: "900" },
  breakdownTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  resultCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10, gap: 10 },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  resultIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  resultIconText: { fontSize: 18 },
  resultInfo: { flex: 1 },
  resultLabel: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  resultDesc: { fontSize: 11, lineHeight: 16 },
  resultScore: { alignItems: "center" },
  resultScorePct: { fontSize: 18, fontWeight: "900" },
  resultScoreFrac: { fontSize: 11, fontWeight: "500" },
  resultBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  resultBarFill: { height: "100%", borderRadius: 3 },
  resultTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  resultTagText: { fontSize: 11, fontWeight: "700" },
  summaryCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginVertical: 16,
  },
  summaryText: { flex: 1, fontSize: 13, lineHeight: 20 },
  // Plan de acción
  planCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16 },
  planIcon: { fontSize: 22 },
  planTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  planSub: { fontSize: 12, lineHeight: 18 },
  actionPlanCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 16, gap: 8 },
  planIntro: { fontSize: 13, lineHeight: 20, marginBottom: 4 },
  routeProgressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 6 },
  routeProgressLabel: { fontSize: 12, fontWeight: "700" },
  routeProgressValue: { fontSize: 14, fontWeight: "900" },
  routeProgressBg: { height: 7, borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  routeProgressFill: { height: "100%", borderRadius: 4 },
  routeGroupTitle: { fontSize: 12, fontWeight: "800", marginBottom: 6 },
  moduleResultRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 9 },
  moduleResultIcon: { fontSize: 16, fontWeight: "900", width: 20, textAlign: "center" as const },
  moduleResultTitle: { fontSize: 12, fontWeight: "800" },
  moduleResultTopics: { fontSize: 10, lineHeight: 15, marginTop: 1 },
  moduleResultScore: { fontSize: 14, fontWeight: "900" },
  planStep: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12 },
  planStepNum: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  planStepNumText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  planStepIcon: { fontSize: 18, width: 24, textAlign: "center" as const },
  planStepTitle: { fontSize: 13, fontWeight: "700" },
  planStepSub: { fontSize: 11, marginTop: 1 },
  planFinalStep: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12 },
});
