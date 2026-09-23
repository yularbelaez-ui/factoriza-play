import { useState } from "react";

type IconName =
  | "arrow"
  | "book"
  | "chart"
  | "chevron"
  | "clock"
  | "lock"
  | "menu"
  | "more"
  | "target"
  | "x";

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, string> = {
    arrow: "M4 12h15m-6-6 6 6-6 6",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm0 0V18",
    chart: "M4 19V5m0 14h16M8 16v-4m4 4V8m4 8V5",
    chevron: "m6 9 6 6 6-6",
    clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    lock: "M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3",
    menu: "M4 6h16M4 12h16M4 18h16",
    more: "M5 12h.01M12 12h.01M19 12h.01",
    target: "M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-4 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-4-1v2",
    x: "m6 6 12 12M18 6 6 18",
  };

  return (
    <svg
      aria-hidden="true"
      className="ef-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={paths[name]} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

const sections = [
  { id: "repaso", number: "01", title: "Zona de repaso", subtitle: "Bases numéricas y signos", status: "En curso", tone: "ochre", topics: ["Naturales y operaciones", "Potencias y propiedades"] },
  { id: "algebra", number: "02", title: "Introducción al álgebra", subtitle: "Del número a la variable", status: "Próximo", tone: "ink", topics: ["Términos semejantes", "Valor numérico"] },
  { id: "operaciones", number: "03", title: "Operaciones algebraicas", subtitle: "Estrategias de resolución", status: "Disponible", tone: "brick", topics: ["Productos notables", "Agrupación de términos"] },
  { id: "factorizacion", number: "04", title: "Factorización", subtitle: "Casos y patrones", status: "Bloqueado", tone: "stone", topics: ["Factor común", "Diferencia de cuadrados"] },
];

const modules = [
  { title: "Factor común", meta: "Caso 01 · 8 ejercicios", progress: 72, accent: "ochre" },
  { title: "Agrupación", meta: "Caso 02 · 6 ejercicios", progress: 38, accent: "brick" },
  { title: "Trinomio simple", meta: "Caso 03 · 9 ejercicios", progress: 0, accent: "ink" },
];

export default function EditorialFactorizaHome() {
  const [openSection, setOpenSection] = useState("repaso");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const announce = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  };

  return (
    <main className="ef-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap');
        :root {
          --ef-paper: #f2eee5;
          --ef-paper-deep: #e8e1d4;
          --ef-ink: #202321;
          --ef-muted: #77736b;
          --ef-line: #d6cec0;
          --ef-ochre: #b78335;
          --ef-brick: #a7543d;
          --ef-olive: #68725c;
          --ef-blue: #40566a;
          --ef-white: #faf8f2;
        }
        * { box-sizing: border-box; }
        .ef-shell {
          background: var(--ef-paper);
          color: var(--ef-ink);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }
        .ef-shell::before {
          background-image: radial-gradient(rgba(32,35,33,.06) .7px, transparent .7px);
          background-size: 7px 7px;
          content: "";
          inset: 0;
          opacity: .35;
          pointer-events: none;
          position: fixed;
          z-index: 0;
        }
        .ef-page { margin: 0 auto; max-width: 470px; min-height: 100vh; padding: 22px 18px 50px; position: relative; z-index: 1; }
        .ef-kicker, .ef-eyebrow, .ef-stat-label, .ef-progress-label, .ef-status, .ef-module-meta, .ef-drawer-label {
          font-family: 'DM Mono', monospace;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .ef-topbar { align-items: center; display: flex; justify-content: space-between; margin-bottom: 36px; }
        .ef-mark { align-items: center; display: flex; gap: 10px; }
        .ef-mark-symbol { align-items: center; background: var(--ef-ink); color: var(--ef-paper); display: flex; font-family: 'Libre Baskerville', serif; font-size: 15px; height: 31px; justify-content: center; width: 31px; }
        .ef-mark-copy { font-family: 'Libre Baskerville', serif; font-size: 13px; line-height: 1.12; }
        .ef-mark-copy small { color: var(--ef-muted); display: block; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .08em; margin-top: 3px; text-transform: uppercase; }
        .ef-icon-button { align-items: center; background: transparent; border: 1px solid var(--ef-line); color: var(--ef-ink); cursor: pointer; display: flex; height: 35px; justify-content: center; transition: background-color .2s, color .2s; width: 35px; }
        .ef-icon-button:hover { background: var(--ef-ink); color: var(--ef-paper); }
        .ef-intro { border-bottom: 1px solid var(--ef-ink); padding-bottom: 27px; }
        .ef-kicker { color: var(--ef-brick); font-size: 9px; margin: 0 0 12px; }
        .ef-title { font-family: 'Libre Baskerville', serif; font-size: clamp(29px, 8vw, 42px); font-weight: 400; letter-spacing: -.045em; line-height: 1.06; margin: 0; max-width: 370px; }
        .ef-title em { color: var(--ef-ochre); font-style: italic; }
        .ef-intro-note { color: var(--ef-muted); font-size: 12px; line-height: 1.6; margin: 17px 0 0; max-width: 330px; }
        .ef-stats { border-bottom: 1px solid var(--ef-line); display: grid; grid-template-columns: repeat(3, 1fr); margin-bottom: 20px; }
        .ef-stat { border-right: 1px solid var(--ef-line); padding: 18px 9px 16px 0; }
        .ef-stat + .ef-stat { padding-left: 12px; }
        .ef-stat:last-child { border-right: 0; }
        .ef-stat-value { font-family: 'Libre Baskerville', serif; font-size: 22px; letter-spacing: -.04em; }
        .ef-stat-value.ochre { color: var(--ef-ochre); }
        .ef-stat-value.brick { color: var(--ef-brick); }
        .ef-stat-value.olive { color: var(--ef-olive); }
        .ef-stat-label { color: var(--ef-muted); font-size: 8px; margin-top: 7px; }
        .ef-card { background: rgba(250,248,242,.66); border: 1px solid var(--ef-line); margin-top: 14px; padding: 17px; }
        .ef-card-head { align-items: flex-start; display: flex; gap: 12px; justify-content: space-between; }
        .ef-eyebrow { color: var(--ef-muted); font-size: 8px; margin: 0 0 7px; }
        .ef-card-title { font-family: 'Libre Baskerville', serif; font-size: 15px; font-weight: 400; line-height: 1.25; margin: 0; }
        .ef-card-copy { color: var(--ef-muted); font-size: 11px; line-height: 1.45; margin: 5px 0 0; }
        .ef-card-number { color: var(--ef-ochre); font-family: 'Libre Baskerville', serif; font-size: 21px; white-space: nowrap; }
        .ef-rule { background: var(--ef-line); height: 1px; margin: 15px 0; }
        .ef-track { background: var(--ef-paper-deep); height: 5px; overflow: hidden; }
        .ef-fill { background: var(--ef-ochre); height: 100%; transition: width .35s ease; }
        .ef-fill.olive { background: var(--ef-olive); }
        .ef-meta-row { align-items: center; color: var(--ef-muted); display: flex; font-size: 10px; justify-content: space-between; margin-top: 9px; }
        .ef-rank { align-items: center; display: flex; gap: 11px; }
        .ef-rank-seal { align-items: center; border: 1px solid var(--ef-brick); color: var(--ef-brick); display: flex; font-family: 'DM Mono', monospace; font-size: 10px; height: 38px; justify-content: center; width: 38px; }
        .ef-badge { border: 1px solid rgba(183,131,53,.4); color: var(--ef-ochre); font-family: 'DM Mono', monospace; font-size: 9px; padding: 6px 8px; white-space: nowrap; }
        .ef-note { color: var(--ef-muted); font-size: 10px; line-height: 1.55; margin: 13px 0 0; }
        .ef-route { background: var(--ef-ink); color: var(--ef-paper); margin-top: 28px; padding: 19px 17px 18px; position: relative; }
        .ef-route::after { border: 1px solid rgba(242,238,229,.22); content: ""; inset: 8px; pointer-events: none; position: absolute; }
        .ef-route > * { position: relative; z-index: 1; }
        .ef-route .ef-eyebrow { color: #c8b28c; }
        .ef-route .ef-card-title { color: var(--ef-paper); }
        .ef-route-intro { color: #b3b6ae; font-size: 11px; line-height: 1.5; margin: 7px 0 16px; max-width: 295px; }
        .ef-route-progress { align-items: center; display: flex; gap: 12px; }
        .ef-route .ef-track { background: rgba(242,238,229,.18); flex: 1; }
        .ef-route .ef-fill { background: var(--ef-ochre); }
        .ef-route-pct { color: #ddc08d; font-family: 'DM Mono', monospace; font-size: 11px; }
        .ef-steps { margin-top: 18px; }
        .ef-step { align-items: flex-start; border-top: 1px solid rgba(242,238,229,.16); cursor: pointer; display: flex; gap: 10px; padding: 13px 0; }
        .ef-step:last-child { border-bottom: 1px solid rgba(242,238,229,.16); }
        .ef-step-index { align-items: center; border: 1px solid #6d746b; border-radius: 50%; color: #c5c9c0; display: flex; flex: 0 0 22px; font-family: 'DM Mono', monospace; font-size: 9px; height: 22px; justify-content: center; }
        .ef-step.done .ef-step-index { background: var(--ef-ochre); border-color: var(--ef-ochre); color: var(--ef-ink); }
        .ef-step-copy { flex: 1; }
        .ef-step-name { color: var(--ef-paper); font-family: 'Libre Baskerville', serif; font-size: 12px; }
        .ef-step-detail { color: #9da49c; font-size: 10px; margin-top: 4px; }
        .ef-step-status { color: #c8b28c; font-family: 'DM Mono', monospace; font-size: 8px; padding-top: 3px; text-transform: uppercase; }
        .ef-continue { align-items: center; background: var(--ef-brick); color: var(--ef-paper); cursor: pointer; display: flex; gap: 13px; justify-content: space-between; margin-top: 14px; padding: 16px 17px; text-align: left; transition: background-color .2s, transform .2s; width: 100%; }
        .ef-continue:hover { background: #8c4130; transform: translateY(-2px); }
        .ef-continue-copy { flex: 1; }
        .ef-continue .ef-eyebrow { color: #eac6b8; }
        .ef-continue-title { font-family: 'Libre Baskerville', serif; font-size: 15px; }
        .ef-continue-meta { color: #eac6b8; font-size: 10px; margin-top: 4px; }
        .ef-section-label { align-items: baseline; display: flex; justify-content: space-between; margin: 32px 0 12px; }
        .ef-section-label h2 { font-family: 'Libre Baskerville', serif; font-size: 18px; font-weight: 400; margin: 0; }
        .ef-section-label span { color: var(--ef-muted); font-family: 'DM Mono', monospace; font-size: 8px; text-transform: uppercase; }
        .ef-modules { display: grid; gap: 8px; }
        .ef-module { align-items: center; background: rgba(250,248,242,.62); border: 1px solid var(--ef-line); cursor: pointer; display: flex; gap: 12px; padding: 13px; text-align: left; transition: border-color .2s, transform .2s; width: 100%; }
        .ef-module:hover { border-color: var(--ef-ochre); transform: translateX(3px); }
        .ef-module-index { color: var(--ef-ochre); font-family: 'DM Mono', monospace; font-size: 10px; }
        .ef-module-copy { flex: 1; }
        .ef-module-title { font-family: 'Libre Baskerville', serif; font-size: 12px; }
        .ef-module-meta { color: var(--ef-muted); font-size: 8px; margin-top: 4px; }
        .ef-module-progress { align-items: flex-end; display: flex; flex-direction: column; gap: 5px; }
        .ef-module-pct { color: var(--ef-muted); font-family: 'DM Mono', monospace; font-size: 9px; }
        .ef-mini-track { background: var(--ef-paper-deep); height: 3px; width: 58px; }
        .ef-mini-fill { background: var(--ef-ochre); height: 100%; }
        .ef-roadmap { margin-top: 29px; }
        .ef-roadmap-intro { color: var(--ef-muted); font-size: 11px; line-height: 1.5; margin: -4px 0 14px; }
        .ef-roadmap-item { border-top: 1px solid var(--ef-line); }
        .ef-roadmap-button { align-items: center; background: transparent; border: 0; color: var(--ef-ink); cursor: pointer; display: flex; gap: 11px; padding: 14px 0; text-align: left; width: 100%; }
        .ef-roadmap-num { color: var(--ef-muted); font-family: 'DM Mono', monospace; font-size: 9px; width: 20px; }
        .ef-roadmap-dot { background: var(--ef-ochre); height: 7px; width: 7px; }
        .ef-roadmap-item:nth-child(3) .ef-roadmap-dot { background: var(--ef-brick); }
        .ef-roadmap-item:nth-child(4) .ef-roadmap-dot { background: var(--ef-blue); }
        .ef-roadmap-item:nth-child(5) .ef-roadmap-dot { background: var(--ef-line); }
        .ef-roadmap-copy { flex: 1; }
        .ef-roadmap-title { font-family: 'Libre Baskerville', serif; font-size: 12px; }
        .ef-roadmap-sub { color: var(--ef-muted); font-size: 10px; margin-top: 3px; }
        .ef-status { color: var(--ef-muted); font-size: 8px; }
        .ef-status.active { color: var(--ef-ochre); }
        .ef-status.locked { color: #9a9a91; }
        .ef-topics { border-left: 1px solid var(--ef-line); margin: 0 0 14px 30px; padding: 0 0 2px 13px; }
        .ef-topic { align-items: center; color: var(--ef-muted); display: flex; font-size: 10px; gap: 7px; padding: 5px 0; }
        .ef-topic::before { background: var(--ef-brick); content: ""; height: 4px; width: 4px; }
        .ef-quick { border-top: 1px solid var(--ef-ink); display: grid; grid-template-columns: repeat(2, 1fr); margin-top: 33px; }
        .ef-quick-button { align-items: center; background: transparent; border: 0; border-bottom: 1px solid var(--ef-line); color: var(--ef-ink); cursor: pointer; display: flex; gap: 9px; padding: 15px 4px; text-align: left; }
        .ef-quick-button:nth-child(odd) { border-right: 1px solid var(--ef-line); }
        .ef-quick-button span { font-family: 'Libre Baskerville', serif; font-size: 11px; }
        .ef-quick-button .ef-icon { color: var(--ef-ochre); }
        .ef-footer { align-items: center; border-top: 1px solid var(--ef-line); color: var(--ef-muted); display: flex; font-size: 9px; justify-content: space-between; margin-top: 28px; padding-top: 16px; }
        .ef-footer strong { color: var(--ef-ink); font-family: 'Libre Baskerville', serif; font-weight: 400; }
        .ef-toast { background: var(--ef-ink); bottom: 20px; color: var(--ef-paper); font-family: 'DM Mono', monospace; font-size: 10px; left: 18px; padding: 12px 14px; position: fixed; right: 18px; text-align: center; transform: translateY(0); z-index: 5; }
        .ef-drawer { background: var(--ef-white); border-left: 1px solid var(--ef-ink); bottom: 0; padding: 23px 18px; position: fixed; right: 0; top: 0; transform: translateX(100%); transition: transform .25s ease; width: min(280px, 82vw); z-index: 4; }
        .ef-drawer.open { transform: translateX(0); }
        .ef-drawer-head { align-items: center; display: flex; justify-content: space-between; margin-bottom: 35px; }
        .ef-drawer h2 { font-family: 'Libre Baskerville', serif; font-size: 20px; font-weight: 400; margin: 0; }
        .ef-drawer-label { color: var(--ef-muted); font-size: 8px; margin: 0 0 14px; }
        .ef-drawer-button { background: none; border: 0; border-bottom: 1px solid var(--ef-line); color: var(--ef-ink); cursor: pointer; display: block; font-family: 'Libre Baskerville', serif; font-size: 13px; padding: 13px 0; text-align: left; width: 100%; }
        @media (min-width: 700px) { .ef-page { padding-top: 34px; } }
      `}</style>

      <section className="ef-page">
        <header className="ef-topbar">
          <div className="ef-mark">
            <div className="ef-mark-symbol">F</div>
            <div className="ef-mark-copy">
              FactorIzA
              <small>cuaderno de práctica</small>
            </div>
          </div>
          <button aria-label="Abrir menú" className="ef-icon-button" onClick={() => setDrawerOpen(true)} type="button">
            <Icon name="menu" />
          </button>
        </header>

        <section className="ef-intro">
          <p className="ef-kicker">Sesión 04 / miércoles</p>
          <h1 className="ef-title">Hola, <em>Alex.</em><br />Volvamos al problema.</h1>
          <p className="ef-intro-note">Tu cuaderno conserva el hilo. Hoy basta con una buena decisión algebraica.</p>
        </section>

        <section aria-label="Resumen de progreso" className="ef-stats">
          <div className="ef-stat"><div className="ef-stat-value ochre">248</div><div className="ef-stat-label">Puntos</div></div>
          <div className="ef-stat"><div className="ef-stat-value brick">07</div><div className="ef-stat-label">Días seguidos</div></div>
          <div className="ef-stat"><div className="ef-stat-value olive">02/04</div><div className="ef-stat-label">Casos</div></div>
        </section>

        <section className="ef-card">
          <div className="ef-card-head">
            <div><p className="ef-eyebrow">Ritmo de hoy</p><h2 className="ef-card-title">Una página más para mantener la racha</h2></div>
            <div className="ef-card-number">124<small style={{ color: "var(--ef-muted)", fontFamily: "'DM Mono', monospace", fontSize: 9 }}> / 200</small></div>
          </div>
          <div className="ef-rule" />
          <div className="ef-track"><div className="ef-fill" style={{ width: "62%" }} /></div>
          <div className="ef-meta-row"><span>Progreso diario</span><span>Te faltan 76 puntos</span></div>
        </section>

        <section className="ef-card">
          <div className="ef-card-head">
            <div className="ef-rank"><div className="ef-rank-seal">III</div><div><p className="ef-eyebrow">Rango actual</p><h2 className="ef-card-title">Observador atento</h2></div></div>
            <span className="ef-badge">12% al próximo</span>
          </div>
          <div className="ef-rule" />
          <div className="ef-track"><div className="ef-fill olive" style={{ width: "68%" }} /></div>
          <div className="ef-meta-row"><span>248 puntos acumulados</span><span>360 para avanzar</span></div>
          <p className="ef-note">Misión: reconocer el patrón antes de operar. Insignias: primera hipótesis, mente flexible.</p>
        </section>

        <section className="ef-route">
          <p className="ef-eyebrow">Ruta sugerida / diagnóstico inicial 68%</p>
          <h2 className="ef-card-title">Un camino corto hacia la factorización</h2>
          <p className="ef-route-intro">Hemos seleccionado tres estaciones para reforzar antes de abrir el siguiente caso.</p>
          <div className="ef-route-progress"><div className="ef-track"><div className="ef-fill" style={{ width: "46%" }} /></div><span className="ef-route-pct">46%</span></div>
          <div className="ef-steps">
            <div className="ef-step done" onClick={() => announce("Repaso de signos marcado como revisado")}><span className="ef-step-index">1</span><div className="ef-step-copy"><div className="ef-step-name">Ley de signos</div><div className="ef-step-detail">7 min de lectura · 3 ejercicios</div></div><span className="ef-step-status">Listo</span></div>
            <div className="ef-step" onClick={() => announce("Abriendo términos semejantes")}><span className="ef-step-index">2</span><div className="ef-step-copy"><div className="ef-step-name">Términos semejantes</div><div className="ef-step-detail">12 min de práctica · recomendado</div></div><span className="ef-step-status">Ahora</span></div>
            <div className="ef-step" onClick={() => announce("Esta estación se habilita al completar la anterior")}><span className="ef-step-index">3</span><div className="ef-step-copy"><div className="ef-step-name">Factor común</div><div className="ef-step-detail">Caso 01 · requiere la estación 2</div></div><span className="ef-step-status">Después</span></div>
          </div>
        </section>

        <button className="ef-continue" onClick={() => announce("Caso 02 listo para continuar")} type="button">
          <span className="ef-continue-copy"><span className="ef-eyebrow">Continúa donde lo dejaste</span><span className="ef-continue-title">Agrupación</span><span className="ef-continue-meta">Caso 02 · ejercicio 3 de 6</span></span>
          <Icon name="arrow" size={21} />
        </button>

        <section>
          <div className="ef-section-label"><h2>Progreso de casos</h2><span>2 de 4 abiertos</span></div>
          <div className="ef-modules">
            {modules.map((module, index) => (
              <button className="ef-module" key={module.title} onClick={() => announce(`${module.title} seleccionado`)} type="button">
                <span className="ef-module-index">0{index + 1}</span>
                <span className="ef-module-copy"><span className="ef-module-title">{module.title}</span><span className="ef-module-meta">{module.meta}</span></span>
                <span className="ef-module-progress"><span className="ef-module-pct">{module.progress ? `${module.progress}%` : "cerrado"}</span><span className="ef-mini-track"><span className="ef-mini-fill" style={{ background: `var(--ef-${module.accent})`, width: `${module.progress}%` }} /></span></span>
                <Icon name={module.progress ? "chevron" : "lock"} size={14} />
              </button>
            ))}
          </div>
        </section>

        <section className="ef-roadmap">
          <div className="ef-section-label"><h2>Mapa del curso</h2><span>4 estaciones</span></div>
          <p className="ef-roadmap-intro">Toca una estación para consultar sus temas y decidir tu siguiente paso.</p>
          {sections.map((section) => {
            const open = openSection === section.id;
            return (
              <div className="ef-roadmap-item" key={section.id}>
                <button className="ef-roadmap-button" onClick={() => setOpenSection(open ? "" : section.id)} type="button">
                  <span className="ef-roadmap-num">{section.number}</span><span className="ef-roadmap-dot" /><span className="ef-roadmap-copy"><span className="ef-roadmap-title">{section.title}</span><span className="ef-roadmap-sub">{section.subtitle}</span></span><span className={`ef-status ${section.status === "En curso" ? "active" : section.status === "Bloqueado" ? "locked" : ""}`}>{section.status}</span><Icon name="chevron" size={14} />
                </button>
                {open && <div className="ef-topics">{section.topics.map((topic) => <div className="ef-topic" key={topic}>{topic}</div>)}</div>}
              </div>
            );
          })}
        </section>

        <section>
          <div className="ef-section-label"><h2>Acceso rápido</h2><span>Atajos</span></div>
          <div className="ef-quick">
            <button className="ef-quick-button" onClick={() => announce("Abriendo tus casos")} type="button"><Icon name="book" size={15} /><span>Mis casos</span></button>
            <button className="ef-quick-button" onClick={() => announce("Tu evaluación está en preparación")} type="button"><Icon name="chart" size={15} /><span>Evaluación</span></button>
            <button className="ef-quick-button" onClick={() => announce("Reflexión: una pausa para explicar lo aprendido")} type="button"><Icon name="clock" size={15} /><span>Reflexión</span></button>
            <button className="ef-quick-button" onClick={() => announce("Ranking de la comunidad actualizado")} type="button"><Icon name="target" size={15} /><span>Comunidad</span></button>
          </div>
        </section>

        <footer className="ef-footer"><span><strong>FactorIzA-Play</strong> / edición de estudio</span><span>v. 2.4</span></footer>
      </section>

      <aside aria-label="Menú principal" className={`ef-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="ef-drawer-head"><h2>Cuaderno</h2><button aria-label="Cerrar menú" className="ef-icon-button" onClick={() => setDrawerOpen(false)} type="button"><Icon name="x" /></button></div>
        <p className="ef-drawer-label">Navegación</p>
        {["Inicio", "Casos de factorización", "Mi evaluación", "Comunidad"].map((item) => <button className="ef-drawer-button" key={item} onClick={() => { setDrawerOpen(false); announce(`${item} seleccionado`); }} type="button">{item}</button>)}
        <p className="ef-drawer-label" style={{ marginTop: 36 }}>Cuenta</p>
        <button className="ef-drawer-button" onClick={() => { setDrawerOpen(false); announce("Preferencias guardadas"); }} type="button">Preferencias</button>
      </aside>

      {notice && <div className="ef-toast" role="status">{notice}</div>}
    </main>
  );
}