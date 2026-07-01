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
import { useColors } from "@/hooks/useColors";
import { getTopicById, TopicContent } from "@/data/sectionTopics";

type Tab = "teoria" | "ejemplos" | "practica";

export default function TemaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const topic = getTopicById(id ?? "");
  const [activeTab, setActiveTab] = useState<Tab>("teoria");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState<number | null>(null);

  if (!topic) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Tema no encontrado</Text>
      </View>
    );
  }

  const handleAnswer = (exId: string, option: string) => {
    if (submitted[exId]) return;
    Haptics.selectionAsync();
    setAnswers((prev) => ({ ...prev, [exId]: option }));
  };

  const handleSubmitExercise = (exId: string) => {
    if (!answers[exId]) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitted((prev) => ({ ...prev, [exId]: true }));
  };

  const handleFinishAll = () => {
    const correct = topic.exercises.filter(
      (ex) => answers[ex.id] === ex.correctAnswer
    ).length;
    setScore(correct);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const allAnswered = topic.exercises.every((ex) => answers[ex.id]);
  const allSubmitted = topic.exercises.every((ex) => submitted[ex.id]);

  const tabs: { id: Tab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: "teoria", label: "Teoría", icon: "book" },
    { id: "ejemplos", label: "Ejemplos", icon: "eye" },
    { id: "practica", label: "Práctica", icon: "edit-3" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: topic.color,
            paddingTop: isWeb ? 67 + 16 : insets.top + 16,
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{topic.icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{topic.title}</Text>
            <Text style={styles.headerSection}>{sectionLabel(topic.sectionId)}</Text>
          </View>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              {
                borderBottomColor: activeTab === tab.id ? topic.color : "transparent",
                borderBottomWidth: 3,
              },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Feather
              name={tab.icon}
              size={15}
              color={activeTab === tab.id ? topic.color : colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.id ? topic.color : colors.mutedForeground },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: isWeb ? 34 + 24 : insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TEORÍA ── */}
        {activeTab === "teoria" && (
          <View style={styles.section}>
            {/* Definición */}
            <View style={[styles.defBox, { backgroundColor: topic.color + "12", borderColor: topic.color + "30" }]}>
              <View style={[styles.defBadge, { backgroundColor: topic.color }]}>
                <Text style={styles.defBadgeText}>Definición</Text>
              </View>
              <Text style={[styles.defText, { color: colors.foreground }]}>{topic.definition}</Text>
            </View>

            {/* Conceptos */}
            {topic.theory.map((sec) => (
              <View key={sec.id} style={[styles.theoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.theoryAccent, { backgroundColor: topic.color }]} />
                <View style={styles.theoryBody}>
                  <Text style={[styles.theoryTitle, { color: topic.color }]}>{sec.title}</Text>
                  <Text style={[styles.theoryContent, { color: colors.foreground }]}>{sec.content}</Text>
                  {sec.formula && (
                    <View style={[styles.formulaBox, { backgroundColor: topic.color + "10", borderColor: topic.color + "25" }]}>
                      <Text style={[styles.formulaText, { color: topic.color }]}>{sec.formula}</Text>
                    </View>
                  )}
                  {sec.tip && (
                    <View style={[styles.tipBox, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]}>
                      <Feather name="zap" size={13} color="#d97706" />
                      <Text style={[styles.tipText, { color: "#92400e" }]}>{sec.tip}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.nextTabBtn, { backgroundColor: topic.color }]}
              onPress={() => setActiveTab("ejemplos")}
            >
              <Text style={styles.nextTabBtnText}>Ver ejemplos →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── EJEMPLOS ── */}
        {activeTab === "ejemplos" && (
          <View style={styles.section}>
            {topic.examples.map((ex, idx) => (
              <View key={ex.id} style={[styles.exampleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.exampleHeader, { backgroundColor: topic.color + "10" }]}>
                  <View style={[styles.exNumBadge, { backgroundColor: topic.color }]}>
                    <Text style={styles.exNumText}>{idx + 1}</Text>
                  </View>
                  <Text style={[styles.exTitle, { color: topic.color }]}>{ex.title}</Text>
                </View>
                <View style={styles.exampleBody}>
                  <Text style={[styles.exProblem, { color: colors.foreground }]}>📝 {ex.problem}</Text>
                  {ex.expression && (
                    <View style={[styles.exExprBox, { backgroundColor: topic.color + "08", borderColor: topic.color + "20" }]}>
                      <Text style={[styles.exExpr, { color: topic.color }]}>{ex.expression}</Text>
                    </View>
                  )}
                  <Text style={[styles.stepsLabel, { color: colors.mutedForeground }]}>Solución paso a paso:</Text>
                  {ex.steps.map((step, si) => (
                    <View key={si} style={styles.stepRow}>
                      <View style={[styles.stepDot, { backgroundColor: topic.color }]} />
                      <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
                    </View>
                  ))}
                  <View style={[styles.resultBox, { backgroundColor: "#dcfce7", borderColor: "#16a34a40" }]}>
                    <Feather name="check-circle" size={14} color="#16a34a" />
                    <Text style={[styles.resultText, { color: "#16a34a" }]}>Resultado: {ex.result}</Text>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.nextTabBtn, { backgroundColor: topic.color }]}
              onPress={() => setActiveTab("practica")}
            >
              <Text style={styles.nextTabBtnText}>Ir a práctica →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── PRÁCTICA ── */}
        {activeTab === "practica" && (
          <View style={styles.section}>
            {score !== null ? (
              <ScoreCard score={score} total={topic.exercises.length} color={topic.color} onRetry={() => {
                setAnswers({});
                setSubmitted({});
                setScore(null);
              }} />
            ) : (
              <>
                {topic.exercises.map((ex, idx) => {
                  const chosen = answers[ex.id];
                  const isSubmitted = submitted[ex.id];
                  const isCorrect = chosen === ex.correctAnswer;

                  return (
                    <View key={ex.id} style={[styles.practiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <View style={styles.practiceHeader}>
                        <View style={[styles.practiceNumBadge, { backgroundColor: topic.color }]}>
                          <Text style={styles.practiceNum}>{idx + 1}</Text>
                        </View>
                        <Text style={[styles.practiceQuestion, { color: colors.foreground }]}>{ex.question}</Text>
                      </View>

                      {ex.expression && (
                        <View style={[styles.exExprBox, { backgroundColor: topic.color + "08", borderColor: topic.color + "20", marginHorizontal: 0, marginBottom: 10 }]}>
                          <Text style={[styles.exExpr, { color: topic.color }]}>{ex.expression}</Text>
                        </View>
                      )}

                      <View style={styles.optionsList}>
                        {ex.options.map((opt) => {
                          const isSelected = chosen === opt;
                          const isRight = opt === ex.correctAnswer;
                          let bg = colors.secondary;
                          let border = colors.border;
                          let textColor = colors.foreground;

                          if (isSubmitted) {
                            if (isRight) { bg = "#dcfce7"; border = "#16a34a"; textColor = "#16a34a"; }
                            else if (isSelected && !isRight) { bg = "#fee2e2"; border = "#dc2626"; textColor = "#dc2626"; }
                          } else if (isSelected) {
                            bg = topic.color + "15"; border = topic.color; textColor = topic.color;
                          }

                          return (
                            <TouchableOpacity
                              key={opt}
                              style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                              onPress={() => handleAnswer(ex.id, opt)}
                              disabled={isSubmitted}
                            >
                              <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                              {isSubmitted && isRight && <Feather name="check" size={14} color="#16a34a" />}
                              {isSubmitted && isSelected && !isRight && <Feather name="x" size={14} color="#dc2626" />}
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {!isSubmitted && (
                        <TouchableOpacity
                          style={[styles.submitBtn, { backgroundColor: chosen ? topic.color : colors.border, opacity: chosen ? 1 : 0.5 }]}
                          onPress={() => handleSubmitExercise(ex.id)}
                          disabled={!chosen}
                        >
                          <Text style={styles.submitBtnText}>Verificar</Text>
                        </TouchableOpacity>
                      )}

                      {isSubmitted && (
                        <View style={[styles.explanationBox, { backgroundColor: isCorrect ? "#f0fdf4" : "#fef2f2", borderColor: isCorrect ? "#16a34a30" : "#dc262630" }]}>
                          <Text style={[styles.explanationLabel, { color: isCorrect ? "#16a34a" : "#dc2626" }]}>
                            {isCorrect ? "✅ ¡Correcto!" : "❌ Incorrecto"}
                          </Text>
                          <Text style={[styles.explanationText, { color: colors.foreground }]}>{ex.explanation}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}

                {allSubmitted && (
                  <TouchableOpacity
                    style={[styles.finishBtn, { backgroundColor: topic.color }]}
                    onPress={handleFinishAll}
                  >
                    <Feather name="award" size={16} color="#fff" />
                    <Text style={styles.finishBtnText}>Ver mi puntuación</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ScoreCard({ score, total, color, onRetry }: { score: number; total: number; color: string; onRetry: () => void }) {
  const pct = Math.round((score / total) * 100);
  const level = pct >= 75 ? "¡Excelente!" : pct >= 50 ? "¡Bien hecho!" : "Sigue practicando";
  const emoji = pct >= 75 ? "🌟" : pct >= 50 ? "👍" : "💪";
  const colors = useColors();

  return (
    <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={styles.scoreEmoji}>{emoji}</Text>
      <Text style={[styles.scoreTitle, { color }]}>{level}</Text>
      <Text style={[styles.scoreValue, { color }]}>{score}/{total} correctas</Text>
      <View style={[styles.scorePctBg, { backgroundColor: colors.border }]}>
        <View style={[styles.scorePctFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.scorePctLabel, { color: colors.mutedForeground }]}>{pct}% de acierto</Text>
      <TouchableOpacity style={[styles.retryBtn, { backgroundColor: color }]} onPress={onRetry}>
        <Feather name="refresh-cw" size={14} color="#fff" />
        <Text style={styles.retryBtnText}>Volver a intentar</Text>
      </TouchableOpacity>
    </View>
  );
}

function sectionLabel(sectionId: string): string {
  const labels: Record<string, string> = {
    saberes: "Zona de Repaso",
    algebra: "Introducción al Álgebra",
    operaciones: "Operaciones Algebraicas",
  };
  return labels[sectionId] ?? sectionId;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { paddingHorizontal: 16, paddingBottom: 20 },
  backBtn: { marginBottom: 12, width: 36, height: 36, justifyContent: "center" },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: { fontSize: 36 },
  headerText: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerSection: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 12,
  },
  tabLabel: { fontSize: 13, fontWeight: "600" },

  content: { padding: 16 },
  section: { gap: 14 },

  // Teoría
  defBox: { borderRadius: 14, padding: 16, borderWidth: 1 },
  defBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 8 },
  defBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  defText: { fontSize: 14, lineHeight: 22 },

  theoryCard: { borderRadius: 14, borderWidth: 1, flexDirection: "row", overflow: "hidden" },
  theoryAccent: { width: 4, flexShrink: 0 },
  theoryBody: { flex: 1, padding: 14, gap: 8 },
  theoryTitle: { fontSize: 14, fontWeight: "700" },
  theoryContent: { fontSize: 13, lineHeight: 21 },

  formulaBox: { borderRadius: 8, borderWidth: 1, padding: 10 },
  formulaText: { fontSize: 13, fontWeight: "700", fontFamily: "monospace" as any },

  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    borderColor: "#fde68a",
  },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "500" },

  nextTabBtn: { borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  nextTabBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Ejemplos
  exampleCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  exampleHeader: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  exNumBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  exNumText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  exTitle: { fontSize: 14, fontWeight: "700" },
  exampleBody: { padding: 14, gap: 8 },
  exProblem: { fontSize: 13, fontWeight: "600", lineHeight: 20 },
  exExprBox: { borderRadius: 8, borderWidth: 1, padding: 10, marginHorizontal: 0 },
  exExpr: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  stepsLabel: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  stepRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  stepDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  stepText: { flex: 1, fontSize: 13, lineHeight: 20 },
  resultBox: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, borderWidth: 1, padding: 10 },
  resultText: { fontSize: 13, fontWeight: "700" },

  // Práctica
  practiceCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  practiceHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  practiceNumBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center", flexShrink: 0, marginTop: 1 },
  practiceNum: { color: "#fff", fontSize: 12, fontWeight: "900" },
  practiceQuestion: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  optionsList: { gap: 7 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionText: { fontSize: 13, fontWeight: "500", flex: 1 },
  submitBtn: { borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  explanationBox: { borderRadius: 10, borderWidth: 1, padding: 10, gap: 4 },
  explanationLabel: { fontSize: 13, fontWeight: "700" },
  explanationText: { fontSize: 12, lineHeight: 18 },
  finishBtn: { borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  finishBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Score card
  scoreCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
  scoreEmoji: { fontSize: 52 },
  scoreTitle: { fontSize: 22, fontWeight: "800" },
  scoreValue: { fontSize: 18, fontWeight: "700" },
  scorePctBg: { width: "100%", height: 8, borderRadius: 4, overflow: "hidden", marginVertical: 4 },
  scorePctFill: { height: "100%", borderRadius: 4 },
  scorePctLabel: { fontSize: 13 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 6 },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
