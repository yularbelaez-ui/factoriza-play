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

export default function EjercicioScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recordExerciseResult } = useApp();
  const isWeb = Platform.OS === "web";

  const parts = rawId?.split("__") || [];
  const moduleId = parts[0];
  const exerciseId = parts[1];

  const module = MODULES.find((m) => m.id === moduleId);
  const exercise = module?.exercises.find((e) => e.id === exerciseId);

  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  if (!module || !exercise) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Ejercicio no encontrado</Text>
      </View>
    );
  }

  const isCorrect = selected === exercise.correctAnswer;

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelected(option);
    Haptics.selectionAsync();
  };

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    recordExerciseResult({
      exerciseId: exercise.id,
      moduleId: module.id,
      correct: isCorrect,
      selectedAnswer: selected,
      correctAnswer: exercise.correctAnswer,
      errorCategory: exercise.errorCategory,
      timestamp: Date.now(),
    });
  };

  const optionStyle = (option: string) => {
    if (!submitted) {
      return {
        backgroundColor:
          selected === option ? module.color + "15" : colors.card,
        borderColor: selected === option ? module.color : colors.border,
      };
    }
    if (option === exercise.correctAnswer) {
      return {
        backgroundColor: colors.success + "15",
        borderColor: colors.success,
      };
    }
    if (option === selected && !isCorrect) {
      return {
        backgroundColor: colors.error + "15",
        borderColor: colors.error,
      };
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
      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="chevron-left" size={22} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>
          {module.title}
        </Text>
      </TouchableOpacity>

      {/* Module badge */}
      <View style={[styles.moduleBadge, { backgroundColor: module.color + "15" }]}>
        <Text style={styles.moduleIcon}>{module.icon}</Text>
        <Text style={[styles.moduleName, { color: module.color }]}>
          {module.title}
        </Text>
      </View>

      {/* Question */}
      <View
        style={[
          styles.questionCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.questionText, { color: colors.foreground }]}>
          {exercise.question}
        </Text>
        {exercise.expression ? (
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
        ) : null}
        {exercise.realWorld && (
          <View
            style={[
              styles.realWorldBadge,
              { backgroundColor: colors.accent + "10" },
            ]}
          >
            <Text style={[styles.realWorldText, { color: colors.accent }]}>
              🌍 {exercise.realWorld}
            </Text>
          </View>
        )}
      </View>

      {/* Hint */}
      {!submitted && (
        <TouchableOpacity
          style={[
            styles.hintToggle,
            { backgroundColor: colors.accent + "10", borderColor: colors.accent + "30" },
          ]}
          onPress={() => setShowHint(!showHint)}
        >
          <Feather name="help-circle" size={16} color={colors.accent} />
          <Text style={[styles.hintToggleText, { color: colors.accent }]}>
            {showHint ? "Ocultar pista" : "Ver pista"}
          </Text>
          <Feather
            name={showHint ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors.accent}
          />
        </TouchableOpacity>
      )}
      {showHint && !submitted && (
        <View
          style={[
            styles.hintBox,
            { backgroundColor: colors.accent + "08", borderColor: colors.accent + "30" },
          ]}
        >
          <Text style={[styles.hintText, { color: colors.foreground }]}>
            💡 {exercise.hint}
          </Text>
        </View>
      )}

      {/* Options */}
      <Text style={[styles.optionsLabel, { color: colors.mutedForeground }]}>
        Selecciona una respuesta:
      </Text>
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
                    selected === option || (submitted && option === exercise.correctAnswer)
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

      {/* Submit / Result */}
      {!submitted ? (
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: selected ? module.color : colors.muted,
              opacity: selected ? 1 : 0.5,
            },
          ]}
          onPress={handleSubmit}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>Verificar respuesta</Text>
        </TouchableOpacity>
      ) : (
        <View>
          {/* Result banner */}
          <View
            style={[
              styles.resultBanner,
              {
                backgroundColor: isCorrect
                  ? colors.success + "15"
                  : colors.error + "15",
                borderColor: isCorrect ? colors.success : colors.error,
              },
            ]}
          >
            <Text style={styles.resultEmoji}>{isCorrect ? "🎉" : "😅"}</Text>
            <View style={styles.resultText}>
              <Text
                style={[
                  styles.resultTitle,
                  { color: isCorrect ? colors.success : colors.error },
                ]}
              >
                {isCorrect ? "¡Correcto! +20 XP" : "Incorrecto"}
              </Text>
              <Text
                style={[styles.resultSub, { color: colors.mutedForeground }]}
              >
                {isCorrect
                  ? "¡Excelente trabajo!"
                  : `La respuesta correcta es: ${exercise.correctAnswer}`}
              </Text>
            </View>
          </View>

          {/* Explanation */}
          <View
            style={[
              styles.explanationCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.expTitle, { color: colors.foreground }]}>
              📚 Explicación
            </Text>
            <Text style={[styles.expText, { color: colors.foreground }]}>
              {exercise.explanation}
            </Text>
          </View>

          {/* Steps */}
          <TouchableOpacity
            style={[
              styles.stepsToggle,
              { backgroundColor: module.color + "10", borderColor: module.color + "30" },
            ]}
            onPress={() => setShowSteps(!showSteps)}
          >
            <Feather name="list" size={16} color={module.color} />
            <Text style={[styles.stepsToggleText, { color: module.color }]}>
              {showSteps ? "Ocultar pasos" : "Ver pasos a paso"}
            </Text>
            <Feather
              name={showSteps ? "chevron-up" : "chevron-down"}
              size={14}
              color={module.color}
            />
          </TouchableOpacity>
          {showSteps && (
            <View
              style={[
                styles.stepsBox,
                { backgroundColor: module.color + "08", borderColor: module.color + "20" },
              ]}
            >
              {exercise.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepNum,
                      { backgroundColor: module.color },
                    ]}
                  >
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: colors.secondary }]}
              onPress={() => router.back()}
            >
              <Feather name="list" size={16} color={colors.foreground} />
              <Text style={[styles.navBtnText, { color: colors.foreground }]}>
                Ver módulo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: module.color }]}
              onPress={() => router.back()}
            >
              <Text style={styles.navBtnTextWhite}>Siguiente</Text>
              <Feather name="chevron-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  moduleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  moduleIcon: { fontSize: 16 },
  moduleName: { fontSize: 13, fontWeight: "700" },
  questionCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    marginBottom: 14,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  questionText: { fontSize: 16, fontWeight: "600", lineHeight: 22 },
  expressionBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  expression: { fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
  realWorldBadge: { borderRadius: 8, padding: 8 },
  realWorldText: { fontSize: 12, fontWeight: "600" },
  hintToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  hintToggleText: { fontSize: 13, fontWeight: "600", flex: 1 },
  hintBox: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  hintText: { fontSize: 14, lineHeight: 20 },
  optionsLabel: { fontSize: 12, fontWeight: "600", marginBottom: 10 },
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
  submitBtn: {
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resultBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  resultEmoji: { fontSize: 36 },
  resultText: { flex: 1 },
  resultTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  resultSub: { fontSize: 13 },
  explanationCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 10,
  },
  expTitle: { fontSize: 15, fontWeight: "700" },
  expText: { fontSize: 14, lineHeight: 20 },
  stepsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  stepsToggleText: { fontSize: 13, fontWeight: "600", flex: 1 },
  stepsBox: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 14, gap: 10 },
  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  stepNumText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
  navRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
    padding: 16,
  },
  navBtnText: { fontSize: 15, fontWeight: "700" },
  navBtnTextWhite: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
