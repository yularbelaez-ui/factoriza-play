import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MODULES } from "@/data/modules";

export default function EvaluacionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { evaluationCodes, currentStudent } = useApp();
  const [inputCode, setInputCode] = useState("");
  const [enteredModule, setEnteredModule] = useState<string | null>(null);
  const [codeError, setCodeError] = useState("");
  const isWeb = Platform.OS === "web";

  const handleEnterCode = () => {
    const code = inputCode.trim().toUpperCase();
    const session = evaluationCodes.find((e) => e.code === code);
    if (session) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEnteredModule(session.moduleId);
      setCodeError("");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCodeError("Código incorrecto. Pídelo a tu docente.");
    }
  };

  const module = enteredModule ? MODULES.find((m) => m.id === enteredModule) : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: isWeb ? 67 + 16 : insets.top + 16,
          paddingBottom: isWeb ? 34 + 80 : insets.bottom + 80,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        Evaluación
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Demuestra lo que aprendiste en cada caso
      </Text>

      <View
        style={[
          styles.codeSection,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.codeHeader}>
          <View
            style={[styles.codeLock, { backgroundColor: colors.primary + "15" }]}
          >
            <Feather name="lock" size={24} color={colors.primary} />
          </View>
          <View style={styles.codeHeaderText}>
            <Text style={[styles.codeTitle, { color: colors.foreground }]}>
              Código de acceso
            </Text>
            <Text style={[styles.codeDesc, { color: colors.mutedForeground }]}>
              Tu docente te dará el código cuando sea el momento
            </Text>
          </View>
        </View>

        <TextInput
          style={[
            styles.codeInput,
            {
              backgroundColor: colors.background,
              borderColor: codeError ? colors.error : colors.border,
              color: colors.foreground,
            },
          ]}
          placeholder="Ingresa el código aquí..."
          placeholderTextColor={colors.mutedForeground}
          value={inputCode}
          onChangeText={(t) => {
            setInputCode(t.toUpperCase());
            setCodeError("");
          }}
          autoCapitalize="characters"
          maxLength={8}
        />
        {codeError ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {codeError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.enterBtn, { backgroundColor: colors.primary }]}
          onPress={handleEnterCode}
          activeOpacity={0.8}
        >
          <Text style={styles.enterBtnText}>Ingresar al Examen</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* If code matches, show module */}
      {module && (
        <View
          style={[
            styles.unlockedCard,
            { backgroundColor: colors.success + "10", borderColor: colors.success + "40" },
          ]}
        >
          <Text style={[styles.unlockedTitle, { color: colors.success }]}>
            ✅ Evaluación desbloqueada
          </Text>
          <Text
            style={[styles.unlockedModule, { color: colors.foreground }]}
          >
            {module.icon} {module.title}
          </Text>
          <TouchableOpacity
            style={[styles.startEvalBtn, { backgroundColor: colors.success }]}
            onPress={() =>
              router.push(`/evaluacion-modulo/${module.id}` as any)
            }
            activeOpacity={0.85}
          >
            <Text style={styles.startEvalBtnText}>Comenzar Evaluación</Text>
            <Feather name="play" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Completed evaluations */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Evaluaciones disponibles
      </Text>

      {evaluationCodes.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="clock" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No hay evaluaciones habilitadas aún.
          </Text>
          <Text
            style={[styles.emptySubtext, { color: colors.mutedForeground }]}
          >
            Tu docente las habilitará en el momento adecuado.
          </Text>
        </View>
      ) : (
        evaluationCodes.map((session) => {
          const mod = MODULES.find((m) => m.id === session.moduleId);
          if (!mod) return null;
          return (
            <TouchableOpacity
              key={session.moduleId}
              style={[
                styles.evalCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() =>
                router.push(`/evaluacion-modulo/${session.moduleId}` as any)
              }
              activeOpacity={0.8}
            >
              <Text style={styles.evalIcon}>{mod.icon}</Text>
              <View style={styles.evalInfo}>
                <Text style={[styles.evalTitle, { color: colors.foreground }]}>
                  {mod.title}
                </Text>
                <Text
                  style={[styles.evalSub, { color: colors.mutedForeground }]}
                >
                  {mod.evaluationExercises.length} preguntas
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  codeSection: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  codeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  codeLock: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  codeHeaderText: { flex: 1 },
  codeTitle: { fontSize: 17, fontWeight: "700", marginBottom: 3 },
  codeDesc: { fontSize: 13 },
  codeInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: { fontSize: 13, marginBottom: 10, textAlign: "center" },
  enterBtn: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  enterBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  unlockedCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: "center",
  },
  unlockedTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  unlockedModule: { fontSize: 20, fontWeight: "800", marginBottom: 14 },
  startEvalBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  startEvalBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  emptyCard: {
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    gap: 10,
  },
  emptyText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  emptySubtext: { fontSize: 13, textAlign: "center" },
  evalCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  evalIcon: { fontSize: 28 },
  evalInfo: { flex: 1 },
  evalTitle: { fontSize: 15, fontWeight: "700" },
  evalSub: { fontSize: 12 },
});
