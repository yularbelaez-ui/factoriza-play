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

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentStudent, unlockedModules, moduleProgress, role, setRole } = useApp();
  const isWeb = Platform.OS === "web";

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
            ¡Hola, {currentStudent.name.split(" ")[0]}! 👋
          </Text>
          <Text style={[styles.appName, { color: colors.primary }]}>
            FactorIzA-Play
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.roleBtn, { backgroundColor: colors.secondary }]}
          onPress={() => setRole(role === "student" ? "teacher" : "student")}
        >
          <Feather
            name={role === "teacher" ? "user" : "briefcase"}
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* XP & Streak Cards */}
      <View style={styles.statsRow}>
        <View
          style={[styles.statCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {currentStudent.totalXP}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            XP Total
          </Text>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}
        >
          <Text style={[styles.statValue, { color: colors.accent }]}>
            🔥 {currentStudent.streak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Racha
          </Text>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}
        >
          <Text style={[styles.statValue, { color: colors.success }]}>
            {completedModulesCount}/{totalModules}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Módulos
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View
        style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Tu progreso general
        </Text>
        <ProgressBar progress={overallProgress} />
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {overallProgress}% completado — {completedModulesCount} de {totalModules} módulos
        </Text>
      </View>

      {/* Hero image */}
      <Image
        source={require("@/assets/images/hero_factoring.png")}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* Continue Learning */}
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
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/modulos" as any)}
        >
          <Text style={styles.quickIcon}>📚</Text>
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Módulos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/comunidad" as any)}
        >
          <Text style={styles.quickIcon}>🏆</Text>
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Ranking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/evaluacion" as any)}
        >
          <Text style={styles.quickIcon}>📝</Text>
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Evaluación</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/docente" as any)}
        >
          <Text style={styles.quickIcon}>👨‍🏫</Text>
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>Docente</Text>
        </TouchableOpacity>
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
  roleBtn: {
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    marginBottom: 2,
  },
  continueTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  continueSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  quickCard: {
    width: "47%",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },
});
