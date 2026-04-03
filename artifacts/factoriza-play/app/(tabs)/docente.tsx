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
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MODULES } from "@/data/modules";
import { ProgressBar } from "@/components/ProgressBar";

export default function DocenteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { allStudents, unlockedModules, unlockModule, addEvaluationCode, getErrorSummary, role } = useApp();
  const [activeTab, setActiveTab] = useState<"students" | "modules" | "errors" | "eval">("students");
  const [evalCode, setEvalCode] = useState("");
  const [selectedModuleForEval, setSelectedModuleForEval] = useState<string>("");
  const isWeb = Platform.OS === "web";

  const errorSummary = getErrorSummary();
  const sorted = [...allStudents].sort((a, b) => b.totalXP - a.totalXP);

  const handleUnlock = (moduleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    unlockModule(moduleId);
  };

  const handleAddEvalCode = () => {
    if (!selectedModuleForEval || !evalCode.trim()) {
      Alert.alert("Error", "Selecciona un módulo e ingresa un código.");
      return;
    }
    addEvaluationCode(selectedModuleForEval, evalCode.trim().toUpperCase());
    Alert.alert(
      "Código creado",
      `El código "${evalCode.toUpperCase()}" fue asignado al módulo ${MODULES.find((m) => m.id === selectedModuleForEval)?.title}`
    );
    setEvalCode("");
  };

  const tabs = [
    { id: "students" as const, label: "Estudiantes", icon: "users" as const },
    { id: "modules" as const, label: "Módulos", icon: "unlock" as const },
    { id: "errors" as const, label: "Errores", icon: "alert-triangle" as const },
    { id: "eval" as const, label: "Exámenes", icon: "clipboard" as const },
  ];

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
        Panel del Docente
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Gestiona módulos, evalúa progreso y analiza errores
      </Text>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeTab === tab.id ? colors.primary : colors.card,
                borderColor:
                  activeTab === tab.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Feather
              name={tab.icon}
              size={14}
              color={activeTab === tab.id ? "#fff" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === tab.id ? "#fff" : colors.mutedForeground,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Students Tab */}
      {activeTab === "students" && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Resultados de Estudiantes ({allStudents.length})
          </Text>
          {sorted.map((student, index) => (
            <View
              key={student.id}
              style={[
                styles.studentCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.studentHeader}>
                <Text style={styles.studentAvatar}>{student.avatar}</Text>
                <View style={styles.studentInfo}>
                  <Text style={[styles.studentName, { color: colors.foreground }]}>
                    {student.name}
                  </Text>
                  <Text style={[styles.studentMeta, { color: colors.mutedForeground }]}>
                    🔥 {student.streak} días · ⚡{student.totalXP} XP
                  </Text>
                </View>
                <Text style={[styles.rank, { color: colors.primary }]}>
                  #{index + 1}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <View style={[styles.miniStat, { backgroundColor: colors.primary + "10" }]}>
                  <Text style={[styles.miniStatValue, { color: colors.primary }]}>
                    {student.completedModules.length}/{MODULES.length}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>
                    Módulos
                  </Text>
                </View>
                <View style={[styles.miniStat, { backgroundColor: colors.success + "10" }]}>
                  <Text style={[styles.miniStatValue, { color: colors.success }]}>
                    {student.exerciseResults.filter((r) => r.correct).length}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>
                    Correctas
                  </Text>
                </View>
                <View style={[styles.miniStat, { backgroundColor: colors.error + "10" }]}>
                  <Text style={[styles.miniStatValue, { color: colors.error }]}>
                    {student.exerciseResults.filter((r) => !r.correct).length}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>
                    Errores
                  </Text>
                </View>
              </View>
              {student.exerciseResults.length > 0 && (
                <View style={styles.progressRow}>
                  <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                    Precisión
                  </Text>
                  <ProgressBar
                    progress={
                      (student.exerciseResults.filter((r) => r.correct).length /
                        student.exerciseResults.length) *
                      100
                    }
                    color={colors.success}
                    height={6}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Desbloquear Módulos
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Toca el botón para habilitar un módulo para todos los estudiantes
          </Text>
          {MODULES.map((module) => {
            const isUnlocked = unlockedModules.includes(module.id);
            return (
              <View
                key={module.id}
                style={[
                  styles.moduleRow,
                  {
                    backgroundColor: isUnlocked
                      ? module.color + "10"
                      : colors.card,
                    borderColor: isUnlocked
                      ? module.color + "40"
                      : colors.border,
                  },
                ]}
              >
                <Text style={styles.moduleIcon}>{module.icon}</Text>
                <View style={styles.moduleInfo}>
                  <Text
                    style={[
                      styles.moduleName,
                      { color: isUnlocked ? module.color : colors.foreground },
                    ]}
                  >
                    {module.title}
                  </Text>
                  <Text
                    style={[styles.moduleLevel, { color: colors.mutedForeground }]}
                  >
                    Nivel {module.level}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.unlockBtn,
                    {
                      backgroundColor: isUnlocked
                        ? colors.success + "20"
                        : colors.primary,
                    },
                  ]}
                  onPress={() => !isUnlocked && handleUnlock(module.id)}
                  disabled={isUnlocked}
                >
                  <Feather
                    name={isUnlocked ? "check" : "unlock"}
                    size={14}
                    color={isUnlocked ? colors.success : "#fff"}
                  />
                  <Text
                    style={[
                      styles.unlockBtnText,
                      { color: isUnlocked ? colors.success : "#fff" },
                    ]}
                  >
                    {isUnlocked ? "Activo" : "Activar"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* Errors Tab */}
      {activeTab === "errors" && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Análisis de Errores
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Errores más frecuentes de todos los estudiantes para reforzar en clase
          </Text>

          {errorSummary.sort((a, b) => b.count - a.count).map((err, i) => (
            <View
              key={err.category}
              style={[
                styles.errorCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.errorHeader}>
                <View
                  style={[
                    styles.errorNum,
                    {
                      backgroundColor:
                        i === 0 ? colors.error + "20" : colors.secondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.errorNumText,
                      { color: i === 0 ? colors.error : colors.mutedForeground },
                    ]}
                  >
                    #{i + 1}
                  </Text>
                </View>
                <Text
                  style={[styles.errorLabel, { color: colors.foreground }]}
                  numberOfLines={2}
                >
                  {err.label}
                </Text>
                <Text style={[styles.errorCount, { color: colors.mutedForeground }]}>
                  {err.count}
                </Text>
              </View>
              <ProgressBar
                progress={err.percentage}
                color={i === 0 ? colors.error : colors.primary}
                height={6}
              />
              <Text
                style={[styles.errorPercent, { color: colors.mutedForeground }]}
              >
                {err.percentage}% de los errores
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Evaluation Tab */}
      {activeTab === "eval" && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Crear Código de Evaluación
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Genera un código para dar acceso al examen de un módulo
          </Text>

          <View
            style={[
              styles.evalForm,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.formLabel, { color: colors.foreground }]}>
              Módulo:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
            >
              <View style={{ flexDirection: "row", gap: 8 }}>
                {MODULES.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.moduleChip,
                      {
                        backgroundColor:
                          selectedModuleForEval === m.id
                            ? m.color
                            : colors.secondary,
                        borderColor:
                          selectedModuleForEval === m.id
                            ? m.color
                            : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedModuleForEval(m.id)}
                  >
                    <Text style={styles.moduleChipIcon}>{m.icon}</Text>
                    <Text
                      style={[
                        styles.moduleChipText,
                        {
                          color:
                            selectedModuleForEval === m.id
                              ? "#fff"
                              : colors.foreground,
                        },
                      ]}
                    >
                      {m.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.formLabel, { color: colors.foreground }]}>
              Código de acceso:
            </Text>
            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Ej: FACT01"
              placeholderTextColor={colors.mutedForeground}
              value={evalCode}
              onChangeText={(t) => setEvalCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={8}
            />

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddEvalCode}
              activeOpacity={0.85}
            >
              <Feather name="plus-circle" size={18} color="#fff" />
              <Text style={styles.createBtnText}>Crear Código</Text>
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
  title: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  tabsContainer: { marginBottom: 20 },
  tabsContent: { gap: 8, paddingVertical: 2 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tabLabel: { fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  sectionSub: { fontSize: 13, marginBottom: 16 },
  studentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  studentAvatar: { fontSize: 28 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  studentMeta: { fontSize: 12 },
  rank: { fontSize: 18, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  miniStat: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  miniStatValue: { fontSize: 18, fontWeight: "800" },
  miniStatLabel: { fontSize: 10, fontWeight: "500" },
  progressRow: { gap: 6 },
  progressLabel: { fontSize: 11, fontWeight: "600" },
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  moduleIcon: { fontSize: 26 },
  moduleInfo: { flex: 1 },
  moduleName: { fontSize: 14, fontWeight: "700" },
  moduleLevel: { fontSize: 12 },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  unlockBtnText: { fontSize: 13, fontWeight: "700" },
  errorCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  errorNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  errorNumText: { fontSize: 12, fontWeight: "800" },
  errorLabel: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  errorCount: { fontSize: 18, fontWeight: "800" },
  errorPercent: { fontSize: 11, marginTop: 6 },
  evalForm: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  formLabel: { fontSize: 14, fontWeight: "600", marginBottom: 10 },
  moduleChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  moduleChipIcon: { fontSize: 16 },
  moduleChipText: { fontSize: 13, fontWeight: "600" },
  codeInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 14,
  },
  createBtn: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
