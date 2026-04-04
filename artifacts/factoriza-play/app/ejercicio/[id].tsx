import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
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

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const ERROR_HINTS: Record<string, { title: string; hint: string; tip: string; icon: string }> = {
  arithmetic: {
    icon: "🔢",
    title: "Error en operaciones aritméticas",
    hint: "Revisa la ley de signos y las operaciones básicas que realizaste. Un signo incorrecto cambia todo el resultado.",
    tip: "Recuerda: al multiplicar dos negativos el resultado es positivo. Al sumar números de distinto signo, resta y conserva el signo del mayor.",
  },
  variables: {
    icon: "🔤",
    title: "Error con variables y polinomios",
    hint: "Verifica los exponentes de cada variable. Solo se pueden combinar términos semejantes (misma variable, mismo exponente).",
    tip: "Recuerda: x² y x son términos distintos, no se suman como 2x. Revisa cada término por separado.",
  },
  equality: {
    icon: "⚖️",
    title: "Error al aplicar el signo igual",
    hint: "Al factorizar, al expandir el resultado debes obtener exactamente la expresión original. Verifica multiplicando tu respuesta.",
    tip: "Practica: si factorizas a(b+c), al distribuir debes obtener ab+ac. Siempre verifica expandiendo.",
  },
  operations: {
    icon: "➗",
    title: "Error en operaciones con conjuntos numéricos",
    hint: "Revisa si estás operando correctamente con fracciones, enteros o raíces. Cada conjunto tiene sus propias reglas.",
    tip: "Al factorizar, los coeficientes deben ser exactos. Revisa el máximo común divisor.",
  },
  powers: {
    icon: "⚡",
    title: "Error con potencias y radicación",
    hint: "Recuerda las propiedades de potencias: (aⁿ)ᵐ = aⁿᵐ y √(a²) = |a|. Verifica cada exponente.",
    tip: "a² significa a×a. Para factorizar diferencia de cuadrados identifica cada término como cuadrado perfecto.",
  },
};

function getExerciseLevels(exercises: (typeof MODULES)[0]["exercises"]) {
  const perLevel = Math.ceil(exercises.length / 3);
  return [
    exercises.slice(0, perLevel),
    exercises.slice(perLevel, perLevel * 2),
    exercises.slice(perLevel * 2),
  ].filter((l) => l.length > 0);
}

function getLevelForExercise(module: (typeof MODULES)[0], exerciseId: string): number {
  return getExerciseLevels(module.exercises).findIndex((lvl) =>
    lvl.some((e) => e.id === exerciseId)
  );
}

export default function EjercicioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recordExerciseResult, completeLevel, currentStudent, moduleProgress } = useApp();
  const isWeb = Platform.OS === "web";
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const parts = (id ?? "").split("__");
  const moduleId = parts[0];
  const exerciseId = parts[1];

  const module = MODULES.find((m) => m.id === moduleId);
  const exercise = module?.exercises.find((e) => e.id === exerciseId);

  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showTheoryBtn, setShowTheoryBtn] = useState(false);

  const shuffledOptions = useMemo(() => {
    if (!exercise) return [];
    return shuffleArray(exercise.options);
  }, [exerciseId]);

  if (!module || !exercise) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Ejercicio no encontrado</Text>
      </View>
    );
  }

  const isCorrect = selected === exercise.correctAnswer;
  const errorHint = ERROR_HINTS[exercise.errorCategory] ?? ERROR_HINTS["arithmetic"];

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
    if (!selected) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setSubmitted(true);

    if (selected === exercise.correctAnswer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      recordExerciseResult({
        exerciseId: exercise.id,
        moduleId: module.id,
        correct: true,
        selectedAnswer: selected,
        correctAnswer: exercise.correctAnswer,
        errorCategory: exercise.errorCategory,
        attempts: newAttempts,
      });
      const levelIdx = getLevelForExercise(module, exercise.id);
      if (levelIdx !== -1) {
        const levelExs = getExerciseLevels(module.exercises)[levelIdx];
        const doneSet = new Set([...(currentStudent?.completedExercises ?? []), exercise.id]);
        if (levelExs.every((e) => doneSet.has(e.id))) {
          completeLevel(module.id, levelIdx);
        }
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      recordExerciseResult({
        exerciseId: exercise.id,
        moduleId: module.id,
        correct: false,
        selectedAnswer: selected,
        correctAnswer: exercise.correctAnswer,
        errorCategory: exercise.errorCategory,
        attempts: newAttempts,
      });
      if (newAttempts >= 2) setShowTheoryBtn(true);
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
  };

  const getOptionColors = (option: string) => {
    if (!submitted) {
      const isSel = selected === option;
      return {
        bg: isSel ? colors.primary + "15" : colors.card,
        border: isSel ? colors.primary : colors.border,
        text: isSel ? colors.primary : colors.foreground,
      };
    }
    if (option === exercise.correctAnswer && isCorrect) {
      return { bg: colors.success + "12", border: colors.success, text: colors.success };
    }
    if (option === selected && !isCorrect) {
      return { bg: colors.error + "10", border: colors.error, text: colors.error };
    }
    return { bg: colors.card, border: colors.border, text: colors.mutedForeground };
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
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="chevron-left" size={22} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Módulo</Text>
      </TouchableOpacity>

      {/* Module tag */}
      <View
        style={[
          styles.moduleTag,
          { backgroundColor: module.color + "15", borderColor: module.color + "30" },
        ]}
      >
        <Text style={styles.moduleTagIcon}>{module.icon}</Text>
        <Text style={[styles.moduleTagText, { color: module.color }]}>{module.title}</Text>
      </View>

      {/* Question */}
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <View
          style={[
            styles.questionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.questionText, { color: colors.foreground }]}>
            {exercise.question}
          </Text>
          {exercise.expression && (
            <View
              style={[
                styles.expressionBox,
                {
                  backgroundColor: module.color + "08",
                  borderColor: module.color + "30",
                },
              ]}
            >
              <Text style={[styles.expression, { color: module.color }]}>
                {exercise.expression}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Hint toggle */}
      <TouchableOpacity
        style={[
          styles.hintToggle,
          { borderColor: colors.accent + "60", backgroundColor: colors.accent + "10" },
        ]}
        onPress={() => setShowHint(!showHint)}
      >
        <Feather name="help-circle" size={15} color={colors.accent} />
        <Text style={[styles.hintToggleText, { color: colors.accent }]}>
          {showHint ? "Ocultar pista" : "¿Necesitas una pista?"}
        </Text>
        <Feather
          name={showHint ? "chevron-up" : "chevron-down"}
          size={14}
          color={colors.accent}
        />
      </TouchableOpacity>

      {showHint && (
        <View
          style={[
            styles.hintCard,
            {
              backgroundColor: colors.accent + "10",
              borderColor: colors.accent + "30",
            },
          ]}
        >
          <Text style={[styles.hintTitle, { color: colors.accent }]}>💡 Pista</Text>
          {exercise.hint && (
            <Text style={[styles.hintText, { color: colors.foreground }]}>{exercise.hint}</Text>
          )}
          {exercise.steps && exercise.steps.length > 0 && (
            <>
              <Text style={[styles.hintStepsTitle, { color: colors.accent }]}>Pasos sugeridos:</Text>
              {exercise.steps.map((step: string, i: number) => (
                <Text key={i} style={[styles.hintStep, { color: colors.foreground }]}>
                  {step}
                </Text>
              ))}
            </>
          )}
        </View>
      )}

      {/* Options */}
      <View style={styles.options}>
        {shuffledOptions.map((option) => {
          const c = getOptionColors(option);
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                { backgroundColor: c.bg, borderColor: c.border },
              ]}
              onPress={() => {
                if (submitted && isCorrect) return;
                setSelected(option);
              }}
              disabled={submitted && isCorrect}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, { color: c.text }]}>{option}</Text>
              {submitted && option === exercise.correctAnswer && isCorrect && (
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
      {(!submitted || !isCorrect) && (
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: selected ? module.color : colors.secondary,
              borderColor: selected ? module.color : colors.border,
              opacity: !selected && !submitted ? 0.6 : 1,
            },
          ]}
          onPress={submitted && !isCorrect ? handleRetry : handleSubmit}
          disabled={!selected && !submitted}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.submitBtnText,
              { color: selected ? "#fff" : colors.mutedForeground },
            ]}
          >
            {submitted && !isCorrect ? "🔄  Intentar de nuevo" : "Verificar respuesta"}
          </Text>
          {!submitted && (
            <Feather
              name="check"
              size={17}
              color={selected ? "#fff" : colors.mutedForeground}
            />
          )}
        </TouchableOpacity>
      )}

      {/* Wrong feedback — NO correct answer shown */}
      {submitted && !isCorrect && (
        <View
          style={[
            styles.feedbackCard,
            {
              backgroundColor: colors.error + "08",
              borderColor: colors.error + "30",
            },
          ]}
        >
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackIcon}>{errorHint.icon}</Text>
            <Text style={[styles.feedbackTitle, { color: colors.error }]}>
              {errorHint.title}
            </Text>
          </View>
          <Text style={[styles.feedbackHint, { color: colors.foreground }]}>
            {errorHint.hint}
          </Text>
          <View
            style={[
              styles.tipBox,
              {
                backgroundColor: colors.accent + "15",
                borderColor: colors.accent + "30",
              },
            ]}
          >
            <Feather name="zap" size={14} color={colors.accent} />
            <Text style={[styles.tipText, { color: colors.foreground }]}>{errorHint.tip}</Text>
          </View>
          {showTheoryBtn && (
            <TouchableOpacity
              style={[styles.goTheoryBtn, { backgroundColor: module.color }]}
              onPress={() => router.push(`/modulo/${module.id}` as any)}
            >
              <Feather name="book-open" size={15} color="#fff" />
              <Text style={styles.goTheoryText}>Revisar teoría del módulo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Correct celebration */}
      {submitted && isCorrect && (
        <View
          style={[
            styles.feedbackCard,
            {
              backgroundColor: colors.success + "10",
              borderColor: colors.success + "30",
            },
          ]}
        >
          <Text style={styles.correctEmoji}>🎉</Text>
          <Text style={[styles.correctTitle, { color: colors.success }]}>¡Excelente!</Text>
          <Text style={[styles.correctSub, { color: colors.foreground }]}>
            {exercise.explanation}
          </Text>
          <View style={[styles.xpGain, { backgroundColor: colors.accent + "20" }]}>
            <Text style={[styles.xpGainText, { color: colors.accent }]}>
              ⚡ +20 XP ganados
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: module.color }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>← Volver al módulo</Text>
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
  moduleTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  moduleTagIcon: { fontSize: 14 },
  moduleTagText: { fontSize: 12, fontWeight: "700" },
  questionCard: { borderRadius: 18, padding: 20, borderWidth: 1, marginBottom: 12 },
  questionText: { fontSize: 16, fontWeight: "600", lineHeight: 24, marginBottom: 12 },
  expressionBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  expression: { fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
  hintToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  hintToggleText: { fontSize: 13, fontWeight: "600" },
  hintCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 6,
  },
  hintTitle: { fontSize: 13, fontWeight: "800" },
  hintText: { fontSize: 13, lineHeight: 18 },
  hintStepsTitle: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  hintStep: { fontSize: 12, lineHeight: 18 },
  options: { gap: 10, marginBottom: 14 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
  },
  optionText: { fontSize: 16, fontWeight: "600", flex: 1 },
  submitBtn: {
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700" },
  feedbackCard: { borderRadius: 18, padding: 18, borderWidth: 1, gap: 12, marginBottom: 16 },
  feedbackHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  feedbackIcon: { fontSize: 26 },
  feedbackTitle: { fontSize: 15, fontWeight: "800", flex: 1 },
  feedbackHint: { fontSize: 14, lineHeight: 20 },
  tipBox: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },
  goTheoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    padding: 14,
  },
  goTheoryText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  correctEmoji: { fontSize: 40, textAlign: "center" },
  correctTitle: { fontSize: 24, fontWeight: "900", textAlign: "center" },
  correctSub: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  xpGain: { borderRadius: 10, padding: 10, alignItems: "center" },
  xpGainText: { fontSize: 15, fontWeight: "800" },
  nextBtn: { borderRadius: 14, padding: 16, alignItems: "center" },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
