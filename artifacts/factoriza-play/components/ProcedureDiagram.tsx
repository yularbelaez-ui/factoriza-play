import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  moduleId: string;
  color: string;
}

export function ProcedureDiagram({ moduleId, color }: Props) {
  const colors = useColors();
  const bg = colors.card;
  const border = colors.border;
  const fg = colors.foreground;
  const muted = colors.mutedForeground;
  const c = color;

  const Box = ({ text, accent = false, wide = false, sub = false }: {
    text: string; accent?: boolean; wide?: boolean; sub?: boolean;
  }) => (
    <View style={[
      s.box,
      wide && s.boxWide,
      {
        backgroundColor: accent ? c + "18" : colors.secondary,
        borderColor: accent ? c + "60" : border,
      },
    ]}>
      <Text style={[s.boxText, sub && s.boxSub, { color: accent ? c : fg }]}>{text}</Text>
    </View>
  );

  const Arrow = ({ dir = "right" }: { dir?: "right" | "down" }) => (
    <Text style={[s.arrow, { color: muted }]}>{dir === "down" ? "↓" : "→"}</Text>
  );

  const Label = ({ text }: { text: string }) => (
    <Text style={[s.label, { color: muted }]}>{text}</Text>
  );

  const Divider = () => (
    <View style={[s.divider, { backgroundColor: border }]} />
  );

  const Row = ({ children }: { children: React.ReactNode }) => (
    <View style={s.row}>{children}</View>
  );

  const Step = ({ num, text }: { num: number; text: string }) => (
    <View style={s.stepRow}>
      <View style={[s.stepNum, { backgroundColor: c }]}>
        <Text style={s.stepNumText}>{num}</Text>
      </View>
      <Text style={[s.stepText, { color: fg }]}>{text}</Text>
    </View>
  );

  if (moduleId === "factor-comun") {
    return (
      <View style={[s.card, { backgroundColor: bg, borderColor: c + "40" }]}>
        <Text style={[s.title, { color: c }]}>🔢 Procedimiento visual</Text>
        <Label text="Expresión original" />
        <Row>
          <Box text="6x²" accent /><Text style={[s.op, { color: muted }]}>+</Text>
          <Box text="9x" accent />
        </Row>
        <Arrow dir="down" />
        <Label text="Identifica el MCD de coeficientes y variables" />
        <Row>
          <Box text="MCD(6,9) = 3" />
          <Text style={[s.op, { color: muted }]}>·</Text>
          <Box text="mín(x², x) = x" />
        </Row>
        <Row><Box text="Factor común = 3x" accent /></Row>
        <Arrow dir="down" />
        <Label text="Divide cada término entre el factor común" />
        <Row>
          <Box text="6x² ÷ 3x = 2x" /><Text style={[s.op, { color: muted }]}>+</Text>
          <Box text="9x ÷ 3x = 3" />
        </Row>
        <Arrow dir="down" />
        <Label text="Resultado factorizado" />
        <View style={[s.result, { backgroundColor: c + "12", borderColor: c + "40" }]}>
          <Text style={[s.resultText, { color: c }]}>3x · (2x + 3)</Text>
        </View>
        <Divider />
        <Text style={[s.formula, { color: muted }]}>ax + ay = a(x + y)</Text>
      </View>
    );
  }

  if (moduleId === "agrupacion-terminos") {
    return (
      <View style={[s.card, { backgroundColor: bg, borderColor: c + "40" }]}>
        <Text style={[s.title, { color: c }]}>📦 Procedimiento visual</Text>
        <Label text="Expresión con 4 términos" />
        <Row>
          <Box text="ax" accent /><Box text="ay" accent />
          <Box text="bx" /><Box text="by" />
        </Row>
        <Arrow dir="down" />
        <Label text="Paso 1 — Agrupa en 2 pares" />
        <Row>
          <View style={[s.group, { borderColor: c + "60" }]}>
            <Box text="ax" accent /><Box text="ay" accent />
          </View>
          <Text style={[s.op, { color: muted }]}>+</Text>
          <View style={[s.group, { borderColor: border }]}>
            <Box text="bx" /><Box text="by" />
          </View>
        </Row>
        <Arrow dir="down" />
        <Label text="Paso 2 — Factor común de cada grupo" />
        <Row>
          <Box text="a(x + y)" accent />
          <Text style={[s.op, { color: muted }]}>+</Text>
          <Box text="b(x + y)" />
        </Row>
        <Arrow dir="down" />
        <Label text="Paso 3 — Factor binomial común (x+y)" />
        <View style={[s.result, { backgroundColor: c + "12", borderColor: c + "40" }]}>
          <Text style={[s.resultText, { color: c }]}>(x + y)(a + b)</Text>
        </View>
      </View>
    );
  }

  if (moduleId === "diferencia-cuadrados") {
    return (
      <View style={[s.card, { backgroundColor: bg, borderColor: c + "40" }]}>
        <Text style={[s.title, { color: c }]}>◻️ Procedimiento visual</Text>
        <Label text="Reconoce la forma a² − b²" />
        <Row>
          <Box text="x²" accent /><Text style={[s.op, { color: "#dc2626" }]}>−</Text>
          <Box text="9" accent />
        </Row>
        <Arrow dir="down" />
        <Label text="Extrae la raíz cuadrada de cada término" />
        <Row>
          <View style={[s.group, { borderColor: c + "40" }]}>
            <Text style={[s.groupLabel, { color: c }]}>√x² = x</Text>
          </View>
          <Text style={[s.op, { color: muted }]}>y</Text>
          <View style={[s.group, { borderColor: c + "40" }]}>
            <Text style={[s.groupLabel, { color: c }]}>√9 = 3</Text>
          </View>
        </Row>
        <Arrow dir="down" />
        <Label text="Aplica la fórmula: (a + b)(a − b)" />
        <Row>
          <View style={[s.binomial, { backgroundColor: "#dcfce7", borderColor: c + "60" }]}>
            <Text style={[s.binomialText, { color: c }]}>x + 3</Text>
            <Text style={[s.binomialSub, { color: muted }]}>suma</Text>
          </View>
          <Text style={[s.op, { color: muted }]}>·</Text>
          <View style={[s.binomial, { backgroundColor: "#fef2f2", borderColor: "#dc2626" + "60" }]}>
            <Text style={[s.binomialText, { color: "#dc2626" }]}>x − 3</Text>
            <Text style={[s.binomialSub, { color: muted }]}>resta</Text>
          </View>
        </Row>
        <View style={[s.result, { backgroundColor: c + "12", borderColor: c + "40" }]}>
          <Text style={[s.resultText, { color: c }]}>(x + 3)(x − 3)</Text>
        </View>
        <Divider />
        <Text style={[s.formula, { color: muted }]}>a² − b² = (a + b)(a − b)</Text>
      </View>
    );
  }

  if (moduleId === "trinomio-cuadrado-perfecto") {
    return (
      <View style={[s.card, { backgroundColor: bg, borderColor: c + "40" }]}>
        <Text style={[s.title, { color: c }]}>⬛ Procedimiento visual</Text>
        <Label text="Reconoce los 3 componentes clave" />
        <View style={[s.tcpGrid, { borderColor: c + "30" }]}>
          <View style={[s.tcpCell, { borderColor: c + "20", backgroundColor: c + "10" }]}>
            <Text style={[s.tcpIcon]}>①</Text>
            <Text style={[s.tcpTerm, { color: c }]}>a²</Text>
            <Text style={[s.tcpSub, { color: muted }]}>1er término{"\n"}cuadrado perfecto</Text>
          </View>
          <View style={[s.tcpCell, { borderColor: "#dc2626" + "20", backgroundColor: "#dc2626" + "08" }]}>
            <Text style={s.tcpIcon}>②</Text>
            <Text style={[s.tcpTerm, { color: "#dc2626" }]}>2ab</Text>
            <Text style={[s.tcpSub, { color: muted }]}>término medio{"\n"}= 2 × a × b</Text>
          </View>
          <View style={[s.tcpCell, { borderColor: c + "20", backgroundColor: c + "10" }]}>
            <Text style={s.tcpIcon}>③</Text>
            <Text style={[s.tcpTerm, { color: c }]}>b²</Text>
            <Text style={[s.tcpSub, { color: muted }]}>3er término{"\n"}cuadrado perfecto</Text>
          </View>
        </View>
        <Arrow dir="down" />
        <Label text="Ejemplo: x² + 6x + 9" />
        <Row>
          <Box text="a = x" accent /><Box text="2ab = 6x → b = 3" wide /><Box text="b² = 9 ✓" accent />
        </Row>
        <Arrow dir="down" />
        <View style={[s.result, { backgroundColor: c + "12", borderColor: c + "40" }]}>
          <Text style={[s.resultText, { color: c }]}>(x + 3)²</Text>
        </View>
        <Divider />
        <Text style={[s.formula, { color: muted }]}>a² + 2ab + b² = (a + b)²</Text>
        <Text style={[s.formula, { color: muted }]}>a² − 2ab + b² = (a − b)²</Text>
      </View>
    );
  }

  if (moduleId === "trinomio-forma-x2-bx-c") {
    return (
      <View style={[s.card, { backgroundColor: bg, borderColor: c + "40" }]}>
        <Text style={[s.title, { color: c }]}>🔍 Procedimiento visual</Text>
        <Label text="Ejemplo: x² + 5x + 6" />
        <Row>
          <Box text="x²" /><Box text="+5x" accent /><Box text="+6" />
        </Row>
        <Arrow dir="down" />
        <Label text="Busca m y n que cumplan ambas condiciones" />
        <View style={[s.condBox, { backgroundColor: c + "08", borderColor: c + "30" }]}>
          <Text style={[s.condText, { color: c }]}>m × n = c = 6</Text>
          <Text style={[s.condText, { color: c }]}>m + n = b = 5</Text>
        </View>
        <Arrow dir="down" />
        <Label text="Prueba pares de factores de 6" />
        <View style={s.tableWrap}>
          {[
            { m: "1", n: "6", sum: "7", ok: false },
            { m: "2", n: "3", sum: "5", ok: true },
            { m: "3", n: "2", sum: "5", ok: true },
          ].map((r, i) => (
            <View key={i} style={[s.tableRow, {
              backgroundColor: r.ok ? c + "12" : colors.secondary,
              borderColor: r.ok ? c + "40" : border,
            }]}>
              <Text style={[s.tableCell, { color: muted }]}>{r.m} × {r.n} = 6</Text>
              <Text style={[s.tableCell, { color: muted }]}>{r.m} + {r.n} = {r.sum}</Text>
              <Text style={{ fontSize: 14 }}>{r.ok ? "✅" : "❌"}</Text>
            </View>
          ))}
        </View>
        <Arrow dir="down" />
        <View style={[s.result, { backgroundColor: c + "12", borderColor: c + "40" }]}>
          <Text style={[s.resultText, { color: c }]}>(x + 2)(x + 3)</Text>
        </View>
        <Divider />
        <Text style={[s.formula, { color: muted }]}>x² + bx + c = (x + m)(x + n)</Text>
      </View>
    );
  }

  if (moduleId === "trinomio-ax2-bx-c") {
    return (
      <View style={[s.card, { backgroundColor: bg, borderColor: c + "40" }]}>
        <Text style={[s.title, { color: c }]}>📐 Procedimiento — Método ac</Text>
        <Label text="Ejemplo: 2x² + 7x + 3" />
        <Row>
          <Box text="a=2" accent /><Box text="b=7" /><Box text="c=3" accent />
        </Row>
        <Arrow dir="down" />
        <Step num={1} text="Calcula a·c = 2·3 = 6" />
        <Step num={2} text="Busca m, n: m·n = 6  y  m+n = 7 → m=6, n=1" />
        <Step num={3} text="Descompón el término medio: 7x = 6x + 1x" />
        <Row>
          <Box text="2x²+6x" accent /><Text style={[s.op, { color: muted }]}>+</Text><Box text="x+3" />
        </Row>
        <Step num={4} text="Factor común en cada grupo" />
        <Row>
          <Box text="2x(x+3)" accent /><Text style={[s.op, { color: muted }]}>+</Text><Box text="1(x+3)" />
        </Row>
        <Arrow dir="down" />
        <View style={[s.result, { backgroundColor: c + "12", borderColor: c + "40" }]}>
          <Text style={[s.resultText, { color: c }]}>(2x + 1)(x + 3)</Text>
        </View>
        <Divider />
        <Text style={[s.formula, { color: muted }]}>ax² + bx + c = (px + r)(qx + s)</Text>
      </View>
    );
  }

  if (moduleId === "cubo-binomio") {
    return (
      <View style={[s.card, { backgroundColor: bg, borderColor: c + "40" }]}>
        <Text style={[s.title, { color: c }]}>🎯 Procedimiento visual</Text>
        <Label text="(a + b)³ — 4 términos con coeficientes 1-3-3-1" />
        <View style={[s.coefRow, { borderColor: c + "30" }]}>
          {["1", "3", "3", "1"].map((n, i) => (
            <View key={i} style={[s.coefBox, { backgroundColor: c + (i === 0 || i === 3 ? "20" : "10"), borderColor: c + "30" }]}>
              <Text style={[s.coefNum, { color: c }]}>{n}</Text>
            </View>
          ))}
        </View>
        <Label text="Patrón de potencias: a baja, b sube" />
        <View style={s.expGrid}>
          {[["a³", "b⁰"], ["a²", "b¹"], ["a¹", "b²"], ["a⁰", "b³"]].map(([pa, pb], i) => (
            <View key={i} style={[s.expCell, { borderColor: border }]}>
              <Text style={[s.expA, { color: c }]}>{pa}</Text>
              <Text style={[s.expB, { color: muted }]}>{pb}</Text>
            </View>
          ))}
        </View>
        <Arrow dir="down" />
        <View style={[s.result, { backgroundColor: c + "12", borderColor: c + "40" }]}>
          <Text style={[s.resultText, { color: c }]}>a³ + 3a²b + 3ab² + b³</Text>
        </View>
        <Divider />
        <Text style={[s.formula, { color: muted }]}>(a − b)³ = a³ − 3a²b + 3ab² − b³</Text>
      </View>
    );
  }

  if (moduleId === "suma-diferencia-cubos") {
    return (
      <View style={[s.card, { backgroundColor: bg, borderColor: c + "40" }]}>
        <Text style={[s.title, { color: c }]}>🎲 Regla SOAP — visual</Text>
        <View style={[s.soapRow, { borderColor: c + "30" }]}>
          {[
            { letter: "S", desc: "Same\nsign", ex: "+", color: c },
            { letter: "O", desc: "Opposite\nsign", ex: "−", color: "#d97706" },
            { letter: "A", desc: "Always", ex: "", color: colors.success },
            { letter: "P", desc: "Positive", ex: "+", color: colors.success },
          ].map((item) => (
            <View key={item.letter} style={[s.soapCell, { backgroundColor: item.color + "12", borderColor: item.color + "30" }]}>
              <Text style={[s.soapLetter, { color: item.color }]}>{item.letter}</Text>
              <Text style={[s.soapDesc, { color: muted }]}>{item.desc}</Text>
              {item.ex ? <Text style={[s.soapEx, { color: item.color }]}>{item.ex}</Text> : null}
            </View>
          ))}
        </View>
        <Arrow dir="down" />
        <Label text="Suma: a³ + b³" />
        <Row>
          <Box text="(a + b)" accent /><Box text="(a² − ab + b²)" wide />
        </Row>
        <Label text="Diferencia: a³ − b³" />
        <Row>
          <Box text="(a − b)" accent /><Box text="(a² + ab + b²)" wide />
        </Row>
        <Arrow dir="down" />
        <Label text="Ejemplo: x³ + 8 = x³ + 2³" />
        <View style={[s.result, { backgroundColor: c + "12", borderColor: c + "40" }]}>
          <Text style={[s.resultText, { color: c }]}>(x + 2)(x² − 2x + 4)</Text>
        </View>
      </View>
    );
  }

  return null;
}

const s = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1.5,
    padding: 16, marginBottom: 16, gap: 10,
  },
  title: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
  label: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  box: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  boxWide: { flex: 1 },
  boxText: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  boxSub: { fontSize: 11 },
  op: { fontSize: 16, fontWeight: "700", marginHorizontal: 2 },
  arrow: { fontSize: 20, textAlign: "center", fontWeight: "300" },
  result: {
    borderRadius: 14, borderWidth: 1.5,
    paddingVertical: 12, paddingHorizontal: 16, alignItems: "center",
  },
  resultText: { fontSize: 20, fontWeight: "900", letterSpacing: 0.5 },
  divider: { height: 1, marginVertical: 4, opacity: 0.6 },
  formula: { fontSize: 12, textAlign: "center", fontStyle: "italic" },
  group: {
    flexDirection: "row", gap: 4,
    borderWidth: 1.5, borderRadius: 10,
    padding: 4, alignItems: "center",
  },
  groupLabel: { fontSize: 14, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 4 },
  binomial: {
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 12, paddingVertical: 8, alignItems: "center", gap: 2,
  },
  binomialText: { fontSize: 16, fontWeight: "800" },
  binomialSub: { fontSize: 10, fontWeight: "600" },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: "center", alignItems: "center",
    flexShrink: 0, marginTop: 1,
  },
  stepNumText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  stepText: { flex: 1, fontSize: 13, lineHeight: 20 },
  condBox: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 4 },
  condText: { fontSize: 14, fontWeight: "700" },
  tableWrap: { gap: 4 },
  tableRow: { flexDirection: "row", borderRadius: 10, borderWidth: 1, paddingVertical: 7, paddingHorizontal: 10, alignItems: "center", gap: 8 },
  tableCell: { flex: 1, fontSize: 12, fontWeight: "600" },
  tcpGrid: { flexDirection: "row", gap: 6, borderWidth: 0 },
  tcpCell: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    padding: 10, alignItems: "center", gap: 4,
  },
  tcpIcon: { fontSize: 16 },
  tcpTerm: { fontSize: 18, fontWeight: "900" },
  tcpSub: { fontSize: 9, textAlign: "center", lineHeight: 13 },
  coefRow: {
    flexDirection: "row", gap: 6, justifyContent: "center",
    borderRadius: 12, borderWidth: 0,
  },
  coefBox: {
    width: 52, height: 52, borderRadius: 14,
    borderWidth: 1.5, justifyContent: "center", alignItems: "center",
  },
  coefNum: { fontSize: 22, fontWeight: "900" },
  expGrid: { flexDirection: "row", gap: 6, justifyContent: "center" },
  expCell: {
    flex: 1, borderRadius: 10, borderWidth: 1,
    paddingVertical: 8, alignItems: "center", gap: 2,
  },
  expA: { fontSize: 15, fontWeight: "800" },
  expB: { fontSize: 12 },
  soapRow: { flexDirection: "row", gap: 6, borderWidth: 0 },
  soapCell: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    paddingVertical: 10, alignItems: "center", gap: 2,
  },
  soapLetter: { fontSize: 22, fontWeight: "900" },
  soapDesc: { fontSize: 9, textAlign: "center", lineHeight: 12 },
  soapEx: { fontSize: 18, fontWeight: "900" },
});
