import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PRACTICE_CATEGORIES } from "@/data/practice";
import { useColors } from "@/hooks/useColors";
import { getBalancedAnswerOptions } from "@/lib/answerOptions";

export default function PracticaScreen() {
  const { categoria } = useLocalSearchParams<{ categoria: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const cat = PRACTICE_CATEGORIES.find((c) => c.id === categoria);

  const [expandedConcept, setExpandedConcept] = useState<number | null>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const shuffledExercises = useMemo(
    () =>
      cat?.exercises.map((ex, index) => ({
        ...ex,
        shuffledOptions: getBalancedAnswerOptions(
          ex.options,
          ex.correctAnswer,
          index
        ),
      })) ?? [],
    [cat?.id]
  );

  if (!cat) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Categoría no encontrada</Text>
      </View>
    );
  }

  const handleSelect = (exId: string, option: string) => {
    if (checked[exId]) return;
    setAnswers((prev) => ({ ...prev, [exId]: option }));
  };

  const handleCheck = (exId: string) => {
    if (!answers[exId]) return;
    setChecked((prev) => ({ ...prev, [exId]: true }));
    const ex = shuffledExercises.find((e) => e.id === exId);
    if (answers[exId] === ex?.correctAnswer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const donePractice = () => {
    router.back();
  };

  const catColor = cat.color;

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
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="chevron-left" size={22} color={catColor} />
        <Text style={[styles.backText, { color: catColor }]}>Volver</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: catColor, shadowColor: catColor }]}>
        <Text style={styles.headerIcon}>{cat.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerTag}>Práctica de</Text>
          <Text style={styles.headerTitle}>{cat.title}</Text>
          <Text style={styles.headerSub}>{cat.shortDesc}</Text>
        </View>
      </View>

      {/* Why you're here */}
      <View
        style={[styles.alertBox, { backgroundColor: catColor + "12", borderColor: catColor + "40" }]}
      >
        <Feather name="info" size={16} color={catColor} />
        <Text style={[styles.alertText, { color: colors.foreground }]}>
          Refuerza este concepto practicando los ejercicios que están aquí, luego vuelve a intentar el ejercicio del módulo.
        </Text>
      </View>

      {/* Concepts */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        📖 Conceptos clave
      </Text>
      {cat.concepts.map((concept, i) => (
        <View
          key={i}
          style={[styles.conceptCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <TouchableOpacity
            style={styles.conceptHeader}
            onPress={() => setExpandedConcept(expandedConcept === i ? null : i)}
          >
            <View style={[styles.conceptNumBg, { backgroundColor: catColor + "15" }]}>
              <Text style={[styles.conceptNum, { color: catColor }]}>{i + 1}</Text>
            </View>
            <Text style={[styles.conceptTitle, { color: colors.foreground }]}>
              {concept.title}
            </Text>
            <Feather
              name={expandedConcept === i ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>

          {expandedConcept === i && (
            <View style={styles.conceptBody}>
              <Text style={[styles.conceptExplan, { color: colors.foreground }]}>
                {concept.explanation}
              </Text>
              {concept.formula && (
                <View
                  style={[
                    styles.formulaBox,
                    { backgroundColor: catColor + "10", borderColor: catColor + "40" },
                  ]}
                >
                  <Text style={[styles.formulaLabel, { color: catColor }]}>📐 Fórmula:</Text>
                  <Text style={[styles.formula, { color: catColor }]}>{concept.formula}</Text>
                </View>
              )}
              <View
                style={[styles.exampleBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <Text style={[styles.exampleLabel, { color: colors.mutedForeground }]}>✏️ Ejemplo:</Text>
                <Text style={[styles.example, { color: colors.foreground }]}>{concept.example}</Text>
              </View>
              <View
                style={[styles.tipBox, { backgroundColor: colors.accent + "12", borderColor: colors.accent + "30" }]}
              >
                <Feather name="zap" size={14} color={colors.accent} />
                <Text style={[styles.tipText, { color: colors.foreground }]}>{concept.tip}</Text>
              </View>
            </View>
          )}
        </View>
      ))}

      {/* Practice exercises */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        💪 Ejercicios de práctica
      </Text>
      <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
        Practica seleccionando la respuesta correcta
      </Text>

      {shuffledExercises.map((ex, idx) => {
        const isChecked = checked[ex.id];
        const userAns = answers[ex.id];
        const isCorrect = userAns === ex.correctAnswer;

        return (
          <View
            key={ex.id}
            style={[
              styles.exCard,
              {
                backgroundColor: colors.card,
                borderColor: isChecked
                  ? isCorrect
                    ? colors.success + "60"
                    : colors.error + "40"
                  : colors.border,
              },
            ]}
          >
            <View style={styles.exHeader}>
              <View style={[styles.exNum, { backgroundColor: catColor }]}>
                <Text style={styles.exNumText}>{idx + 1}</Text>
              </View>
              <Text style={[styles.exQuestion, { color: colors.foreground }]}>
                {ex.question}
              </Text>
            </View>

            {ex.expression && (
              <View
                style={[
                  styles.exprBox,
                  { backgroundColor: catColor + "08", borderColor: catColor + "25" },
                ]}
              >
                <Text style={[styles.expr, { color: catColor }]}>{ex.expression}</Text>
              </View>
            )}

            <View style={styles.options}>
              {ex.shuffledOptions.map((opt) => {
                let bg = colors.background;
                let border = colors.border;
                let textColor = colors.foreground;

                if (userAns === opt && !isChecked) {
                  bg = catColor + "15";
                  border = catColor;
                  textColor = catColor;
                } else if (isChecked && opt === ex.correctAnswer) {
                  bg = colors.success + "12";
                  border = colors.success;
                  textColor = colors.success;
                } else if (isChecked && opt === userAns && !isCorrect) {
                  bg = colors.error + "10";
                  border = colors.error;
                  textColor = colors.error;
                }

                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                    onPress={() => handleSelect(ex.id, opt)}
                    disabled={isChecked}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.optText, { color: textColor }]}>{opt}</Text>
                    {isChecked && opt === ex.correctAnswer && (
                      <Feather name="check-circle" size={17} color={colors.success} />
                    )}
                    {isChecked && opt === userAns && !isCorrect && (
                      <Feather name="x-circle" size={17} color={colors.error} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {!isChecked && (
              <TouchableOpacity
                style={[
                  styles.checkBtn,
                  {
                    backgroundColor: userAns ? catColor : colors.secondary,
                    opacity: userAns ? 1 : 0.6,
                  },
                ]}
                onPress={() => handleCheck(ex.id)}
                disabled={!userAns}
              >
                <Text style={[styles.checkBtnText, { color: userAns ? "#fff" : colors.mutedForeground }]}>
                  Verificar
                </Text>
                <Feather name="check" size={15} color={userAns ? "#fff" : colors.mutedForeground} />
              </TouchableOpacity>
            )}

            {isChecked && (
              <View
                style={[
                  styles.feedback,
                  {
                    backgroundColor: isCorrect ? colors.success + "10" : colors.error + "08",
                    borderColor: isCorrect ? colors.success + "30" : colors.error + "25",
                  },
                ]}
              >
                <Text style={[styles.feedbackText, { color: isCorrect ? colors.success : colors.error }]}>
                  {isCorrect ? "✅ ¡Correcto!" : "❌ Incorrecto"}
                </Text>
                <Text style={[styles.feedbackExplan, { color: colors.foreground }]}>
                  {ex.explanation}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Return button */}
      <TouchableOpacity
        style={[styles.doneBtn, { backgroundColor: catColor, shadowColor: catColor }]}
        onPress={donePractice}
        activeOpacity={0.85}
      >
        <Feather name="arrow-left" size={18} color="#fff" />
        <Text style={styles.doneBtnText}>Volver al ejercicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16 },
  backText: { fontSize: 15, fontWeight: "600" },
  header: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIcon: { fontSize: 36 },
  headerText: { flex: 1 },
  headerTag: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  alertBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  alertText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 10 },
  sectionSub: { fontSize: 13, marginBottom: 14, marginTop: -6 },
  conceptCard: { borderRadius: 14, marginBottom: 10, borderWidth: 1, overflow: "hidden" },
  conceptHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  conceptNumBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  conceptNum: { fontSize: 13, fontWeight: "800" },
  conceptTitle: { flex: 1, fontSize: 14, fontWeight: "700" },
  conceptBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  conceptExplan: { fontSize: 13, lineHeight: 19 },
  formulaBox: { borderRadius: 10, padding: 12, borderWidth: 1 },
  formulaLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  formula: { fontSize: 15, fontWeight: "700" },
  exampleBox: { borderRadius: 10, padding: 12, borderWidth: 1 },
  exampleLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  example: { fontSize: 13, lineHeight: 18 },
  tipBox: {
    flexDirection: "row",
    gap: 8,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  tipText: { flex: 1, fontSize: 12, lineHeight: 17 },
  exCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 14 },
  exHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  exNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  exNumText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  exQuestion: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  exprBox: { borderRadius: 10, padding: 12, borderWidth: 1, alignItems: "center", marginBottom: 12 },
  expr: { fontSize: 18, fontWeight: "800" },
  options: { gap: 8, marginBottom: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
  },
  optText: { fontSize: 15, fontWeight: "500", flex: 1 },
  checkBtn: {
    borderRadius: 12,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  checkBtnText: { fontSize: 14, fontWeight: "700" },
  feedback: { borderRadius: 12, padding: 12, borderWidth: 1, gap: 6, marginTop: 4 },
  feedbackText: { fontSize: 13, fontWeight: "800" },
  feedbackExplan: { fontSize: 13, lineHeight: 18 },
  doneBtn: {
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
