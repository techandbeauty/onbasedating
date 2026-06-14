import { useState, useEffect } from "react";

/* ============================================================
   ONBASE — minimal mockup (3 screens)
   Welcome → The Listening Room → Pods Hub
   Palette + layout matched to the new reference mockups
   ============================================================ */

const C = {
  bg: "#0A0608", bg2: "#120A0C",
  card: "rgba(255,255,255,0.05)", cardBorder: "rgba(255,255,255,0.10)",
  cardWarm: "rgba(245,169,155,0.06)", cardWarmBorder: "rgba(245,169,155,0.18)",
  rose: "#E6A8A8", roseSoft: "#D89B97",
  coral: "#E0526E", coralBright: "#F07A8E", coralDeep: "#B83E5C",
  peach: "#F5C9B0", peachGlow: "#F5A99B",
  text: "#F5EFF0", muted: "#9A8E92", faint: "#6B5F63",
};

const fontUI = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif';
const fontDisplay = '"Cormorant Garamond", "Playfair Display", Georgia, serif';

/* ---------- shared atoms ---------- */

function GlowRing({ size = 220, children, intensity = 1 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `2.5px solid ${C.peachGlow}`,
      boxShadow: `0 0 40px ${C.peachGlow}${Math.round(0x80 * intensity).toString(16).padStart(2, "0")}, 0 0 90px ${C.peach}${Math.round(0x55 * intensity).toString(16).padStart(2, "0")}, inset 0 0 50px ${C.peach}${Math.round(0x22 * intensity).toString(16).padStart(2, "0")}`,
    }}>{children}</div>
  );
}

function ProfileSilhouette({ direction = "right", tone = "#050203" }) {
  return (
    <svg viewBox="0 0 100 150" style={{ width: "100%", height: "100%",
      transform: direction === "left" ? "scaleX(-1)" : "none" }}>
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0608" />
          <stop offset="100%" stopColor={tone} />
        </linearGradient>
      </defs>
      <path d="M 38 18 Q 42 12 50 12 Q 62 12 65 22 Q 67 30 64 38 L 64 42 Q 66 44 65 47 L 63 49 Q 62 54 60 56 L 60 62 L 56 64 L 48 64 L 40 60 Q 38 50 38 42 Z" fill="url(#bodyGrad)" />
      <path d="M 36 22 Q 38 10 50 9 Q 64 8 66 18 Q 68 8 56 6 Q 42 5 36 14 Q 32 20 36 22 Z" fill="url(#bodyGrad)" />
      <path d="M 44 60 L 56 60 L 58 70 Q 80 78 88 100 L 88 150 L 12 150 L 12 100 Q 22 78 42 70 Z" fill="url(#bodyGrad)" />
    </svg>
  );
}

function BodySilhouette({ tone = "#0a0608" }) {
  return (
    <svg viewBox="0 0 100 130" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="50" cy="34" rx="16" ry="19" fill={tone} />
      <path d="M20 130 Q22 76 50 70 Q78 76 80 130 Z" fill={tone} />
    </svg>
  );
}

function Wordmark({ size = 22, withTagline = true }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: fontDisplay, color: C.rose, fontSize: size,
        letterSpacing: size * 0.32, fontWeight: 400, lineHeight: 1,
        textIndent: size * 0.32,
      }}>ONBASE</div>
      {withTagline && (
        <div style={{
          color: C.roseSoft, fontSize: size * 0.34, letterSpacing: size * 0.14,
          fontWeight: 500, marginTop: size * 0.25, textIndent: size * 0.14,
        }}>CONNECTION BEFORE APPEARANCE</div>
      )}
    </div>
  );
}

function Waveform({ active = true, bars = 26, color = C.coral, height = 26 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 2.5, borderRadius: 2,
          background: `linear-gradient(180deg, ${C.coralBright}, ${color})`,
          height: active ? undefined : 3 + (i % 4),
          animation: active ? `pulse ${0.7 + (i % 5) * 0.13}s ease-in-out ${i * 0.045}s infinite alternate` : "none",
          minHeight: 3, maxHeight: height, opacity: active ? 1 : 0.55,
        }} />
      ))}
    </div>
  );
}

function Btn({ children, onClick, ghost, style }) {
  const base = {
    width: "100%", border: "none", borderRadius: 999, padding: "16px 0",
    fontSize: 15.5, fontWeight: 600, fontFamily: fontUI, color: "#fff",
    cursor: "pointer", letterSpacing: 0.2,
  };
  if (ghost) return <button onClick={onClick} style={{ ...base, background: "transparent", border: `1px solid ${C.coral}66`, color: C.text, ...style }}>{children}</button>;
  return <button onClick={onClick} style={{
    ...base,
    background: `linear-gradient(90deg, ${C.coralDeep} 0%, ${C.coral} 55%, #D9758B 100%)`,
    boxShadow: `0 12px 32px ${C.coral}44`, ...style,
  }}>{children}</button>;
}

function Header({ title, onBack, right, brand }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 4px", position: "relative", minHeight: 44 }}>
      {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: C.text, fontSize: 24, cursor: "pointer", fontFamily: fontUI, padding: 0, lineHeight: 1 }}>‹</button>}
      {!onBack && brand && <span style={{ color: C.muted, fontSize: 22, cursor: "pointer" }}>≡</span>}
      <div style={{ flex: 1, textAlign: "center" }}>
        {brand ? <Wordmark size={14} /> : <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>}
      </div>
      {right && <span style={{ color: C.muted, fontSize: 17 }}>{right}</span>}
      {!right && (onBack || brand) && <span style={{ width: 14 }} />}
    </div>
  );
}

function TabBar({ active, onTab }) {
  const tabs = [
    { id: "discover", label: "Discover" },
    { id: "pods", label: "Pods" },
    { id: "dates", label: "Dates" },
    { id: "journey", label: "Journey" },
    { id: "profile", label: "Profile" },
  ];
  const Icon = ({ id, color }) => {
    if (id === "discover") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2M21 12h0" />
      </svg>
    );
    if (id === "pods") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round">
        <path d="M21 12c0 4-4 8-9 8-1.5 0-2.9-.3-4-.9L3 20l1-4c-.6-1.2-1-2.6-1-4 0-4 4-8 9-8s9 4 9 8z" />
        <path d="M9 12.5l2 2 4-4" strokeLinecap="round" />
      </svg>
    );
    if (id === "dates") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 3v4M16 3v4" />
        <path d="M12 15c-1-1.2-2-2-2-3 0-1 .8-1.5 1.5-1.5.5 0 .5 0 1 .5.5-.5.5-.5 1-.5.7 0 1.5.5 1.5 1.5 0 1-1 1.8-2 3z" fill={color} stroke="none" />
      </svg>
    );
    if (id === "journey") return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <path d="M6 18c2-2 2-5 0-6S4 8 6 6M18 6c-2 2-2 5 0 6s2 4 0 6" />
        <circle cx="6" cy="18" r="1.6" fill={color} stroke="none" />
        <circle cx="18" cy="6" r="1.6" fill={color} stroke="none" />
      </svg>
    );
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
      </svg>
    );
  };
  return (
    <div style={{
      display: "flex", justifyContent: "space-around", padding: "10px 6px 18px",
      borderTop: `1px solid ${C.cardBorder}`, background: "rgba(10,6,8,0.95)",
    }}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <div key={t.id} onClick={() => onTab(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: isActive ? C.coral : C.faint, fontSize: 10.5, fontWeight: 500, cursor: "pointer",
          }}>
            <Icon id={t.id} color={isActive ? C.coral : C.faint} />
            <span>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Screen 1: Welcome ---------- */

function WelcomeScreen({ go }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0 26px 24px" }}>
      <div style={{ paddingTop: 32, textAlign: "center" }}>
        <Wordmark size={26} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <GlowRing size={300}>
          <div style={{ position: "absolute", left: 8, bottom: 14, width: 95, height: 200, opacity: 0.96 }}>
            <ProfileSilhouette direction="right" />
          </div>
          <div style={{ position: "absolute", right: 8, bottom: 14, width: 95, height: 200, opacity: 0.96 }}>
            <ProfileSilhouette direction="left" />
          </div>
          <div style={{ position: "absolute", bottom: -2, left: "10%", right: "10%", height: 12, background: `radial-gradient(ellipse, ${C.peach}55, transparent 70%)`, filter: "blur(4px)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 180, color: C.text }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 500, lineHeight: 1.2 }}>
              Real connection<br />starts here.
            </div>
            <div style={{ margin: "16px auto", display: "flex", justifyContent: "center" }}>
              <Waveform active={false} bars={14} height={20} />
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: C.text, opacity: 0.92 }}>
              OnBase is a space to<br />build <span style={{ color: C.coralBright, fontWeight: 600 }}>real connections</span><br />through conversations<br />that matter.
            </div>
          </div>
        </GlowRing>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 18 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i === 0 ? C.coral : "#3a2a2e" }} />
        ))}
      </div>
      <Btn onClick={() => go("discover")}>Get Started</Btn>
      <div style={{ height: 12 }} />
      <Btn ghost onClick={() => go("pods")}>I Already Have an Account</Btn>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18, color: C.muted, fontSize: 11.5, textAlign: "center" }}>
        <span style={{ color: C.coral, fontSize: 15 }}>🔒</span>
        <span>Your conversations are private,<br />secure and only between you.</span>
      </div>
    </div>
  );
}

/* ---------- Screen 2: The Listening Room ---------- */

function ListeningRoomScreen({ go, onTab }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress((p) => (p >= 30 ? 30 : p + 0.1)), 100);
    return () => clearInterval(t);
  }, [playing]);
  const elapsed = `0:${String(Math.floor(progress)).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header brand right={<span style={{ position: "relative" }}>💬<span style={{ position: "absolute", top: -2, right: -2, width: 6, height: 6, borderRadius: 3, background: C.coral }} /></span>} />
      <div style={{ textAlign: "center", padding: "8px 24px 4px" }}>
        <div style={{ fontFamily: fontDisplay, fontSize: 21, fontWeight: 500, letterSpacing: 3, marginBottom: 6 }}>THE LISTENING ROOM</div>
        <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic" }}>Real voices. Real stories. Real potential.</div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 0 }}>
        <div style={{ position: "absolute", left: 0, transform: "scaleX(-1)", opacity: 0.5 }}>
          <Waveform active={playing} bars={18} height={70} color={C.coral} />
        </div>
        <div style={{ position: "absolute", right: 0, opacity: 0.5 }}>
          <Waveform active={playing} bars={18} height={70} color={C.coral} />
        </div>
        <div style={{ position: "relative" }}>
          <GlowRing size={240} intensity={playing ? 1.2 : 0.9}>
            <div style={{ width: "85%", height: "92%", position: "absolute", bottom: 0 }}>
              <ProfileSilhouette direction="right" />
            </div>
          </GlowRing>
          <div style={{
            position: "absolute", right: -34, top: "44%", width: 28, height: 28, borderRadius: "50%",
            background: C.card, border: `1px solid ${C.cardBorder}`, display: "flex",
            alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13, cursor: "pointer",
          }}>i</div>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "4px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ fontSize: 24, fontWeight: 600, fontFamily: fontDisplay }}>Jordan</div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={C.coral}>
            <path d="M12 1l3 3h4l1 4 3 3-3 3-1 4h-4l-3 3-3-3H5l-1-4-3-3 3-3 1-4h4z" />
            <path d="M9 12l2 2 4-4" stroke="#0a0608" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontSize: 13.5, color: C.muted, marginTop: 2 }}>31 · Dallas, TX</div>
      </div>
      <div style={{ padding: "10px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontStyle: "italic", fontSize: 14, lineHeight: 1.5 }}>
          <span style={{ color: C.coral, fontSize: 20, lineHeight: 1, marginRight: 2 }}>“</span>
          <span>One thing people should know about me…</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <button onClick={() => setPlaying((p) => !p)} style={{
            width: 52, height: 52, borderRadius: "50%", border: `1px solid ${C.coral}66`, cursor: "pointer",
            background: `radial-gradient(circle at 35% 30%, ${C.coralBright}33, transparent)`,
            color: C.coralBright, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          }}>{playing ? "❚❚" : "▶"}</button>
          <div style={{ flex: 1 }}>
            <Waveform active={playing} bars={42} height={22} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 4 }}>
              <span>{elapsed}</span><span>0:30</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 24px 8px", display: "flex", alignItems: "center", gap: 14 }}>
        <button style={{
          width: 60, height: 60, borderRadius: "50%", border: `1px solid ${C.cardBorder}`,
          background: C.card, color: C.text, fontSize: 22, cursor: "pointer", flexShrink: 0,
        }}>✕</button>
        <div style={{ flex: 1, fontSize: 12, color: C.muted, textAlign: "center", lineHeight: 1.5 }}>
          If there's a connection, choose to <span style={{ color: C.coral, fontWeight: 600 }}>court</span> them and start a Pod together.
        </div>
        <button onClick={() => go("pods")} style={{
          width: 60, height: 60, borderRadius: "50%", border: "none", cursor: "pointer", flexShrink: 0,
          background: `radial-gradient(circle at 35% 30%, ${C.coralBright}, ${C.coralDeep})`,
          color: "#fff", fontSize: 22,
          boxShadow: `0 8px 24px ${C.coral}66`,
        }}>♥</button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 38px 6px", fontSize: 11, color: C.muted }}>
        <span>Pass</span><span style={{ color: C.coral }}>Court</span>
      </div>
      <TabBar active="discover" onTab={onTab} />
    </div>
  );
}

/* ---------- Screen 3: Pods Hub ---------- */

function PodsHubScreen({ go, onTab }) {
  const [stage, setStage] = useState("Courting");
  const stages = {
    Courting: { cap: 8, items: [
      { name: "Alex", sub: "Day 12 of 30", filled: true, hot: true },
      { name: "Jamie", sub: "Day 3 of 30" },
      { name: "Jordan", sub: "Just opened" },
      { name: "Casey", sub: "Day 21 of 30", filled: true },
    ]},
    Dating: { cap: 6, items: [
      { name: "Sam", sub: "Day 45 of 90 · Revealed", filled: true, revealed: true },
    ]},
    Relationship: { cap: 1, items: [] },
  };
  const s = stages[stage];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header brand right="+" />
      <div style={{ textAlign: "center", padding: "0 22px 8px" }}>
        <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 500, letterSpacing: 1.6, marginBottom: 4 }}>YOUR PODS</div>
        <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>Intentional rooms. Depth over quantity.</div>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "10px 18px", justifyContent: "center" }}>
        {["Courting", "Dating", "Relationship"].map((st) => (
          <button key={st} onClick={() => setStage(st)} style={{
            padding: "8px 14px", borderRadius: 999, border: "none", fontSize: 12, fontWeight: 600,
            fontFamily: fontUI, cursor: "pointer",
            background: stage === st ? `linear-gradient(90deg, ${C.coralDeep}, ${C.coral})` : C.card,
            color: stage === st ? "#fff" : C.muted,
          }}>{st} · {stages[st].items.length}/{stages[st].cap}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px 12px" }}>
        {s.items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
            <div style={{ fontSize: 38, marginBottom: 14, opacity: 0.5 }}>⬡</div>
            <div style={{ fontSize: 15, color: C.text, fontWeight: 600, marginBottom: 6 }}>No {stage.toLowerCase()} pods yet</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
              {stage === "Dating" && "Pods graduate here after a mutual reveal at Day 30."}
              {stage === "Relationship" && "One pod becomes everything — at Day 60, you decide together."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {s.items.map((p) => (
              <div key={p.name} style={{
                display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                background: p.hot ? `linear-gradient(120deg, ${C.cardWarm}, ${C.card})` : C.card,
                border: `1px solid ${p.hot ? C.cardWarmBorder : C.cardBorder}`,
                borderRadius: 18, padding: 14,
              }}>
                <div style={{ width: 58, height: 58 }}>
                  <GlowRing size={58} intensity={p.filled ? 0.7 : 0.3}>
                    {p.filled ? <div style={{ width: "70%", height: "78%", position: "absolute", bottom: 4 }}><BodySilhouette tone={p.revealed ? "#caa28a" : "#0a0608"} /></div> : <span style={{ fontSize: 14 }}>🔒</span>}
                  </GlowRing>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{p.sub}</div>
                  {p.hot && <div style={{ fontSize: 11, color: C.coral, marginTop: 4, fontWeight: 600 }}>🎙 New voice note</div>}
                </div>
                <span style={{ color: C.faint, fontSize: 18 }}>›</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 22, padding: 14, background: C.cardWarm, border: `1px solid ${C.cardWarmBorder}`, borderRadius: 14 }}>
          <div style={{ fontSize: 11, color: C.coral, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>POD CAPACITY</div>
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>
            Courting: max 8 · Dating: max 6 · Relationship: 1. Closing a pod requires a 7-day pause before opening another.
          </div>
        </div>
      </div>
      <TabBar active="pods" onTab={onTab} />
    </div>
  );
}

/* ---------- App shell ---------- */

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const go = (s) => setScreen(s);
  const onTab = (tab) => {
    if (tab === "discover") setScreen("discover");
    else setScreen("pods");
  };

  const screens = {
    welcome: <WelcomeScreen go={go} />,
    discover: <ListeningRoomScreen go={go} onTab={onTab} />,
    pods: <PodsHubScreen go={go} onTab={onTab} />,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at center, #1a1012 0%, #050203 80%)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 28,
      padding: 24, fontFamily: fontUI, flexWrap: "wrap",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');
        @keyframes pulse { from { height: 4px; } to { height: 100%; } }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>

      {/* simple screen switcher */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 8, width: 160,
        background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.06)`,
        borderRadius: 16, padding: 14,
      }}>
        <div style={{ fontFamily: fontDisplay, color: C.rose, fontSize: 16, letterSpacing: 2.5, marginBottom: 6 }}>ONBASE</div>
        {[["welcome", "Welcome"], ["discover", "Listening Room"], ["pods", "Pods Hub"]].map(([id, label]) => (
          <div key={id} onClick={() => setScreen(id)} style={{
            padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13,
            background: screen === id ? `linear-gradient(90deg, ${C.coralDeep}, ${C.coral})` : "transparent",
            color: screen === id ? "#fff" : C.text, fontWeight: screen === id ? 600 : 400,
          }}>{label}</div>
        ))}
      </div>

      {/* phone */}
      <div style={{
        width: 390, height: 820, maxHeight: "94vh", borderRadius: 48,
        background: `linear-gradient(180deg, ${C.bg2}, ${C.bg})`, border: "10px solid #1a1416",
        boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(245,169,155,0.05)",
        overflow: "hidden", position: "relative", color: C.text, display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 26px 0", fontSize: 13, fontWeight: 500 }}>
          <span>9:41</span><span style={{ letterSpacing: 2 }}>▮▮ ⚡</span>
        </div>
        <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>
          {screens[screen]}
        </div>
        <div style={{ position: "absolute", bottom: 7, left: "50%", transform: "translateX(-50%)", width: 120, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.85)" }} />
      </div>
    </div>
  );
}
