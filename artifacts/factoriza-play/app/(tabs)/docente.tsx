import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
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
import { MODULES, MODULE_CASE_ORDER } from "@/data/modules";
import { COURSE_SECTIONS } from "@/data/courseSections";
import { ProgressBar } from "@/components/ProgressBar";
import { DIAGNOSTIC_CATEGORY_INFO } from "@/data/diagnostic";
import { PROFILE_DETAILS } from "@/data/learningRoutes";
import {
  apiEvidencePreviewUrl,
  apiGetClassTopicStats,
  ApiTopicStat,
  apiGetClassStudentAnalytics,
  ApiStudentAnalytics,
} from "@/lib/api";

const MODULE_TOPIC_LABELS: Record<string, string> = {
  "reconocimiento-patrones": "Reconocimiento de patrones",
  "factor-comun": "Factor común",
  "agrupacion-terminos": "Agrupación de términos",
  "trinomio-cuadrado-perfecto": "Trinomio cuadrado perfecto",
  "diferencia-cuadrados": "Diferencia de cuadrados",
  "trinomio-forma-x2-bx-c": "Trinomio x² + bx + c",
  "trinomio-ax2-bx-c": "Trinomio ax² + bx + c",
  "cubo-binomio": "Cubo de un binomio",
  "suma-diferencia-cubos": "Suma / diferencia de cubos",
};

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest > 0 ? `${minutes}m ${rest}s` : `${minutes}m`;
}

// Lookup exerciseId → short question text, used to label each question row
// in the teacher panel's per-student drill-down.
const EXERCISE_QUESTION_LOOKUP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const mod of MODULES) {
    for (const ex of [...mod.exercises, ...mod.evaluationExercises]) {
      map[ex.id] = ex.question;
    }
  }
  return map;
})();

const ERROR_CATEGORY_LABELS: Record<string, string> = {
  operaciones: "operaciones básicas",
  ley_signos: "ley de signos",
  potenciacion: "potenciación",
  radicacion: "radicación",
  variables: "uso de variables",
  equality: "signo igual",
  terminos_semejantes: "términos semejantes",
  estructura_no_reconocida: "reconocimiento de estructuras",
  factor_comun_no_identificado: "factor común",
  extraccion_factor_incorrecta: "extracción del factor",
  caso_incorrecto: "caso de factorización",
  estrategia_incorrecta: "elección de estrategia",
  sin_verificacion: "verificación del resultado",
  error_repetido: "repetición del error",
  feedback_ignorado: "uso de retroalimentación",
};

// Mapa: categoría de error → tema de S1/S2/S3 recomendado para el docente
const ERROR_TO_TOPIC_DOCENTE: Record<string, { title: string; section: string; color: string; icon: string }> = {
  operaciones:  { title: "Multiplicación de polinomios",      section: "S3 · Operaciones Algebraicas", color: "#059669", icon: "⚙️" },
  ley_signos:   { title: "Números Enteros y Ley de Signos",   section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  variables:    { title: "Términos semejantes y polinomios",  section: "S2 · Introducción al Álgebra",  color: "#2563eb", icon: "✏️" },
  equality:     { title: "Expresión y término algebraico",    section: "S2 · Introducción al Álgebra",  color: "#2563eb", icon: "✏️" },
  potenciacion: { title: "Potencias y sus propiedades",       section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  radicacion:   { title: "Radicación y números irracionales", section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  arithmetic:   { title: "Operaciones con números naturales", section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  powers:       { title: "Potencias y sus propiedades",       section: "S1 · Zona de Repaso",          color: "#7c3aed", icon: "🧮" },
  operations:   { title: "Suma y resta de polinomios",        section: "S3 · Operaciones Algebraicas", color: "#059669", icon: "⚙️" },
};

type Tab = "students" | "comunidad" | "secciones" | "errors" | "eval" | "codes";

export default function DocenteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    allStudents,
    addEvaluationCode,
    getErrorSummary,
    getDiagnosticSummary,
    classCodes,
    addClassCode,
    removeClassCode,
    logout,
    evaluationCodes,
    refreshTeacherData,
    isRefreshingTeacher,
    deleteStudent,
  } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [evalCode, setEvalCode] = useState("");
  const [selectedModuleForEval, setSelectedModuleForEval] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newCodeLabel, setNewCodeLabel] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [expandedSection, setExpandedSection] = useState<string | null>("saberes");
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);
  const [studentPendingDelete, setStudentPendingDelete] = useState<(typeof allStudents)[number] | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [topicStats, setTopicStats] = useState<ApiTopicStat[]>([]);
  const [isLoadingTopicStats, setIsLoadingTopicStats] = useState(false);
  const [studentAnalytics, setStudentAnalytics] = useState<Record<number, ApiStudentAnalytics>>({});
  const [expandedStudentIds, setExpandedStudentIds] = useState<Set<number>>(new Set());
  const [expandedModuleKeys, setExpandedModuleKeys] = useState<Set<string>>(new Set());
  const isWeb = Platform.OS === "web";

  const toggleStudentExpanded = (studentId: number) => {
    setExpandedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };
  const toggleModuleExpanded = (key: string) => {
    setExpandedModuleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Sync students from backend on mount and every 30 s
  const stableRefresh = useCallback(() => { refreshTeacherData(); }, [refreshTeacherData]);
  useEffect(() => {
    stableRefresh();
    const interval = setInterval(stableRefresh, 30_000);
    return () => clearInterval(interval);
  }, [stableRefresh]);

  // Load per-topic time/hints/error stats for the "Errores" tab, refreshed
  // whenever the class filter changes or on the same 30 s cadence as the rest
  // of the teacher panel.
  const refreshTopicStats = useCallback(async () => {
    const codesToFetch = filterClass === "all" ? classCodes.map((c) => c.code) : [filterClass];
    if (codesToFetch.length === 0) {
      setTopicStats([]);
      return;
    }
    setIsLoadingTopicStats(true);
    try {
      const results = await Promise.all(
        codesToFetch.map((code) => apiGetClassTopicStats(code).catch(() => ({ topics: [] as ApiTopicStat[] })))
      );
      const merged = new Map<string, ApiTopicStat>();
      for (const { topics } of results) {
        for (const t of topics) {
          const existing = merged.get(t.moduleId);
          if (!existing) {
            merged.set(t.moduleId, { ...t });
          } else {
            existing.studentsInvolved += t.studentsInvolved;
            existing.exerciseCount += t.exerciseCount;
            existing.errorCount += t.errorCount;
            existing.hintsUsed += t.hintsUsed;
            existing.totalDurationSeconds += t.totalDurationSeconds;
            existing.avgDurationSeconds =
              existing.totalDurationSeconds > 0 && existing.exerciseCount > 0
                ? Math.round(existing.totalDurationSeconds / existing.exerciseCount)
                : null;
          }
        }
      }
      setTopicStats(Array.from(merged.values()).sort((a, b) => b.exerciseCount - a.exerciseCount));
    } finally {
      setIsLoadingTopicStats(false);
    }
  }, [filterClass, classCodes]);

  useEffect(() => {
    refreshTopicStats();
    const interval = setInterval(refreshTopicStats, 30_000);
    return () => clearInterval(interval);
  }, [refreshTopicStats]);

  // Load per-student, per-module and per-question analytics (correct/
  // incorrect, attempts, hints, time, repeated exercises) for the
  // "Estudiantes" tab drill-down. The client-side `exerciseResults` on
  // each StudentRecord is only ever populated for the device's own
  // history, so this is the only reliable source for other students.
  const refreshStudentAnalytics = useCallback(async () => {
    const codesToFetch = filterClass === "all" ? classCodes.map((c) => c.code) : [filterClass];
    if (codesToFetch.length === 0) {
      setStudentAnalytics({});
      return;
    }
    try {
      const results = await Promise.all(
        codesToFetch.map((code) =>
          apiGetClassStudentAnalytics(code).catch(() => ({ students: [] as ApiStudentAnalytics[] }))
        )
      );
      const merged: Record<number, ApiStudentAnalytics> = {};
      for (const { students: studentRows } of results) {
        for (const s of studentRows) {
          merged[s.studentId] = s;
        }
      }
      setStudentAnalytics(merged);
    } catch {
      // Keep the last known analytics visible when the network is unavailable.
    }
  }, [filterClass, classCodes]);

  useEffect(() => {
    refreshStudentAnalytics();
    const interval = setInterval(refreshStudentAnalytics, 30_000);
    return () => clearInterval(interval);
  }, [refreshStudentAnalytics]);

  const errorSummary = getErrorSummary(filterClass === "all" ? undefined : filterClass);
  const sorted = [...allStudents]
    .filter((s) => filterClass === "all" || s.classCode === filterClass)
    .sort((a, b) => b.totalXP - a.totalXP);
  const detailedErrors = Object.values(studentAnalytics).flatMap((student) =>
    student.modules.flatMap((mod) =>
      mod.exercises.flatMap((exercise) =>
        exercise.attempts
          .filter((attempt) => !attempt.correct)
          .map((attempt) => ({
            ...attempt,
            studentId: student.studentId,
            pseudonym: student.pseudonym ?? `Estudiante ${student.studentId}`,
            exerciseId: exercise.exerciseId,
            moduleId: mod.moduleId,
          }))
      )
    )
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAddEvalCode = () => {
    if (!selectedModuleForEval || !evalCode.trim()) {
      Alert.alert("Error", "Selecciona un caso e ingresa un código.");
      return;
    }
    addEvaluationCode(selectedModuleForEval, evalCode.trim().toUpperCase());
    const mod = MODULES.find((m) => m.id === selectedModuleForEval);
    Alert.alert(
      "Código creado",
      `Código "${evalCode.toUpperCase()}" asignado a "${mod?.title}". Compártelo con tus estudiantes.`
    );
    setEvalCode("");
  };

  const handleAddClassCode = () => {
    const trimCode = newCode.trim().toUpperCase();
    const trimLabel = newCodeLabel.trim();
    if (!trimCode) {
      Alert.alert("Error", "El código no puede estar vacío.");
      return;
    }
    if (!trimLabel) {
      Alert.alert("Error", "Ingresa un nombre para identificar este grupo.");
      return;
    }
    addClassCode(trimCode, trimLabel);
    setNewCode("");
    setNewCodeLabel("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Código creado", `El código "${trimCode}" (${trimLabel}) está listo para compartir con tus estudiantes.`);
  };

  const handleDeleteStudent = (student: (typeof allStudents)[number]) => {
    if (!student.backendId || deletingStudentId !== null) return;
    setDeleteError(null);
    setStudentPendingDelete(student);
  };

  const confirmDeleteStudent = async () => {
    const backendId = studentPendingDelete?.backendId;
    if (!backendId || deletingStudentId !== null) return;
    const student = studentPendingDelete;
    setDeletingStudentId(backendId);
    const result = await deleteStudent(student);
    setDeletingStudentId(null);
    if (!result.ok) {
      setDeleteError(result.error ?? "No se pudo eliminar el perfil. Intenta de nuevo.");
      return;
    }
    setStudentPendingDelete(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const TABS: { id: Tab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: "students",   label: "Estudiantes", icon: "users"          },
    { id: "comunidad",  label: "Comunidad",   icon: "award"          },
    { id: "secciones",  label: "Secciones",   icon: "layers"         },
    { id: "errors",     label: "Errores",     icon: "alert-triangle" },
    { id: "eval",       label: "Exámenes",    icon: "clipboard"      },
    { id: "codes",      label: "Códigos",     icon: "key"            },
  ];

  const filterChips = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TouchableOpacity
          style={[styles.filterChip, { backgroundColor: filterClass === "all" ? colors.primary : colors.secondary, borderColor: filterClass === "all" ? colors.primary : colors.border }]}
          onPress={() => setFilterClass("all")}
        >
          <Text style={{ color: filterClass === "all" ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>Todos</Text>
        </TouchableOpacity>
        {classCodes.map((cc) => (
          <TouchableOpacity
            key={cc.code}
            style={[styles.filterChip, { backgroundColor: filterClass === cc.code ? colors.primary : colors.secondary, borderColor: filterClass === cc.code ? colors.primary : colors.border }]}
            onPress={() => setFilterClass(cc.code)}
          >
            <Text style={{ color: filterClass === cc.code ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{cc.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <>
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
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Panel Docente
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {allStudents.length} estudiantes registrados
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isRefreshingTeacher && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: colors.secondary }]}
            onPress={refreshTeacherData}
            disabled={isRefreshingTeacher}
          >
            <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.secondary }]}
            onPress={logout}
          >
            <Feather name="log-out" size={17} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab.id ? colors.primary : colors.card,
                borderColor: activeTab === tab.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Feather
              name={tab.icon}
              size={13}
              color={activeTab === tab.id ? "#fff" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.id ? "#fff" : colors.mutedForeground },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── CODES TAB ── */}
      {activeTab === "codes" && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Códigos de Clase
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Crea un código por cada grupo o clase. Los estudiantes lo usan para registrarse.
          </Text>

          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.foreground }]}>
              Nombre del grupo
            </Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Ej: Grado 8A, Grupo 2..."
              placeholderTextColor={colors.mutedForeground}
              value={newCodeLabel}
              onChangeText={setNewCodeLabel}
            />
            <Text style={[styles.formLabel, { color: colors.foreground }]}>
              Código de clase
            </Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, letterSpacing: 3, fontWeight: "700" }]}
              placeholder="Ej: MATE8A"
              placeholderTextColor={colors.mutedForeground}
              value={newCode}
              onChangeText={(t) => setNewCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
            />
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddClassCode}
            >
              <Feather name="plus-circle" size={16} color="#fff" />
              <Text style={styles.createBtnText}>Crear código</Text>
            </TouchableOpacity>
          </View>

          {classCodes.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="key" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No hay códigos creados aún
              </Text>
            </View>
          ) : (
            classCodes.map((cc) => {
              const studentsInClass = allStudents.filter((s) => s.classCode === cc.code);
              return (
                <View
                  key={cc.code}
                  style={[styles.codeRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.codeBadge, { backgroundColor: colors.primary + "15" }]}>
                    <Text style={[styles.codeValue, { color: colors.primary }]}>
                      {cc.code}
                    </Text>
                  </View>
                  <View style={styles.codeInfo}>
                    <Text style={[styles.codeLabel, { color: colors.foreground }]}>
                      {cc.label}
                    </Text>
                    <Text style={[styles.codeMeta, { color: colors.mutedForeground }]}>
                      {studentsInClass.length} estudiantes
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Eliminar código",
                        `¿Eliminar el código "${cc.code}"?`,
                        [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Eliminar",
                            style: "destructive",
                            onPress: () => removeClassCode(cc.code),
                          },
                        ]
                      )
                    }
                  >
                    <Feather name="trash-2" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* ── STUDENTS TAB ── */}
      {activeTab === "students" && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Resultados de Estudiantes
          </Text>

          {classCodes.length > 0 && filterChips}

          {sorted.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="users" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Ningún estudiante registrado aún
              </Text>
            </View>
          ) : (
            sorted.map((student, index) => {
              const topicsDone = (student.completedTopics ?? []).length;
              const casesDone = student.completedModules.length;
              // Correct/incorrect counts, attempts, hints and time come from
              // the server-side analytics endpoint, not `student.exerciseResults`
              // — that field on a StudentRecord is only ever populated for the
              // device's own login history, so it's always empty for the
              // other students the teacher is viewing here.
              const analytics = student.backendId != null ? studentAnalytics[student.backendId] : undefined;
              const modulesAnalytics = analytics?.modules ?? [];
              const correctCount = modulesAnalytics.reduce((sum, m) => sum + m.correctCount, 0);
              const wrongCount = modulesAnalytics.reduce((sum, m) => sum + m.incorrectCount, 0);
              const attemptsTotal = modulesAnalytics.reduce((sum, m) => sum + m.attemptsTotal, 0);
              const hintsTotal = modulesAnalytics.reduce((sum, m) => sum + m.hintsUsed, 0);
              const timeTotal = modulesAnalytics.reduce((sum, m) => sum + m.totalDurationSeconds, 0);
              const repeatedTotal = modulesAnalytics.reduce((sum, m) => sum + m.repeatedExercises, 0);
              const totalResults = correctCount + wrongCount;
              const pct = totalResults > 0 ? Math.round((correctCount / totalResults) * 100) : 0;
              const isStudentExpanded = student.backendId != null && expandedStudentIds.has(student.backendId);
              const profileCode = student.diagnosticProfile?.profile ??
                (student.diagnosticProfile?.level === "básico" ? "A" : student.diagnosticProfile?.level === "intermedio" ? "B" : "C");
              const profileDetails = student.diagnosticProfile ? PROFILE_DETAILS[profileCode] : null;
              const competencyLabels: Record<string, string> = {
                aritmetica: "aritmética",
                propiedades: "propiedades",
                terminos: "términos",
                variables: "variables",
                igualdad: "signo igual",
              };
              const weakCompetencies = (student.diagnosticProfile?.competencyResults ?? [])
                .filter((result) => result.score < 75)
                .map((result) => competencyLabels[result.competency] ?? result.competency);
              const errorCounts = student.exerciseResults
                .filter((result) => !result.correct && result.errorCategory)
                .reduce<Record<string, number>>((counts, result) => {
                  const key = result.errorCategory!;
                  counts[key] = (counts[key] ?? 0) + 1;
                  return counts;
                }, {});
              const frequentErrors = Object.entries(errorCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 2)
                .map(([category]) => ERROR_CATEGORY_LABELS[category] ?? category);
              return (
                <View
                  key={student.id}
                  style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.studentHeader}>
                    <Text style={styles.studentAvatar}>{student.avatar}</Text>
                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, { color: colors.foreground }]}>
                        {student.pseudonym}
                      </Text>
                      <Text style={[styles.studentMeta, { color: colors.mutedForeground }]}>
                        Clase: {student.classCode} · 🔥 {student.streak} · ⚡{student.totalXP} XP
                      </Text>
                    </View>
                    <Text style={[styles.rank, { color: colors.primary }]}>#{index + 1}</Text>
                  </View>

                  {profileDetails && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: profileDetails.color + "12", borderColor: profileDetails.color + "30", borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10 }}>
                      <Text style={{ fontSize: 16 }}>{profileDetails.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: profileDetails.color, fontSize: 11, fontWeight: "800" }}>
                          {profileDetails.label} · {student.diagnosticProfile?.route?.replace("ruta-", "Ruta ") ?? "Ruta por actualizar"}
                        </Text>
                        <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 1 }}>
                          {profileDetails.summary}
                        </Text>
                        {weakCompetencies.length > 0 && (
                          <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 3 }}>
                            Por fortalecer: {weakCompetencies.join(", ")}
                          </Text>
                        )}
                        {frequentErrors.length > 0 && (
                          <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 2 }}>
                            Errores frecuentes: {frequentErrors.join(" · ")}
                          </Text>
                        )}
                      </View>
                      <Text style={{ color: profileDetails.color, fontSize: 11, fontWeight: "800" }}>
                        {student.diagnosticProfile?.overallScore ?? 0}%
                      </Text>
                    </View>
                  )}

                  {/* Section progress summary */}
                  <View style={styles.sectionProgressRow}>
                    {COURSE_SECTIONS.map((sec) => {
                      const isFact = sec.id === "factorizacion";
                      const total = sec.topics.length;
                      const done = isFact
                        ? student.completedModules.length
                        : sec.topics.filter((t) => t.topicId && (student.completedTopics ?? []).includes(t.topicId!)).length;
                      const secPct = Math.round((done / total) * 100);
                      return (
                        <View key={sec.id} style={[styles.secProgressCard, { backgroundColor: sec.color + "12", borderColor: sec.color + "30" }]}>
                          <Text style={{ fontSize: 14 }}>{sec.icon}</Text>
                          <Text style={[styles.secProgressNum, { color: sec.color }]}>{done}/{total}</Text>
                          <Text style={[styles.secProgressLabel, { color: colors.mutedForeground }]}>S{sec.number}</Text>
                          <View style={{ width: "100%", height: 3, backgroundColor: colors.border, borderRadius: 2, marginTop: 2, overflow: "hidden" }}>
                            <View style={{ width: `${secPct}%` as any, height: "100%", backgroundColor: sec.color, borderRadius: 2 }} />
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.statsRow}>
                    {[
                      { value: `${casesDone}/${MODULES.length}`, label: "Módulos", color: colors.primary },
                      { value: `${correctCount}`, label: "Correctas", color: colors.success },
                      { value: `${wrongCount}`, label: "Errores", color: colors.error },
                    ].map((s) => (
                      <View key={s.label} style={[styles.miniStat, { backgroundColor: s.color + "10" }]}>
                        <Text style={[styles.miniStatValue, { color: s.color }]}>{s.value}</Text>
                        <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                      </View>
                    ))}
                  </View>
                  {totalResults > 0 && (
                    <View style={{ gap: 4 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 10, color: colors.mutedForeground, fontWeight: "600" }}>
                          Precisión en factorización
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.success, fontWeight: "700" }}>
                          {pct}%
                        </Text>
                      </View>
                      <ProgressBar progress={pct} color={colors.success} height={5} />
                    </View>
                  )}

                  {modulesAnalytics.length > 0 && student.backendId != null && (
                    <TouchableOpacity
                      style={styles.detailToggleBtn}
                      onPress={() => toggleStudentExpanded(student.backendId!)}
                    >
                      <Feather name={isStudentExpanded ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
                      <Text style={[styles.detailToggleText, { color: colors.primary }]}>
                        {isStudentExpanded ? "Ocultar detalle por módulo y pregunta" : "Ver detalle por módulo y pregunta"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isStudentExpanded && (
                    <View style={{ marginTop: 6, marginBottom: 4, gap: 10 }}>
                      <View style={[styles.moduleAnalyticsCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "25" }]}>
                        <Text style={[styles.moduleAnalyticsTitle, { color: colors.foreground }]}>
                          Ruta y actividades
                        </Text>
                        <Text style={[styles.moduleAnalyticsMeta, { color: colors.mutedForeground }]}>
                          Ruta asignada: {student.diagnosticProfile?.route?.replace("ruta-", "Ruta ") ?? "Sin diagnóstico"}
                        </Text>
                        <Text style={[styles.moduleAnalyticsMeta, { color: colors.mutedForeground }]}>
                          Temas reforzados: {analytics?.reinforcedTopics?.length ? analytics.reinforcedTopics.join(", ") : "Ninguno registrado"}
                        </Text>
                        <Text style={[styles.moduleAnalyticsMeta, { color: colors.mutedForeground }]}>
                          Actividades adicionales: {analytics?.additionalActivities?.length ? analytics.additionalActivities.join(", ") : "Ninguna registrada"}
                        </Text>
                      </View>
                      <View style={styles.statsRow}>
                        {[
                          { value: formatDuration(timeTotal), label: "Tiempo total", color: colors.primary },
                          { value: `${attemptsTotal}`, label: "Intentos", color: colors.mutedForeground },
                          { value: `💡${hintsTotal}`, label: "Pistas pedidas", color: "#d97706" },
                          { value: `🔁${repeatedTotal}`, label: "Repetidos", color: colors.error },
                        ].map((s) => (
                          <View key={s.label} style={[styles.miniStat, { backgroundColor: colors.secondary }]}>
                            <Text style={[styles.miniStatValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                          </View>
                        ))}
                      </View>

                      {modulesAnalytics
                        .slice()
                        .sort((a, b) => {
                          const orderA = MODULE_CASE_ORDER.indexOf(a.moduleId);
                          const orderB = MODULE_CASE_ORDER.indexOf(b.moduleId);
                          return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
                        })
                        .map((mod) => {
                          const moduleKey = `${student.backendId}:${mod.moduleId}`;
                          const isModuleExpanded = expandedModuleKeys.has(moduleKey);
                          return (
                            <View key={mod.moduleId} style={[styles.moduleAnalyticsCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                              <TouchableOpacity onPress={() => toggleModuleExpanded(moduleKey)}>
                                <View style={styles.moduleAnalyticsHeader}>
                                  <Text style={[styles.moduleAnalyticsTitle, { color: colors.foreground }]} numberOfLines={1}>
                                    {MODULE_TOPIC_LABELS[mod.moduleId] ?? mod.moduleId}
                                  </Text>
                                  <Feather name={isModuleExpanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                                </View>
                                <Text style={[styles.moduleAnalyticsMeta, { color: colors.mutedForeground }]}>
                                  ✅{mod.correctCount} · ❌{mod.incorrectCount} · {mod.attemptsTotal} intentos · 💡{mod.hintsUsed} pistas · ⏱ {formatDuration(mod.totalDurationSeconds)} · 🔁{mod.repeatedExercises} repetidos
                                </Text>
                              </TouchableOpacity>
                              {isModuleExpanded && (
                                <View style={{ marginTop: 8, gap: 6 }}>
                                  {mod.exercises.map((ex) => (
                                    <View key={ex.exerciseId} style={[styles.exerciseAnalyticsRow, { borderColor: colors.border }]}>
                                      <Text style={[styles.exerciseAnalyticsQuestion, { color: colors.foreground }]} numberOfLines={2}>
                                        {EXERCISE_QUESTION_LOOKUP[ex.exerciseId] ?? ex.exerciseId}
                                      </Text>
                                      <Text style={[styles.exerciseAnalyticsMeta, { color: colors.mutedForeground }]}>
                                        ✅{ex.correctCount} · ❌{ex.incorrectCount} · {ex.attemptsTotal} intentos · 💡{ex.hintsUsed} · ⏱ {formatDuration(ex.totalDurationSeconds)}
                                        {ex.attemptsTotal > 1 ? " · repetido" : ""}
                                      </Text>
                                      {ex.attempts.map((attempt, attemptIndex) => (
                                        <View key={`${ex.exerciseId}-${attemptIndex}`} style={{ marginTop: 7, paddingTop: 7, borderTopWidth: 1, borderTopColor: colors.border, gap: 3 }}>
                                          <Text style={{ color: attempt.correct ? colors.success : colors.error, fontSize: 11, fontWeight: "800" }}>
                                            {attempt.correct ? "Respuesta correcta" : "Respuesta incorrecta"} · intento {attempt.attempts}
                                          </Text>
                                          <Text style={{ color: colors.foreground, fontSize: 11 }}>
                                            Pregunta: {attempt.questionText ?? EXERCISE_QUESTION_LOOKUP[ex.exerciseId] ?? ex.exerciseId}
                                          </Text>
                                          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                                            Respondió: {attempt.answer ?? "(sin respuesta)"} · Tema: {attempt.topicName ?? MODULE_TOPIC_LABELS[mod.moduleId] ?? mod.moduleId}
                                          </Text>
                                          <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>
                                            {new Date(attempt.createdAt).toLocaleString()} · ⏱ {formatDuration(ex.avgDurationSeconds)}
                                          </Text>
                                          {attempt.evidenceUrl ? (
                                            <View style={styles.evidenceCard}>
                                              {attempt.evidenceDriveFileId ? (
                                                <TouchableOpacity
                                                  accessibilityLabel={`Abrir evidencia del ejercicio ${ex.exerciseId}`}
                                                  onPress={() => Linking.openURL(attempt.evidenceUrl!)}
                                                >
                                                  <Image
                                                    source={{ uri: apiEvidencePreviewUrl(student.classCode, attempt.evidenceDriveFileId) }}
                                                    style={[styles.evidenceImage, { backgroundColor: colors.muted }]}
                                                    resizeMode="cover"
                                                  />
                                                </TouchableOpacity>
                                              ) : null}
                                              <TouchableOpacity
                                                style={[styles.evidenceButton, { borderColor: colors.primary + "55" }]}
                                                onPress={() => Linking.openURL(attempt.evidenceUrl!)}
                                              >
                                                <Feather name="external-link" size={13} color={colors.primary} />
                                                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>
                                                  Abrir imagen en Drive
                                                </Text>
                                              </TouchableOpacity>
                                            </View>
                                          ) : null}
                                        </View>
                                      ))}
                                    </View>
                                  ))}
                                  {mod.reflections.map((reflection) => (
                                    <View key={reflection.id} style={[styles.exerciseAnalyticsRow, { borderColor: colors.primary + "35", backgroundColor: colors.primary + "07" }]}>
                                      <Text style={[styles.exerciseAnalyticsQuestion, { color: colors.foreground }]}>Reflexión final</Text>
                                      <Text style={[styles.exerciseAnalyticsMeta, { color: colors.mutedForeground }]}>Aspectos que funcionaron: {reflection.aspectsWorked || "—"}</Text>
                                      <Text style={[styles.exerciseAnalyticsMeta, { color: colors.mutedForeground }]}>Dificultades: {reflection.difficulties || "—"}</Text>
                                      <Text style={[styles.exerciseAnalyticsMeta, { color: colors.mutedForeground }]}>Sugerencias: {reflection.improvementSuggestions || "—"}</Text>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          );
                        })}
                    </View>
                  )}

                  <TouchableOpacity
                    accessibilityLabel={`Eliminar perfil de ${student.pseudonym}`}
                    style={[
                      styles.deleteStudentBtn,
                      {
                        borderColor: colors.error + "45",
                        backgroundColor: colors.error + "08",
                      },
                    ]}
                    onPress={() => handleDeleteStudent(student)}
                    disabled={deletingStudentId !== null}
                  >
                    {deletingStudentId === student.backendId ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Feather name="trash-2" size={14} color={colors.error} />
                    )}
                    <Text style={[styles.deleteStudentText, { color: colors.error }]}>
                      Eliminar perfil
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* ── COMUNIDAD TAB ── */}
      {activeTab === "comunidad" && (() => {
        const communityStudents = [...allStudents]
          .filter((s) => filterClass === "all" || s.classCode === filterClass)
          .sort((a, b) => b.totalXP - a.totalXP);

        const totalXPSum = communityStudents.reduce((acc, s) => acc + s.totalXP, 0);
        const avgXP = communityStudents.length > 0 ? Math.round(totalXPSum / communityStudents.length) : 0;
        const topXP  = communityStudents.length > 0 ? communityStudents[0].totalXP : 0;
        const activeStudents = communityStudents.filter((s) => s.streak > 0).length;
        const medalIcons = ["🥇", "🥈", "🥉"];

        return (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Comunidad y Ranking
            </Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Participación y posicionamiento de tus estudiantes
            </Text>

            {/* Summary stats */}
            <View style={styles.commSummaryRow}>
              {[
                { label: "Total",     value: String(communityStudents.length), icon: "👥", color: colors.primary },
                { label: "XP líder",  value: String(topXP),  icon: "🥇", color: "#d97706" },
                { label: "XP prom.",  value: String(avgXP),  icon: "⭐", color: colors.success },
                { label: "Con racha", value: String(activeStudents), icon: "🔥", color: "#dc2626" },
              ].map((s) => (
                <View key={s.label} style={[styles.commStatCard, { backgroundColor: s.color + "12", borderColor: s.color + "25" }]}>
                  <Text style={styles.commStatIcon}>{s.icon}</Text>
                  <Text style={[styles.commStatValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={[styles.commStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Class filter */}
            {classCodes.length > 0 && filterChips}

            {communityStudents.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="award" size={28} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Ningún estudiante registrado en esta clase aún
                </Text>
              </View>
            ) : (
              communityStudents.map((student, index) => {
                const rank = index + 1;
                const correctCount  = student.exerciseResults.filter((r) => r.correct).length;
                const totalResults  = student.exerciseResults.length;
                const pct = totalResults > 0 ? Math.round((correctCount / totalResults) * 100) : 0;
                const casesDone = student.completedModules.length;
                const topicsDone = (student.completedTopics ?? []).length;

                return (
                  <View
                    key={student.id}
                    style={[
                      styles.commRow,
                      {
                        backgroundColor: rank <= 3 ? colors.card : colors.card,
                        borderColor: rank === 1 ? "#f59e0b60" : rank === 2 ? "#94a3b860" : rank === 3 ? "#cd7c3a60" : colors.border,
                        borderLeftWidth: rank <= 3 ? 4 : 1,
                        borderLeftColor: rank === 1 ? "#f59e0b" : rank === 2 ? "#94a3b8" : rank === 3 ? "#cd7c3a" : colors.border,
                      },
                    ]}
                  >
                    {/* Rank + Avatar */}
                    <View style={styles.commRankCol}>
                      {rank <= 3 ? (
                        <Text style={styles.commMedal}>{medalIcons[rank - 1]}</Text>
                      ) : (
                        <Text style={[styles.commRankNum, { color: colors.mutedForeground }]}>#{rank}</Text>
                      )}
                      <Text style={styles.commAvatar}>{student.avatar}</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.commInfo}>
                      <View style={styles.commNameRow}>
                        <Text style={[styles.commName, { color: colors.foreground }]} numberOfLines={1}>
                          {student.pseudonym}
                        </Text>
                        <View style={[styles.commClassBadge, { backgroundColor: colors.primary + "15" }]}>
                          <Text style={[styles.commClassText, { color: colors.primary }]}>{student.classCode}</Text>
                        </View>
                      </View>

                      {/* Quick stats row */}
                      <View style={styles.commQuickStats}>
                        <Text style={[styles.commStat, { color: "#d97706" }]}>⭐ {student.totalXP} XP</Text>
                        <Text style={[styles.commStat, { color: "#dc2626" }]}>🔥 {student.streak}</Text>
                        <Text style={[styles.commStat, { color: colors.success }]}>📚 {casesDone}/{MODULES.length}</Text>
                        <Text style={[styles.commStat, { color: colors.mutedForeground }]}>📖 {topicsDone} temas</Text>
                      </View>

                      {/* Accuracy bar */}
                      {totalResults > 0 && (
                        <View style={styles.commAccRow}>
                          <View style={[styles.commAccBg, { backgroundColor: colors.border }]}>
                            <View style={[styles.commAccFill, { width: `${pct}%` as any, backgroundColor: pct >= 70 ? colors.success : "#d97706" }]} />
                          </View>
                          <Text style={[styles.commAccPct, { color: pct >= 70 ? colors.success : "#d97706" }]}>{pct}%</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        );
      })()}

      {/* ── SECCIONES TAB ── */}
      {activeTab === "secciones" && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Avance por Sección
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Progreso del grupo en los 4 módulos del curso
          </Text>

          {classCodes.length > 0 && filterChips}

          {COURSE_SECTIONS.map((sec) => {
            const isFact = sec.id === "factorizacion";
            const isExpanded = expandedSection === sec.id;
            const studentsFiltered = sorted;
            const totalStudents = studentsFiltered.length || 1;

            const overallStarted = isFact
              ? studentsFiltered.filter((s) => s.completedModules.length > 0).length
              : studentsFiltered.filter((s) => sec.topics.some((t) => t.topicId && (s.completedTopics ?? []).includes(t.topicId!))).length;

            const overallCompleted = isFact
              ? studentsFiltered.filter((s) => s.completedModules.length === MODULES.length).length
              : studentsFiltered.filter((s) => sec.topics.every((t) => !t.topicId || (s.completedTopics ?? []).includes(t.topicId!))).length;

            const avgCompletion = isFact
              ? Math.round(studentsFiltered.reduce((acc, s) => acc + s.completedModules.length, 0) / totalStudents / MODULES.length * 100)
              : Math.round(studentsFiltered.reduce((acc, s) => {
                  const done = sec.topics.filter((t) => t.topicId && (s.completedTopics ?? []).includes(t.topicId!)).length;
                  return acc + done;
                }, 0) / totalStudents / sec.topics.length * 100);

            return (
              <View
                key={sec.id}
                style={[styles.secCard, { backgroundColor: colors.card, borderColor: isExpanded ? sec.color : colors.border }]}
              >
                {/* Section header */}
                <TouchableOpacity
                  style={styles.secCardHeader}
                  onPress={() => setExpandedSection(isExpanded ? null : sec.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.secIconBox, { backgroundColor: sec.color + "18" }]}>
                    <Text style={{ fontSize: 22 }}>{sec.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.secCardTitle, { color: colors.foreground }]}>
                      {sec.number} · {sec.title}
                    </Text>
                    <Text style={[styles.secCardSub, { color: colors.mutedForeground }]}>
                      {sec.subtitle} · {sec.topics.length} {isFact ? "casos" : "temas"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <View style={{ flex: 1, height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" }}>
                        <View style={{ width: `${avgCompletion}%` as any, height: "100%", backgroundColor: sec.color, borderRadius: 3 }} />
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: sec.color, minWidth: 36 }}>{avgCompletion}%</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <View style={[styles.secBadge, { backgroundColor: sec.color + "15" }]}>
                      <Text style={[styles.secBadgeText, { color: sec.color }]}>{overallStarted} iniciaron</Text>
                    </View>
                    <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                  </View>
                </TouchableOpacity>

                {/* Summary stats */}
                <View style={[styles.secStatsRow, { borderTopColor: colors.border }]}>
                  {[
                    { label: "Iniciaron", value: overallStarted, color: sec.color },
                    { label: "Completaron", value: overallCompleted, color: colors.success },
                    { label: "Sin iniciar", value: totalStudents - overallStarted, color: colors.mutedForeground },
                  ].map((st) => (
                    <View key={st.label} style={styles.secStatItem}>
                      <Text style={[styles.secStatValue, { color: st.color }]}>{st.value}</Text>
                      <Text style={[styles.secStatLabel, { color: colors.mutedForeground }]}>{st.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Expanded: per-topic/case breakdown */}
                {isExpanded && (
                  <View style={[styles.topicList, { borderTopColor: colors.border }]}>
                    {isFact
                      ? [...MODULES]
                          .sort((a, b) => MODULE_CASE_ORDER.indexOf(a.id) - MODULE_CASE_ORDER.indexOf(b.id))
                          .map((mod) => {
                            const caseNum = MODULE_CASE_ORDER.indexOf(mod.id) + 1;
                            const completedBy = studentsFiltered.filter((s) => s.completedModules.includes(mod.id)).length;
                            const pct = Math.round((completedBy / totalStudents) * 100);
                            return (
                              <View key={mod.id} style={styles.topicRow}>
                                <Text style={styles.topicIcon}>{mod.icon}</Text>
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.topicName, { color: colors.foreground }]} numberOfLines={1}>
                                    Caso {caseNum}: {mod.title}
                                  </Text>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                                    <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: "hidden" }}>
                                      <View style={{ width: `${pct}%` as any, height: "100%", backgroundColor: mod.color, borderRadius: 2 }} />
                                    </View>
                                    <Text style={{ fontSize: 10, fontWeight: "700", color: mod.color, minWidth: 30 }}>{pct}%</Text>
                                  </View>
                                </View>
                                <View style={[styles.topicCount, { backgroundColor: pct > 0 ? sec.color + "15" : colors.secondary }]}>
                                  <Text style={[styles.topicCountText, { color: pct > 0 ? sec.color : colors.mutedForeground }]}>
                                    {completedBy}/{sorted.length || 0}
                                  </Text>
                                </View>
                              </View>
                            );
                          })
                      : sec.topics.map((topic) => {
                          if (!topic.topicId) return null;
                          const completedBy = studentsFiltered.filter((s) => (s.completedTopics ?? []).includes(topic.topicId!)).length;
                          const pct = Math.round((completedBy / totalStudents) * 100);
                          return (
                            <View key={topic.topicId} style={styles.topicRow}>
                              <View style={[styles.topicDot, { backgroundColor: pct > 0 ? sec.color : colors.border }]} />
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.topicName, { color: colors.foreground }]} numberOfLines={1}>
                                  {topic.label}
                                </Text>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                                  <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: "hidden" }}>
                                    <View style={{ width: `${pct}%` as any, height: "100%", backgroundColor: sec.color, borderRadius: 2 }} />
                                  </View>
                                  <Text style={{ fontSize: 10, fontWeight: "700", color: sec.color, minWidth: 30 }}>{pct}%</Text>
                                </View>
                              </View>
                              <View style={[styles.topicCount, { backgroundColor: pct > 0 ? sec.color + "15" : colors.secondary }]}>
                                <Text style={[styles.topicCountText, { color: pct > 0 ? sec.color : colors.mutedForeground }]}>
                                  {completedBy}/{sorted.length || 0}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* ── ERRORS TAB ── */}
      {activeTab === "errors" && (
        <View>
          {(() => {
            const diagSummary = getDiagnosticSummary(filterClass === "all" ? undefined : filterClass);
            const studentsWithDiag = (filterClass === "all" ? allStudents : allStudents.filter((s) => s.classCode === filterClass)).filter((s) => s.diagnosticProfile);
            if (studentsWithDiag.length === 0) return null;
            const avgOverall = Math.round(
              studentsWithDiag.reduce((s, st) => s + (st.diagnosticProfile?.overallScore ?? 0), 0) / studentsWithDiag.length
            );
            return (
              <View style={[styles.diagSummaryCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "25" }]}>
                <View style={styles.diagSummaryHeader}>
                  <View style={[styles.diagSummaryIcon, { backgroundColor: colors.primary + "15" }]}>
                    <Text style={{ fontSize: 20 }}>🧠</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.diagSummaryTitle, { color: colors.foreground }]}>
                      Perfil Diagnóstico del Grupo
                    </Text>
                    <Text style={[styles.diagSummarySub, { color: colors.mutedForeground }]}>
                      {studentsWithDiag.length} estudiante{studentsWithDiag.length !== 1 ? "s" : ""} evaluado{studentsWithDiag.length !== 1 ? "s" : ""} · Promedio: {avgOverall}%
                    </Text>
                  </View>
                </View>
                {diagSummary.filter((d) => d.count > 0).map((d) => {
                  const info = DIAGNOSTIC_CATEGORY_INFO[d.category as keyof typeof DIAGNOSTIC_CATEGORY_INFO];
                  if (!info) return null;
                  const isWeak = d.avgScore < 60;
                  return (
                    <View key={d.category} style={styles.diagSummaryRow}>
                      <Text style={styles.diagSummaryIcon2}>{info.icon}</Text>
                      <View style={styles.diagSummaryBarWrap}>
                        <Text style={[styles.diagSummaryLabel, { color: colors.foreground }]}>{info.label}</Text>
                        <View style={[styles.diagSummaryBarBg, { backgroundColor: colors.border }]}>
                          <View style={[styles.diagSummaryBarFill, { width: `${d.avgScore}%` as any, backgroundColor: isWeak ? info.color : colors.success }]} />
                        </View>
                      </View>
                      <Text style={[styles.diagSummaryPct, { color: isWeak ? info.color : colors.success }]}>
                        {d.avgScore}%
                      </Text>
                      {isWeak && (
                        <Feather name="alert-circle" size={13} color={info.color} />
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })()}

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Análisis de Errores
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Errores más frecuentes en factorización para reforzar en el aula
          </Text>

          {classCodes.length > 0 && filterChips}

          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 6 }]}>
            Registro detallado de errores
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Estudiante, respuesta enviada, pregunta exacta, tema y fecha.
          </Text>
          {detailedErrors.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No hay errores sincronizados para este filtro.</Text>
            </View>
          ) : detailedErrors.slice(0, 100).map((error, index) => (
            <View key={`${error.studentId}-${error.exerciseId}-${error.createdAt}-${index}`} style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.error + "30" }]}>
              <Text style={{ color: colors.error, fontSize: 13, fontWeight: "800" }}>{error.pseudonym}</Text>
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700", marginTop: 4 }}>
                {error.questionText ?? EXERCISE_QUESTION_LOOKUP[error.exerciseId] ?? error.exerciseId}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 4 }}>
                Respondió: {error.answer ?? "(sin respuesta)"}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                Tema: {error.topicName ?? MODULE_TOPIC_LABELS[error.moduleId] ?? error.moduleId} · Intento {error.attempts}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 3 }}>
                {new Date(error.createdAt).toLocaleString()}
              </Text>
            </View>
          ))}

          {errorSummary.sort((a, b) => b.count - a.count).map((err, i) => {
            const remediation = ERROR_TO_TOPIC_DOCENTE[err.category];
            return (
              <View key={err.category} style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.errorHeader}>
                  <View style={[styles.errorNum, { backgroundColor: i === 0 ? colors.error + "20" : colors.secondary }]}>
                    <Text style={[styles.errorNumText, { color: i === 0 ? colors.error : colors.mutedForeground }]}>#{i + 1}</Text>
                  </View>
                  <Text style={[styles.errorLabel, { color: colors.foreground }]} numberOfLines={2}>{err.label}</Text>
                  <Text style={[styles.errorCount, { color: colors.mutedForeground }]}>{err.count}</Text>
                </View>
                <ProgressBar progress={err.percentage} color={i === 0 ? colors.error : colors.primary} height={5} />
                <Text style={[{ fontSize: 10, color: colors.mutedForeground, marginTop: 5 }]}>{err.percentage}% de los errores</Text>
                {remediation && (
                  <View style={[styles.errorRemediationRow, { backgroundColor: remediation.color + "10", borderColor: remediation.color + "30" }]}>
                    <Text style={{ fontSize: 13 }}>{remediation.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.errorRemediationLabel, { color: remediation.color }]}>Reforzar en clase →</Text>
                      <Text style={[styles.errorRemediationTopic, { color: colors.foreground }]} numberOfLines={1}>{remediation.title}</Text>
                      <Text style={[styles.errorRemediationSection, { color: colors.mutedForeground }]}>{remediation.section}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 22 }]}>
            Tiempo y ayudas por tema
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Tiempo promedio por ejercicio, veces que usaron la ayuda y errores por tema
          </Text>

          {isLoadingTopicStats && topicStats.length === 0 ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : topicStats.length === 0 ? (
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Aún no hay datos suficientes de tiempo o ayudas para este filtro.
            </Text>
          ) : (
            topicStats.map((t) => (
              <View
                key={t.moduleId}
                style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.errorHeader}>
                  <Text style={[styles.errorLabel, { color: colors.foreground }]} numberOfLines={2}>
                    {MODULE_TOPIC_LABELS[t.moduleId] ?? t.moduleId}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Feather name="clock" size={13} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 12, color: colors.foreground }}>
                      {formatDuration(t.avgDurationSeconds)} promedio
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Feather name="help-circle" size={13} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 12, color: colors.foreground }}>
                      {t.hintsUsed} ayuda{t.hintsUsed !== 1 ? "s" : ""} usada{t.hintsUsed !== 1 ? "s" : ""}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Feather name="alert-circle" size={13} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 12, color: colors.foreground }}>
                      {t.errorCount} error{t.errorCount !== 1 ? "es" : ""}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Feather name="users" size={13} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 12, color: colors.foreground }}>
                      {t.studentsInvolved} estudiante{t.studentsInvolved !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* ── EVAL TAB ── */}
      {activeTab === "eval" && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Crear Código de Evaluación
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Genera un código para dar acceso al examen de un caso en el momento oportuno
          </Text>

          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.foreground }]}>Caso:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[...MODULES]
                  .sort((a, b) => {
                    const ai = MODULE_CASE_ORDER.indexOf(a.id);
                    const bi = MODULE_CASE_ORDER.indexOf(b.id);
                    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                  })
                  .map((m) => {
                  const caseNum = MODULE_CASE_ORDER.indexOf(m.id) + 1;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.moduleChip, { backgroundColor: selectedModuleForEval === m.id ? m.color : colors.secondary, borderColor: selectedModuleForEval === m.id ? m.color : colors.border }]}
                      onPress={() => setSelectedModuleForEval(m.id)}
                    >
                      <Text style={styles.moduleChipIcon}>{m.icon}</Text>
                      <Text style={[styles.moduleChipText, { color: selectedModuleForEval === m.id ? "#fff" : colors.foreground }]}>
                        {caseNum > 0 ? `C${caseNum}: ` : ""}{m.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={[styles.formLabel, { color: colors.foreground }]}>Código de acceso:</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, letterSpacing: 4, fontWeight: "700", textAlign: "center", fontSize: 18 }]}
              placeholder="Ej: EVAL01"
              placeholderTextColor={colors.mutedForeground}
              value={evalCode}
              onChangeText={(t) => setEvalCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={8}
            />

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddEvalCode}
            >
              <Feather name="plus-circle" size={16} color="#fff" />
              <Text style={styles.createBtnText}>Crear código de examen</Text>
            </TouchableOpacity>
          </View>

          {evaluationCodes.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8 }]}>
                Códigos activos
              </Text>
              {evaluationCodes.map((ec) => {
                const mod = MODULES.find((m) => m.id === ec.moduleId);
                return (
                  <View key={ec.moduleId} style={[styles.codeRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={{ fontSize: 22 }}>{mod?.icon}</Text>
                    <View style={styles.codeInfo}>
                      <Text style={[styles.codeLabel, { color: colors.foreground }]}>{mod?.title}</Text>
                      <Text style={[styles.codeMeta, { color: colors.primary, fontWeight: "700" }]}>Código: {ec.code}</Text>
                    </View>
                    <Feather name="check-circle" size={18} color={colors.success} />
                  </View>
                );
              })}
            </>
          )}
        </View>
      )}
    </ScrollView>
      <Modal
        visible={studentPendingDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (deletingStudentId === null) setStudentPendingDelete(null);
        }}
      >
        <View style={styles.deleteModalBackdrop}>
          <View style={[styles.deleteModal, { backgroundColor: colors.card }]}>
            <View style={[styles.deleteModalIcon, { backgroundColor: colors.error + "12" }]}>
              <Feather name="trash-2" size={22} color={colors.error} />
            </View>
            <Text style={[styles.deleteModalTitle, { color: colors.foreground }]}>
              Eliminar perfil de estudiante
            </Text>
            <Text style={[styles.deleteModalText, { color: colors.mutedForeground }]}>
              Se eliminará el perfil de{" "}
              <Text style={{ color: colors.foreground, fontWeight: "800" }}>
                {studentPendingDelete?.pseudonym}
              </Text>
              , junto con sus XP, avances y resultados.
            </Text>
            <Text style={[styles.deleteModalWarning, { color: colors.error }]}>
              Esta acción no se puede deshacer.
            </Text>
            {deleteError && (
              <Text style={[styles.deleteModalError, { color: colors.error }]}>
                {deleteError}
              </Text>
            )}
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteCancelBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setDeleteError(null);
                  setStudentPendingDelete(null);
                }}
                disabled={deletingStudentId !== null}
                accessibilityLabel="Cancelar eliminación"
              >
                <Text style={[styles.deleteCancelText, { color: colors.foreground }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmBtn, { backgroundColor: colors.error }]}
                onPress={confirmDeleteStudent}
                disabled={deletingStudentId !== null}
                accessibilityLabel="Confirmar eliminación del perfil"
              >
                {deletingStudentId !== null ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="trash-2" size={14} color="#fff" />
                )}
                <Text style={styles.deleteConfirmText}>
                  {deletingStudentId !== null ? "Eliminando..." : "Eliminar perfil"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 13 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  tabsContainer: { marginBottom: 20 },
  tab: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, gap: 5 },
  tabLabel: { fontSize: 12, fontWeight: "600" },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  sectionSub: { fontSize: 13, marginBottom: 16 },
  formCard: { borderRadius: 16, padding: 18, borderWidth: 1, marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  formInput: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 14 },
  createBtn: { borderRadius: 14, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  createBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  codeBadge: { borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12 },
  codeValue: { fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  codeInfo: { flex: 1 },
  codeLabel: { fontSize: 14, fontWeight: "700" },
  codeMeta: { fontSize: 12, marginTop: 2 },
  filterChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  // Student card
  studentCard: { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  studentHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  studentAvatar: { fontSize: 26 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: "700" },
  studentMeta: { fontSize: 11, marginTop: 2 },
  rank: { fontSize: 18, fontWeight: "800" },
  sectionProgressRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  secProgressCard: { flex: 1, borderRadius: 10, padding: 8, alignItems: "center", borderWidth: 1, gap: 2 },
  secProgressNum: { fontSize: 13, fontWeight: "800" },
  secProgressLabel: { fontSize: 9, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  miniStat: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  miniStatValue: { fontSize: 16, fontWeight: "800" },
  miniStatLabel: { fontSize: 10, fontWeight: "500" },
  detailToggleBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 2, alignSelf: "flex-start" },
  detailToggleText: { fontSize: 11.5, fontWeight: "700" },
  moduleAnalyticsCard: { borderRadius: 12, padding: 10, borderWidth: 1 },
  moduleAnalyticsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  moduleAnalyticsTitle: { fontSize: 12.5, fontWeight: "700", flex: 1 },
  moduleAnalyticsMeta: { fontSize: 10.5, marginTop: 4, lineHeight: 15 },
  exerciseAnalyticsRow: { borderLeftWidth: 2, paddingLeft: 8, paddingBottom: 4 },
  exerciseAnalyticsQuestion: { fontSize: 11.5, fontWeight: "600", lineHeight: 15 },
  exerciseAnalyticsMeta: { fontSize: 10, marginTop: 2 },
  evidenceCard: { marginTop: 6, gap: 6 },
  evidenceImage: { width: "100%", height: 180, borderRadius: 10 },
  evidenceButton: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteStudentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 2,
  },
  deleteStudentText: { fontSize: 12, fontWeight: "700" },
  deleteModalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },
  deleteModal: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  deleteModalIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  deleteModalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  deleteModalText: { fontSize: 14, lineHeight: 21 },
  deleteModalWarning: { fontSize: 13, fontWeight: "800", marginTop: 10 },
  deleteModalError: { fontSize: 12, fontWeight: "700", marginTop: 10 },
  deleteModalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  deleteCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteCancelText: { fontSize: 13, fontWeight: "700" },
  deleteConfirmBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteConfirmText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  // Section cards (Secciones tab)
  secCard: { borderRadius: 16, marginBottom: 14, borderWidth: 1.5, overflow: "hidden" },
  secCardHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  secIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  secCardTitle: { fontSize: 15, fontWeight: "800" },
  secCardSub: { fontSize: 11, marginTop: 1 },
  secBadge: { borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  secBadgeText: { fontSize: 10, fontWeight: "700" },
  secStatsRow: { flexDirection: "row", borderTopWidth: 1, paddingVertical: 10, paddingHorizontal: 14 },
  secStatItem: { flex: 1, alignItems: "center" },
  secStatValue: { fontSize: 18, fontWeight: "800" },
  secStatLabel: { fontSize: 10, fontWeight: "500", marginTop: 1 },
  topicList: { borderTopWidth: 1, paddingHorizontal: 14, paddingBottom: 8, paddingTop: 4, gap: 2 },
  topicRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  topicIcon: { fontSize: 18, width: 24, textAlign: "center" },
  topicDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 8 },
  topicName: { fontSize: 12, fontWeight: "600" },
  topicCount: { borderRadius: 10, paddingVertical: 3, paddingHorizontal: 10 },
  topicCountText: { fontSize: 11, fontWeight: "700" },
  // Errors tab
  errorCard: { borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  errorHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  errorNum: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  errorNumText: { fontSize: 11, fontWeight: "800" },
  errorLabel: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  errorCount: { fontSize: 18, fontWeight: "800" },
  errorRemediationRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    borderRadius: 10, borderWidth: 1, padding: 10, marginTop: 10,
  },
  errorRemediationLabel: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  errorRemediationTopic: { fontSize: 13, fontWeight: "700", marginTop: 1 },
  errorRemediationSection: { fontSize: 11, marginTop: 1 },
  emptyCard: { borderRadius: 16, padding: 28, alignItems: "center", borderWidth: 1, gap: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
  moduleChip: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, gap: 6 },
  moduleChipIcon: { fontSize: 14 },
  moduleChipText: { fontSize: 12, fontWeight: "600" },
  // Comunidad tab
  commSummaryRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  commStatCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center", gap: 2 },
  commStatIcon: { fontSize: 18 },
  commStatValue: { fontSize: 16, fontWeight: "800" },
  commStatLabel: { fontSize: 9, fontWeight: "600" },
  commRow: {
    borderRadius: 16, borderWidth: 1, padding: 12,
    marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10,
  },
  commRankCol: { alignItems: "center", width: 38, gap: 2 },
  commMedal: { fontSize: 20 },
  commRankNum: { fontSize: 13, fontWeight: "800" },
  commAvatar: { fontSize: 22 },
  commInfo: { flex: 1, gap: 5 },
  commNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  commName: { fontSize: 14, fontWeight: "700", flex: 1 },
  commClassBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  commClassText: { fontSize: 10, fontWeight: "700" },
  commQuickStats: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  commStat: { fontSize: 11, fontWeight: "700" },
  commAccRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  commAccBg: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  commAccFill: { height: "100%", borderRadius: 3 },
  commAccPct: { fontSize: 11, fontWeight: "800", width: 32, textAlign: "right" },
  // Diagnostic summary
  diagSummaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20, gap: 10 },
  diagSummaryHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  diagSummaryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  diagSummaryTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  diagSummarySub: { fontSize: 12 },
  diagSummaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  diagSummaryIcon2: { fontSize: 15, width: 22, textAlign: "center" },
  diagSummaryBarWrap: { flex: 1, gap: 3 },
  diagSummaryLabel: { fontSize: 11, fontWeight: "600" },
  diagSummaryBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  diagSummaryBarFill: { height: "100%", borderRadius: 3 },
  diagSummaryPct: { fontSize: 12, fontWeight: "800", width: 34, textAlign: "right" },
});
