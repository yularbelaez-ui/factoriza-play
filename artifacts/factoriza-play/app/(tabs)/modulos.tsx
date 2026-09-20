import { Feather } from "@expo/vector-icons";
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
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MODULES, MODULE_CASE_ORDER } from "@/data/modules";
import { COURSE_SECTIONS, SectionStatus } from "@/data/courseSections";
import { DIAGNOSTIC_CATEGORY_INFO } from "@/data/diagnostic";
import { ProgressBar } from "@/components/ProgressBar";

export default function ModulosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { unlockedModules, moduleProgress, currentStudent } = useApp();
  const isWeb = Platform.OS === "web";
  const [expandedSection, setExpandedSection] = useState<string>("factorizacion");

  if (!currentStudent) return null;

  const getProgress = (moduleId: string) => {
    const module = MODULES.find((m) => m.id === moduleId);
    if (!module) return 0;
    const completedIds = new Set([
      ...(currentStudent.completedExercises ?? []),
      ...(currentStudent.exerciseResults ?? [])
        .filter((result) => result.correct)
        .map((result) => result.exerciseId),
    ]);
    const done = module.exercises.filter((exercise) => completedIds.has(exercise.id)).length;
    const total = module.exercises.length;
    return Math.round((done / total) * 100);
  };

  const dp = currentStudent.diagnosticProfile;

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
        🗺️ Ruta del Curso
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Toca cada sección para explorar los temas
      </Text>

      {COURSE_SECTIONS.map((section, idx) => {
        const isExpanded = expandedSection === section.id;
        const isLast = idx === COURSE_SECTIONS.length - 1;

        return (
          <View key={section.id} style={styles.roadmapItem}>
            {/* Línea conectora */}
            {!isLast && (
              <View style={[styles.connector, { backgroundColor: section.borderColor }]} />
            )}

            {/* Cabecera de sección — siempre visible */}
            <TouchableOpacity
              style={[
                styles.sectionCard,
                {
                  backgroundColor: section.lightColor,
                  borderColor: section.borderColor,
                  borderLeftColor: section.color,
                },
              ]}
              onPress={() =>
                setExpandedSection(isExpanded ? "" : section.id)
              }
              activeOpacity={0.8}
            >
              {/* Top row */}
              <View style={styles.sectionTop}>
                <View style={[styles.numBadge, { backgroundColor: section.color }]}>
                  <Text style={styles.numText}>{section.number}</Text>
                </View>
                <Text style={styles.sectionIcon}>{section.icon}</Text>
                <View style={styles.sectionMeta}>
                  <Text style={[styles.sectionTitle, { color: "#1e1b4b" }]}>
                    {section.title}
                  </Text>
                  <Text style={[styles.sectionSub, { color: "#6b7280" }]}>
                    {section.subtitle}
                  </Text>
                </View>
                <View style={styles.sectionRight}>
                  <StatusBadge status={section.status} color={section.color} />
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={section.color}
                    style={{ marginTop: 6 }}
                  />
                </View>
              </View>

              {/* Contenido expandido */}
              {isExpanded && (
                <View style={[styles.expanded, { borderTopColor: section.borderColor }]}>

                  {/* ── Sección 01: Diagnóstico ── */}
                  {section.status === "diagnostico" && (
                    <>
                      <TopicList topics={section.topics} color={section.color} />
                      {dp ? (
                        <DiagnosticCard dp={dp} />
                      ) : (
                        <View style={[styles.diagPending, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]}>
                          <Feather name="alert-circle" size={13} color="#d97706" />
                          <Text style={[styles.diagPendingText, { color: "#92400e" }]}>
                            Aún no completaste la evaluación diagnóstica
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* ── Sección 04: Factorización (activa) ── */}
                  {section.status === "activo" && (
                    <>
                      <TopicList topics={section.topics} color={section.color} />
                      <View style={[styles.modulesSeparator, { borderTopColor: section.borderColor }]}>
                        <Text style={[styles.modulesLabel, { color: section.color }]}>
                          Casos de Factorización
                        </Text>
                        <View style={[styles.lockNote, { backgroundColor: "#f3f4f6", borderColor: "#e5e7eb" }]}>
                          <Feather name="lock" size={12} color="#6b7280" />
                          <Text style={[styles.lockNoteText, { color: "#6b7280" }]}>
                            Los casos se desbloquean progresivamente
                          </Text>
                        </View>
                      </View>
                      <View style={styles.moduleList}>
                        {[...MODULES]
                          .sort((a, b) => {
                            const ai = MODULE_CASE_ORDER.indexOf(a.id);
                            const bi = MODULE_CASE_ORDER.indexOf(b.id);
                            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                          })
                          .map((mod) => {
                          const caseNum = MODULE_CASE_ORDER.indexOf(mod.id) + 1;
                          const unlocked = unlockedModules.includes(mod.id);
                          const completed = currentStudent.completedModules.includes(mod.id);
                          const progress = getProgress(mod.id);
                          return (
                            <TouchableOpacity
                              key={mod.id}
                              style={[
                                styles.moduleRow,
                                {
                                  backgroundColor: unlocked ? "#fff" : "#f9fafb",
                                  borderColor: unlocked ? mod.color + "40" : "#e5e7eb",
                                  borderLeftColor: unlocked ? mod.color : "#d1d5db",
                                },
                              ]}
                              onPress={() => unlocked && router.push(`/modulo/${mod.id}` as any)}
                              activeOpacity={unlocked ? 0.75 : 1}
                            >
                              <Text style={styles.moduleIcon}>{mod.icon}</Text>
                              <View style={styles.moduleInfo}>
                                <View style={styles.moduleInfoTop}>
                                  <Text
                                    style={[
                                      styles.moduleName,
                                      { color: unlocked ? "#1e1b4b" : "#9ca3af" },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {caseNum > 0 ? `Caso ${caseNum}: ` : ""}{mod.title}
                                  </Text>
                                  {completed && (
                                    <View style={[styles.doneBadge, { backgroundColor: "#dcfce7" }]}>
                                      <Feather name="check" size={11} color="#16a34a" />
                                      <Text style={[styles.doneText, { color: "#16a34a" }]}>Completado</Text>
                                    </View>
                                  )}
                                </View>
                                <Text
                                  style={[styles.moduleSub, { color: "#9ca3af" }]}
                                  numberOfLines={1}
                                >
                                  {mod.subtitle}
                                </Text>
                                {unlocked && (
                                  <View style={styles.moduleProgress}>
                                    <View style={[styles.progressBg, { backgroundColor: "#e5e7eb" }]}>
                                      <View
                                        style={[
                                          styles.progressFill,
                                          {
                                            width: `${progress}%` as any,
                                            backgroundColor: completed ? "#16a34a" : mod.color,
                                          },
                                        ]}
                                      />
                                    </View>
                                    <Text style={[styles.progressPct, { color: "#6b7280" }]}>
                                      {progress}%
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <View style={styles.moduleChevron}>
                                {unlocked ? (
                                  <Feather name="chevron-right" size={18} color={mod.color} />
                                ) : (
                                  <Feather name="lock" size={15} color="#d1d5db" />
                                )}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  )}

                  {/* ── Secciones disponibles (contenido en construcción) ── */}
                  {section.status === "disponible" && (
                    <>
                      <TopicList topics={section.topics} color={section.color} />
                      <View style={[styles.comingSoon, { backgroundColor: section.lightColor, borderColor: section.borderColor }]}>
                        <Feather name="book-open" size={13} color={section.color} />
                        <Text style={[styles.comingSoonText, { color: section.color }]}>
                          Contenido interactivo en construcción — pronto podrás practicar estos temas
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────

function TopicList({ topics, color }: { topics: import("@/data/courseSections").SectionTopic[]; color: string }) {
  return (
    <View style={styles.topicList}>
      {topics.map((t, i) => {
        if (t.topicId) {
          return (
            <TouchableOpacity
              key={i}
              style={styles.topicRow}
              onPress={() => router.push(`/tema/${t.topicId}` as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.topicDot, { backgroundColor: color }]} />
              <Text style={[styles.topicText, { color: "#374151" }]}>{t.label}</Text>
              <Feather name="chevron-right" size={13} color={color} />
            </TouchableOpacity>
          );
        }
        return (
          <View key={i} style={styles.topicRow}>
            <View style={[styles.topicDot, { backgroundColor: color }]} />
            <Text style={styles.topicText}>{t.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function StatusBadge({ status, color }: { status: SectionStatus; color: string }) {
  const config: Record<SectionStatus, { label: string; bg: string; text: string }> = {
    activo:      { label: "Activo",      bg: color + "20", text: color },
    diagnostico: { label: "Diagnóstico", bg: "#7c3aed20",  text: "#7c3aed" },
    disponible:  { label: "Disponible",  bg: "#f0fdf4",    text: "#059669" },
  };
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

function DiagnosticCard({
  dp,
}: {
  dp: NonNullable<ReturnType<typeof useApp>["currentStudent"]>["diagnosticProfile"];
}) {
  if (!dp) return null;
  const levelColors = { básico: "#dc2626", intermedio: "#d97706", avanzado: "#059669" };
  const levelEmoji  = { básico: "🌱",      intermedio: "🌿",      avanzado: "🌳" };
  const lc = levelColors[dp.level];
  const le = levelEmoji[dp.level];
  return (
    <View style={styles.diagCard}>
      <View style={styles.diagHeader}>
        <Text style={styles.diagEmoji}>{le}</Text>
        <Text style={[styles.diagLevel, { color: lc }]}>
          Nivel {dp.level} · {dp.overallScore}%
        </Text>
      </View>
      {dp.results.map((r) => {
        const info = DIAGNOSTIC_CATEGORY_INFO[r.category as keyof typeof DIAGNOSTIC_CATEGORY_INFO];
        if (!info) return null;
        return (
          <View key={r.category} style={styles.diagRow}>
            <Text style={styles.diagIcon}>{info.icon}</Text>
            <View style={[styles.diagBarBg, { backgroundColor: "#ddd6fe" }]}>
              <View
                style={[
                  styles.diagBarFill,
                  {
                    width: `${r.score}%` as any,
                    backgroundColor: r.score < 60 ? "#dc2626" : "#059669",
                  },
                ]}
              />
            </View>
            <Text style={[styles.diagPct, { color: r.score < 60 ? "#dc2626" : "#059669" }]}>
              {r.score}%
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },

  title: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 20 },

  roadmapItem: { position: "relative", marginBottom: 0 },
  connector: {
    position: "absolute",
    left: 20,
    top: "100%",
    width: 2,
    height: 14,
    zIndex: 1,
  },

  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 14,
    overflow: "hidden",
  },
  sectionTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  numBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  numText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  sectionIcon: { fontSize: 22 },
  sectionMeta: { flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  sectionSub: { fontSize: 11, lineHeight: 16, marginTop: 1 },
  sectionRight: { alignItems: "flex-end", gap: 2, flexShrink: 0 },

  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: "700" },

  expanded: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },

  topicList: { gap: 7, marginBottom: 12 },
  topicRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  topicDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5, flexShrink: 0 },
  topicText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 19 },

  // Módulos
  modulesSeparator: { borderTopWidth: 1, paddingTop: 12, marginTop: 2, marginBottom: 10 },
  modulesLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  lockNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  lockNoteText: { fontSize: 12, fontWeight: "500" },

  moduleList: { gap: 8 },
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 12,
    gap: 10,
  },
  moduleIcon: { fontSize: 26, flexShrink: 0 },
  moduleInfo: { flex: 1, minWidth: 0 },
  moduleInfoTop: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  moduleName: { fontSize: 14, fontWeight: "700", flexShrink: 1 },
  moduleSub: { fontSize: 12, marginBottom: 4 },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  doneText: { fontSize: 10, fontWeight: "700" },
  moduleProgress: { flexDirection: "row", alignItems: "center", gap: 6 },
  progressBg: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressPct: { fontSize: 11, fontWeight: "600", width: 30, textAlign: "right" },
  moduleChevron: { flexShrink: 0 },

  // Diagnóstico
  diagPending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
  },
  diagPendingText: { flex: 1, fontSize: 12, fontWeight: "500" },
  diagCard: {
    backgroundColor: "#f5f3ff",
    borderRadius: 10,
    padding: 10,
    gap: 5,
    marginTop: 4,
  },
  diagHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  diagEmoji: { fontSize: 18 },
  diagLevel: { fontSize: 13, fontWeight: "700" },
  diagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  diagIcon: { fontSize: 13, width: 20, textAlign: "center" },
  diagBarBg: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  diagBarFill: { height: "100%", borderRadius: 3 },
  diagPct: { fontSize: 11, fontWeight: "700", width: 32, textAlign: "right" },

  // Próximamente
  comingSoon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  comingSoonText: { fontSize: 12, fontWeight: "500" },
});
