import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { FactorizationModule } from "@/data/modules";

interface Props {
  module: FactorizationModule;
  unlocked: boolean;
  progress: number;
  onPress: () => void;
}

export function ModuleCard({ module, unlocked, progress, onPress }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: unlocked ? colors.card : colors.locked,
          borderColor: unlocked ? module.color + "40" : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconBg,
            {
              backgroundColor: unlocked ? module.color + "20" : colors.border,
            },
          ]}
        >
          <Text style={styles.icon}>{unlocked ? module.icon : "🔒"}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.levelRow}>
            <Text
              style={[
                styles.level,
                { color: unlocked ? module.color : colors.lockedForeground },
              ]}
            >
              Nivel {module.level}
            </Text>
            <Text
              style={[
                styles.xp,
                { color: unlocked ? colors.accent : colors.lockedForeground },
              ]}
            >
              +{module.xpReward} XP
            </Text>
          </View>
          <Text
            style={[
              styles.title,
              { color: unlocked ? colors.foreground : colors.lockedForeground },
            ]}
            numberOfLines={1}
          >
            {module.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: unlocked ? colors.mutedForeground : colors.lockedForeground },
            ]}
            numberOfLines={1}
          >
            {module.subtitle}
          </Text>
        </View>
        <View style={styles.rightSide}>
          {unlocked ? (
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          ) : (
            <Feather name="lock" size={18} color={colors.lockedForeground} />
          )}
        </View>
      </View>
      {unlocked && progress > 0 && (
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBg, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: module.color,
                  width: `${progress}%` as any,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
            {progress}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  level: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  xp: {
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
  },
  rightSide: {
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  progressBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "right",
  },
});
