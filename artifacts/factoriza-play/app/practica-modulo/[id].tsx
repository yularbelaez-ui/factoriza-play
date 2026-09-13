import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { MODULES } from "@/data/modules";
import { useColors } from "@/hooks/useColors";
import { getBalancedAnswerOptions } from "@/lib/answerOptions";

type Phase = "main" | "retry" | "done";
type Exercise = (typeof MODULES)[0]["exercises"][0];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Error hints por categoría
const ERROR_HINTS: Record<string, { icon: string; text: string }> = {
  operaciones:   { icon: "🔢", text: "Revisa el MCD de los coeficientes y las divisiones entre términos." },
  ley_signos:    { icon: "➕➖", text: "Atención a los signos. Al factorizar con factor negativo, los signos del paréntesis se invierten." },
  variables:     { icon: "🔤", text: "Para variables, usa la MENOR potencia presente entre todos los términos." },
  equality:      { icon: "⚖️", text: "Verifica expandiendo tu respuesta para confirmar que es equivalente a la expresión original." },
  potenciacion:  { icon: "⚡", text: "Identifica si el término es un cuadrado o cubo perfecto antes de aplicar la fórmula." },
  radicacion:    { icon: "√", text: "Para raíz cuadrada: divide el exponente entre 2. Para raíz cúbica: entre 3." },
  arithmetic:    { icon: "🔢", text: "Revisa las operaciones básicas: el cálculo del MCD o la división de coeficientes." },
  powers:        { icon: "⚡", text: "Recuerda las propiedades de potencias al identificar cuadrados y cubos perfectos." },
  operations:    { icon: "➗", text: "Verifica los coeficientes del resultado dividiendo término a término." },
};

export default function PracticaModuloScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recordExerciseResult, recordHintEvent, completeLevel, startActivitySession, currentStudent } = useApp();
  const isWeb = Platform.OS === "web";
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const module = MODULES.find((m) => m.id === id);
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (!module) return;
    startActivitySession(module.id).then((result) => {
      if (result.ok && result.sessionId) setSessionId(result.sessionId);
    });
  }, [module?.id]);

  // ── Build main queue: sorted easy→medium→hard, shuffled within each level ──
  const mainQueue = useMemo<Exercise[]>(() => {
    if (!module) return [];
    const all = module.exercises;
    const perLevel = Math.ceil(all.length / 3);
    const l1 = shuffleArray(all.slice(0, perLevel));
    const l2 = shuffleArray(all.slice(perLevel, perLevel * 2));
    const l3 = shuffleArray(all.slice(perLevel * 2));
    return [...l1, ...l2, ...l3];
  }, [id]);

  // ── State ──
  const [phase, setPhase] = useState<Phase>("main");
  const [mainIdx, setMainIdx] = useState(0);
  const [retryQueue, setRetryQueue] = useState<Exercise[]>([]);
  const [retryIdx, setRetryIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctMain, setCorrectMain] = useState(0);
  const [correctRetry, setCorrectRetry] = useState(0);
  const [answered, setAnswered] = useState(0);

  // Current exercise
  const currentEx: Exercise | null =
    phase === "main" ? (mainQueue[mainIdx] ?? null) :
    phase === "retry" ? (retryQueue[retryIdx] ?? null) :
    null;

  // Time and hint usage per exercise, for the teacher panel's per-topic
  // analytics. Reset whenever a new exercise is shown.
  const startTimeRef = useRef(Date.now());
  const hintsUsedRef = useRef(0);
  useEffect(() => {
    startTimeRef.current = Date.now();
    hintsUsedRef.current = 0;
  }, [currentEx?.id]);

  const orderedOptions = useMemo(() => {
    if (!currentEx) return [];
    const ordinal = phase === "main" ? mainIdx : mainQueue.length + retryIdx;
    return getBalancedAnswerOptions(
      currentEx.options,
      currentEx.correctAnswer,
      ordinal
    );
  }, [currentEx?.id, mainIdx, mainQueue.length, phase, retryIdx]);

  const isCorrect = selected === currentEx?.correctAnswer;
  const errorHint = currentEx ? (ERROR_HINTS[currentEx.errorCategory] ?? ERROR_HINTS["arithmetic"]) : null;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    if (!selected || !currentEx || !module) return;
    const correct = selected === currentEx.correctAnswer;
    setSubmitted(true);
    setAnswered(a => a + 1);
    const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (phase === "main") setCorrectMain(c => c + 1);
      else setCorrectRetry(c => c + 1);
      recordExerciseResult(
        {
          exerciseId: currentEx.id,
          moduleId: module.id,
          correct: true,
          selectedAnswer: selected,
          correctAnswer: currentEx.correctAnswer,
          errorCategory: currentEx.errorCategory,
          attempts: phase === "retry" ? 2 : 1,
          questionText: `${currentEx.question}${currentEx.expression ? ` — ${currentEx.expression}` : ""}`,
          topicName: module.title,
        },
        { hintsUsed: hintsUsedRef.current, durationSeconds: elapsedSeconds }
      );
      // Check level/module completion
      const doneSet = new Set([...(currentStudent?.completedExercises ?? []), currentEx.id]);
      const perLevel = Math.ceil(module.exercises.length / 3);
      const levels = [
        module.exercises.slice(0, perLevel),
        module.exercises.slice(perLevel, perLevel * 2),
        module.exercises.slice(perLevel * 2),
      ].filter(l => l.length > 0);
      levels.forEach((lvlExs, lvlIdx) => {
        if (lvlExs.some(e => e.id === currentEx.id) && lvlExs.every(e => doneSet.has(e.id))) {
          completeLevel(module.id, lvlIdx);
        }
      });
      if (module.exercises.every(e => doneSet.has(e.id))) {
        if (sessionId) {
          router.push({ pathname: "/reflexion", params: { kind: "session", sessionId, activityId: module.id } });
        }
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      if (!showHint) {
        hintsUsedRef.current += 1;
        void recordHintEvent(currentEx.id, `${currentEx.id}-hint-${phase}`);
      }
      setShowHint(true); // Auto-show hint
      recordExerciseResult(
        {
          exerciseId: currentEx.id,
          moduleId: module.id,
          correct: false,
          selectedAnswer: selected,
          correctAnswer: currentEx.correctAnswer,
          errorCategory: currentEx.errorCategory,
          attempts: phase === "retry" ? 2 : 1,
          questionText: `${currentEx.question}${currentEx.expression ? ` — ${currentEx.expression}` : ""}`,
          topicName: module.title,
        },
        { hintsUsed: hintsUsedRef.current, durationSeconds: elapsedSeconds }
      );
      // Add to retry queue (only if in main phase)
      if (phase === "main") {
        setRetryQueue(prev => [...prev, currentEx]);
      }
    }
  };

  const handleNext = () => {
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);

    if (phase === "main") {
      const nextIdx = mainIdx + 1;
      if (nextIdx >= mainQueue.length) {
        // The final main question must always leave the main phase.
        // Read the already-rendered retry queue directly instead of nesting
        // a phase update inside a retryQueue state updater.
        if (retryQueue.length > 0) {
          setPhase("retry");
          setRetryIdx(0);
        } else {
          setPhase("done");
        }
      } else {
        setMainIdx(nextIdx);
      }
    } else if (phase === "retry") {
      const nextIdx = retryIdx + 1;
      if (nextIdx >= retryQueue.length) {
        setPhase("done");
      } else {
        setRetryIdx(nextIdx);
      }
    }
  };

  const getOptionStyle = (option: string) => {
    if (!submitted) {
      const isSel = selected === option;
      return {
        bg: isSel ? colors.primary + "15" : colors.card,
        border: isSel ? colors.primary : colors.border,
        text: isSel ? colors.primary : colors.foreground,
      };
    }
    if (option === currentEx?.correctAnswer && isCorrect) {
      return { bg: colors.success + "12", border: colors.success, text: colors.success };
    }
    if (option === selected && !isCorrect) {
      return { bg: colors.error + "10", border: colors.error, text: colors.error };
    }
    return { bg: colors.card, border: colors.border, text: colors.mutedForeground };
  };

  if (!module) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Módulo no encontrado</Text>
      </View>
    );
  }

  // ── DONE screen ──────────────────────────────────────────────────
  if (phase === "done") {
    const total = mainQueue.length;
    const finalScore = total > 0 ? Math.round((correctMain / total) * 100) : 0;
    const emoji = finalScore >= 90 ? "🏆" : finalScore >= 70 ? "🎉" : finalScore >= 50 ? "📚" : "💪";
    const message =
      finalScore >= 90 ? "¡Dominas este caso!" :
      finalScore >= 70 ? "¡Muy bien! Sigue así." :
      finalScore >= 50 ? "Buen intento. ¡Practica más!" :
      "Revisa la teoría e inténtalo de nuevo.";

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: isWeb ? 67 + 16 : insets.top + 16, paddingBottom: 80 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Volver al caso</Text>
        </TouchableOpacity>

        <View style={[styles.resultCard, { backgroundColor: finalScore >= 70 ? colors.success + "12" : colors.error + "10", borderColor: finalScore >= 70 ? colors.success + "40" : colors.error + "30" }]}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
          <Text style={[styles.resultScore, { color: finalScore >= 70 ? colors.success : colors.error }]}>{finalScore}%</Text>
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>{message}</Text>
          <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
            {correctMain} de {total} respuestas correctas
          </Text>
          {retryQueue.length > 0 && (
            <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
              + {correctRetry} de {retryQueue.length} en repaso
            </Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
            <Text style={[styles.statNum, { color: colors.success }]}>{correctMain}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Correctas</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.error + "10", borderColor: colors.error + "30" }]}>
            <Text style={[styles.statNum, { color: colors.error }]}>{retryQueue.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Repasadas</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.accent + "12", borderColor: colors.accent + "30" }]}>
            <Text style={[styles.statNum, { color: colors.accent }]}>⚡ {correctMain * 20}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>XP ganados</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: module.color }]}
          onPress={() => router.back()}
        >
          <Feather name="check-circle" size={18} color="#fff" />
          <Text style={styles.doneBtnText}>Ver el caso completo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.retryBtn, { borderColor: module.color }]}
          onPress={() => router.push(`/(tabs)/evaluacion` as any)}
        >
          <Text style={[styles.retryBtnText, { color: module.color }]}>Ir a evaluación →</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (!currentEx) return null;

  // ── Progress ─────────────────────────────────────────────────────
  const totalExs = mainQueue.length;
  const doneExs = phase === "main" ? mainIdx : mainQueue.length + retryIdx;
  const progressPct = totalExs > 0 ? (doneExs / (totalExs + retryQueue.length || 1)) * 100 : 0;

  const levelOfCurrent = (() => {
    const all = module.exercises;
    const perLevel = Math.ceil(all.length / 3);
    const idx = all.findIndex(e => e.id === currentEx.id);
    const lvl = Math.floor(idx / perLevel);
    return lvl === 0 ? { label: "Nivel Básico", icon: "🌱", color: "#059669" }
         : lvl === 1 ? { label: "Nivel Medio", icon: "🌿", color: "#d97706" }
         :              { label: "Nivel Avanzado", icon: "🌳", color: "#dc2626" };
  })();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: isWeb ? 67 + 16 : insets.top + 16, paddingBottom: 80 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="chevron-left" size={22} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Caso</Text>
      </TouchableOpacity>

      {/* Phase banner (retry) */}
      {phase === "retry" && (
        <View style={[styles.retryBanner, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
          <Text style={styles.retryBannerEmoji}>🔄</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.retryBannerTitle, { color: "#92400e" }]}>Repaso de errores</Text>
            <Text style={[styles.retryBannerSub, { color: "#b45309" }]}>
              {retryIdx + 1} de {retryQueue.length} ejercicios para repasar
            </Text>
          </View>
        </View>
      )}

      {/* Progress bar */}
      <View style={styles.progressHeader}>
        <View style={styles.progressRow}>
          <View style={[styles.levelTag, { backgroundColor: levelOfCurrent.color + "20" }]}>
            <Text style={styles.levelTagText}>{levelOfCurrent.icon} {levelOfCurrent.label}</Text>
          </View>
          <Text style={[styles.progressCount, { color: colors.mutedForeground }]}>
            {phase === "main" ? `${mainIdx + 1}/${totalExs}` : `Repaso ${retryIdx + 1}/${retryQueue.length}`}
          </Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${Math.min(progressPct, 100)}%` as any, backgroundColor: module.color }]} />
        </View>
      </View>

      {/* Module tag */}
      <View style={[styles.moduleTag, { backgroundColor: module.color + "15", borderColor: module.color + "30" }]}>
        <Text style={styles.moduleTagIcon}>{module.icon}</Text>
        <Text style={[styles.moduleTagText, { color: module.color }]}>{module.title}</Text>
      </View>

      {/* Story / real-world situation */}
      {currentEx.realWorld && (
        <View style={[styles.storyCard, { backgroundColor: module.color + "0d", borderColor: module.color + "30" }]}>
          <Text style={styles.storyIcon}>📖</Text>
          <Text style={[styles.storyText, { color: colors.foreground }]}>{currentEx.realWorld}</Text>
        </View>
      )}

      {/* Question */}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.questionText, { color: colors.foreground }]}>
            {currentEx.question}
          </Text>
          {currentEx.expression ? (
            <View style={[styles.expressionBox, { backgroundColor: module.color + "08", borderColor: module.color + "30" }]}>
              <Text style={[styles.expression, { color: module.color }]}>{currentEx.expression}</Text>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {/* Hint (auto-shown on wrong, or togglable) */}
      {!submitted && (
        <TouchableOpacity
          style={[styles.hintToggle, { borderColor: colors.accent + "60", backgroundColor: colors.accent + "10" }]}
          onPress={() => {
            setShowHint((prev) => {
               if (!prev) {
                 hintsUsedRef.current += 1;
                 void recordHintEvent(currentEx.id, `${currentEx.id}-manual-hint`);
               }
              return !prev;
            });
          }}
        >
          <Feather name="help-circle" size={15} color={colors.accent} />
          <Text style={[styles.hintToggleText, { color: colors.accent }]}>
            {showHint ? "Ocultar pista" : "💡 Ver pista"}
          </Text>
          <Feather name={showHint ? "chevron-up" : "chevron-down"} size={14} color={colors.accent} />
        </TouchableOpacity>
      )}

      {showHint && (
        <View style={[styles.hintCard, { backgroundColor: colors.accent + "10", borderColor: colors.accent + "30" }]}>
          <Text style={[styles.hintTitle, { color: colors.accent }]}>
            {errorHint?.icon} Pista
          </Text>
          <Text style={[styles.hintText, { color: colors.foreground }]}>{currentEx.hint}</Text>
          {submitted && !isCorrect && errorHint && (
            <View style={[styles.tipRow, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "20" }]}>
              <Text style={[styles.tipText, { color: colors.foreground }]}>{errorHint.text}</Text>
            </View>
          )}
          {currentEx.steps && currentEx.steps.length > 0 && (
            <>
              <Text style={[styles.stepsTitle, { color: colors.accent }]}>Pasos sugeridos:</Text>
              {currentEx.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepNum, { backgroundColor: colors.accent }]}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* Options */}
      <View style={styles.options}>
        {orderedOptions.map((option) => {
          const c = getOptionStyle(option);
          return (
            <TouchableOpacity
              key={option}
              style={[styles.option, { backgroundColor: c.bg, borderColor: c.border }]}
              onPress={() => { if (!submitted || !isCorrect) setSelected(option); }}
              disabled={submitted && isCorrect}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, { color: c.text }]}>{option}</Text>
              {submitted && option === currentEx.correctAnswer && isCorrect && (
                <Feather name="check-circle" size={20} color={colors.success} />
              )}
              {submitted && option === selected && !isCorrect && (
                <Feather name="x-circle" size={20} color={colors.error} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Action button */}
      {!submitted && (
        <TouchableOpacity
          style={[styles.submitBtn, {
            backgroundColor: selected ? module.color : colors.secondary,
            borderColor: selected ? module.color : colors.border,
            opacity: selected ? 1 : 0.6,
          }]}
          onPress={handleSubmit}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={[styles.submitBtnText, { color: selected ? "#fff" : colors.mutedForeground }]}>
            Verificar respuesta
          </Text>
          <Feather name="check" size={17} color={selected ? "#fff" : colors.mutedForeground} />
        </TouchableOpacity>
      )}

      {/* Wrong feedback */}
      {submitted && !isCorrect && (
        <View style={[styles.feedbackCard, { backgroundColor: colors.error + "08", borderColor: colors.error + "30" }]}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackIcon}>{errorHint?.icon}</Text>
            <Text style={[styles.feedbackTitle, { color: colors.error }]}>
              Respuesta incorrecta
            </Text>
          </View>
          <Text style={[styles.feedbackText, { color: colors.foreground }]}>
            La pista te ayudará a entender. Este ejercicio aparecerá de nuevo al final.
          </Text>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: module.color }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>Continuar →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Correct celebration */}
      {submitted && isCorrect && (
        <View style={[styles.feedbackCard, { backgroundColor: colors.success + "10", borderColor: colors.success + "30" }]}>
          <Text style={styles.correctEmoji}>🎉</Text>
          <Text style={[styles.correctTitle, { color: colors.success }]}>¡Correcto!</Text>
          <Text style={[styles.correctSub, { color: colors.foreground }]}>{currentEx.explanation}</Text>
          <View style={[styles.xpBadge, { backgroundColor: colors.accent + "20" }]}>
            <Text style={[styles.xpText, { color: colors.accent }]}>⚡ +20 XP</Text>
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: module.color }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {phase === "main" && mainIdx + 1 >= mainQueue.length
                ? retryQueue.length > 0 ? "Ir al repaso →" : "Ver resultados →"
                : "Siguiente →"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 4 },
  backText: { fontSize: 15, fontWeight: "600" },

  retryBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 14,
  },
  retryBannerEmoji: { fontSize: 24 },
  retryBannerTitle: { fontSize: 14, fontWeight: "800" },
  retryBannerSub: { fontSize: 12 },

  progressHeader: { marginBottom: 14 },
  progressRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  levelTag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  levelTagText: { fontSize: 12, fontWeight: "700" },
  progressCount: { fontSize: 13, fontWeight: "600" },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  moduleTag: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12,
    borderWidth: 1, alignSelf: "flex-start", marginBottom: 14,
  },
  moduleTagIcon: { fontSize: 14 },
  moduleTagText: { fontSize: 12, fontWeight: "700" },

  storyCard: { flexDirection: "row", gap: 10, borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 12, alignItems: "flex-start" },
  storyIcon: { fontSize: 16 },
  storyText: { flex: 1, fontSize: 13, lineHeight: 19, fontStyle: "italic" },
  questionCard: { borderRadius: 18, padding: 20, borderWidth: 1, marginBottom: 12 },
  questionText: { fontSize: 16, fontWeight: "600", lineHeight: 24, marginBottom: 10 },
  expressionBox: { borderRadius: 12, padding: 16, borderWidth: 1, alignItems: "center" },
  expression: { fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },

  hintToggle: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, padding: 10, borderWidth: 1, marginBottom: 10,
    alignSelf: "flex-start",
  },
  hintToggleText: { fontSize: 13, fontWeight: "600" },
  hintCard: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 14, gap: 8 },
  hintTitle: { fontSize: 13, fontWeight: "800" },
  hintText: { fontSize: 13, lineHeight: 18 },
  tipRow: { borderRadius: 10, padding: 10, borderWidth: 1 },
  tipText: { fontSize: 12, lineHeight: 18 },
  stepsTitle: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  stepNum: { width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  stepNumText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  stepText: { flex: 1, fontSize: 12, lineHeight: 18 },

  options: { gap: 10, marginBottom: 14 },
  option: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 14, padding: 16, borderWidth: 1.5,
  },
  optionText: { fontSize: 16, fontWeight: "600", flex: 1 },

  submitBtn: {
    borderRadius: 16, padding: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1.5, marginBottom: 14,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700" },

  feedbackCard: { borderRadius: 18, padding: 18, borderWidth: 1, gap: 10, marginBottom: 16 },
  feedbackHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  feedbackIcon: { fontSize: 24 },
  feedbackTitle: { fontSize: 15, fontWeight: "800" },
  feedbackText: { fontSize: 13, lineHeight: 18 },

  correctEmoji: { fontSize: 38, textAlign: "center" },
  correctTitle: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  correctSub: { fontSize: 13, lineHeight: 18, textAlign: "center" },
  xpBadge: { borderRadius: 10, padding: 8, alignItems: "center" },
  xpText: { fontSize: 14, fontWeight: "800" },

  nextBtn: { borderRadius: 14, padding: 16, alignItems: "center", marginTop: 4 },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Done screen
  resultCard: {
    borderRadius: 20, padding: 24, alignItems: "center",
    borderWidth: 1.5, gap: 8, marginBottom: 20,
  },
  resultEmoji: { fontSize: 52 },
  resultScore: { fontSize: 52, fontWeight: "900" },
  resultTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  resultSub: { fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1 },
  statNum: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  doneBtn: {
    borderRadius: 16, padding: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginBottom: 12,
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  retryBtn: {
    borderRadius: 16, padding: 16,
    alignItems: "center", borderWidth: 1.5,
  },
  retryBtnText: { fontSize: 15, fontWeight: "700" },
});
