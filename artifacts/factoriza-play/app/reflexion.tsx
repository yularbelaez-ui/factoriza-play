import React, { useMemo, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type ReflectionKind = "session" | "weekly";
type Fields = Record<string, string>;

function currentWeekStart() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 12));
  const day = date.getDay();
  date.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1));
  return date.toISOString().slice(0, 10);
}

export default function ReflectionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sessionId?: string; activityId?: string; topicId?: string; kind?: ReflectionKind }>();
  const { saveSessionReflection, saveWeeklyReflection, completeModule, completeTopicPractice } = useApp();
  const [kind, setKind] = useState<ReflectionKind>(
    params.sessionId && params.kind !== "weekly" ? "session" : "weekly",
  );
  const [fields, setFields] = useState<Fields>({});
  const [saving, setSaving] = useState(false);
  const isWeb = Platform.OS === "web";

  const form = useMemo(() => kind === "session"
    ? [
        ["understood", "Hoy comprendí", "¿Qué idea o procedimiento comprendiste hoy?"],
        ["mistakes", "Hoy me equivoqué en", "Describe un error que te ayudó a aprender."],
        ["helpful", "Lo que más me ayudó fue", "Una pista, ejemplo, explicación o estrategia."],
        ["remainingQuestions", "Lo que todavía no entiendo es", "¿Qué pregunta quieres retomar?"],
      ]
    : [
        ["mostImportant", "Lo más importante que aprendí esta semana", "Escribe el aprendizaje principal."],
        ["mainDifficulty", "Mi principal dificultad", "¿Qué fue lo más difícil?"],
        ["appHelp", "Cómo me ayudó la aplicación", "¿Qué recurso te ayudó a superar esa dificultad?"],
        ["advice", "Mi consejo para otro estudiante", "Comparte una recomendación concreta."],
      ], [kind]);

  const setValue = (key: string, value: string) => setFields((previous) => ({ ...previous, [key]: value }));
  const submit = async () => {
    if (saving || form.some(([key]) => !(fields[key] ?? "").trim())) {
      Alert.alert("Completa la reflexión", "Responde las cuatro preguntas antes de guardar.");
      return;
    }
    setSaving(true);
    if (kind === "session" && !params.sessionId) {
      setSaving(false);
      Alert.alert("Sesión requerida", "Abre una actividad para iniciar una sesión válida antes de reflexionar.");
      return;
    }
    const result = kind === "session"
      ? await saveSessionReflection({
          sessionId: params.sessionId!,
          understood: fields.understood.trim(),
          mistakes: fields.mistakes.trim(),
          helpful: fields.helpful.trim(),
          remainingQuestions: fields.remainingQuestions.trim(),
        })
      : await saveWeeklyReflection({
          weekStart: currentWeekStart(),
          mostImportant: fields.mostImportant.trim(),
          mainDifficulty: fields.mainDifficulty.trim(),
          appHelp: fields.appHelp.trim(),
          advice: fields.advice.trim(),
        });
    setSaving(false);
    if (!result.ok) {
      Alert.alert("No se guardó", result.error ?? "Comprueba tu conexión e inténtalo de nuevo.");
      return;
    }
    if (kind === "session" && params.activityId && params.activityId !== "diagnostico" && params.sessionId) {
      const completion = params.topicId
        ? await completeTopicPractice(params.topicId, params.sessionId)
        : await completeModule(params.activityId, params.sessionId);
      if (!completion.ok) {
        Alert.alert("Reflexión guardada", completion.error ?? "La actividad aún no puede cerrarse.");
        setSaving(false);
        return;
      }
    }
    Alert.alert("Reflexión guardada", kind === "session" ? "Ganaste +30 XP por completar tu sesión." : "Ganaste +50 XP por tu reflexión semanal.");
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: isWeb ? 67 + 16 : insets.top + 16, paddingBottom: isWeb ? 34 + 32 : insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Feather name="chevron-left" size={22} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Volver</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.foreground }]}>🧠 Reflexión metacognitiva</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Tus respuestas ayudan a reconocer qué estrategias te funcionan. Es obligatoria para cerrar una actividad.
      </Text>
      <View style={[styles.tabs, { backgroundColor: colors.secondary }]}>
        {(["session", "weekly"] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.tab, kind === option && { backgroundColor: colors.primary }]}
            onPress={() => { setKind(option); setFields({}); }}
          >
            <Text style={{ color: kind === option ? "#fff" : colors.foreground, fontWeight: "700", fontSize: 12 }}>
              {option === "session" ? "Sesión rápida · +30 XP" : "Semana · +50 XP"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {form.map(([key, label, placeholder]) => (
          <View key={key} style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
            <TextInput
              value={fields[key] ?? ""}
              onChangeText={(value) => setValue(key, value)}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </View>
        ))}
      </View>
      <TouchableOpacity style={[styles.submit, { backgroundColor: saving ? colors.border : colors.primary }]} onPress={submit} disabled={saving}>
        <Feather name="check-circle" size={18} color="#fff" />
        <Text style={styles.submitText}>{saving ? "Guardando..." : "Guardar reflexión"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  back: { flexDirection: "row", alignItems: "center", gap: 4, marginHorizontal: 20, marginBottom: 18 },
  backText: { fontSize: 14, fontWeight: "700" },
  title: { fontSize: 25, fontWeight: "900", marginHorizontal: 20, marginBottom: 8 },
  subtitle: { fontSize: 13, lineHeight: 20, marginHorizontal: 20, marginBottom: 18 },
  tabs: { flexDirection: "row", borderRadius: 12, padding: 4, marginHorizontal: 20, marginBottom: 14 },
  tab: { flex: 1, alignItems: "center", borderRadius: 9, paddingVertical: 11 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginHorizontal: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "800", marginBottom: 7 },
  input: { minHeight: 78, borderWidth: 1, borderRadius: 10, padding: 11, textAlignVertical: "top", fontSize: 14 },
  submit: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 15, margin: 20 },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
