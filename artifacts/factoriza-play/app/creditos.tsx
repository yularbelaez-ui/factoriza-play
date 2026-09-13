import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { CREDIT_SOURCES } from "@/data/credits";

export default function CreditsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: isWeb ? 67 + 16 : insets.top + 16,
        paddingBottom: isWeb ? 34 + 32 : insets.bottom + 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <Feather name="chevron-left" size={22} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: colors.primary + "15" }]}>
          <Text style={styles.headerEmoji}>📚</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Créditos y fuentes</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Recursos educativos que inspiran y acompañan el aprendizaje en FactorIzA-Play.
        </Text>
      </View>

      <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="info" size={17} color={colors.primary} />
        <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
          Estos recursos se presentan como apoyo educativo. FactorIzA-Play no reclama
          propiedad sobre sus contenidos ni implica afiliación con sus autores.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Fuentes consultadas
      </Text>

      <View style={styles.sourceList}>
        {CREDIT_SOURCES.map((source) => (
          <TouchableOpacity
            key={source.name}
            style={[styles.sourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => void Linking.openURL(source.url)}
            accessibilityRole="link"
            accessibilityLabel={`Abrir fuente ${source.name}`}
            activeOpacity={0.8}
          >
            <View style={[styles.sourceIcon, { backgroundColor: source.color + "18" }]}>
              <Text style={styles.sourceEmoji}>{source.icon}</Text>
            </View>
            <View style={styles.sourceCopy}>
              <Text style={[styles.sourceName, { color: colors.foreground }]}>
                {source.name}
              </Text>
              <Text style={[styles.sourceDescription, { color: colors.mutedForeground }]}>
                {source.description}
              </Text>
              <Text style={[styles.sourceLink, { color: colors.primary }]}>
                Abrir recurso
              </Text>
            </View>
            <Feather name="external-link" size={17} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerTitle, { color: colors.foreground }]}>
          Sobre FactorIzA-Play
        </Text>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          La secuencia de actividades, los casos de factorización, las rutas
          adaptativas y el seguimiento del progreso forman parte del diseño
          pedagógico de este proyecto.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  backText: { fontSize: 14, fontWeight: "700" },
  header: { alignItems: "center", paddingHorizontal: 24, marginBottom: 20 },
  headerIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerEmoji: { fontSize: 32 },
  title: { fontSize: 26, fontWeight: "900", textAlign: "center" },
  subtitle: { fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 8 },
  notice: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 26,
  },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sourceList: { gap: 10, marginHorizontal: 20 },
  sourceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  sourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceEmoji: { fontSize: 22 },
  sourceCopy: { flex: 1, gap: 3 },
  sourceName: { fontSize: 14, fontWeight: "800" },
  sourceDescription: { fontSize: 12, lineHeight: 17 },
  sourceLink: { fontSize: 11, fontWeight: "800", marginTop: 2 },
  footer: {
    borderTopWidth: 1,
    marginHorizontal: 20,
    marginTop: 30,
    paddingTop: 20,
  },
  footerTitle: { fontSize: 15, fontWeight: "800", marginBottom: 6 },
  footerText: { fontSize: 12, lineHeight: 18 },
});