import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Mode = "select" | "student" | "teacher";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const isWeb = Platform.OS === "web";

  const [mode, setMode] = useState<Mode>("select");
  const [pseudonym, setPseudonym] = useState("");
  const [classCode, setClassCode] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleStudentLogin = async () => {
    setError("");
    if (!pseudonym.trim()) {
      setError("Ingresa tu seudónimo.");
      return;
    }
    if (!classCode.trim()) {
      setError("Ingresa el código de clase.");
      return;
    }
    setLoading(true);
    const result = await login("student", pseudonym.trim(), classCode.trim());
    setLoading(false);
    if (result.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)" as any);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || "Error al iniciar sesión.");
    }
  };

  const handleTeacherLogin = async () => {
    setError("");
    if (!teacherCode.trim()) {
      setError("Ingresa el código de docente.");
      return;
    }
    setLoading(true);
    const result = await login("teacher", "", teacherCode.trim());
    setLoading(false);
    if (result.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/docente");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || "Código incorrecto.");
    }
  };

  const paddingTop = isWeb ? 67 + 32 : insets.top + 32;
  const paddingBottom = isWeb ? 34 + 32 : insets.bottom + 32;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop, paddingBottom, paddingHorizontal: 28 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={[styles.logoBg, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>Fx</Text>
          </View>
          <Text style={[styles.appName, { color: colors.primary }]}>
            FactorIzA-Play
          </Text>
          <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
            Aprende factorización de forma divertida
          </Text>
        </View>

        {/* Mode selection */}
        {mode === "select" && (
          <View style={styles.modeSelect}>
            <Text style={[styles.modeTitle, { color: colors.foreground }]}>
              ¿Cómo deseas ingresar?
            </Text>

            <TouchableOpacity
              style={[
                styles.modeBtn,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
              ]}
              onPress={() => {
                setMode("student");
                setError("");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modeBtnIcon}>🎓</Text>
              <View style={styles.modeBtnInfo}>
                <Text style={styles.modeBtnTitle}>Soy Estudiante</Text>
                <Text style={styles.modeBtnSub}>
                  Ingresa con tu seudónimo y código de clase
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1.5,
                  shadowColor: "#000",
                },
              ]}
              onPress={() => {
                setMode("teacher");
                setError("");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modeBtnIcon}>👨‍🏫</Text>
              <View style={styles.modeBtnInfo}>
                <Text
                  style={[styles.modeBtnTitle, { color: colors.foreground }]}
                >
                  Soy Docente
                </Text>
                <Text style={[styles.modeBtnSub, { color: colors.mutedForeground }]}>
                  Accede con tu código de docente
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {/* Student login */}
        {mode === "student" && (
          <View style={styles.form}>
            <TouchableOpacity
              style={styles.backRow}
              onPress={() => {
                setMode("select");
                setError("");
              }}
            >
              <Feather name="chevron-left" size={18} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>
                Volver
              </Text>
            </TouchableOpacity>

            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              Ingreso de Estudiante
            </Text>
            <Text style={[styles.formSub, { color: colors.mutedForeground }]}>
              Usa el seudónimo y código que te dio tu docente
            </Text>

            <Text style={[styles.label, { color: colors.foreground }]}>
              Seudónimo
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Tu seudónimo (ej: SuperMath01)"
              placeholderTextColor={colors.mutedForeground}
              value={pseudonym}
              onChangeText={(t) => {
                setPseudonym(t);
                setError("");
              }}
              autoCapitalize="none"
              returnKeyType="next"
            />

            <Text style={[styles.label, { color: colors.foreground }]}>
              Código de clase
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Código de clase (ej: MATE8A)"
              placeholderTextColor={colors.mutedForeground}
              value={classCode}
              onChangeText={(t) => {
                setClassCode(t.toUpperCase());
                setError("");
              }}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleStudentLogin}
            />

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.error + "15", borderColor: colors.error },
                ]}
              >
                <Feather name="alert-circle" size={14} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.loginBtn,
                { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
              ]}
              onPress={handleStudentLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Ingresar</Text>
                  <Feather name="log-in" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Teacher login */}
        {mode === "teacher" && (
          <View style={styles.form}>
            <TouchableOpacity
              style={styles.backRow}
              onPress={() => {
                setMode("select");
                setError("");
              }}
            >
              <Feather name="chevron-left" size={18} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>
                Volver
              </Text>
            </TouchableOpacity>

            <Text style={[styles.formTitle, { color: colors.foreground }]}>
              Acceso Docente
            </Text>
            <Text style={[styles.formSub, { color: colors.mutedForeground }]}>
              Ingresa tu código de acceso como docente
            </Text>

            <Text style={[styles.label, { color: colors.foreground }]}>
              Código de acceso
            </Text>
            <View style={styles.passRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.passInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="Código de docente"
                placeholderTextColor={colors.mutedForeground}
                value={teacherCode}
                onChangeText={(t) => {
                  setTeacherCode(t);
                  setError("");
                }}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleTeacherLogin}
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { backgroundColor: colors.secondary }]}
                onPress={() => setShowPass(!showPass)}
              >
                <Feather
                  name={showPass ? "eye-off" : "eye"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.error + "15", borderColor: colors.error },
                ]}
              >
                <Feather name="alert-circle" size={14} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.loginBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1.5,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleTeacherLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text
                    style={[styles.loginBtnText, { color: colors.foreground }]}
                  >
                    Acceder como Docente
                  </Text>
                  <Feather name="briefcase" size={18} color={colors.primary} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  logoArea: { alignItems: "center", marginBottom: 40 },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  appName: { fontSize: 28, fontWeight: "900", marginBottom: 4 },
  appTagline: { fontSize: 14, fontWeight: "400", textAlign: "center" },
  modeSelect: { gap: 14 },
  modeTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  modeBtnIcon: { fontSize: 32 },
  modeBtnInfo: { flex: 1 },
  modeBtnTitle: { color: "#fff", fontSize: 17, fontWeight: "800", marginBottom: 2 },
  modeBtnSub: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  form: { gap: 0 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 20 },
  backText: { fontSize: 15, fontWeight: "600" },
  formTitle: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  formSub: { fontSize: 13, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  passRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 16 },
  passInput: { flex: 1, marginBottom: 0 },
  eyeBtn: {
    width: 48,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontWeight: "600", flex: 1 },
  loginBtn: {
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
