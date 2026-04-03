import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  xp: number;
  size?: "sm" | "md" | "lg";
}

export function XPBadge({ xp, size = "md" }: Props) {
  const colors = useColors();
  const sizes = {
    sm: { fontSize: 11, padding: 4, paddingH: 8, radius: 8 },
    md: { fontSize: 13, padding: 5, paddingH: 10, radius: 10 },
    lg: { fontSize: 16, padding: 7, paddingH: 14, radius: 12 },
  };
  const s = sizes[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.accent + "20",
          paddingVertical: s.padding,
          paddingHorizontal: s.paddingH,
          borderRadius: s.radius,
          borderColor: colors.accent + "40",
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.accent, fontSize: s.fontSize },
        ]}
      >
        ⚡ {xp} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
  },
  text: {
    fontWeight: "700",
  },
});
