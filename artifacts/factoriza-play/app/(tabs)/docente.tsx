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
import { MODULES, MODULE_CASE_ORDER } from "@/data/modules";
import { ProgressBar } from "@/components/ProgressBar";
import { DIAGNOSTIC_CATEGORY_INFO } from "@/data/diagnostic";

type Tab = "students" | "modules" | "errors" | "eval" | "codes";

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
  } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [evalCode, setEvalCode] = useState("");
  const [selectedModuleForEval, setSelectedModuleForEval] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newCodeLabel, setNewCodeLabel] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const isWeb = Platform.OS === "web";

  const errorSummary = getErrorSummary(filterClass === "all" ? undefined : filterClass);
  const sorted = [...allStudents]
    .filter((s) => filterClass === "all" || s.classCode === filterClass)
    .sort((a, b) => b.totalXP - a.totalXP);

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

  const TABS: { id: Tab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { id: "students", label: "Estudiantes", icon: "users" },
    { id: "modules", label: "Módulos", icon: "unlock" },
    { id: "errors", label: "Errores", icon: "alert-triangle" },
    { id: "eval", label: "Exámenes", icon: "clipboard" },
    { id: "codes", label: "Códigos", icon: "key" },
  ];

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
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.secondary }]}
          onPress={logout}
        >
          <Feather name="log-out" size={17} color={colors.mutedForeground} />
        </TouchableOpacity>
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

          {/* Filter by class */}
          {classCodes.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={[styles.filterChip, { backgroundColor: filterClass === "all" ? colors.primary : colors.secondary, borderColor: filterClass === "all" ? colors.primary : colors.border }]}
                  onPress={() => setFilterClass("all")}
                >
                  <Text style={{ color: filterClass === "all" ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                    Todos
                  </Text>
                </TouchableOpacity>
                {classCodes.map((cc) => (
                  <TouchableOpacity
                    key={cc.code}
                    style={[styles.filterChip, { backgroundColor: filterClass === cc.code ? colors.primary : colors.secondary, borderColor: filterClass === cc.code ? colors.primary : colors.border }]}
                    onPress={() => setFilterClass(cc.code)}
                  >
                    <Text style={{ color: filterClass === cc.code ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                      {cc.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {sorted.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="users" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Ningún estudiante registrado aún
              </Text>
            </View>
          ) : (
            sorted.map((student, index) => (
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
                <View style={styles.statsRow}>
                  {[
                    { value: `${student.completedModules.length}/${MODULES.length}`, label: "Casos", color: colors.primary },
                    { value: `${student.exerciseResults.filter((r) => r.correct).length}`, label: "Correctas", color: colors.success },
                    { value: `${student.exerciseResults.filter((r) => !r.correct).length}`, label: "Errores", color: colors.error },
                  ].map((s) => (
                    <View key={s.label} style={[styles.miniStat, { backgroundColor: s.color + "10" }]}>
                      <Text style={[styles.miniStatValue, { color: s.color }]}>{s.value}</Text>
                      <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                    </View>
                  ))}
                </View>
                {student.exerciseResults.length > 0 && (() => {
                  const pct = Math.round(
                    (student.exerciseResults.filter((r) => r.correct).length /
                      student.exerciseResults.length) * 100
                  );
                  return (
                    <View style={{ gap: 4 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontWeight: "600" }]}>
                          Precisión
                        </Text>
                        <Text style={[{ fontSize: 10, color: colors.success, fontWeight: "700" }]}>
                          {pct}%
                        </Text>
                      </View>
                      <ProgressBar
                        progress={pct}
                        color={colors.success}
                        height={5}
                      />
                    </View>
                  );
                })()}
              </View>
            ))
          )}
        </View>
      )}

      {/* ── MODULES TAB ── */}
      {activeTab === "modules" && (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Progreso por Caso
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Los casos se desbloquean progresivamente al completar el anterior
          </Text>
          {[...MODULES]
            .sort((a, b) => {
              const ai = MODULE_CASE_ORDER.indexOf(a.id);
              const bi = MODULE_CASE_ORDER.indexOf(b.id);
              return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            })
            .map((module) => {
            const caseNum = MODULE_CASE_ORDER.indexOf(module.id) + 1;
            const completedCount = sorted.filter((s) =>
              s.completedModules.includes(module.id)
            ).length;
            const total = sorted.length || 1;
            const pct = Math.round((completedCount / total) * 100);
            return (
              <View
                key={module.id}
                style={[styles.moduleRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={styles.moduleIcon}>{module.icon}</Text>
                <View style={styles.moduleInfo}>
                  <Text style={[styles.moduleName, { color: colors.foreground }]}>
                    {caseNum > 0 ? `Caso ${caseNum}: ` : ""}{module.title}
                  </Text>
                  <Text style={[styles.moduleLevel, { color: colors.mutedForeground }]}>
                    {module.exercises.length} ejercicios · {completedCount}/{sorted.length} estudiantes
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: "hidden" }}>
                      <View style={{ width: `${pct}%` as any, height: "100%", backgroundColor: module.color, borderRadius: 2 }} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: module.color }}>{pct}%</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ── ERRORS TAB ── */}
      {activeTab === "errors" && (
        <View>
          {/* Diagnostic summary */}
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
            Errores más frecuentes para reforzar en el aula
          </Text>

          {/* Filter */}
          {classCodes.length > 0 && (
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
          )}

          {errorSummary.sort((a, b) => b.count - a.count).map((err, i) => (
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
            </View>
          ))}
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

          {/* Active eval codes */}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 13 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
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
  studentCard: { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  studentHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  studentAvatar: { fontSize: 26 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: "700" },
  studentMeta: { fontSize: 11, marginTop: 2 },
  rank: { fontSize: 18, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  miniStat: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  miniStatValue: { fontSize: 16, fontWeight: "800" },
  miniStatLabel: { fontSize: 10, fontWeight: "500" },
  moduleRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, gap: 12 },
  moduleIcon: { fontSize: 24 },
  moduleInfo: { flex: 1 },
  moduleName: { fontSize: 14, fontWeight: "700" },
  moduleLevel: { fontSize: 11, marginTop: 2 },
  unlockBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  unlockBtnText: { fontSize: 12, fontWeight: "700" },
  errorCard: { borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  errorHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  errorNum: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  errorNumText: { fontSize: 11, fontWeight: "800" },
  errorLabel: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  errorCount: { fontSize: 18, fontWeight: "800" },
  emptyCard: { borderRadius: 16, padding: 28, alignItems: "center", borderWidth: 1, gap: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
  moduleChip: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, gap: 6 },
  moduleChipIcon: { fontSize: 14 },
  moduleChipText: { fontSize: 12, fontWeight: "600" },
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
