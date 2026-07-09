import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useApp } from "@/context/AppContext";
import { getTopicById } from "@/data/sectionTopics";

type Tab = "teoria" | "ejemplos" | "practica";

export default function TemaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { completeTopicPractice } = useApp();

  const topic = getTopicById(id ?? "");
  const [activeTab, setActiveTab] = useState<Tab>("teoria");

  // ── Duolingo-style practice state ──
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const [practiceRevealed, setPracticeRevealed] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceFinished, setPracticeFinished] = useState(false);

  // Reset practice when switching to practice tab
  useEffect(() => {
    if (activeTab === "practica") {
      setPracticeIdx(0);
      setPracticeAnswer(null);
      setPracticeRevealed(false);
      setPracticeScore(0);
      setPracticeFinished(false);
    }
  }, [activeTab]);

  if (!topic) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Tema no encontrado</Text>
      </View>
    );
  }

  const exercises = topic.exercises;
  const currentEx = exercises[practiceIdx];
  const totalEx = exercises.length;

  const handlePracticeSelect = (option: string) => {
    if (practiceRevealed) return;
    Haptics.selectionAsync();
    setPracticeAnswer(option);
  };

  const handlePracticeVerify = () => {
    if (!practiceAnswer || practiceRevealed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const correct = practiceAnswer === currentEx.correctAnswer;
    if (correct) {
      setPracticeScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setPracticeRevealed(true);
  };

  const handlePracticeContinue = () => {
    if (practiceIdx < totalEx - 1) {
      setPracticeIdx((i) => i + 1);
      setPracticeAnswer(null);
      setPracticeRevealed(false);
    } else {
      completeTopicPractice(topic.id);
      setPracticeFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handlePracticeRetry = () => {
    setPracticeIdx(0);
    setPracticeAnswer(null);
    setPracticeRevealed(false);
    setPracticeScore(0);
    setPracticeFinished(false);
  };

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

      {/* ── PRÁCTICA (Duolingo-style, outside ScrollView) ── */}
      {activeTab === "practica" && (
        <View style={{ flex: 1 }}>
          {practiceFinished ? (
            <ScrollView
              contentContainerStyle={[styles.practiceContent, { paddingBottom: isWeb ? 34 + 24 : insets.bottom + 24 }]}
              showsVerticalScrollIndicator={false}
            >
              <PracticeScoreCard
                score={practiceScore}
                total={totalEx}
                color={topic.color}
                onRetry={handlePracticeRetry}
                onBack={() => router.back()}
              />
            </ScrollView>
          ) : (
            <>
              {/* Progress bar */}
              <View style={[styles.practiceTopBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={[styles.practiceProgress, { color: colors.mutedForeground }]}>
                    Ejercicio {practiceIdx + 1} de {totalEx}
                  </Text>
                  <Text style={[styles.practiceScore, { color: topic.color }]}>
                    ⭐ {practiceScore} correctas
                  </Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${((practiceIdx) / totalEx) * 100}%` as any,
                        backgroundColor: topic.color,
                      },
                    ]}
                  />
                </View>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 180 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Question */}
                <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.questionText, { color: colors.foreground }]}>
                    {currentEx.question}
                  </Text>
                  {currentEx.expression && (
                    <View style={[styles.expressionBox, { backgroundColor: topic.color + "12", borderColor: topic.color + "30" }]}>
                      <Text style={[styles.expressionText, { color: topic.color }]}>{currentEx.expression}</Text>
                    </View>
                  )}
                </View>

                {/* Options */}
                <View style={{ gap: 8 }}>
                  {currentEx.options.map((opt) => {
                    const isSelected = practiceAnswer === opt;
                    const isCorrect = opt === currentEx.correctAnswer;
                    let bg = colors.secondary;
                    let border = colors.border;
                    let textColor = colors.foreground;
                    let rightIcon: "check" | "x" | null = null;

                    if (practiceRevealed) {
                      if (isCorrect) {
                        bg = "#dcfce7"; border = "#16a34a"; textColor = "#16a34a"; rightIcon = "check";
                      } else if (isSelected && !isCorrect) {
                        bg = "#fee2e2"; border = "#dc2626"; textColor = "#dc2626"; rightIcon = "x";
                      }
                    } else if (isSelected) {
                      bg = topic.color + "18"; border = topic.color; textColor = topic.color;
                    }

                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                        onPress={() => handlePracticeSelect(opt)}
                        disabled={practiceRevealed}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                        {rightIcon && (
                          <Feather
                            name={rightIcon}
                            size={16}
                            color={rightIcon === "check" ? "#16a34a" : "#dc2626"}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Feedback panel */}
                {practiceRevealed && (
                  <View
                    style={[
                      styles.feedbackCard,
                      {
                        backgroundColor: practiceAnswer === currentEx.correctAnswer ? "#f0fdf4" : "#fef2f2",
                        borderColor: practiceAnswer === currentEx.correctAnswer ? "#16a34a40" : "#dc262640",
                      },
                    ]}
                  >
                    <View style={styles.feedbackHeader}>
                      <Text style={styles.feedbackEmoji}>
                        {practiceAnswer === currentEx.correctAnswer ? "🎉" : "💡"}
                      </Text>
                      <Text
                        style={[
                          styles.feedbackTitle,
                          { color: practiceAnswer === currentEx.correctAnswer ? "#16a34a" : "#dc2626" },
                        ]}
                      >
                        {practiceAnswer === currentEx.correctAnswer ? "¡Correcto!" : "Incorrecto"}
                      </Text>
                    </View>
                    {practiceAnswer !== currentEx.correctAnswer && (
                      <View style={[styles.correctAnswerTag, { backgroundColor: "#dcfce7", borderColor: "#16a34a30" }]}>
                        <Feather name="check-circle" size={13} color="#16a34a" />
                        <Text style={styles.correctAnswerText}>
                          Respuesta correcta: {currentEx.correctAnswer}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.feedbackExplanation, { color: "#374151" }]}>
                      {currentEx.explanation}
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Bottom action bar */}
              <View
                style={[
                  styles.bottomBar,
                  {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    paddingBottom: isWeb ? 34 : insets.bottom + 8,
                  },
                ]}
              >
                {!practiceRevealed ? (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: practiceAnswer ? topic.color : colors.border,
                        opacity: practiceAnswer ? 1 : 0.55,
                      },
                    ]}
                    onPress={handlePracticeVerify}
                    disabled={!practiceAnswer}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionBtnText}>Verificar</Text>
                    <Feather name="check" size={18} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: topic.color }]}
                    onPress={handlePracticeContinue}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionBtnText}>
                      {practiceIdx < totalEx - 1 ? "Continuar" : "Ver resultado"}
                    </Text>
                    <Feather name="arrow-right" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      )}

      {/* ── TEORIA & EJEMPLOS (in ScrollView) ── */}
      {activeTab !== "practica" && (
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
              <View style={[styles.defBox, { backgroundColor: topic.color + "12", borderColor: topic.color + "30" }]}>
                <View style={[styles.defBadge, { backgroundColor: topic.color }]}>
                  <Text style={styles.defBadgeText}>Definición</Text>
                </View>
                <Text style={[styles.defText, { color: colors.foreground }]}>{topic.definition}</Text>
              </View>

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
        </ScrollView>
      )}
    </View>
  );
}

function PracticeScoreCard({
  score, total, color, onRetry, onBack,
}: {
  score: number; total: number; color: string; onRetry: () => void; onBack: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const level = pct >= 80 ? "¡Excelente!" : pct >= 60 ? "¡Bien hecho!" : "Sigue practicando";
  const emoji = pct >= 80 ? "🌟" : pct >= 60 ? "👍" : "💪";
  const colors = useColors();

  return (
    <View style={{ gap: 16, paddingTop: 8 }}>
      <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={styles.scoreEmoji}>{emoji}</Text>
        <Text style={[styles.scoreTitle, { color }]}>{level}</Text>
        <Text style={[styles.scoreValue, { color }]}>{score}/{total} correctas</Text>
        <View style={[styles.scorePctBg, { backgroundColor: colors.border }]}>
          <View style={[styles.scorePctFill, { width: `${pct}%` as any, backgroundColor: color }]} />
        </View>
        <Text style={[styles.scorePctLabel, { color: colors.mutedForeground }]}>{pct}% de acierto</Text>

        {pct < 70 && (
          <View style={[styles.hintBox, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]}>
            <Feather name="zap" size={14} color="#d97706" />
            <Text style={[styles.hintText, { color: "#92400e" }]}>
              Te recomendamos repasar la teoría y los ejemplos antes de reintentar.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={[styles.retryBtn, { backgroundColor: color }]} onPress={onRetry}>
        <Feather name="refresh-cw" size={14} color="#fff" />
        <Text style={styles.retryBtnText}>Volver a intentar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.retryBtn, { backgroundColor: "transparent", borderWidth: 1.5, borderColor: color }]}
        onPress={onBack}
      >
        <Feather name="arrow-left" size={14} color={color} />
        <Text style={[styles.retryBtnText, { color }]}>Volver al módulo</Text>
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

  tabBar: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 8 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 12 },
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

  tipBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, borderRadius: 8, borderWidth: 1, padding: 10, borderColor: "#fde68a" },
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
  exExprBox: { borderRadius: 8, borderWidth: 1, padding: 10 },
  exExpr: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  stepsLabel: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  stepRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  stepDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  stepText: { flex: 1, fontSize: 13, lineHeight: 20 },
  resultBox: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, borderWidth: 1, padding: 10 },
  resultText: { fontSize: 13, fontWeight: "700" },

  // Práctica (Duolingo)
  practiceContent: { padding: 16 },
  practiceTopBar: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  practiceProgress: { fontSize: 12, fontWeight: "600" },
  practiceScore: { fontSize: 12, fontWeight: "700" },
  progressBg: { height: 7, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },

  questionCard: { borderRadius: 16, borderWidth: 1, padding: 18 },
  questionText: { fontSize: 16, fontWeight: "600", lineHeight: 24, marginBottom: 10 },
  expressionBox: { borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "center", marginTop: 4 },
  expressionText: { fontSize: 22, fontWeight: "800", letterSpacing: 1 },

  optionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 12, borderWidth: 1.5, paddingVertical: 14, paddingHorizontal: 16,
  },
  optionText: { fontSize: 15, fontWeight: "600", flex: 1 },

  feedbackCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  feedbackHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  feedbackEmoji: { fontSize: 22 },
  feedbackTitle: { fontSize: 16, fontWeight: "800" },
  correctAnswerTag: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 8, borderWidth: 1, padding: 8,
  },
  correctAnswerText: { fontSize: 13, fontWeight: "700", color: "#16a34a", flex: 1 },
  feedbackExplanation: { fontSize: 13, lineHeight: 20 },

  bottomBar: {
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
    position: "absolute", bottom: 0, left: 0, right: 0,
  },
  actionBtn: {
    borderRadius: 14, paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  actionBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  // Score card
  scoreCard: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
  scoreEmoji: { fontSize: 52 },
  scoreTitle: { fontSize: 22, fontWeight: "800" },
  scoreValue: { fontSize: 18, fontWeight: "700" },
  scorePctBg: { width: "100%", height: 8, borderRadius: 4, overflow: "hidden", marginVertical: 4 },
  scorePctFill: { height: "100%", borderRadius: 4 },
  scorePctLabel: { fontSize: 13 },
  hintBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, borderRadius: 10, borderWidth: 1, padding: 10, width: "100%" },
  hintText: { flex: 1, fontSize: 12, lineHeight: 18 },
  retryBtn: { borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
