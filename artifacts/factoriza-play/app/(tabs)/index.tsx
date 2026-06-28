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

// ── Mapa de ruta del curso ──────────────────────────────────────────
const COURSE_SECTIONS = [
  {
    id: "saberes",
    number: "01",
    title: "Zona de Repaso",
    subtitle: "Saberes previos",
    icon: "🧮",
    color: "#7c3aed",
    lightColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    topics: [
      "Números naturales y operaciones",
      "Números decimales y operaciones",
      "Números enteros y negativos",
      "Números racionales",
      "Números irracionales",
      "Números reales",
      "Potencias y propiedades",
      "Descomposición en factores primos",
    ],
    status: "diagnostico" as const,
  },
  {
    id: "algebra",
    number: "02",
    title: "Introducción al Álgebra",
    subtitle: "Conceptos fundamentales",
    icon: "✏️",
    color: "#2563eb",
    lightColor: "#eff6ff",
    borderColor: "#bfdbfe",
    topics: [
      "Diferencia con la aritmética",
      "Notación algebraica",
      "Signos en el álgebra",
      "Expresión y término algebraico",
      "Grado de un término",
      "Clasificación de expresiones",
      "Ordenar un polinomio",
      "Términos semejantes y valor numérico",
    ],
    status: "proximamente" as const,
  },
  {
    id: "operaciones",
    number: "03",
    title: "Operaciones Algebraicas",
    subtitle: "Suma, resta, multiplicación y división",
    icon: "⚙️",
    color: "#059669",
    lightColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    topics: [
      "Suma y resta de polinomios",
      "Signos de agrupación",
      "Multiplicación (monomios y polinomios)",
      "División algebraica",
      "Productos notables",
      "Cuadrado de la diferencia",
      "Producto suma por diferencia",
      "Cubo de un binomio",
    ],
    status: "proximamente" as const,
  },
  {
    id: "factorizacion",
    number: "04",
    title: "Factorización",
    subtitle: "Los 8 casos de factorización",
    icon: "🔍",
    color: "#d97706",
    lightColor: "#fffbeb",
    borderColor: "#fde68a",
    topics: [
      "Caso 1: Factor común",
      "Caso 2: Factor común por agrupación",
      "Caso 3: Trinomio cuadrado perfecto",
      "Caso 4: Diferencia de cuadrados",
      "Caso 5 & 6: Trinomios",
      "Caso 7: Cubo perfecto de binomios",
      "Caso 8: Suma/diferencia de cubos",
    ],
    status: "activo" as const,
  },
] as const;

type SectionStatus = "diagnostico" | "proximamente" | "activo";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentStudent, unlockedModules } = useApp();
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
  const levelEmoji = { básico: "🌱", intermedio: "🌿", avanzado: "🌳" };

  const logout = useApp().logout;

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

      {/* ── Mapa de ruta del curso ── */}
      <Text style={[styles.mapTitle, { color: colors.foreground }]}>
        🗺️ Ruta del Curso
      </Text>
      <Text style={[styles.mapSubtitle, { color: colors.mutedForeground }]}>
        Toca cada sección para ver los temas
      </Text>

      <View style={styles.roadmap}>
        {COURSE_SECTIONS.map((section, idx) => {
          const isExpanded = expandedSection === section.id;
          const isLast = idx === COURSE_SECTIONS.length - 1;

          return (
            <View key={section.id} style={styles.roadmapItem}>
              {/* Línea conectora */}
              {!isLast && (
                <View style={[styles.connector, { backgroundColor: section.borderColor }]} />
              )}

              {/* Tarjeta de sección */}
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
                  {/* Número y badge */}
                  <View style={[styles.sectionNumBadge, { backgroundColor: section.color }]}>
                    <Text style={styles.sectionNum}>{section.number}</Text>
                  </View>

                  <View style={styles.sectionMeta}>
                    <Text style={styles.sectionIcon}>{section.icon}</Text>
                    <View style={styles.sectionTexts}>
                      <Text style={[styles.sectionCardTitle, { color: "#1e1b4b" }]}>
                        {section.title}
                      </Text>
                      <Text style={[styles.sectionCardSub, { color: "#6b7280" }]}>
                        {section.subtitle}
                      </Text>
                    </View>
                  </View>

                  {/* Status badge */}
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

                {/* Temas expandidos */}
                {isExpanded && (
                  <View style={[styles.topicsList, { borderTopColor: section.borderColor }]}>
                    {section.topics.map((topic, ti) => (
                      <View key={ti} style={styles.topicRow}>
                        <View style={[styles.topicDot, { backgroundColor: section.color }]} />
                        <Text style={[styles.topicText, { color: "#374151" }]}>{topic}</Text>
                      </View>
                    ))}

                    {/* Acciones según estado */}
                    {section.status === "diagnostico" && dp && (
                      <DiagnosticMini dp={dp} levelColors={levelColors} levelEmoji={levelEmoji} />
                    )}
                    {section.status === "activo" && (
                      <TouchableOpacity
                        style={[styles.sectionBtn, { backgroundColor: section.color }]}
                        onPress={() => router.push("/(tabs)/modulos" as any)}
                      >
                        <Text style={styles.sectionBtnText}>Ir a los módulos →</Text>
                      </TouchableOpacity>
                    )}
                    {section.status === "proximamente" && (
                      <View style={[styles.comingSoon, { backgroundColor: "#f3f4f6", borderColor: "#e5e7eb" }]}>
                        <Feather name="clock" size={13} color="#9ca3af" />
                        <Text style={[styles.comingSoonText, { color: "#9ca3af" }]}>
                          Próximamente disponible
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* ── Acceso rápido ── */}
      <Text style={[styles.sectionTitle2, { color: colors.foreground }]}>
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

// ── Sub-componentes ─────────────────────────────────────────────────

function StatusBadge({ status, color }: { status: SectionStatus; color: string }) {
  const config = {
    activo: { label: "Activo", bg: color + "20", text: color },
    diagnostico: { label: "Diagnóstico", bg: "#7c3aed20", text: "#7c3aed" },
    proximamente: { label: "Próximamente", bg: "#f3f4f6", text: "#9ca3af" },
  }[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

function DiagnosticMini({
  dp,
  levelColors,
  levelEmoji,
}: {
  dp: NonNullable<ReturnType<typeof useApp>["currentStudent"]>["diagnosticProfile"];
  levelColors: Record<string, string>;
  levelEmoji: Record<string, string>;
}) {
  if (!dp) return null;
  const lc = levelColors[dp.level];
  const le = levelEmoji[dp.level];
  return (
    <View style={styles.diagMini}>
      <View style={styles.diagMiniHeader}>
        <Text style={styles.diagMiniEmoji}>{le}</Text>
        <Text style={[styles.diagMiniLevel, { color: lc }]}>
          Nivel {dp.level} · {dp.overallScore}%
        </Text>
      </View>
      <View style={styles.diagMiniBars}>
        {dp.results.map((r) => {
          const info = DIAGNOSTIC_CATEGORY_INFO[r.category as keyof typeof DIAGNOSTIC_CATEGORY_INFO];
          if (!info) return null;
          return (
            <View key={r.category} style={styles.diagMiniRow}>
              <Text style={styles.diagMiniIcon}>{info.icon}</Text>
              <View style={styles.diagMiniBarBg}>
                <View
                  style={[
                    styles.diagMiniBarFill,
                    { width: `${r.score}%` as any, backgroundColor: r.score < 60 ? "#dc2626" : "#059669" },
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
    </View>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────
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

  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  sectionTitle2: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
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

  mapTitle: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  mapSubtitle: { fontSize: 13, marginBottom: 16 },

  roadmap: { marginBottom: 28 },
  roadmapItem: { position: "relative", paddingLeft: 0 },
  connector: {
    position: "absolute",
    left: 20,
    top: "100%",
    width: 2,
    height: 16,
    zIndex: 1,
  },

  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 16,
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
  sectionMeta: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  sectionIcon: { fontSize: 22 },
  sectionTexts: { flex: 1 },
  sectionCardTitle: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  sectionCardSub: { fontSize: 11, lineHeight: 16, marginTop: 1 },
  sectionRight: { alignItems: "flex-end", gap: 2, flexShrink: 0 },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
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

  sectionBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
  },
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

  // Diagnostic mini inside expanded
  diagMini: {
    backgroundColor: "#f5f3ff",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    gap: 6,
  },
  diagMiniHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  diagMiniEmoji: { fontSize: 18 },
  diagMiniLevel: { fontSize: 13, fontWeight: "700" },
  diagMiniBars: { gap: 5 },
  diagMiniRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  diagMiniIcon: { fontSize: 13, width: 20, textAlign: "center" },
  diagMiniBarBg: { flex: 1, height: 5, backgroundColor: "#ddd6fe", borderRadius: 3, overflow: "hidden" },
  diagMiniBarFill: { height: "100%", borderRadius: 3 },
  diagMiniPct: { fontSize: 11, fontWeight: "700", width: 32, textAlign: "right" },

  quickGrid: { flexDirection: "row", gap: 12 },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
  },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
});
