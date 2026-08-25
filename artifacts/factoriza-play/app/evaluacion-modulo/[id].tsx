import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

export default function EvaluacionModuloScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { evaluationCodes, recordExerciseResult } = useApp();
  const isWeb = Platform.OS === "web";

  const module = MODULES.find((m) => m.id === id);

  const [codeInput, setCodeInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoStep, setPhotoStep] = useState(false); // show photo step before submit

  // Take max 10 evaluation exercises (shuffled)
  const shuffledExercises = useMemo(() => {
    if (!module) return [];
    // Show max 10 questions in a varied order, then distribute correct
    // answers over A/B/C/D in the same order students see them.
    return shuffleArray(module.evaluationExercises)
      .slice(0, 10)
      .map((ex, index) => ({
        ...ex,
        shuffledOptions: getBalancedAnswerOptions(
          ex.options,
          ex.correctAnswer,
          index
        ),
      }));
  }, [id]);

  if (!module) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Caso no encontrado</Text>
      </View>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === shuffledExercises.length;
  const correctCount = shuffledExercises.filter((ex) => answers[ex.id] === ex.correctAnswer).length;
  const score = shuffledExercises.length > 0
    ? Math.round((correctCount / shuffledExercises.length) * 100)
    : 0;

  const handleUnlock = () => {
    const evalSession = evaluationCodes.find((e) => e.moduleId === module.id);
    if (!evalSession) {
      setCodeError("Este caso no tiene código activo. Consulta a tu docente.");
      return;
    }
    if (codeInput.trim().toUpperCase() !== evalSession.code.toUpperCase()) {
      setCodeError("Código incorrecto. Verifica con tu docente.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setUnlocked(true);
    setCodeError("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSelect = (exerciseId: string, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [exerciseId]: option }));
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      // Try gallery
      const galleryResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });
      if (!galleryResult.canceled && galleryResult.assets[0]) {
        setPhotoUri(galleryResult.assets[0].uri);
      }
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    shuffledExercises.forEach((ex) => {
      if (answers[ex.id]) {
        recordExerciseResult({
          exerciseId: ex.id,
          moduleId: module.id,
          correct: answers[ex.id] === ex.correctAnswer,
          selectedAnswer: answers[ex.id] ?? "",
          correctAnswer: ex.correctAnswer,
          errorCategory: ex.errorCategory,
          attempts: 1,
        });
      }
    });
  };

  const getOptionColors = (ex: (typeof shuffledExercises)[0], option: string) => {
    if (!submitted) {
      const isSel = answers[ex.id] === option;
      return {
        bg: isSel ? colors.primary + "15" : colors.card,
        border: isSel ? colors.primary : colors.border,
        text: isSel ? colors.primary : colors.foreground,
      };
    }
    if (option === ex.correctAnswer) {
      return { bg: colors.success + "12", border: colors.success, text: colors.success };
    }
    if (answers[ex.id] === option && option !== ex.correctAnswer) {
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
        <Text style={[styles.backText, { color: colors.primary }]}>Evaluación</Text>
      </TouchableOpacity>

      <View style={[styles.header, { backgroundColor: module.color, shadowColor: module.color }]}>
        <Text style={styles.headerIcon}>{module.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTag}>Evaluación Final</Text>
          <Text style={styles.headerTitle}>{module.title}</Text>
          <Text style={styles.headerSub}>{shuffledExercises.length} preguntas de selección múltiple</Text>
        </View>
        <View style={[styles.scoreCircle, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name="clipboard" size={22} color="#fff" />
        </View>
      </View>

      {/* ── CODE GATE ── */}
      {!unlocked && (
        <View style={[styles.codeGate, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="lock" size={28} color={colors.primary} />
          <Text style={[styles.codeGateTitle, { color: colors.foreground }]}>Evaluación Bloqueada</Text>
          <Text style={[styles.codeGateSub, { color: colors.mutedForeground }]}>
            Tu docente te dará el código cuando sea el momento de realizar la evaluación.
          </Text>
          <TextInput
            style={[styles.codeInput, {
              backgroundColor: colors.background,
              borderColor: codeError ? colors.error : colors.border,
              color: colors.foreground,
            }]}
            placeholder="Ingresa el código"
            placeholderTextColor={colors.mutedForeground}
            value={codeInput}
            onChangeText={(t) => { setCodeInput(t.toUpperCase()); setCodeError(""); }}
            autoCapitalize="characters"
            maxLength={10}
            textAlign="center"
          />
          {codeError ? <Text style={[styles.codeError, { color: colors.error }]}>{codeError}</Text> : null}
          <TouchableOpacity
            style={[styles.unlockBtn, { backgroundColor: colors.primary }]}
            onPress={handleUnlock}
          >
            <Feather name="unlock" size={16} color="#fff" />
            <Text style={styles.unlockBtnText}>Desbloquear evaluación</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── INSTRUCTIONS ── */}
      {unlocked && !started && (
        <View style={[styles.instructions, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.instrEmoji}>📋</Text>
          <Text style={[styles.instrTitle, { color: colors.foreground }]}>Instrucciones</Text>
          <View style={{ gap: 10 }}>
            {[
              `${shuffledExercises.length} preguntas de selección múltiple`,
              "Lee cada pregunta con cuidado antes de responder",
              "Selecciona la opción que consideres correcta",
              "📷 Deberás adjuntar foto de tu procedimiento escrito",
              "Responde todas las preguntas antes de enviar",
              "No se pueden cambiar respuestas después de enviar",
            ].map((item, i) => (
              <View key={i} style={styles.instrItem}>
                <View style={[styles.instrNum, { backgroundColor: colors.primary }]}>
                  <Text style={styles.instrNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.instrText, { color: colors.foreground }]}>{item}</Text>
              </View>
            ))}
          </View>
          {/* Photo reminder */}
          <View style={[styles.photoReminder, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
            <Text style={{ fontSize: 20 }}>📝</Text>
            <Text style={[styles.photoReminderText, { color: "#92400e" }]}>
              Antes de enviar necesitas tomar una foto de los ejercicios resueltos en tu cuaderno.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: module.color }]}
            onPress={() => setStarted(true)}
          >
            <Text style={styles.startBtnText}>Comenzar evaluación →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── QUESTIONS ── */}
      {unlocked && started && !submitted && !photoStep && (
        <View>
          {/* Progress indicator */}
          <View style={[styles.examProgress, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.examProgressText, { color: colors.foreground }]}>
              {answeredCount}/{shuffledExercises.length} respondidas
            </Text>
            <View style={[styles.examProgressBg, { backgroundColor: colors.border }]}>
              <View style={[styles.examProgressFill, {
                width: `${shuffledExercises.length > 0 ? (answeredCount / shuffledExercises.length) * 100 : 0}%` as any,
                backgroundColor: module.color,
              }]} />
            </View>
          </View>

          {shuffledExercises.map((ex, idx) => (
            <View
              key={ex.id}
              style={[styles.questionCard, {
                backgroundColor: colors.card,
                borderColor: answers[ex.id] ? module.color + "40" : colors.border,
              }]}
            >
              <View style={styles.questionHeader}>
                <View style={[styles.qNum, { backgroundColor: answers[ex.id] ? module.color : colors.border }]}>
                  <Text style={styles.qNumText}>{idx + 1}</Text>
                </View>
                <Text style={[styles.qText, { color: colors.foreground }]}>{ex.question}</Text>
              </View>
              {ex.expression && (
                <View style={[styles.exprBox, { backgroundColor: module.color + "08", borderColor: module.color + "30" }]}>
                  <Text style={[styles.expr, { color: module.color }]}>{ex.expression}</Text>
                </View>
              )}
              <View style={{ gap: 8 }}>
                {ex.shuffledOptions.map((opt) => {
                  const isSel = answers[ex.id] === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.optBtn, {
                        backgroundColor: isSel ? colors.primary + "15" : colors.background,
                        borderColor: isSel ? colors.primary : colors.border,
                      }]}
                      onPress={() => handleSelect(ex.id, opt)}
                    >
                      <View style={[styles.optBullet, { backgroundColor: isSel ? colors.primary : colors.border }]}>
                        {isSel && <Feather name="check" size={10} color="#fff" />}
                      </View>
                      <Text style={[styles.optText, { color: isSel ? colors.primary : colors.foreground }]}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Go to photo step */}
          <TouchableOpacity
            style={[styles.submitBtn, {
              backgroundColor: allAnswered ? module.color : colors.secondary,
              opacity: allAnswered ? 1 : 0.6,
            }]}
            onPress={() => allAnswered && setPhotoStep(true)}
            disabled={!allAnswered}
          >
            <Feather name="camera" size={18} color={allAnswered ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.submitBtnText, { color: allAnswered ? "#fff" : colors.mutedForeground }]}>
              {allAnswered ? "Adjuntar procedimiento →" : `Responde todas (${answeredCount}/${shuffledExercises.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── PHOTO STEP ── */}
      {unlocked && started && !submitted && photoStep && (
        <View style={[styles.photoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.photoEmoji}>📷</Text>
          <Text style={[styles.photoTitle, { color: colors.foreground }]}>
            Adjunta tu procedimiento
          </Text>
          <Text style={[styles.photoSub, { color: colors.mutedForeground }]}>
            Toma una foto clara de los ejercicios resueltos en tu cuaderno. El docente revisará tu procedimiento.
          </Text>

          {!photoUri ? (
            <View style={{ gap: 10, width: "100%" }}>
              <TouchableOpacity
                style={[styles.photoBtn, { backgroundColor: module.color }]}
                onPress={handlePickPhoto}
              >
                <Feather name="camera" size={18} color="#fff" />
                <Text style={styles.photoBtnText}>Tomar foto con cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoBtnAlt, { borderColor: module.color }]}
                onPress={handlePickFromGallery}
              >
                <Feather name="image" size={18} color={module.color} />
                <Text style={[styles.photoBtnAltText, { color: module.color }]}>Seleccionar de galería</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoPreviewArea}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="contain" />
              <View style={[styles.photoCheck, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
                <Feather name="check-circle" size={18} color={colors.success} />
                <Text style={[styles.photoCheckText, { color: colors.success }]}>Foto adjuntada correctamente</Text>
              </View>
              <TouchableOpacity
                style={[styles.photoBtnAlt, { borderColor: colors.mutedForeground }]}
                onPress={handlePickPhoto}
              >
                <Text style={[styles.photoBtnAltText, { color: colors.mutedForeground }]}>Cambiar foto</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.optionalNote, { backgroundColor: colors.accent + "10", borderColor: colors.accent + "20" }]}>
            <Feather name="info" size={14} color={colors.accent} />
            <Text style={[styles.optionalNoteText, { color: colors.foreground }]}>
              Si no puedes tomar foto ahora, puedes continuar. El docente puede solicitarla después.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: module.color }]}
            onPress={handleSubmit}
          >
            <Feather name="send" size={18} color="#fff" />
            <Text style={[styles.submitBtnText, { color: "#fff" }]}>Enviar evaluación</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backToQBtn} onPress={() => setPhotoStep(false)}>
            <Text style={[styles.backToQText, { color: colors.mutedForeground }]}>← Volver a las preguntas</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── RESULTS ── */}
      {submitted && (
        <View>
          <View style={[styles.resultCard, {
            backgroundColor: score >= 70 ? colors.success + "12" : colors.error + "10",
            borderColor: score >= 70 ? colors.success + "40" : colors.error + "30",
          }]}>
            <Text style={styles.resultEmoji}>{score >= 90 ? "🏆" : score >= 70 ? "🎉" : score >= 50 ? "📚" : "💪"}</Text>
            <Text style={[styles.resultScore, { color: score >= 70 ? colors.success : colors.error }]}>{score}%</Text>
            <Text style={[styles.resultTitle, { color: colors.foreground }]}>
              {score >= 90 ? "¡Dominas este tema!" : score >= 70 ? "¡Buen trabajo!" : score >= 50 ? "Sigue practicando" : "Necesitas reforzar"}
            </Text>
            <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
              {correctCount} de {shuffledExercises.length} respuestas correctas
            </Text>
            {photoUri && (
              <View style={[styles.photoCheck, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
                <Feather name="camera" size={14} color={colors.success} />
                <Text style={[styles.photoCheckText, { color: colors.success }]}>Procedimiento adjuntado</Text>
              </View>
            )}
          </View>

          {/* Review */}
          <Text style={[styles.reviewTitle, { color: colors.foreground }]}>Revisión detallada</Text>
          {shuffledExercises.map((ex, idx) => {
            const userAns = answers[ex.id];
            const ok = userAns === ex.correctAnswer;
            return (
              <View key={ex.id} style={[styles.reviewCard, {
                backgroundColor: colors.card,
                borderColor: ok ? colors.success + "40" : colors.error + "30",
                borderLeftWidth: 4,
                borderLeftColor: ok ? colors.success : colors.error,
              }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.qNum, { backgroundColor: ok ? colors.success : colors.error }]}>
                    <Text style={styles.qNumText}>{idx + 1}</Text>
                  </View>
                  <Text style={[styles.qText, { color: colors.foreground, fontSize: 13 }]} numberOfLines={3}>
                    {ex.question}{ex.expression ? ` — ${ex.expression}` : ""}
                  </Text>
                  <Feather name={ok ? "check-circle" : "x-circle"} size={18} color={ok ? colors.success : colors.error} />
                </View>
                {!ok && (
                  <View style={{ marginTop: 10, gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={{ fontSize: 12, color: colors.error }}>
                      Tu respuesta: {userAns || "(sin respuesta)"}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.success, fontWeight: "700" }}>
                      Respuesta correcta: {ex.correctAnswer}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.foreground, marginTop: 4, lineHeight: 17 }}>
                      💡 {ex.explanation}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: module.color }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>← Volver al caso</Text>
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

  header: {
    borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center",
    gap: 14, marginBottom: 20, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  headerIcon: { fontSize: 32 },
  headerTag: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  scoreCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },

  codeGate: { borderRadius: 20, padding: 28, alignItems: "center", borderWidth: 1, gap: 12, marginBottom: 20 },
  codeGateTitle: { fontSize: 20, fontWeight: "800" },
  codeGateSub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  codeInput: { borderWidth: 1.5, borderRadius: 14, padding: 16, fontSize: 22, fontWeight: "800", letterSpacing: 6, width: "100%", textAlign: "center" },
  codeError: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  unlockBtn: { borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 8, width: "100%", justifyContent: "center" },
  unlockBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  instructions: { borderRadius: 20, padding: 24, borderWidth: 1, gap: 16, marginBottom: 20 },
  instrEmoji: { fontSize: 36, textAlign: "center" },
  instrTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  instrItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  instrNum: { width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center", marginTop: 1, flexShrink: 0 },
  instrNumText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  instrText: { flex: 1, fontSize: 14, lineHeight: 20 },
  photoReminder: { borderRadius: 12, padding: 12, borderWidth: 1, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  photoReminderText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  startBtn: { borderRadius: 14, padding: 18, alignItems: "center", marginTop: 4 },
  startBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  examProgress: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 14, gap: 8 },
  examProgressText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  examProgressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  examProgressFill: { height: "100%", borderRadius: 3 },

  questionCard: { borderRadius: 16, padding: 18, borderWidth: 1.5, marginBottom: 14 },
  questionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  qNum: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 1, flexShrink: 0 },
  qNumText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  qText: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  exprBox: { borderRadius: 10, padding: 14, borderWidth: 1, alignItems: "center", marginBottom: 12 },
  expr: { fontSize: 20, fontWeight: "800" },
  optBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 12, borderWidth: 1.5 },
  optBullet: { width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  optText: { fontSize: 14, fontWeight: "500", flex: 1 },

  submitBtn: { borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 },
  submitBtnText: { fontSize: 16, fontWeight: "700" },

  // Photo step
  photoCard: { borderRadius: 20, padding: 24, borderWidth: 1, alignItems: "center", gap: 16, marginBottom: 20 },
  photoEmoji: { fontSize: 48 },
  photoTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  photoSub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  photoBtn: { borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
  photoBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  photoBtnAlt: { borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", borderWidth: 1.5 },
  photoBtnAltText: { fontSize: 15, fontWeight: "700" },
  photoPreviewArea: { width: "100%", gap: 10 },
  photoPreview: { width: "100%", height: 200, borderRadius: 14 },
  photoCheck: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 10, borderWidth: 1, alignSelf: "stretch" },
  photoCheckText: { fontSize: 13, fontWeight: "600" },
  optionalNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, padding: 10, borderWidth: 1, alignSelf: "stretch" },
  optionalNoteText: { flex: 1, fontSize: 12, lineHeight: 17 },
  backToQBtn: { paddingVertical: 8 },
  backToQText: { fontSize: 14 },

  // Results
  resultCard: { borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 1.5, gap: 8, marginBottom: 20 },
  resultEmoji: { fontSize: 48 },
  resultScore: { fontSize: 52, fontWeight: "900" },
  resultTitle: { fontSize: 22, fontWeight: "800" },
  resultSub: { fontSize: 14 },
  reviewTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  reviewCard: { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  reviewHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  doneBtn: { borderRadius: 14, padding: 18, alignItems: "center", marginTop: 10, marginBottom: 10 },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
