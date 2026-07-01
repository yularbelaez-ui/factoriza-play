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
import { MODULES } from "@/data/modules";
import { ProgressBar } from "@/components/ProgressBar";
import { DIAGNOSTIC_CATEGORY_INFO } from "@/data/diagnostic";
import { COURSE_SECTIONS, SectionStatus } from "@/data/courseSections";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentStudent, unlockedModules, logout } = useApp();
  const isWeb = Platform.OS === "web";
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!currentStudent) return null;

  const totalModules = MODULES.length;
  const completedModulesCount = currentStudent.completedModules.length;
  const overallProgress =
    totalModules > 0 ? Math.round((completedModulesCount / totalModules) * 100) : 0;

  const nextModule = MODULES.find(
    (m) =>
      unlockedModules.includes(m.id) &&
      !currentStudent.completedModules.includes(m.id)
  );

  const dp = currentStudent.diagnosticProfile;
  const levelColors = { básico: "#dc2626", intermedio: "#d97706", avanzado: "#059669" };
  const levelEmoji  = { básico: "🌱",      intermedio: "🌿",      avanzado: "🌳" };

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
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            ¡Hola, {currentStudent.pseudonym}! 👋
          </Text>
          <Text style={[styles.appName, { color: colors.primary }]}>
            FactorIzA-Play
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.secondary }]}
          onPress={logout}
        >
          <Feather name="log-out" size={17} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* ── Stats ── */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#7c3aed15", borderColor: "#7c3aed30" }]}>
          <Text style={[styles.statValue, { color: "#7c3aed" }]}>{currentStudent.totalXP}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>XP Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}>
          <Text style={[styles.statValue, { color: colors.accent }]}>🔥 {currentStudent.streak}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Racha</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
          <Text style={[styles.statValue, { color: colors.success }]}>{completedModulesCount}/{totalModules}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Módulos</Text>
        </View>
      </View>

      {/* ── Progreso general de factorización ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Progreso en Factorización
        </Text>
        <ProgressBar progress={overallProgress} />
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {overallProgress}% completado · {completedModulesCount} de {totalModules} módulos
        </Text>
      </View>

      {/* ── Continuar ── */}
      {nextModule && (
        <TouchableOpacity
          style={[styles.continueCard, { backgroundColor: nextModule.color, shadowColor: nextModule.color }]}
          onPress={() => router.push(`/modulo/${nextModule.id}` as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.continueIcon}>{nextModule.icon}</Text>
          <View style={styles.continueInfo}>
            <Text style={styles.continueLevel}>Continúa donde lo dejaste</Text>
            <Text style={styles.continueTitle}>{nextModule.title}</Text>
            <Text style={styles.continueSub}>{nextModule.subtitle}</Text>
          </View>
          <Feather name="arrow-right-circle" size={28} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      )}

      {/* ── Mapa de ruta resumido ── */}
      <View style={styles.mapHeader}>
        <Text style={[styles.mapTitle, { color: colors.foreground }]}>🗺️ Ruta del Curso</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/modulos" as any)}>
          <Text style={[styles.mapLink, { color: colors.primary }]}>Ver todo →</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.mapSubtitle, { color: colors.mutedForeground }]}>
        Toca una sección para ver los temas
      </Text>

      {COURSE_SECTIONS.map((section, idx) => {
        const isExpanded = expandedSection === section.id;
        const isLast = idx === COURSE_SECTIONS.length - 1;

        return (
          <View key={section.id} style={styles.roadmapItem}>
            {!isLast && (
              <View style={[styles.connector, { backgroundColor: section.borderColor }]} />
            )}

            <TouchableOpacity
              style={[
                styles.sectionCard,
                {
                  backgroundColor: section.lightColor,
                  borderColor: section.borderColor,
                  borderLeftColor: section.color,
                },
              ]}
              onPress={() => setExpandedSection(isExpanded ? null : section.id)}
              activeOpacity={0.8}
            >
              <View style={styles.sectionCardTop}>
                <View style={[styles.sectionNumBadge, { backgroundColor: section.color }]}>
                  <Text style={styles.sectionNum}>{section.number}</Text>
                </View>
                <Text style={styles.sectionIcon}>{section.icon}</Text>
                <View style={styles.sectionTexts}>
                  <Text style={[styles.sectionCardTitle, { color: "#1e1b4b" }]}>
                    {section.title}
                  </Text>
                  <Text style={[styles.sectionCardSub, { color: "#6b7280" }]}>
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

              {isExpanded && (
                <View style={[styles.topicsList, { borderTopColor: section.borderColor }]}>
                  {section.topics.map((topic, ti) => (
                    <View key={ti} style={styles.topicRow}>
                      <View style={[styles.topicDot, { backgroundColor: section.color }]} />
                      <Text style={[styles.topicText, { color: "#374151" }]}>{topic.label}</Text>
                    </View>
                  ))}

                  {section.status === "diagnostico" && dp && (
                    <View style={styles.diagMini}>
                      <View style={styles.diagMiniHeader}>
                        <Text style={styles.diagMiniEmoji}>{levelEmoji[dp.level]}</Text>
                        <Text style={[styles.diagMiniLevel, { color: levelColors[dp.level] }]}>
                          Nivel {dp.level} · {dp.overallScore}%
                        </Text>
                      </View>
                      {dp.results.map((r) => {
                        const info = DIAGNOSTIC_CATEGORY_INFO[r.category as keyof typeof DIAGNOSTIC_CATEGORY_INFO];
                        if (!info) return null;
                        return (
                          <View key={r.category} style={styles.diagMiniRow}>
                            <Text style={styles.diagMiniIcon}>{info.icon}</Text>
                            <View style={[styles.diagMiniBarBg, { backgroundColor: "#ddd6fe" }]}>
                              <View
                                style={[
                                  styles.diagMiniBarFill,
                                  {
                                    width: `${r.score}%` as any,
                                    backgroundColor: r.score < 60 ? "#dc2626" : "#059669",
                                  },
                                ]}
                              />
                            </View>
                            <Text style={[styles.diagMiniPct, { color: r.score < 60 ? "#dc2626" : "#059669" }]}>
                              {r.score}%
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {section.status === "activo" && (
                    <TouchableOpacity
                      style={[styles.sectionBtn, { backgroundColor: section.color }]}
                      onPress={() => router.push("/(tabs)/modulos" as any)}
                    >
                      <Text style={styles.sectionBtnText}>Ver módulos de factorización →</Text>
                    </TouchableOpacity>
                  )}

                  {section.status === "disponible" && (
                    <View style={[styles.comingSoon, { backgroundColor: section.lightColor, borderColor: section.borderColor }]}>
                      <Feather name="book-open" size={13} color={section.color} />
                      <Text style={[styles.comingSoonText, { color: section.color }]}>
                        Contenido interactivo en construcción
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        );
      })}

      {/* ── Acceso rápido ── */}
      <Text style={[styles.quickHeading, { color: colors.foreground }]}>
        Acceso rápido
      </Text>
      <View style={styles.quickGrid}>
        {[
          { label: "Módulos", icon: "📚", route: "/(tabs)/modulos" },
          { label: "Ranking", icon: "🏆", route: "/(tabs)/comunidad" },
          { label: "Evaluación", icon: "📝", route: "/(tabs)/evaluacion" },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(item.route as any)}
          >
            <Text style={styles.quickIcon}>{item.icon}</Text>
            <Text style={[styles.quickLabel, { color: colors.foreground }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Sub-componente StatusBadge ───────────────────────────────────────
function StatusBadge({ status, color }: { status: SectionStatus; color: string }) {
  const config: Record<SectionStatus, { label: string; bg: string; text: string }> = {
    activo:      { label: "Activo",       bg: color + "20", text: color },
    diagnostico: { label: "Diagnóstico",  bg: "#7c3aed20",  text: "#7c3aed" },
    disponible:  { label: "Disponible",   bg: "#f0fdf4",    text: "#059669" },
  };
  const c = config[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.statusText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: { fontSize: 14, fontWeight: "500", marginBottom: 2 },
  appName: { fontSize: 26, fontWeight: "800" },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: "500" },

  section: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  progressLabel: { fontSize: 12, fontWeight: "500", marginTop: 8 },

  continueCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  continueIcon: { fontSize: 32, marginRight: 14 },
  continueInfo: { flex: 1 },
  continueLevel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  continueTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  continueSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },

  mapHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  mapTitle: { fontSize: 20, fontWeight: "800" },
  mapLink: { fontSize: 13, fontWeight: "700" },
  mapSubtitle: { fontSize: 13, marginBottom: 16 },

  roadmapItem: { position: "relative" },
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
  sectionCardTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  sectionNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  sectionNum: { color: "#fff", fontSize: 13, fontWeight: "900" },
  sectionIcon: { fontSize: 22 },
  sectionTexts: { flex: 1 },
  sectionCardTitle: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  sectionCardSub: { fontSize: 11, lineHeight: 16, marginTop: 1 },
  sectionRight: { alignItems: "flex-end", gap: 2, flexShrink: 0 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: "700" },

  topicsList: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
  },
  topicRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  topicDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5, flexShrink: 0 },
  topicText: { flex: 1, fontSize: 13, lineHeight: 19 },

  sectionBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignItems: "center", marginTop: 8 },
  sectionBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

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

  diagMini: { backgroundColor: "#f5f3ff", borderRadius: 10, padding: 10, marginTop: 6, gap: 5 },
  diagMiniHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  diagMiniEmoji: { fontSize: 18 },
  diagMiniLevel: { fontSize: 13, fontWeight: "700" },
  diagMiniRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  diagMiniIcon: { fontSize: 13, width: 20, textAlign: "center" },
  diagMiniBarBg: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  diagMiniBarFill: { height: "100%", borderRadius: 3 },
  diagMiniPct: { fontSize: 11, fontWeight: "700", width: 32, textAlign: "right" },

  quickHeading: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  quickGrid: { flexDirection: "row", gap: 12 },
  quickCard: { flex: 1, borderRadius: 16, padding: 18, alignItems: "center", borderWidth: 1 },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
});
