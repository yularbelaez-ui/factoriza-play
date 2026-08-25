import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { StudentRecord, useApp } from "@/context/AppContext";
import { apiGetClassStudents } from "@/lib/api";

const RANKING_AVATARS = ["🎓", "🧑‍🎓", "👩‍🎓", "👨‍🎓", "🌟", "🚀", "💡", "🔢"];

export default function ComunidadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    allStudents,
    currentStudent,
  } = useApp();
  const isWeb = Platform.OS === "web";
  const [serverRanking, setServerRanking] = React.useState<StudentRecord[] | null>(null);
  const [isRefreshingRanking, setIsRefreshingRanking] = React.useState(false);

  const refreshRanking = useCallback(async () => {
    const classCode = currentStudent?.classCode;
    if (!classCode) return;

    setIsRefreshingRanking(true);
    try {
      const { students } = await apiGetClassStudents(classCode);
      const refreshedRanking: StudentRecord[] = students.map((student) => {
        const localStudent = allStudents.find(
          (candidate) => candidate.backendId === student.id
        );
        return {
          id: localStudent?.id ?? `ranking-${student.id}`,
          backendId: student.id,
          pseudonym: student.pseudonym,
          classCode: student.classCode,
          avatar:
            localStudent?.avatar ??
            RANKING_AVATARS[student.id % RANKING_AVATARS.length],
          streak: student.streak,
          totalXP: student.totalXP,
          completedModules: student.completedModules,
          completedTopics: student.completedTopics,
          completedExercises: student.completedExercises,
          exerciseResults: localStudent?.exerciseResults ?? [],
          lastLogin: localStudent?.lastLogin ?? Date.now(),
          diagnosticProfile:
            student.diagnosticProfile ?? localStudent?.diagnosticProfile,
        };
      });
      setServerRanking(refreshedRanking);
    } finally {
      setIsRefreshingRanking(false);
    }
  }, [allStudents, currentStudent?.classCode]);

  useFocusEffect(
    useCallback(() => {
      void refreshRanking();
    }, [refreshRanking])
  );

  const rankingStudents =
    serverRanking ?? allStudents.filter(
      (student) => student.classCode === currentStudent?.classCode
    );
  const sorted = [...rankingStudents].sort(
    (a, b) =>
      b.totalXP - a.totalXP ||
      a.pseudonym.localeCompare(b.pseudonym, "es", { sensitivity: "base" })
  );
  const myRank = sorted.findIndex(
    (student) => student.backendId === currentStudent?.backendId
  ) + 1;
  const rankedCurrentStudent = sorted.find(
    (student) => student.backendId === currentStudent?.backendId
  );

  const medalColors = [colors.gold, colors.silver, colors.bronze];
  const medalIcons = ["🥇", "🥈", "🥉"];

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
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Comunidad Grado 8°
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Comparte el progreso y motívense entre todos
          </Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Actualizar ranking"
          style={[
            styles.refreshButton,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
          onPress={() => void refreshRanking()}
          disabled={isRefreshingRanking}
        >
          {isRefreshingRanking ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="refresh-cw" size={17} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Los puestos se actualizan según los XP acumulados por cada estudiante.
      </Text>

      {/* Banner */}
      <Image
        source={require("@/assets/images/community_banner.png")}
        style={styles.banner}
        resizeMode="cover"
      />

      {/* My position */}
      <View
        style={[
          styles.myPositionCard,
          {
            backgroundColor: colors.primary + "10",
            borderColor: colors.primary + "30",
          },
        ]}
      >
        <Text style={[styles.myPosLabel, { color: colors.primary }]}>
          Tu posición
        </Text>
        <Text style={[styles.myPosRank, { color: colors.primary }]}>
          #{myRank > 0 ? myRank : "?"}
        </Text>
        <Text style={[styles.myPosXP, { color: colors.mutedForeground }]}>
          {rankedCurrentStudent?.totalXP ?? currentStudent?.totalXP ?? 0} XP
        </Text>
      </View>

      {/* Ranking */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Tabla de Posiciones
      </Text>

      {sorted.map((student, index) => {
        const isMe = student.backendId === currentStudent?.backendId;
        const rank = index + 1;

        return (
          <View
            key={student.id}
            style={[
              styles.rankRow,
              {
                backgroundColor: isMe
                  ? colors.primary + "10"
                  : colors.card,
                borderColor: isMe ? colors.primary + "40" : colors.border,
              },
            ]}
          >
            <View style={styles.rankBadge}>
              {rank <= 3 ? (
                <Text style={styles.medalIcon}>{medalIcons[rank - 1]}</Text>
              ) : (
                <Text
                  style={[styles.rankNum, { color: colors.mutedForeground }]}
                >
                  {rank}
                </Text>
              )}
            </View>

            <Text style={styles.avatarText}>{student.avatar}</Text>

            <View style={styles.studentInfo}>
              <Text
                style={[
                  styles.studentName,
                  { color: isMe ? colors.primary : colors.foreground },
                ]}
              >
                {student.pseudonym} {isMe && "(Tú)"}
              </Text>
              <Text
                style={[styles.studentMeta, { color: colors.mutedForeground }]}
              >
                🔥 {student.streak} días · {student.completedModules.length} casos
              </Text>
            </View>

            <View style={styles.xpBadge}>
              <Text style={[styles.xpText, { color: colors.accent }]}>
                ⚡{student.totalXP}
              </Text>
            </View>
          </View>
        );
      })}

      {/* Trophy image */}
      <Image
        source={require("@/assets/images/ranking_trophy.png")}
        style={styles.trophy}
        resizeMode="contain"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 4 },
  titleCopy: { flex: 1 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  banner: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
  },
  myPositionCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  myPosLabel: { fontSize: 13, fontWeight: "600", flex: 1 },
  myPosRank: { fontSize: 28, fontWeight: "900" },
  myPosXP: { fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  rankBadge: {
    width: 36,
    alignItems: "center",
  },
  medalIcon: { fontSize: 22 },
  rankNum: { fontSize: 16, fontWeight: "800" },
  avatarText: { fontSize: 24 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  studentMeta: { fontSize: 12 },
  xpBadge: {},
  xpText: { fontSize: 14, fontWeight: "800" },
  trophy: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 8,
    opacity: 0.8,
  },
});
