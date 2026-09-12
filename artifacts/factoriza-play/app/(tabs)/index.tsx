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
import { getRankForXp } from "@/data/progression";
import { DIAGNOSTIC_CATEGORY_INFO } from "@/data/diagnostic";
import { COURSE_SECTIONS, SectionStatus } from "@/data/courseSections";
import {
  getRouteStepState,
  isLearningRouteCompleted,
  LEARNING_ROUTES,
  PROFILE_DETAILS,
  getRouteForProfile,
  normalizeProfileCode,
} from "@/data/learningRoutes";

// ── Mapa de categorías diagnóstico → tema ────────────────────────────
const CATEGORY_TOPICS: Record<string, { topicId: string; title: string; icon: string; section: string }> = {
  // S1 — Zona de Repaso
  naturales:    { topicId: "s1-naturales",    title: "Números Naturales y Operaciones",   icon: "🔢", section: "S1 · Zona de Repaso" },
  decimales:    { topicId: "s1-decimales",    title: "Números Decimales y Operaciones",   icon: "🔸", section: "S1 · Zona de Repaso" },
  enteros:      { topicId: "s1-enteros",      title: "Números Enteros y Ley de Signos",  icon: "➖", section: "S1 · Zona de Repaso" },
  irracionales: { topicId: "s1-irracionales", title: "Números Irracionales y Radicación",icon: "√",  section: "S1 · Zona de Repaso" },
  reales:       { topicId: "s1-reales",       title: "Números Reales",                   icon: "♾️", section: "S1 · Zona de Repaso" },
  potencias:    { topicId: "s1-potencias",    title: "Potencias y sus Propiedades",      icon: "⚡", section: "S1 · Zona de Repaso" },
  factorizacion:{ topicId: "s1-factores",     title: "Descomposición en Factores Primos",icon: "🔑", section: "S1 · Zona de Repaso" },
  // S2 — Álgebra Básica
  algebra:      { topicId: "s2-semejantes",   title: "Términos semejantes y valor numérico", icon: "✏️", section: "S2 · Introducción al Álgebra" },
  // S3 — Operaciones Algebraicas
  operaciones:  { topicId: "s3-productos",    title: "Productos notables",               icon: "⚙️", section: "S3 · Operaciones Algebraicas" },
};

// ── Colores de paso según puntaje ────────────────────────────────────
function stepColor(score: number) {
  if (score < 50) return { bg: "#fef2f2", border: "#fecaca", badge: "#dc2626", label: "#dc2626" };
  if (score < 70) return { bg: "#fffbeb", border: "#fde68a", badge: "#d97706", label: "#d97706" };
  return { bg: "#f0fdf4", border: "#bbf7d0", badge: "#059669", label: "#059669" };
}

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
  const rank = getRankForXp(currentStudent.totalXP);
  const levelColors = { básico: "#dc2626", intermedio: "#d97706", avanzado: "#059669" };
  const levelEmoji  = { básico: "🌱",      intermedio: "🌿",      avanzado: "🌳" };

  const profileCode = normalizeProfileCode(dp?.profile, dp?.level);
  const profileDetails = dp ? PROFILE_DETAILS[profileCode] : null;
  const routeId =
    dp?.profile === "C" && dp.route === "ruta-3"
      ? "ruta-4"
      : dp?.route ?? getRouteForProfile(profileCode).id;
  const assignedRoute = dp
    ? LEARNING_ROUTES[
        routeId
      ]
    : null;
  const routeSteps = assignedRoute?.steps ?? [];
  const allStrong =
    profileCode === "C" ||
    profileCode === "explorador-factorizacion";
  const completedTopics = currentStudent.completedTopics ?? [];
  const completedModules = currentStudent.completedModules ?? [];
  const routeCompleted = assignedRoute
    ? isLearningRouteCompleted(assignedRoute, completedTopics, completedModules)
    : false;
  const canAccessFactorization = allStrong || routeCompleted;

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
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Casos</Text>
        </View>
      </View>

      {currentStudent.rankUpMessage && (
        <View style={[styles.rankUpBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "35" }]}>
          <Text style={[styles.rankUpText, { color: colors.primary }]}>{currentStudent.rankUpMessage}</Text>
        </View>
      )}

      {/* ── Permanent progress display ── */}
      <View style={[styles.rankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.rankHeader}>
          <View style={[styles.rankIconBox, { backgroundColor: colors.primary + "15" }]}>
            <Text style={styles.rankIcon}>{rank.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rankTitle, { color: colors.foreground }]}>
              Rango actual: {rank.name}
            </Text>
            <Text style={[styles.rankMeta, { color: colors.mutedForeground }]}>
              {currentStudent.totalXP} XP{rank.nextXP ? ` · Próximo rango en ${rank.nextXP} XP` : " · Rango máximo"}
            </Text>
          </View>
          <Text style={[styles.rankProgressText, { color: colors.primary }]}>{rank.progressPercent}%</Text>
        </View>
        <View style={[styles.rankProgressBg, { backgroundColor: colors.border }]}>
          <View style={[styles.rankProgressFill, { width: `${rank.progressPercent}%` as any, backgroundColor: colors.primary }]} />
        </View>
        {profileDetails && (
          <View style={{ marginTop: 10 }}>
            <Text style={[styles.rankMission, { color: colors.foreground }]}>
              Misión: {profileDetails.mission}
            </Text>
            <Text style={[styles.rankBadges, { color: colors.mutedForeground }]}>
              Insignias: {(currentStudent.badges ?? []).length > 0
                ? currentStudent.badges!.map((badge) => `${badge.icon} ${badge.label}`).join(" · ")
                : "Aún no tienes insignias"}
            </Text>
          </View>
        )}
      </View>

      {/* ══════════════════════════════════════════
          RUTA SUGERIDA (solo si hay diagnóstico)
          ══════════════════════════════════════════ */}
      {dp ? (
        <View style={[styles.routeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Encabezado de ruta */}
          <View style={styles.routeHeader}>
            <View style={styles.routeTitleRow}>
              <Text style={styles.routeEmoji}>🗺️</Text>
              <View>
                <Text style={[styles.routeTitle, { color: colors.foreground }]}>Tu Ruta Sugerida</Text>
                <Text style={[styles.routeSub, { color: colors.mutedForeground }]}>
                  {profileDetails?.icon} {profileDetails?.label} · {assignedRoute?.title} · {dp.overallScore}%
                </Text>
              </View>
            </View>
          </View>

          {allStrong ? (
            /* Todas las áreas ≥ 70% */
            <View style={styles.allStrongBox}>
              <Text style={styles.allStrongEmoji}>🎉</Text>
              <Text style={[styles.allStrongText, { color: "#059669" }]}>
                ¡Tienes bases sólidas en todas las áreas! Puedes ir directo a factorización.
              </Text>
            </View>
          ) : (
            /* Pasos de repaso */
            <View style={styles.stepsContainer}>
              {routeSteps.map((step, idx) => {
                        const sc = {
                          bg: (assignedRoute?.color ?? colors.primary) + "0D",
                          border: (assignedRoute?.color ?? colors.primary) + "35",
                          badge: assignedRoute?.color ?? colors.primary,
                          label: assignedRoute?.color ?? colors.primary,
                        };
                const isLast = idx === routeSteps.length - 1;
                const stepState = getRouteStepState(
                  assignedRoute!,
                  idx,
                  completedTopics,
                  completedModules
                );
                const canOpenStep = stepState !== "locked";
                const stepStatus =
                  stepState === "completed"
                    ? { label: "Completada", icon: "check-circle" as const, color: colors.success }
                    : stepState === "available"
                      ? { label: "Disponible", icon: "chevron-right" as const, color: sc.label }
                      : { label: "Bloqueada", icon: "lock" as const, color: colors.mutedForeground };
                return (
                    <View key={step.id}>
                    <TouchableOpacity
                      style={[
                        styles.stepRow,
                        {
                          backgroundColor: canOpenStep ? sc.bg : colors.secondary,
                          borderColor: canOpenStep ? sc.border : colors.border,
                          opacity: canOpenStep ? 1 : 0.62,
                        },
                      ]}
                        onPress={() =>
                          canOpenStep &&
                          router.push(
                            (step.topicId ? `/tema/${step.topicId}` : `/modulo/${step.moduleId}`) as any
                          )
                        }
                      activeOpacity={canOpenStep ? 0.8 : 1}
                    >
                      <View style={[styles.stepBadge, { backgroundColor: canOpenStep ? sc.badge : colors.mutedForeground }]}>
                          {stepState === "locked" ? (
                            <Feather name="lock" size={12} color="#fff" />
                          ) : (
                            <Text style={styles.stepNum}>{idx + 1}</Text>
                          )}
                      </View>
                      <Text style={styles.stepIcon}>{step.icon}</Text>
                      <View style={styles.stepInfo}>
                        <Text style={[styles.stepTitle, { color: colors.foreground }]} numberOfLines={2}>
                          {step.title}
                        </Text>
                        <Text style={[styles.stepSection, { color: colors.mutedForeground }]}>
                          {step.description}
                        </Text>
                      </View>
                      <View style={styles.stepRight}>
                        <Text style={[styles.stepScore, { color: stepStatus.color }]}>{stepStatus.label}</Text>
                        <Feather name={stepStatus.icon} size={16} color={stepStatus.color} />
                      </View>
                    </TouchableOpacity>
                    {/* Conector vertical entre pasos */}
                    {!isLast && (
                      <View style={styles.stepConnector}>
                        <View style={[styles.stepConnectorLine, { backgroundColor: colors.border }]} />
                      </View>
                    )}
                  </View>
                );
              })}
              {/* Conector al paso final */}
              <View style={styles.stepConnector}>
                <View style={[styles.stepConnectorLine, { backgroundColor: colors.border }]} />
              </View>
            </View>
          )}

          {/* Paso final: Factorización */}
          <TouchableOpacity
            style={[
              styles.finalStep,
              {
                backgroundColor: canAccessFactorization ? "#fffbeb" : colors.secondary,
                borderColor: canAccessFactorization ? "#fde68a" : colors.border,
                opacity: canAccessFactorization ? 1 : 0.62,
              },
            ]}
            onPress={() => canAccessFactorization && router.push("/(tabs)/modulos" as any)}
            activeOpacity={canAccessFactorization ? 0.85 : 1}
          >
            <View style={[styles.stepBadge, { backgroundColor: "#d97706" }]}>
              <Feather name="star" size={13} color="#fff" />
            </View>
            <Text style={styles.finalStepIcon}>🔢</Text>
            <View style={styles.stepInfo}>
              <Text style={styles.finalStepTitle}>Paso final: Factorización</Text>
              <Text style={styles.finalStepSub}>
                {canAccessFactorization
                  ? `${totalModules} módulos progresivos · Sección 4`
                  : "Completa los pasos anteriores para desbloquearla"}
              </Text>
            </View>
            <Feather
              name={canAccessFactorization ? "arrow-right-circle" : "lock"}
              size={20}
              color={canAccessFactorization ? "#d97706" : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
      ) : (
        /* Sin diagnóstico: invitar a hacerlo */
        <TouchableOpacity
          style={[styles.diagBanner, { backgroundColor: "#7c3aed", shadowColor: "#7c3aed" }]}
          onPress={() => router.push("/diagnostico" as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.diagBannerEmoji}>🧠</Text>
          <View style={styles.diagBannerInfo}>
            <Text style={styles.diagBannerTitle}>Haz el diagnóstico</Text>
            <Text style={styles.diagBannerSub}>
              Obtén una ruta personalizada según tus bases
            </Text>
          </View>
          <Feather name="arrow-right-circle" size={26} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      )}

      {/* ── Continuar con el siguiente caso ── */}
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

      {/* ── Progreso general + por módulo ── */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Progreso en Factorización
        </Text>
        <ProgressBar progress={overallProgress} />
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {overallProgress}% completado · {completedModulesCount} de {totalModules} casos
        </Text>

        {/* Per-module mini progress */}
        <View style={styles.modGrid}>
          {MODULES.map((mod) => {
            const totalEx = mod.exercises.length;
            const doneEx = mod.exercises.filter(e =>
              currentStudent.completedExercises.includes(e.id)
            ).length;
            const pct = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0;
            const completed = currentStudent.completedModules.includes(mod.id);
            const unlocked = unlockedModules.includes(mod.id);
            return (
              <TouchableOpacity
                key={mod.id}
                style={[styles.modRow, {
                  backgroundColor: completed ? colors.success + "08" : colors.background,
                  borderColor: completed ? colors.success + "40" : colors.border,
                }]}
                onPress={() => unlocked && router.push(`/modulo/${mod.id}` as any)}
                activeOpacity={unlocked ? 0.8 : 1}
              >
                <Text style={styles.modIcon}>{mod.icon}</Text>
                <View style={styles.modInfo}>
                  <Text style={[styles.modTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {mod.title}
                  </Text>
                  {unlocked && doneEx > 0 && (
                    <View style={[styles.modBarBg, { backgroundColor: colors.border }]}>
                      <View style={[styles.modBarFill, {
                        width: `${pct}%` as any,
                        backgroundColor: completed ? colors.success : mod.color,
                      }]} />
                    </View>
                  )}
                </View>
                <Text style={[styles.modPct, {
                  color: completed ? colors.success : unlocked && doneEx > 0 ? mod.color : colors.mutedForeground,
                }]}>
                  {completed ? "✅" : unlocked ? (doneEx > 0 ? `${pct}%` : "0%") : "🔒"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Mapa de ruta resumido ── */}
      <View style={styles.mapHeader}>
        <Text style={[styles.mapTitle, { color: colors.foreground }]}>📚 Módulos del Curso</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/modulos" as any)}>
          <Text style={[styles.mapLink, { color: colors.primary }]}>Ver todo →</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.mapSubtitle, { color: colors.mutedForeground }]}>
        Toca una sección para expandirla
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
                      <Text style={styles.sectionBtnText}>Ver casos de factorización →</Text>
                    </TouchableOpacity>
                  )}

                  {section.status === "disponible" && (
                    <View style={{ gap: 4, marginTop: 4 }}>
                      {section.topics.filter(t => t.topicId).map((topic, ti) => (
                        <TouchableOpacity
                          key={ti}
                          style={[styles.topicLink, { backgroundColor: section.lightColor, borderColor: section.borderColor }]}
                          onPress={() => router.push(`/tema/${topic.topicId}` as any)}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.topicDot, { backgroundColor: section.color }]} />
                          <Text style={[styles.topicLinkText, { color: "#374151" }]} numberOfLines={1}>{topic.label}</Text>
                          <Feather name="chevron-right" size={13} color={section.color} />
                        </TouchableOpacity>
                      ))}
                      {section.topics.every(t => !t.topicId) && (
                        <View style={[styles.comingSoon, { backgroundColor: section.lightColor, borderColor: section.borderColor }]}>
                          <Feather name="book-open" size={13} color={section.color} />
                          <Text style={[styles.comingSoonText, { color: section.color }]}>
                            Contenido interactivo en construcción
                          </Text>
                        </View>
                      )}
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
          { label: "Casos", icon: "📚", route: "/(tabs)/modulos" },
          { label: "Ranking", icon: "🏆", route: "/(tabs)/comunidad" },
          { label: "Evaluación", icon: "📝", route: "/(tabs)/evaluacion" },
          { label: "Reflexión", icon: "🧠", route: "/reflexion" },
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
  rankCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 20 },
  rankHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  rankIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rankIcon: { fontSize: 24 },
  rankTitle: { fontSize: 15, fontWeight: "800" },
  rankMeta: { fontSize: 11, marginTop: 2 },
  rankProgressText: { fontSize: 14, fontWeight: "800" },
  rankProgressBg: { height: 7, borderRadius: 4, overflow: "hidden", marginTop: 12 },
  rankProgressFill: { height: "100%", borderRadius: 4 },
  rankMission: { fontSize: 12, fontWeight: "700" },
  rankBadges: { fontSize: 11, marginTop: 4 },
  rankUpBanner: { borderRadius: 12, borderWidth: 1, padding: 11, marginBottom: 12 },
  rankUpText: { fontSize: 13, fontWeight: "800", textAlign: "center" },

  // ── Ruta sugerida ─────────────────────────────────────────────────
  routeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  routeHeader: { marginBottom: 14 },
  routeTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  routeEmoji: { fontSize: 28 },
  routeTitle: { fontSize: 18, fontWeight: "800", lineHeight: 22 },
  routeSub: { fontSize: 12, marginTop: 2 },

  stepsContainer: { gap: 0 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNum: { color: "#fff", fontSize: 12, fontWeight: "800" },
  stepIcon: { fontSize: 20 },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  stepSection: { fontSize: 11, marginTop: 1 },
  stepRight: { alignItems: "flex-end", gap: 2 },
  stepScore: { fontSize: 12, fontWeight: "800" },

  stepConnector: { alignItems: "flex-start", paddingLeft: 22, height: 14 },
  stepConnectorLine: { width: 2, flex: 1 },

  allStrongBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  allStrongEmoji: { fontSize: 22 },
  allStrongText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },

  finalStep: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#fde68a",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    marginTop: 2,
  },
  finalStepIcon: { fontSize: 20 },
  finalStepTitle: { fontSize: 13, fontWeight: "800", color: "#92400e" },
  finalStepSub: { fontSize: 11, color: "#b45309", marginTop: 1 },

  // ── Banner diagnóstico ────────────────────────────────────────────
  diagBanner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
    gap: 14,
  },
  diagBannerEmoji: { fontSize: 32 },
  diagBannerInfo: { flex: 1 },
  diagBannerTitle: { color: "#fff", fontSize: 17, fontWeight: "800" },
  diagBannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },

  // ── Continuar ─────────────────────────────────────────────────────
  continueCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
    gap: 14,
  },
  continueIcon: { fontSize: 32 },
  continueInfo: { flex: 1 },
  continueLevel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  continueTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  continueSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },

  // ── Progreso factorización ────────────────────────────────────────
  section: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  progressLabel: { fontSize: 12, fontWeight: "500", marginTop: 8 },

  // ── Mapa de módulos ───────────────────────────────────────────────
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

  topicLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  topicLinkText: { flex: 1, fontSize: 12, fontWeight: "500" },

  modGrid: { gap: 6, marginTop: 12 },
  modRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modIcon: { fontSize: 18, width: 24, textAlign: "center" },
  modInfo: { flex: 1, gap: 3 },
  modTitle: { fontSize: 12, fontWeight: "600" },
  modBarBg: { height: 3, borderRadius: 2, overflow: "hidden" },
  modBarFill: { height: "100%", borderRadius: 2 },
  modPct: { fontSize: 11, fontWeight: "700", minWidth: 30, textAlign: "right" },

  diagMini: { backgroundColor: "#f5f3ff", borderRadius: 10, padding: 10, marginTop: 6, gap: 5 },
  diagMiniHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  diagMiniEmoji: { fontSize: 18 },
  diagMiniLevel: { fontSize: 13, fontWeight: "700" },
  diagMiniRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  diagMiniIcon: { fontSize: 13, width: 20, textAlign: "center" },
  diagMiniBarBg: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  diagMiniBarFill: { height: "100%", borderRadius: 3 },
  diagMiniPct: { fontSize: 11, fontWeight: "700", width: 32, textAlign: "right" },

  quickHeading: { fontSize: 18, fontWeight: "700", marginBottom: 12, marginTop: 8 },
  quickGrid: { flexDirection: "row", gap: 12 },
  quickCard: { flex: 1, borderRadius: 16, padding: 18, alignItems: "center", borderWidth: 1 },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
});
