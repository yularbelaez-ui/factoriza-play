import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Linking,
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
import { getTopicById, TopicExercise } from "@/data/sectionTopics";
import { getBalancedAnswerOptions } from "@/lib/answerOptions";
import { isPersonalizedPrerequisiteTopic } from "@/data/personalizedRoutes";

type Tab = "teoria" | "ejemplos" | "practica";

// XP per exercise
const XP_FIRST_TRY  = 10;
const XP_SECOND_TRY = 5;
const XP_PASS_PCT   = 0.85; // need ≥85% of max XP to pass

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TemaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const { startActivitySession, recordHintEvent, recordExerciseResult } = useApp();

  const topic = getTopicById(id ?? "");
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (topic) {
      startActivitySession(topic.id).then((result) => {
        if (result.ok && result.sessionId) setSessionId(result.sessionId);
      });
    }
  }, [topic?.id]);
  const [activeTab, setActiveTab] = useState<Tab>("teoria");

  // ── Practice state ──────────────────────────────────────────────
  const [queue, setQueue]                         = useState<TopicExercise[]>([]);
  const [practiceIdx, setPracticeIdx]             = useState(0);
  const [selectedAnswer, setSelectedAnswer]       = useState<string | null>(null);
  const [disabledOptions, setDisabledOptions]     = useState<string[]>([]);
  // phase: "idle" | "hint" (wrong first try, showing hint) | "revealed" (final reveal)
  const [phase, setPhase]                         = useState<"idle" | "hint" | "revealed">("idle");
  const [earnedXP, setEarnedXP]                   = useState(0);
  const [practiceFinished, setPracticeFinished]   = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const resetPractice = useCallback(() => {
    if (!topic) return;
    setQueue(shuffleArray(topic.exercises));
    setPracticeIdx(0);
    setSelectedAnswer(null);
    setDisabledOptions([]);
    setPhase("idle");
    setEarnedXP(0);
    setPracticeFinished(false);
  }, [topic]);

  useEffect(() => {
    if (activeTab === "practica") resetPractice();
  }, [activeTab, resetPractice]);

  if (!topic) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Tema no encontrado</Text>
      </View>
    );
  }

  const currentEx = queue[practiceIdx];
  const orderedOptions = currentEx
    ? getBalancedAnswerOptions(
        currentEx.options,
        currentEx.correctAnswer,
        practiceIdx
      )
    : [];
  const totalEx   = queue.length;
  const maxXP     = totalEx * XP_FIRST_TRY;
  const requiresReflection = isPersonalizedPrerequisiteTopic(topic.id);

  // ── Shake animation for wrong answer ────────────────────────────
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Option selection ─────────────────────────────────────────────
  const handleSelect = (opt: string) => {
    if (phase === "revealed") return;
    if (disabledOptions.includes(opt)) return;
    Haptics.selectionAsync();
    setSelectedAnswer(opt);
  };

  // ── Verify button ────────────────────────────────────────────────
  const handleVerify = () => {
    if (!selectedAnswer || !currentEx) return;
    const correct = selectedAnswer === currentEx.correctAnswer;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (correct) {
      // Award XP based on phase
      const xp = phase === "hint" ? XP_SECOND_TRY : XP_FIRST_TRY;
      const attempts = phase === "hint" ? 2 : 1;
      setEarnedXP((prev) => prev + xp);
      recordExerciseResult(
        {
          exerciseId: currentEx.id,
          moduleId: `support:${topic.id}`,
          correct: true,
          selectedAnswer,
          correctAnswer: currentEx.correctAnswer,
          errorCategory: topic.sectionId,
          attempts,
          questionText: currentEx.question,
          topicName: topic.title,
        },
        { hintsUsed: phase === "hint" ? 1 : 0 }
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase("revealed");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      if (phase === "idle") {
        // First wrong attempt → show hint, disable that option
        setDisabledOptions((prev) => [...prev, selectedAnswer]);
        setSelectedAnswer(null);
        setPhase("hint");
        void recordHintEvent(currentEx.id, `${currentEx.id}-hint-1`);
      } else {
        // Second wrong attempt → full reveal, no XP
        recordExerciseResult(
          {
            exerciseId: currentEx.id,
            moduleId: `support:${topic.id}`,
            correct: false,
            selectedAnswer,
            correctAnswer: currentEx.correctAnswer,
            errorCategory: topic.sectionId,
            attempts: 2,
            questionText: currentEx.question,
            topicName: topic.title,
          },
          { hintsUsed: 1 }
        );
        setPhase("revealed");
      }
    }
  };

  // ── Continue to next question ────────────────────────────────────
  const handleContinue = () => {
    if (practiceIdx < totalEx - 1) {
      setPracticeIdx((i) => i + 1);
      setSelectedAnswer(null);
      setDisabledOptions([]);
      setPhase("idle");
    } else {
      // Show the local result card first. Previously this button only tried
      // to open a reflection when a session existed, so it appeared to do
      // nothing for practices without a server session.
      setPracticeFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const tabs: { id: Tab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: "teoria",   label: "Teoría",   icon: "book"   },
    { id: "ejemplos", label: "Ejemplos", icon: "eye"    },
    { id: "practica", label: "Práctica", icon: "edit-3" },
  ];

  // ── Option visual state ──────────────────────────────────────────
  function optionStyle(opt: string) {
    const isSelected = selectedAnswer === opt;
    const isCorrect  = opt === currentEx?.correctAnswer;
    const isDisabled = disabledOptions.includes(opt);

    if (phase === "revealed") {
      if (isCorrect)                 return { bg: "#dcfce7", border: "#16a34a", text: "#16a34a", icon: "check" as const };
      if (isSelected && !isCorrect)  return { bg: "#fee2e2", border: "#dc2626", text: "#dc2626", icon: "x"     as const };
      return { bg: colors.secondary, border: colors.border, text: colors.foreground, icon: null };
    }
    if (isDisabled)
      return { bg: "#fee2e2", border: "#dc262640", text: "#dc262680", icon: "x" as const };
    if (isSelected)
      return { bg: topic!.color + "18", border: topic!.color, text: topic!.color, icon: null };
    return { bg: colors.secondary, border: colors.border, text: colors.foreground, icon: null };
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: topic.color, paddingTop: isWeb ? 67 + 16 : insets.top + 16 }]}>
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
            style={[styles.tab, { borderBottomColor: activeTab === tab.id ? topic.color : "transparent", borderBottomWidth: 3 }]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Feather name={tab.icon} size={15} color={activeTab === tab.id ? topic.color : colors.mutedForeground} />
            <Text style={[styles.tabLabel, { color: activeTab === tab.id ? topic.color : colors.mutedForeground }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ══════════════════════════════════════════
          PRÁCTICA (Duolingo-style, 2-attempt + XP)
          ══════════════════════════════════════════ */}
      {activeTab === "practica" && (
        <View style={{ flex: 1 }}>
          {practiceFinished ? (
            <ScrollView
              contentContainerStyle={[styles.practiceContent, { paddingBottom: isWeb ? 34 + 24 : insets.bottom + 24 }]}
              showsVerticalScrollIndicator={false}
            >
              <PracticeScoreCard
                earnedXP={earnedXP}
                maxXP={maxXP}
                total={totalEx}
                color={topic.color}
                onRetry={resetPractice}
                onComplete={requiresReflection ? () => {
                  if (!sessionId) {
                    Alert.alert(
                      "Sesión no disponible",
                      "No se pudo iniciar la sesión de aprendizaje. Vuelve a abrir el tema e inténtalo de nuevo.",
                    );
                    return;
                  }
                  router.push(
                    `/reflexion?kind=session&sessionId=${encodeURIComponent(sessionId)}&activityId=${encodeURIComponent(topic.id)}&topicId=${encodeURIComponent(topic.id)}` as any,
                  );
                } : undefined}
                onBack={() => router.back()}
              />
            </ScrollView>
          ) : currentEx ? (
            <>
              {/* Progress bar */}
              <View style={[styles.practiceTopBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.progressMeta}>
                  <Text style={[styles.practiceProgress, { color: colors.mutedForeground }]}>
                    Ejercicio {practiceIdx + 1} de {totalEx}
                  </Text>
                  <View style={styles.xpBadge}>
                    <Text style={[styles.xpText, { color: topic.color }]}>⭐ {earnedXP} XP</Text>
                  </View>
                </View>
                <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${(practiceIdx / totalEx) * 100}%` as any, backgroundColor: topic.color }]} />
                </View>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 180 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Question */}
                <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.questionText, { color: colors.foreground }]}>{currentEx.question}</Text>
                  {currentEx.expression && (
                    <View style={[styles.expressionBox, { backgroundColor: topic.color + "12", borderColor: topic.color + "30" }]}>
                      <Text style={[styles.expressionText, { color: topic.color }]}>{currentEx.expression}</Text>
                    </View>
                  )}
                </View>

                {/* Options */}
                <Animated.View style={{ gap: 8, transform: [{ translateX: shakeAnim }] }}>
                  {orderedOptions.map((opt) => {
                    const s = optionStyle(opt);
                    const isDisabled = disabledOptions.includes(opt) || phase === "revealed";
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.optionBtn, { backgroundColor: s.bg, borderColor: s.border }]}
                        onPress={() => handleSelect(opt)}
                        disabled={isDisabled}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.optionText, { color: s.text }]}>{opt}</Text>
                        {s.icon && <Feather name={s.icon} size={16} color={s.text} />}
                      </TouchableOpacity>
                    );
                  })}
                </Animated.View>

                {/* HINT (after first wrong attempt) */}
                {phase === "hint" && (
                  <View style={[styles.hintCard, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
                    <View style={styles.hintHeader}>
                      <Text style={styles.hintEmoji}>💡</Text>
                      <Text style={styles.hintTitle}>Pista — ¡inténtalo de nuevo!</Text>
                    </View>
                    <Text style={[styles.hintBody, { color: "#92400e" }]}>
                      {topic.practiceHint ?? "Repasa la teoría y los ejemplos de este tema para encontrar la respuesta correcta."}
                    </Text>
                    <Text style={[styles.hintNote, { color: "#b45309" }]}>
                      Si aciertas ahora ganarás {XP_SECOND_TRY} XP (en lugar de {XP_FIRST_TRY} XP).
                    </Text>
                  </View>
                )}

                {/* FEEDBACK (after final reveal) */}
                {phase === "revealed" && (
                  <View style={[
                    styles.feedbackCard,
                    {
                      backgroundColor: selectedAnswer === currentEx.correctAnswer ? "#f0fdf4" : "#fef2f2",
                      borderColor:     selectedAnswer === currentEx.correctAnswer ? "#16a34a40" : "#dc262640",
                    },
                  ]}>
                    <View style={styles.feedbackHeader}>
                      <Text style={styles.feedbackEmoji}>
                        {selectedAnswer === currentEx.correctAnswer ? "🎉" : "💡"}
                      </Text>
                      <Text style={[styles.feedbackTitle, { color: selectedAnswer === currentEx.correctAnswer ? "#16a34a" : "#dc2626" }]}>
                        {selectedAnswer === currentEx.correctAnswer ? "¡Correcto!" : "Respuesta incorrecta"}
                      </Text>
                    </View>
                    {selectedAnswer !== currentEx.correctAnswer && (
                      <View style={[styles.correctAnswerTag, { backgroundColor: "#dcfce7", borderColor: "#16a34a30" }]}>
                        <Feather name="check-circle" size={13} color="#16a34a" />
                        <Text style={styles.correctAnswerText}>Respuesta correcta: {currentEx.correctAnswer}</Text>
                      </View>
                    )}
                    <Text style={[styles.feedbackExplanation, { color: "#374151" }]}>{currentEx.explanation}</Text>
                  </View>
                )}
              </ScrollView>

              {/* Bottom action bar */}
              <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: isWeb ? 34 : insets.bottom + 8 }]}>
                {phase !== "revealed" ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: selectedAnswer ? (phase === "hint" ? "#d97706" : topic.color) : colors.border, opacity: selectedAnswer ? 1 : 0.55 }]}
                    onPress={handleVerify}
                    disabled={!selectedAnswer}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionBtnText}>
                      {phase === "hint" ? "Verificar de nuevo" : "Verificar"}
                    </Text>
                    <Feather name={phase === "hint" ? "refresh-cw" : "check"} size={18} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: topic.color }]}
                    onPress={handleContinue}
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
          ) : null}
        </View>
      )}

      {/* ── TEORIA & EJEMPLOS ── */}
      {activeTab !== "practica" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: isWeb ? 34 + 24 : insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
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

              {/* ── Videos recomendados ── */}
              {topic.videos && topic.videos.length > 0 && (
                <View style={[styles.videosCard, { backgroundColor: "#1e1b4b08", borderColor: "#7c3aed20" }]}>
                  <View style={styles.videosHeader}>
                    <Text style={styles.videosEmoji}>📺</Text>
                    <View>
                      <Text style={[styles.videosTitle, { color: colors.foreground }]}>Videos recomendados</Text>
                      <Text style={[styles.videosSub, { color: colors.mutedForeground }]}>Se abre en tu navegador</Text>
                    </View>
                  </View>
                  {topic.videos.map((v, vi) => (
                    <TouchableOpacity
                      key={vi}
                      style={[styles.videoRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => Linking.openURL(v.url)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.videoPlayBtn, { backgroundColor: "#ff0000" }]}>
                        <Feather name="play" size={12} color="#fff" />
                      </View>
                      <View style={styles.videoInfo}>
                        <Text style={[styles.videoTitle, { color: colors.foreground }]} numberOfLines={2}>{v.title}</Text>
                        <Text style={[styles.videoChannel, { color: colors.mutedForeground }]}>{v.channel}</Text>
                      </View>
                      <Feather name="external-link" size={14} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity style={[styles.nextTabBtn, { backgroundColor: topic.color }]} onPress={() => setActiveTab("ejemplos")}>
                <Text style={styles.nextTabBtnText}>Ver ejemplos →</Text>
              </TouchableOpacity>
            </View>
          )}

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

              <TouchableOpacity style={[styles.nextTabBtn, { backgroundColor: topic.color }]} onPress={() => setActiveTab("practica")}>
                <Text style={styles.nextTabBtnText}>Ir a práctica →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ── Score Card ───────────────────────────────────────────────────────
function PracticeScoreCard({
  earnedXP, maxXP, total, color, onRetry, onComplete, onBack,
}: {
  earnedXP: number; maxXP: number; total: number; color: string; onRetry: () => void; onBack: () => void;
  onComplete?: () => void;
}) {
  const pct     = maxXP > 0 ? Math.round((earnedXP / maxXP) * 100) : 0;
  const passed  = pct >= Math.round(XP_PASS_PCT * 100);
  const level   = pct >= 90 ? "¡Excelente!" : pct >= 70 ? "¡Bien hecho!" : "Sigue practicando";
  const emoji   = pct >= 90 ? "🌟" : pct >= 70 ? "👍" : "💪";
  const colors  = useColors();

  return (
    <View style={{ gap: 16, paddingTop: 8 }}>
      <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={styles.scoreEmoji}>{emoji}</Text>
        <Text style={[styles.scoreTitle, { color }]}>{level}</Text>

        {/* XP display */}
        <View style={[styles.xpResultRow, { backgroundColor: color + "12", borderColor: color + "30" }]}>
          <Text style={[styles.xpResultValue, { color }]}>⭐ {earnedXP} / {maxXP} XP</Text>
          <Text style={[styles.xpResultPct, { color: passed ? "#059669" : "#dc2626" }]}>
            {pct}% {passed ? "✅ Aprobado" : "❌ Necesitas más"}
          </Text>
        </View>

        <View style={[styles.scorePctBg, { backgroundColor: colors.border }]}>
          <View style={[styles.scorePctFill, { width: `${pct}%` as any, backgroundColor: passed ? "#059669" : "#d97706" }]} />
        </View>

        {passed ? (
          <View style={[styles.passedBox, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
            <Feather name="award" size={15} color="#059669" />
            <Text style={[styles.passedText, { color: "#059669" }]}>
              {onComplete
                ? "¡Superaste el 85% de XP! Completa la reflexión para cerrar el tema."
                : "¡Superaste el 85% de XP! Puedes continuar con el curso."}
            </Text>
          </View>
        ) : (
          <View style={[styles.hintBoxSmall, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]}>
            <Feather name="zap" size={14} color="#d97706" />
            <Text style={[styles.hintSmallText, { color: "#92400e" }]}>
              Necesitas al menos 85% de XP ({Math.ceil(maxXP * XP_PASS_PCT)} XP). Repasa la teoría y vuelve a intentarlo.
            </Text>
          </View>
        )}
      </View>

      {passed && onComplete && (
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: color }]} onPress={onComplete}>
          <Feather name="arrow-right-circle" size={15} color="#fff" />
          <Text style={styles.retryBtnText}>Completar reflexión y avanzar</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.xpLegend, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.xpLegendTitle, { color: colors.foreground }]}>Sistema de XP:</Text>
        <Text style={[styles.xpLegendRow, { color: colors.mutedForeground }]}>🥇 Respuesta correcta al 1.er intento: {XP_FIRST_TRY} XP</Text>
        <Text style={[styles.xpLegendRow, { color: colors.mutedForeground }]}>🥈 Correcta al 2.° intento (con pista): {XP_SECOND_TRY} XP</Text>
        <Text style={[styles.xpLegendRow, { color: colors.mutedForeground }]}>❌ Incorrecta ambos intentos: 0 XP</Text>
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
    saberes:     "Zona de Repaso",
    algebra:     "Introducción al Álgebra",
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

  // Videos
  videosCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  videosHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  videosEmoji: { fontSize: 26 },
  videosTitle: { fontSize: 15, fontWeight: "800" },
  videosSub: { fontSize: 11, marginTop: 1 },
  videoRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, gap: 10 },
  videoPlayBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  videoChannel: { fontSize: 11, marginTop: 2 },

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
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  stepDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  stepText: { flex: 1, fontSize: 13, lineHeight: 20 },
  resultBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, borderWidth: 1, padding: 10 },
  resultText: { fontSize: 13, fontWeight: "700" },

  // Práctica
  practiceContent: { padding: 16 },
  practiceTopBar: { padding: 12, borderBottomWidth: 1 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  practiceProgress: { fontSize: 13, fontWeight: "600" },
  xpBadge: { flexDirection: "row", alignItems: "center" },
  xpText: { fontSize: 14, fontWeight: "800" },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  questionCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  questionText: { fontSize: 15, fontWeight: "700", lineHeight: 22 },
  expressionBox: { borderRadius: 10, padding: 12, borderWidth: 1, alignItems: "center" },
  expressionText: { fontSize: 16, fontWeight: "800", fontFamily: "monospace" as any },

  optionBtn: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionText: { fontSize: 14, fontWeight: "600", flex: 1 },

  // Hint card
  hintCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 8 },
  hintHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  hintEmoji: { fontSize: 20 },
  hintTitle: { fontSize: 14, fontWeight: "800", color: "#92400e" },
  hintBody: { fontSize: 13, lineHeight: 20 },
  hintNote: { fontSize: 12, fontStyle: "italic" },

  // Feedback card
  feedbackCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  feedbackHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  feedbackEmoji: { fontSize: 22 },
  feedbackTitle: { fontSize: 16, fontWeight: "800" },
  correctAnswerTag: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, borderWidth: 1, padding: 8 },
  correctAnswerText: { fontSize: 13, fontWeight: "600", color: "#16a34a" },
  feedbackExplanation: { fontSize: 13, lineHeight: 20 },

  // Bottom bar
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 12, borderTopWidth: 1 },
  actionBtn: { borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  actionBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  // Score card
  scoreCard: { borderRadius: 20, borderWidth: 1, padding: 20, alignItems: "center", gap: 14 },
  scoreEmoji: { fontSize: 52 },
  scoreTitle: { fontSize: 22, fontWeight: "800" },
  xpResultRow: { borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 4, width: "100%" },
  xpResultValue: { fontSize: 18, fontWeight: "800" },
  xpResultPct: { fontSize: 14, fontWeight: "700" },
  scorePctBg: { height: 8, borderRadius: 4, overflow: "hidden", width: "100%" },
  scorePctFill: { height: "100%", borderRadius: 4 },
  passedBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10, width: "100%" },
  passedText: { flex: 1, fontSize: 13, fontWeight: "600" },
  hintBoxSmall: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10, width: "100%" },
  hintSmallText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "500" },

  xpLegend: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  xpLegendTitle: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  xpLegendRow: { fontSize: 12, lineHeight: 18 },

  retryBtn: { borderRadius: 14, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  retryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
