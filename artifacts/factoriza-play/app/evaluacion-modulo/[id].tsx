import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { apiSaveModuleReflection } from "@/lib/api";

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type EvidencePhoto = {
  uri: string;
  base64: string;
  mimeType: string;
};

export default function EvaluacionModuloScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    evaluationCodes,
    recordHintEvent,
    recordExerciseResult,
    startActivitySession,
    completeEvaluation,
    currentStudent,
  } = useApp();
  const isWeb = Platform.OS === "web";

  const module = MODULES.find((m) => m.id === id);
  const evaluationCompleted = Boolean(
    module && currentStudent?.completedEvaluations?.includes(module.id),
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (module && !evaluationCompleted) {
      startActivitySession(`evaluacion:${module.id}`).then((result) => {
        if (result.ok && result.sessionId) setSessionId(result.sessionId);
      });
    }
  }, [module?.id, evaluationCompleted]);

  const [codeInput, setCodeInput] = useState("");
  const [unlocked, setUnlocked] = useState(() =>
    Boolean(module && evaluationCodes.some((evaluation) => evaluation.moduleId === module.id))
  );
  const [codeError, setCodeError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [photos, setPhotos] = useState<EvidencePhoto[]>([]);
  const [aspectsWorked, setAspectsWorked] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [improvementSuggestions, setImprovementSuggestions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoStep, setPhotoStep] = useState(false); // show photo step before submit
  const [hintsShown, setHintsShown] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (module && evaluationCodes.some((evaluation) => evaluation.moduleId === module.id)) {
      setUnlocked(true);
    }
  }, [module?.id, evaluationCodes]);

  // Total time spent on the evaluation, for the teacher panel's per-topic
  // time analytics (attributed evenly across the answered questions since
  // the evaluation is submitted as a single batch, not question by question).
  const startTimeRef = useRef<number | null>(null);
  // Counts how many times each question's hint was requested, for the
  // teacher panel's per-question hint analytics.
  const hintsUsedRef = useRef<Record<string, number>>({});

  const toggleHint = (exerciseId: string) => {
    setHintsShown((prev) => {
      const next = { ...prev, [exerciseId]: !prev[exerciseId] };
      if (next[exerciseId] && !prev[exerciseId]) {
        hintsUsedRef.current[exerciseId] = (hintsUsedRef.current[exerciseId] ?? 0) + 1;
        void recordHintEvent(exerciseId, `${exerciseId}-evaluation-hint-${hintsUsedRef.current[exerciseId]}`);
      }
      return next;
    });
  };

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

  if (evaluationCompleted) {
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
          </View>
          <View style={[styles.scoreCircle, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="check-circle" size={22} color="#fff" />
          </View>
        </View>
        <View style={[styles.completedCard, { backgroundColor: colors.success + "12", borderColor: colors.success + "45" }]}>
          <Feather name="check-circle" size={42} color={colors.success} />
          <Text style={[styles.completedTitle, { color: colors.foreground }]}>
            Evaluación ya realizada
          </Text>
          <Text style={[styles.completedText, { color: colors.mutedForeground }]}>
            Ya presentaste esta evaluación. No puedes volver a realizarla.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: module.color }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

  const addPickedPhotos = (assets: ImagePicker.ImagePickerAsset[]) => {
    const picked = assets
      .filter((asset) => asset.base64)
      .map((asset) => ({
        uri: asset.uri,
        base64: asset.base64!,
        mimeType: asset.mimeType ?? "image/jpeg",
      }));
    if (picked.length > 0) setPhotos((previous) => [...previous, ...picked]);
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      // Try gallery
      const galleryResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        base64: true,
        allowsMultipleSelection: true,
      });
      if (!galleryResult.canceled) addPickedPhotos(galleryResult.assets);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
      base64: true,
    });
    if (!result.canceled) addPickedPhotos(result.assets);
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
      base64: true,
      allowsMultipleSelection: true,
    });
    if (!result.canceled) addPickedPhotos(result.assets);
  };

  const removePhoto = (index: number) => {
    setPhotos((previous) => previous.filter((_, photoIndex) => photoIndex !== index));
  };

  const reflectionComplete =
    aspectsWorked.trim().length > 0 &&
    difficulties.trim().length > 0 &&
    improvementSuggestions.trim().length > 0;

  const handleSubmit = async () => {
    if (photos.length === 0 || !reflectionComplete || isSubmitting) return;
    setIsSubmitting(true);
    const completion = await completeEvaluation(module.id);
    if (!completion.ok || completion.alreadyCompleted) {
      setIsSubmitting(false);
      return;
    }
    setSubmitted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const answeredExercises = shuffledExercises.filter((ex) => answers[ex.id]);
    const totalSeconds = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : null;
    const perQuestionSeconds =
      totalSeconds !== null && answeredExercises.length > 0
        ? Math.round(totalSeconds / answeredExercises.length)
        : undefined;
    answeredExercises.forEach((ex, index) => {
      recordExerciseResult(
        {
          exerciseId: ex.id,
          moduleId: module.id,
          correct: answers[ex.id] === ex.correctAnswer,
          selectedAnswer: answers[ex.id] ?? "",
          correctAnswer: ex.correctAnswer,
          errorCategory: ex.errorCategory,
          attempts: 1,
          questionText: `${ex.question}${ex.expression ? ` — ${ex.expression}` : ""}`,
          topicName: module.title,
          evidenceBase64: index === 0 ? photos[0].base64 : undefined,
          evidenceMimeType: index === 0 ? photos[0].mimeType : undefined,
          evidenceAttachments: index === 0
            ? photos.map((photo) => ({ base64: photo.base64, mimeType: photo.mimeType }))
            : undefined,
        },
        { hintsUsed: hintsUsedRef.current[ex.id] ?? 0, durationSeconds: perQuestionSeconds }
      );
    });
    if (currentStudent?.backendId) {
      try {
        await apiSaveModuleReflection(currentStudent.backendId, {
          moduleId: module.id,
          aspectsWorked: aspectsWorked.trim(),
          difficulties: difficulties.trim(),
          improvementSuggestions: improvementSuggestions.trim(),
          clientId: `reflection-${module.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        });
      } catch {
        // Exercise evidence remains queued; the reflection can be resubmitted later.
      }
    }
    if (sessionId) {
      router.push({ pathname: "/reflexion", params: { kind: "session", sessionId, activityId: module.id } });
    }
    setIsSubmitting(false);
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
            onPress={() => {
              startTimeRef.current = Date.now();
              setStarted(true);
            }}
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
              {ex.realWorld && (
                <View style={[styles.storyCard, { backgroundColor: module.color + "0d", borderColor: module.color + "30" }]}>
                  <Text style={styles.storyIcon}>📖</Text>
                  <Text style={[styles.storyText, { color: colors.foreground }]}>{ex.realWorld}</Text>
                </View>
              )}
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

              <TouchableOpacity
                style={styles.hintBtn}
                onPress={() => toggleHint(ex.id)}
              >
                <Feather name="help-circle" size={13} color={module.color} />
                <Text style={[styles.hintBtnText, { color: module.color }]}>
                  {hintsShown[ex.id] ? "Ocultar pista" : "Pedir ayuda"}
                </Text>
              </TouchableOpacity>
              {hintsShown[ex.id] && (
                <View style={[styles.hintBox, { backgroundColor: module.color + "0c", borderColor: module.color + "30" }]}>
                  <Text style={[styles.hintText, { color: colors.foreground }]}>💡 {ex.hint}</Text>
                </View>
              )}
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

           {photos.length === 0 ? (
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
               <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, width: "100%" }}>
                 {photos.map((photo, index) => (
                   <View key={`${photo.uri}-${index}`} style={{ position: "relative" }}>
                     <Image source={{ uri: photo.uri }} style={styles.photoPreview} resizeMode="cover" />
                     <TouchableOpacity
                       accessibilityLabel={`Eliminar imagen ${index + 1}`}
                       style={styles.removePhotoButton}
                       onPress={() => removePhoto(index)}
                     >
                       <Feather name="x" size={14} color="#fff" />
                     </TouchableOpacity>
                   </View>
                 ))}
               </View>
              <View style={[styles.photoCheck, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
                <Feather name="check-circle" size={18} color={colors.success} />
                 <Text style={[styles.photoCheckText, { color: colors.success }]}>
                   {photos.length} {photos.length === 1 ? "imagen adjuntada" : "imágenes adjuntadas"}
                 </Text>
              </View>
              <TouchableOpacity
                style={[styles.photoBtnAlt, { borderColor: colors.mutedForeground }]}
                onPress={handlePickPhoto}
              >
                 <Text style={[styles.photoBtnAltText, { color: colors.mutedForeground }]}>Agregar otra imagen</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.optionalNote, { backgroundColor: colors.accent + "10", borderColor: colors.accent + "20" }]}>
            <Feather name="info" size={14} color={colors.accent} />
            <Text style={[styles.optionalNoteText, { color: colors.foreground }]}>
               Adjunta una o varias fotos claras del procedimiento en tu cuaderno. Al menos una imagen es obligatoria.
            </Text>
          </View>

          <View style={{ width: "100%", gap: 10 }}>
            <Text style={[styles.photoTitle, { color: colors.foreground, fontSize: 16 }]}>
              Reflexión final obligatoria
            </Text>
            {[
              { label: "Aspectos que funcionaron", value: aspectsWorked, setter: setAspectsWorked },
              { label: "Aspectos que generaron dificultades", value: difficulties, setter: setDifficulties },
              { label: "Sugerencias de mejora", value: improvementSuggestions, setter: setImprovementSuggestions },
            ].map((field) => (
              <View key={field.label} style={{ gap: 5 }}>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700" }}>{field.label}</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.setter}
                  multiline
                  placeholder="Escribe tu respuesta..."
                  placeholderTextColor={colors.mutedForeground}
                  style={{
                    minHeight: 74,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 12,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    textAlignVertical: "top",
                  }}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, {
               backgroundColor: photos.length > 0 && reflectionComplete ? module.color : colors.secondary,
               opacity: photos.length > 0 && reflectionComplete ? 1 : 0.55,
            }]}
            onPress={handleSubmit}
             disabled={photos.length === 0 || !reflectionComplete || isSubmitting}
          >
            <Feather name="send" size={18} color="#fff" />
            <Text style={[styles.submitBtnText, { color: "#fff" }]}>
              {isSubmitting ? "Enviando..." : "Enviar evaluación"}
            </Text>
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
             {photos.length > 0 && (
              <View style={[styles.photoCheck, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
                <Feather name="camera" size={14} color={colors.success} />
                 <Text style={[styles.photoCheckText, { color: colors.success }]}>
                   {photos.length} {photos.length === 1 ? "imagen adjuntada" : "imágenes adjuntadas"}
                 </Text>
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

  storyCard: { flexDirection: "row", gap: 10, borderRadius: 14, padding: 12, borderWidth: 1, marginBottom: 12, alignItems: "flex-start" },
  storyIcon: { fontSize: 16 },
  storyText: { flex: 1, fontSize: 13, lineHeight: 19, fontStyle: "italic" },
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
  hintBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, alignSelf: "flex-start" },
  hintBtnText: { fontSize: 12, fontWeight: "700" },
  hintBox: { borderRadius: 10, padding: 12, borderWidth: 1, marginTop: 8 },
  hintText: { fontSize: 12.5, lineHeight: 18 },

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
  photoPreview: { width: 120, height: 120, borderRadius: 14 },
  removePhotoButton: { position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(17,24,39,0.78)", justifyContent: "center", alignItems: "center" },
  photoCheck: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 10, borderWidth: 1, alignSelf: "stretch" },
  photoCheckText: { fontSize: 13, fontWeight: "600" },
  optionalNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, padding: 10, borderWidth: 1, alignSelf: "stretch" },
  optionalNoteText: { flex: 1, fontSize: 12, lineHeight: 17 },
  backToQBtn: { paddingVertical: 8 },
  backToQText: { fontSize: 14 },

  // Results
  resultCard: { borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 1.5, gap: 8, marginBottom: 20 },
  completedCard: { borderRadius: 18, borderWidth: 1, padding: 24, alignItems: "center", gap: 10, marginTop: 18 },
  completedTitle: { fontSize: 20, fontWeight: "900", textAlign: "center" },
  completedText: { fontSize: 14, lineHeight: 21, textAlign: "center", maxWidth: 310 },
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
