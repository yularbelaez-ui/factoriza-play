import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Image,
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

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentStudent, unlockedModules, moduleProgress, logout } = useApp();
  const isWeb = Platform.OS === "web";

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
      {/* Header */}
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

      {/* Stats */}
      <View style={styles.statsRow}>
        <View
          style={[styles.statCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {currentStudent.totalXP}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>XP Total</Text>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}
        >
          <Text style={[styles.statValue, { color: colors.accent }]}>
            🔥 {currentStudent.streak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Racha</Text>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}
        >
          <Text style={[styles.statValue, { color: colors.success }]}>
            {completedModulesCount}/{totalModules}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Módulos</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Tu progreso general
        </Text>
        <ProgressBar progress={overallProgress} />
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {overallProgress}% completado
        </Text>
      </View>

      {/* Diagnostic profile card */}
      {currentStudent.diagnosticProfile && (() => {
        const dp = currentStudent.diagnosticProfile!;
        const levelColors = { básico: "#dc2626", intermedio: "#d97706", avanzado: "#059669" };
        const levelEmoji = { básico: "🌱", intermedio: "🌿", avanzado: "🌳" };
        const lc = levelColors[dp.level];
        const le = levelEmoji[dp.level];
        const weakAreas = dp.results.filter((r) => r.score < 60);
        return (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.diagHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>
                  Perfil Diagnóstico
                </Text>
                <Text style={[{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }]}>
                  Evaluación inicial completada
                </Text>
              </View>
              <View style={[styles.diagBadge, { backgroundColor: lc + "15" }]}>
                <Text style={styles.diagBadgeEmoji}>{le}</Text>
                <Text style={[styles.diagBadgeScore, { color: lc }]}>
                  {dp.overallScore}%
                </Text>
              </View>
            </View>
            <View style={{ gap: 8, marginTop: 12 }}>
              {dp.results.map((r) => {
                const info = DIAGNOSTIC_CATEGORY_INFO[r.category as keyof typeof DIAGNOSTIC_CATEGORY_INFO];
                if (!info) return null;
                return (
                  <View key={r.category} style={styles.diagRow}>
                    <Text style={styles.diagRowIcon}>{info.icon}</Text>
                    <View style={styles.diagRowBar}>
                      <View style={[styles.diagBarBg, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.diagBarFill,
                            {
                              width: `${r.score}%` as any,
                              backgroundColor: r.score < 60 ? info.color : colors.success,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[styles.diagRowPct, { color: r.score < 60 ? info.color : colors.success }]}>
                      {r.score}%
                    </Text>
                  </View>
                );
              })}
            </View>
            {weakAreas.length > 0 && (
              <View style={[styles.diagWeak, { backgroundColor: colors.accent + "10", borderColor: colors.accent + "30" }]}>
                <Feather name="alert-triangle" size={13} color={colors.accent} />
                <Text style={[styles.diagWeakText, { color: colors.foreground }]}>
                  Áreas a reforzar: {weakAreas.map((r) => DIAGNOSTIC_CATEGORY_INFO[r.category as keyof typeof DIAGNOSTIC_CATEGORY_INFO]?.label).filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
          </View>
        );
      })()}

      {/* Hero */}
      <Image
        source={require("@/assets/images/hero_factoring.png")}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* Continue */}
      {nextModule && (
        <View style={styles.continueSection}>
          <Text style={[styles.sectionTitle2, { color: colors.foreground }]}>
            Continúa aprendiendo
          </Text>
          <TouchableOpacity
            style={[
              styles.continueCard,
              { backgroundColor: nextModule.color, shadowColor: nextModule.color },
            ]}
            onPress={() => router.push(`/modulo/${nextModule.id}` as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueIcon}>{nextModule.icon}</Text>
            <View style={styles.continueInfo}>
              <Text style={styles.continueLevel}>Nivel {nextModule.level}</Text>
              <Text style={styles.continueTitle}>{nextModule.title}</Text>
              <Text style={styles.continueSub}>{nextModule.subtitle}</Text>
            </View>
            <Feather name="arrow-right-circle" size={28} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
      )}

      {/* Quick access */}
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
  heroImage: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    marginBottom: 20,
  },
  continueSection: { marginBottom: 20 },
  continueCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueIcon: { fontSize: 32, marginRight: 14 },
  continueInfo: { flex: 1 },
  continueLevel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  continueTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  continueSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
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
  // Diagnostic card
  diagHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  diagBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: "center" },
  diagBadgeEmoji: { fontSize: 18, marginBottom: 2 },
  diagBadgeScore: { fontSize: 16, fontWeight: "900" },
  diagRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  diagRowIcon: { fontSize: 16, width: 24, textAlign: "center" },
  diagRowBar: { flex: 1 },
  diagBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  diagBarFill: { height: "100%", borderRadius: 3 },
  diagRowPct: { fontSize: 12, fontWeight: "700", width: 36, textAlign: "right" },
  diagWeak: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginTop: 8,
  },
  diagWeakText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "500" },
});
