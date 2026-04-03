import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { MODULES } from "@/data/modules";

export default function EvaluacionModuloScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recordExerciseResult } = useApp();
  const isWeb = Platform.OS === "web";

  const module = MODULES.find((m) => m.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!module) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Módulo no encontrado</Text>
      </View>
    );
  }

  const exercises = module.evaluationExercises;
  const exercise = exercises[currentIndex];

  const handleSelect = (option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    Haptics.selectionAsync();
  };

  const handleNext = () => {
    if (!submitted) {
      setSubmitted(true);
      const selected = answers[currentIndex];
      const correct = selected === exercise.correctAnswer;
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      recordExerciseResult({
        exerciseId: `eval-${exercise.id}`,
        moduleId: module.id,
        correct,
        selectedAnswer: selected || "",
        correctAnswer: exercise.correctAnswer,
        errorCategory: exercise.errorCategory,
        timestamp: Date.now(),
      });
      return;
    }
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSubmitted(false);
    } else {
      setFinished(true);
    }
  };

  const correctCount = exercises.reduce((count, ex, i) => {
    return answers[i] === ex.correctAnswer ? count + 1 : count;
  }, 0);

  const score = Math.round((correctCount / exercises.length) * 100);

  if (finished) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: isWeb ? 67 + 32 : insets.top + 32,
            paddingBottom: isWeb ? 34 + 32 : insets.bottom + 32,
            alignItems: "center",
          },
        ]}
      >
        <Text style={[styles.finishEmoji]}>
          {score >= 80 ? "🎓" : score >= 50 ? "📚" : "💪"}
        </Text>
        <Text style={[styles.finishTitle, { color: colors.foreground }]}>
          Evaluación Completada
        </Text>
        <Text style={[styles.finishScore, { color: module.color }]}>
          {score}%
        </Text>
        <Text style={[styles.finishSub, { color: colors.mutedForeground }]}>
          {correctCount} de {exercises.length} respuestas correctas
        </Text>
        <View
          style={[
            styles.scoreCard,
            {
              backgroundColor:
                score >= 80
                  ? colors.success + "15"
                  : score >= 50
                  ? colors.warning + "15"
                  : colors.error + "15",
              borderColor:
                score >= 80
                  ? colors.success
                  : score >= 50
                  ? colors.warning
                  : colors.error,
            },
          ]}
        >
          <Text
            style={[
              styles.scoreMessage,
              {
                color:
                  score >= 80
                    ? colors.success
                    : score >= 50
                    ? colors.warning
                    : colors.error,
              },
            ]}
          >
            {score >= 80
              ? "¡Excelente! Dominas este módulo."
              : score >= 50
              ? "Buen trabajo. Sigue practicando."
              : "Necesitas repasar más este módulo."}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: module.color }]}
          onPress={() => router.push("/(tabs)/" as any)}
          activeOpacity={0.85}
        >
          <Feather name="home" size={18} color="#fff" />
          <Text style={styles.homeBtnText}>Volver al inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const selected = answers[currentIndex];
  const isCorrect = selected === exercise.correctAnswer;

  const optionStyle = (option: string) => {
    if (!submitted) {
      return {
        backgroundColor: selected === option ? module.color + "15" : colors.card,
        borderColor: selected === option ? module.color : colors.border,
      };
    }
    if (option === exercise.correctAnswer) {
      return { backgroundColor: colors.success + "15", borderColor: colors.success };
    }
    if (option === selected && !isCorrect) {
      return { backgroundColor: colors.error + "15", borderColor: colors.error };
    }
    return { backgroundColor: colors.card, borderColor: colors.border };
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
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="chevron-left" size={22} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>
          Evaluaciones
        </Text>
      </TouchableOpacity>

      {/* Header */}
      <View
        style={[styles.evalHeader, { backgroundColor: module.color }]}
      >
        <Text style={styles.evalHeaderIcon}>{module.icon}</Text>
        <View style={styles.evalHeaderInfo}>
          <Text style={styles.evalHeaderLabel}>Evaluación</Text>
          <Text style={styles.evalHeaderTitle}>{module.title}</Text>
        </View>
        <Text style={styles.evalHeaderProgress}>
          {currentIndex + 1}/{exercises.length}
        </Text>
      </View>

      {/* Progress */}
      <View style={[styles.evalProgressBg, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.evalProgressFill,
            {
              backgroundColor: module.color,
              width: `${((currentIndex + (submitted ? 1 : 0)) / exercises.length) * 100}%` as any,
            },
          ]}
        />
      </View>

      {/* Question */}
      <View
        style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.questionText, { color: colors.foreground }]}>
          {exercise.question}
        </Text>
        {exercise.expression && (
          <View
            style={[
              styles.expressionBox,
              { backgroundColor: module.color + "08", borderColor: module.color + "30" },
            ]}
          >
            <Text style={[styles.expression, { color: module.color }]}>
              {exercise.expression}
            </Text>
          </View>
        )}
      </View>

      {/* Options */}
      {exercise.options.map((option, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.option, optionStyle(option)]}
          onPress={() => handleSelect(option)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.optionLetter,
              {
                backgroundColor:
                  submitted && option === exercise.correctAnswer
                    ? colors.success
                    : submitted && option === selected && !isCorrect
                    ? colors.error
                    : selected === option
                    ? module.color
                    : colors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.optionLetterText,
                {
                  color:
                    selected === option ||
                    (submitted && option === exercise.correctAnswer)
                      ? "#fff"
                      : colors.mutedForeground,
                },
              ]}
            >
              {String.fromCharCode(65 + i)}
            </Text>
          </View>
          <Text
            style={[
              styles.optionText,
              {
                color:
                  submitted && option === exercise.correctAnswer
                    ? colors.success
                    : submitted && option === selected && !isCorrect
                    ? colors.error
                    : colors.foreground,
              },
            ]}
          >
            {option}
          </Text>
          {submitted && option === exercise.correctAnswer && (
            <Feather name="check-circle" size={18} color={colors.success} />
          )}
          {submitted && option === selected && !isCorrect && (
            <Feather name="x-circle" size={18} color={colors.error} />
          )}
        </TouchableOpacity>
      ))}

      {/* Feedback after submit */}
      {submitted && (
        <View
          style={[
            styles.feedbackCard,
            {
              backgroundColor: isCorrect ? colors.success + "10" : colors.error + "10",
              borderColor: isCorrect ? colors.success : colors.error,
            },
          ]}
        >
          <Text
            style={[
              styles.feedbackTitle,
              { color: isCorrect ? colors.success : colors.error },
            ]}
          >
            {isCorrect ? "✅ Correcto" : "❌ Incorrecto"}
          </Text>
          <Text style={[styles.feedbackText, { color: colors.foreground }]}>
            {exercise.explanation}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.nextBtn,
          {
            backgroundColor: !selected && !submitted ? colors.muted : module.color,
            opacity: !selected && !submitted ? 0.5 : 1,
          },
        ]}
        onPress={handleNext}
        disabled={!selected && !submitted}
        activeOpacity={0.85}
      >
        <Text style={styles.nextBtnText}>
          {!submitted
            ? "Verificar"
            : currentIndex === exercises.length - 1
            ? "Ver resultados"
            : "Siguiente"}
        </Text>
        <Feather
          name={
            !submitted
              ? "check"
              : currentIndex === exercises.length - 1
              ? "award"
              : "chevron-right"
          }
          size={18}
          color="#fff"
        />
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
  evalHeader: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  evalHeaderIcon: { fontSize: 28 },
  evalHeaderInfo: { flex: 1 },
  evalHeaderLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  evalHeaderTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  evalHeaderProgress: { color: "#fff", fontSize: 16, fontWeight: "800" },
  evalProgressBg: {
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
    overflow: "hidden",
  },
  evalProgressFill: { height: "100%", borderRadius: 2 },
  questionCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 14,
  },
  questionText: { fontSize: 16, fontWeight: "600", lineHeight: 22 },
  expressionBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  expression: { fontSize: 22, fontWeight: "800" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  optionLetterText: { fontSize: 14, fontWeight: "800" },
  optionText: { flex: 1, fontSize: 15, fontWeight: "500" },
  feedbackCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
    gap: 8,
  },
  feedbackTitle: { fontSize: 16, fontWeight: "800" },
  feedbackText: { fontSize: 13, lineHeight: 18 },
  nextBtn: {
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  finishEmoji: { fontSize: 72, marginBottom: 16, textAlign: "center" },
  finishTitle: { fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  finishScore: { fontSize: 64, fontWeight: "900", textAlign: "center" },
  finishSub: { fontSize: 16, textAlign: "center", marginBottom: 24 },
  scoreCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 24,
    maxWidth: 320,
    alignSelf: "stretch",
    alignItems: "center",
  },
  scoreMessage: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  homeBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  homeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
