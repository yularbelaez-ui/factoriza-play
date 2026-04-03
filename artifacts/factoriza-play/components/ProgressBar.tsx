import React from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color, height = 8 }: Props) {
  const colors = useColors();
  const fillColor = color || colors.primary;

  return (
    <View style={[styles.container, { height, backgroundColor: colors.border, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(100, Math.max(0, progress))}%` as any,
            backgroundColor: fillColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
