import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
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

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Mapa: categoría de error → tema de S1/S2/S3 a reforzar
const ERROR_TO_TOPIC: Record<string, { topicId: string; title: string; section: string; color: string; icon: string }> = {
  operaciones:  { topicId: "s3-multiplicacion", title: "Multiplicación de polinomios",      section: "S3 · Operaciones Algebraicas", color: "#059669", icon: "⚙️" },
  ley_signos:   { topicId: "s1-enteros",         title: "Números Enteros y Ley de Signos",  section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  variables:    { topicId: "s2-semejantes",       title: "Términos semejantes y polinomios", section: "S2 · Introducción al Álgebra", color: "#2563eb", icon: "✏️" },
  equality:     { topicId: "s2-expresion",        title: "Expresión y término algebraico",   section: "S2 · Introducción al Álgebra", color: "#2563eb", icon: "✏️" },
  potenciacion: { topicId: "s1-potencias",        title: "Potencias y sus propiedades",      section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  radicacion:   { topicId: "s1-irracionales",     title: "Radicación y números irracionales",section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  arithmetic:   { topicId: "s1-naturales",        title: "Operaciones con naturales",        section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  powers:       { topicId: "s1-potencias",        title: "Potencias y sus propiedades",      section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  operations:   { topicId: "s3-suma-resta",       title: "Suma y resta de polinomios",       section: "S3 · Operaciones Algebraicas", color: "#059669", icon: "⚙️" },
};

const ERROR_HINTS: Record<string, { title: string; hint: string; tip: string; icon: string }> = {
  operaciones: {
    icon: "🔢",
    title: "Error en operaciones aritméticas",
    hint: "Revisa las operaciones básicas: el MCD de los coeficientes o la división de monomios. Un cálculo incorrecto cambia todo el resultado.",
    tip: "Al multiplicar monomios: multiplica coeficientes y suma exponentes. Al dividir: divide coeficientes y resta exponentes.",
  },
  ley_signos: {
    icon: "➕➖",
    title: "Error en la ley de signos",
    hint: "Revisa los signos de cada término. Al sacar un factor común negativo, los signos dentro del paréntesis se invierten.",
    tip: "Regla clave: (−)(−) = (+) y (−)(+) = (−). Verifica siempre multiplicando el factor por el paréntesis.",
  },
  variables: {
    icon: "🔤",
    title: "Error con variables y polinomios",
    hint: "Verifica los exponentes de cada variable. Para el factor variable usa la MENOR potencia entre todos los términos.",
    tip: "Recuerda: x² y x son términos distintos. La menor potencia de x en {x³, x²} es x².",
  },
  equality: {
    icon: "⚖️",
    title: "Error al aplicar el signo igual",
    hint: "En factorización, el = indica equivalencia. Expande tu respuesta para verificar que obtienes la expresión original.",
    tip: "Para verificar: si factorizas a(b+c), distribuye → ab+ac y compara con la expresión original.",
  },
  potenciacion: {
    icon: "⚡",
    title: "Error con propiedades de potenciación",
    hint: "Revisa si el término es un cuadrado o cubo perfecto. El exponente debe ser par (para cuadrados) o divisible entre 3 (para cubos).",
    tip: "Propiedad clave: (aⁿ)ᵐ = aⁿ·ᵐ. Para reconocer cuadrados perfectos: 1,4,9,16,25,36,49,64,81,100...",
  },
  radicacion: {
    icon: "√",
    title: "Error en radicación",
    hint: "Para extraer la raíz cuadrada de un monomio: toma la raíz del coeficiente y divide el exponente entre 2. Para raíz cúbica, divide el exponente entre 3.",
    tip: "√(16x⁴) = 4x² porque √16=4 y x⁴÷2=x². Verifica: (4x²)² = 16x⁴ ✓.",
  },
  arithmetic: {
    icon: "🔢",
    title: "Error en operaciones aritméticas",
    hint: "Revisa las operaciones básicas que realizaste. Un cálculo incorrecto cambia todo el resultado.",
    tip: "Comprueba el MCD de los coeficientes y la potencia más baja de cada variable.",
  },
  powers: {
    icon: "⚡",
    title: "Error con potencias y radicación",
    hint: "Revisa los exponentes y verifica que los términos sean cuadrados o cubos perfectos.",
    tip: "a² significa a×a. Identifica cuadrados perfectos antes de aplicar las fórmulas.",
  },
  operations: {
    icon: "➗",
    title: "Error en operaciones",
    hint: "Revisa los coeficientes y verifica el máximo común divisor.",
    tip: "Al factorizar, los coeficientes deben ser exactos.",
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

function getSuggestedSteps(steps: string[], correctAnswer: string): string[] {
  if (steps.length <= 1) return steps;

  const normalizedAnswer = correctAnswer.replace(/\s+/g, "").toLowerCase();
  const withoutAnswer = steps.filter((step, index) => {
    if (index === steps.length - 1) return false;
    const normalizedStep = step.replace(/\s+/g, "").toLowerCase();
    return (
      !normalizedStep.startsWith("resultado:") &&
      !normalizedStep.startsWith("respuesta:") &&
      !normalizedStep.includes(normalizedAnswer)
    );
  });

  return withoutAnswer.slice(0, 3);
}

export default function EjercicioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recordExerciseResult, completeLevel, startActivitySession, currentStudent, moduleProgress } = useApp();
  const isWeb = Platform.OS === "web";
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const parts = (id ?? "").split("__");
  const moduleId = parts[0];
  const exerciseId = parts[1];

  const module = MODULES.find((m) => m.id === moduleId);
  const exercise = module?.exercises.find((e) => e.id === exerciseId);
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (!module) return;
    startActivitySession(module.id).then((result) => {
      if (result.ok && result.sessionId) setSessionId(result.sessionId);
    });
  }, [module?.id]);
  const isAlreadyCompleted = currentStudent?.completedExercises.includes(exerciseId) ?? false;

  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showTheoryBtn, setShowTheoryBtn] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState("image/jpeg");

  // Time and hint usage for this exercise, used by the teacher panel's
  // per-topic analytics (time spent, errors, hint usage).
  const startTimeRef = useRef(Date.now());
  const hintsUsedRef = useRef(0);
  const toggleHint = () => {
    setShowHint((prev) => {
      if (!prev) hintsUsedRef.current += 1;
      return !prev;
    });
  };

  const exerciseOrdinal = module?.exercises.findIndex((item) => item.id === exerciseId) ?? 0;
  const orderedOptions = useMemo(() => {
    if (!exercise) return [];
    return getBalancedAnswerOptions(
      exercise.options,
      exercise.correctAnswer,
      exerciseOrdinal
    );
  }, [exercise?.id, exerciseOrdinal]);

  if (!module || !exercise) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Ejercicio no encontrado</Text>
      </View>
    );
  }

  if (isAlreadyCompleted) {
    return (
      <View
        style={[
          styles.completedScreen,
          {
            backgroundColor: colors.background,
            paddingTop: isWeb ? 67 + 16 : insets.top + 16,
            paddingBottom: isWeb ? 34 + 24 : insets.bottom + 24,
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={22} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Volver al caso</Text>
        </TouchableOpacity>
        <View style={[styles.completedCard, { backgroundColor: colors.card, borderColor: colors.success + "50" }]}>
          <View style={[styles.completedIcon, { backgroundColor: colors.success + "18" }]}>
            <Feather name="lock" size={30} color={colors.success} />
          </View>
          <Text style={[styles.completedTitle, { color: colors.success }]}>Ejercicio completado</Text>
          <Text style={[styles.completedText, { color: colors.foreground }]}>
            Tu respuesta y la evidencia del procedimiento ya fueron registradas. Este ejercicio está bloqueado para evitar respuestas o fotografías duplicadas.
          </Text>
          <TouchableOpacity
            style={[styles.completedButton, { backgroundColor: module.color }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Feather name="arrow-left" size={16} color="#fff" />
            <Text style={styles.completedButtonText}>Continuar con el caso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isCorrect = selected === exercise.correctAnswer;
  const errorHint = ERROR_HINTS[exercise.errorCategory] ?? ERROR_HINTS["arithmetic"];
  const remediation = ERROR_TO_TOPIC[exercise.errorCategory] ?? null;
  const suggestedSteps = getSuggestedSteps(exercise.steps ?? [], exercise.correctAnswer);

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

  const captureProcedure = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    const result = permission.status === "granted"
      ? await ImagePicker.launchCameraAsync({ quality: 0.75, base64: true })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.75,
          base64: true,
        });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
      setPhotoMimeType(result.assets[0].mimeType ?? "image/jpeg");
    }
  };

  const handleSubmit = () => {
    if (!selected || !photoBase64) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setSubmitted(true);

    const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    if (selected === exercise.correctAnswer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      recordExerciseResult(
        {
          exerciseId: exercise.id,
          moduleId: module.id,
          correct: true,
          selectedAnswer: selected,
          correctAnswer: exercise.correctAnswer,
          errorCategory: exercise.errorCategory,
          attempts: newAttempts,
          questionText: `${exercise.question}${exercise.expression ? ` — ${exercise.expression}` : ""}`,
          topicName: module.title,
          evidenceBase64: photoBase64,
          evidenceMimeType: photoMimeType,
        },
        { hintsUsed: hintsUsedRef.current, durationSeconds: elapsedSeconds }
      );
      const levelIdx = getLevelForExercise(module, exercise.id);
      const doneSet = new Set([...(currentStudent?.completedExercises ?? []), exercise.id]);
      if (levelIdx !== -1) {
        const levelExs = getExerciseLevels(module.exercises)[levelIdx];
        if (levelExs.every((e) => doneSet.has(e.id))) {
          completeLevel(module.id, levelIdx);
        }
      }
      // Si todos los ejercicios del módulo están completados, desbloquear el siguiente caso
      if (module.exercises.every((e) => doneSet.has(e.id))) {
        if (sessionId) {
          router.push({ pathname: "/reflexion", params: { kind: "session", sessionId, activityId: module.id } });
        }
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      recordExerciseResult(
        {
          exerciseId: exercise.id,
          moduleId: module.id,
          correct: false,
          selectedAnswer: selected,
          correctAnswer: exercise.correctAnswer,
          errorCategory: exercise.errorCategory,
          attempts: newAttempts,
          questionText: `${exercise.question}${exercise.expression ? ` — ${exercise.expression}` : ""}`,
          topicName: module.title,
          evidenceBase64: photoBase64,
          evidenceMimeType: photoMimeType,
        },
        { hintsUsed: hintsUsedRef.current, durationSeconds: elapsedSeconds }
      );
      if (newAttempts >= 2) setShowTheoryBtn(true);
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
    setPhotoUri(null);
    setPhotoBase64(null);
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
        <Text style={[styles.backText, { color: colors.primary }]}>Caso</Text>
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

      {/* Story / real-world situation */}
      {exercise.realWorld && (
        <View
          style={[
            styles.storyCard,
            { backgroundColor: module.color + "0d", borderColor: module.color + "30" },
          ]}
        >
          <Text style={styles.storyIcon}>📖</Text>
          <Text style={[styles.storyText, { color: colors.foreground }]}>
            {exercise.realWorld}
          </Text>
        </View>
      )}

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
        onPress={toggleHint}
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
          {suggestedSteps.length > 0 && (
            <>
              <Text style={[styles.hintStepsTitle, { color: colors.accent }]}>Pasos sugeridos:</Text>
              {suggestedSteps.map((step: string, i: number) => (
                <Text key={i} style={[styles.hintStep, { color: colors.foreground }]}>
                  {i + 1}. {step}
                </Text>
              ))}
              <Text style={[styles.hintGuard, { color: colors.mutedForeground }]}>
                Continúa el procedimiento por tu cuenta y compara tu resultado con las opciones.
              </Text>
            </>
          )}
        </View>
      )}

      {/* Options */}
      <View style={styles.options}>
          {orderedOptions.map((option) => {
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

      {!submitted && (
        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: photoBase64 ? colors.success : colors.border }]}>
          <Text style={[styles.questionText, { color: colors.foreground, fontSize: 15 }]}>
            📷 Evidencia obligatoria del procedimiento
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, lineHeight: 18, marginTop: 5 }}>
            Toma una foto clara del procedimiento que realizaste para resolver este ejercicio.
          </Text>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={{ width: "100%", height: 190, borderRadius: 12, marginTop: 12 }} resizeMode="contain" />
          ) : null}
          <TouchableOpacity
            onPress={captureProcedure}
            style={[styles.hintToggle, { borderColor: module.color + "60", backgroundColor: module.color + "10", marginTop: 12 }]}
          >
            <Feather name="camera" size={16} color={module.color} />
            <Text style={[styles.hintToggleText, { color: module.color }]}>
              {photoBase64 ? "Cambiar foto" : "Tomar o seleccionar foto"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action button */}
      {(!submitted || !isCorrect) && (
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: selected && photoBase64 ? module.color : colors.secondary,
              borderColor: selected && photoBase64 ? module.color : colors.border,
              opacity: (!selected || !photoBase64) && !submitted ? 0.6 : 1,
            },
          ]}
          onPress={submitted && !isCorrect ? handleRetry : handleSubmit}
          disabled={(!selected || !photoBase64) && !submitted}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.submitBtnText,
              { color: selected && photoBase64 ? "#fff" : colors.mutedForeground },
            ]}
          >
            {submitted && !isCorrect
              ? "🔄  Intentar de nuevo"
              : !photoBase64
                ? "Adjunta la foto para verificar"
                : "Verificar respuesta"}
          </Text>
          {!submitted && (
            <Feather
              name="check"
              size={17}
              color={selected && photoBase64 ? "#fff" : colors.mutedForeground}
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
          {/* Recomendación: ir al tema de S1/S2/S3 relacionado con el error */}
          {remediation && (
            <TouchableOpacity
              style={[styles.remediationBtn, { backgroundColor: remediation.color + "12", borderColor: remediation.color + "40" }]}
              onPress={() => router.push(`/tema/${remediation.topicId}` as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.remediationIcon, { backgroundColor: remediation.color + "20" }]}>
                <Text style={{ fontSize: 16 }}>{remediation.icon}</Text>
              </View>
              <View style={styles.remediationInfo}>
                <Text style={[styles.remediationLabel, { color: remediation.color }]}>
                  💡 Refuerza este concepto
                </Text>
                <Text style={[styles.remediationTitle, { color: remediation.color }]} numberOfLines={1}>
                  {remediation.title}
                </Text>
                <Text style={[styles.remediationSection, { color: remediation.color + "aa" }]}>
                  {remediation.section}
                </Text>
              </View>
              <Feather name="arrow-right-circle" size={20} color={remediation.color} />
            </TouchableOpacity>
          )}
          {showTheoryBtn && (
            <TouchableOpacity
              style={[styles.goTheoryBtn, { backgroundColor: module.color }]}
              onPress={() => router.push(`/modulo/${module.id}` as any)}
            >
              <Feather name="book-open" size={15} color="#fff" />
              <Text style={styles.goTheoryText}>Revisar teoría del caso</Text>
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
            <Text style={styles.nextBtnText}>← Volver al caso</Text>
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
  completedScreen: { flex: 1, paddingHorizontal: 20 },
  completedCard: { borderRadius: 20, borderWidth: 1.5, padding: 24, alignItems: "center", marginTop: 44, gap: 12 },
  completedIcon: { width: 66, height: 66, borderRadius: 33, alignItems: "center", justifyContent: "center" },
  completedTitle: { fontSize: 21, fontWeight: "800", textAlign: "center" },
  completedText: { fontSize: 14, lineHeight: 21, textAlign: "center" },
  completedButton: { marginTop: 8, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 8 },
  completedButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
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
  storyCard: { flexDirection: "row", gap: 10, borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 12, alignItems: "flex-start" },
  storyIcon: { fontSize: 16 },
  storyText: { flex: 1, fontSize: 13, lineHeight: 19, fontStyle: "italic" },
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
  hintGuard: { fontSize: 11, lineHeight: 17, fontStyle: "italic", marginTop: 3 },
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
  remediationBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1.5, padding: 12,
  },
  remediationIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  remediationInfo: { flex: 1, gap: 1 },
  remediationLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  remediationTitle: { fontSize: 13, fontWeight: "700" },
  remediationSection: { fontSize: 11 },
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
