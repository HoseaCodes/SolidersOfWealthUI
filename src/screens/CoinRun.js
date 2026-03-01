import { useState, useEffect, useRef, useCallback } from "react";
import GameEmbed from "../components/game/GameEmbed";

// ─── STYLES ────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Barlow+Condensed:ital,wght@0,300;0,400;0,600;0,700;0,900;1,400&family=Share+Tech+Mono&display=swap');

  :root {
    --gold: #F0B429;
    --gold-dim: #8B6914;
    --red: #E53E3E;
    --green: #38A169;
    --blue: #3182CE;
    --dark: #0A0A08;
    --dark2: #111110;
    --dark3: #1A1A16;
    --dark4: #252520;
    --border: rgba(240,180,41,0.2);
    --text: #E8E4D4;
    --muted: #7A7560;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    background: var(--dark);
    color: var(--text);
    font-family: 'Barlow Condensed', sans-serif;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.6;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--dark2); }
  ::-webkit-scrollbar-thumb { background: var(--gold-dim); }

  @keyframes gridPan {
    0% { transform: translate(0,0); }
    100% { transform: translate(60px, 60px); }
  }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes playerBob {
    0% { transform: translateY(0); }
    100% { transform: translateY(-4px); }
  }
  @keyframes floatCoin {
    0%, 100% { transform: translateY(0) rotate(0); opacity: 1; }
    50% { transform: translateY(-8px) rotate(15deg); opacity: 0.8; }
  }
  @keyframes obsMove {
    0% { transform: translateX(200px); opacity: 1; }
    100% { transform: translateX(-300px); opacity: 0; }
  }
  @keyframes gatePulse {
    0%, 100% { box-shadow: 0 0 8px currentColor; }
    50% { box-shadow: 0 0 24px currentColor; }
  }

  .sow-reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .sow-reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .sow-nav-link:hover { color: var(--gold) !important; }
  .sow-btn-primary:hover {
    background: #FFD060 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(240,180,41,0.3);
  }
  .sow-btn-secondary:hover {
    background: rgba(240,180,41,0.08) !important;
    transform: translateY(-2px);
  }
  .sow-nav-cta:hover { background: #FFD060 !important; transform: translateY(-1px); }
  .sow-mechanic-card:hover { background: var(--dark3) !important; }
  .sow-lb-row:hover { background: var(--dark4) !important; }
  .sow-vote-option:hover { background: var(--dark4) !important; }
  .sow-footer-link:hover { color: var(--gold) !important; }
  .sow-share-btn:hover { background: #FFD060 !important; }
  .sow-signup-input:focus { border-color: var(--gold) !important; }

  @media (max-width: 768px) {
    .sow-nav-links { display: none !important; }
    .sow-mechanics-grid { grid-template-columns: 1fr !important; }
    .sow-event-cards { grid-template-columns: 1fr !important; }
    .sow-counter-demo { grid-template-columns: 1fr !important; }
    .sow-vote-grid { grid-template-columns: 1fr !important; }
    .sow-loop-flow { flex-direction: column !important; }
    .sow-loop-step::after { display: none !important; }
    .sow-hero-stats { gap: 24px !important; }
    .sow-hero { padding: 100px 20px 60px !important; }
    .sow-gameplay, .sow-hud-section, .sow-share-section { padding: 60px 20px !important; }
  }
`;

// ─── DATA ──────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { sym: "CASH", val: "+$2,450", up: true },
  { sym: "DEBT", val: "-$800", up: false },
  { sym: "ASSETS", val: "+$12,000", up: true },
  { sym: "NET WORTH", val: "+$13,650", up: true },
  { sym: "INFLATION", val: "WAVE INCOMING", up: false },
  { sym: "MARKET", val: "BOOM ACTIVE", up: true },
  { sym: "PIONEER SEASON", val: "LIVE", up: true },
];

const MECHANICS = [
  { icon: "🪙", name: "Cash Coin", cls: "cash", color: "var(--gold)", desc: "Your most common pickup. Builds the liquid portion of your net worth. Stack them fast.", formula: "NET WORTH += CASH" },
  { icon: "📈", name: "Asset Block", cls: "asset", color: "var(--blue)", desc: "Blue collectibles representing real holdings — land, equity, yield-bearing instruments.", formula: "NET WORTH += ASSETS" },
  { icon: "💳", name: "Debt Token", cls: "debt", color: "var(--red)", desc: "Red pickups that drag your net worth down. Avoid or face the compound consequences.", formula: "NET WORTH -= DEBT" },
  { icon: "📄", name: "Bill Obstacle", cls: "bill", color: "var(--red)", desc: "Unexpected expenses hit your health directly. You have 3 lives — don't waste them on bills.", formula: "HP -= 1" },
  { icon: "🌊", name: "Inflation Wave", cls: "inflation", color: "#ED8936", desc: "The economy speeds up. Pickups spawn faster, but so do obstacles. Adapt or fall behind.", formula: "SPEED += MODIFIER" },
  { icon: "🚪", name: "Market Gate", cls: "event", color: "#9F7AEA", desc: "Choose BOOM for high risk / high reward. Choose CRASH for defensive play. Both paths matter.", formula: "→ BOOM / CRASH" },
];

const LEADERBOARD = [
  { rank: 1, avatar: "💰", name: "WealthWarrior", badge: "MARKET TITAN", event: "BOOM", score: "$148,220", top: "top-1" },
  { rank: 2, avatar: "⚔", name: "CashCommander", badge: null, event: "BOOM", score: "$131,750", top: "top-2" },
  { rank: 3, avatar: "📊", name: "AssetAlpha", badge: null, event: "CRASH", score: "$112,400", top: "top-3" },
  { rank: 4, avatar: "🛡", name: "MarketSurvivor", badge: null, event: "BOOM", score: "$98,100", top: "" },
  { rank: 5, avatar: "💎", name: "NetWorthNova", badge: null, event: "CRASH", score: "$84,650", top: "" },
];

const LOOP_STEPS = [
  { icon: "🏃", label: "RUN", sub: "Run fast" },
  { icon: "💰", label: "COLLECT", sub: "Cash & assets" },
  { icon: "⚡", label: "MARKET EVENT", sub: "Choose your gate" },
  { icon: "📊", label: "SCORE", sub: "Net worth tallied" },
  { icon: "🌐", label: "SHARE", sub: "Join the War Room" },
];

const FOUNDER_PERKS = [
  { icon: "🏅", text: "Founder Badge In-Game" },
  { icon: "🗳️", text: "Vote on Future Content" },
  { icon: "📣", text: "Weekly Top 50 Featured" },
  { icon: "🎨", text: "Submit Market Events" },
];

const EVENT_COLORS = { BOOM: "#38A169", CRASH: "#E53E3E", STABLE: "#F0B429" };

// ─── HOOKS ─────────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sow-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useCountUp(target, triggerRef) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let cur = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            cur = Math.min(cur + step, target);
            setVal(cur);
            if (cur >= target) clearInterval(timer);
          }, 30);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (triggerRef.current) obs.observe(triggerRef.current);
    return () => obs.disconnect();
  }, [target, triggerRef]);
  return val;
}

function useCountdown() {
  const [time, setTime] = useState("00:00:00");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
      next.setHours(0, 0, 0, 0);
      const diff = next - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function useLiveHUD() {
  const [hud, setHud] = useState({ cash: 18200, assets: 9500, debt: 3400, event: "BOOM", eventColor: "#38A169" });
  useEffect(() => {
    const id = setInterval(() => {
      setHud((prev) => {
        let { cash, assets, debt } = prev;
        if (Math.random() < 0.5) {
          cash += Math.floor(Math.random() * 800);
          assets += Math.floor(Math.random() * 400);
        } else {
          debt += Math.floor(Math.random() * 300);
          cash -= Math.floor(Math.random() * 200);
        }
        cash = Math.max(0, cash);
        debt = Math.max(0, debt);
        const evtKeys = Object.keys(EVENT_COLORS);
        const event = Math.random() < 0.1 ? evtKeys[Math.floor(Math.random() * evtKeys.length)] : prev.event;
        return { cash, assets, debt, event, eventColor: EVENT_COLORS[event] };
      });
    }, 1200);
    return () => clearInterval(id);
  }, []);
  const nw = hud.cash + hud.assets - hud.debt;
  return { ...hud, nw };
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

function Nav({ scrolled }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 40px",
      background: scrolled ? "rgba(10,10,8,0.97)" : "linear-gradient(to bottom, rgba(10,10,8,0.95), transparent)",
      borderBottom: `1px solid ${scrolled ? "rgba(240,180,41,0.2)" : "transparent"}`,
      transition: "border-color 0.3s, background 0.3s",
    }}>
      <a href="#top" style={{ fontFamily: "'Black Ops One', cursive", fontSize: 18, color: "var(--gold)", letterSpacing: 2, textDecoration: "none" }}>
        SOW <span style={{ color: "var(--text)", opacity: 0.5 }}>: COIN RUN</span>
      </a>
      <ul className="sow-nav-links" style={{ display: "flex", gap: 32, listStyle: "none" }}>
        {["#gameplay|Gameplay", "#leaderboard|Leaderboard", "#community|Community"].map((item) => {
          const [href, label] = item.split("|");
          return (
            <li key={href}>
              <a href={href} className="sow-nav-link" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--muted)", textDecoration: "none", transition: "color 0.2s" }}>
                {label}
              </a>
            </li>
          );
        })}
      </ul>
      <a href="#play" className="sow-nav-cta" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", background: "var(--gold)", color: "var(--dark)", border: "none", padding: "8px 20px", cursor: "pointer", fontWeight: 700, textDecoration: "none", transition: "background 0.2s, transform 0.15s" }}>
        Play Now
      </a>
    </nav>
  );
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ position: "absolute", top: 80, left: 0, right: 0, overflow: "hidden", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(240,180,41,0.03)", padding: "8px 0" }}>
      <div style={{ display: "flex", gap: 60, whiteSpace: "nowrap", animation: "ticker 30s linear infinite" }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--gold)" }}>{item.sym}</span>
            <span style={{ color: item.up ? "var(--green)" : "var(--red)" }}>{item.val}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CountUpStat({ target, label }) {
  const ref = useRef(null);
  const val = useCountUp(target, ref);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <span style={{ fontFamily: "'Black Ops One', cursive", fontSize: 36, color: "var(--gold)", display: "block" }}>{val}</span>
      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--muted)" }}>{label}</span>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="sow-hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", padding: "120px 40px 60px" }}>
      {/* Animated grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(240,180,41,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(240,180,41,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", animation: "gridPan 20s linear infinite" }} />
      {/* Glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, background: "radial-gradient(ellipse, rgba(240,180,41,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Ticker />

      <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: "var(--gold)", marginBottom: 20, position: "relative", animation: "fadeUp 0.8s ease both" }}>
        Season 0 · Pioneer Season · Now Live
      </p>
      <h1 style={{ fontFamily: "'Black Ops One', cursive", fontSize: "clamp(56px, 10vw, 120px)", lineHeight: 0.9, color: "var(--text)", textTransform: "uppercase", position: "relative", animation: "fadeUp 0.8s 0.15s ease both", letterSpacing: -2 }}>
        Soldiers<br />
        <span style={{ color: "var(--gold)", display: "block" }}>of Wealth</span>
        <span style={{ display: "block", fontSize: "clamp(28px, 5vw, 60px)", color: "var(--muted)", letterSpacing: 12, marginTop: 8 }}>COIN RUN</span>
      </h1>
      <p style={{ marginTop: 24, fontSize: 22, fontWeight: 300, letterSpacing: 4, color: "var(--text)", opacity: 0.7, animation: "fadeUp 0.8s 0.3s ease both", textTransform: "uppercase" }}>
        Run the Economy
      </p>
      <p style={{ marginTop: 12, fontSize: 16, maxWidth: 520, color: "var(--muted)", lineHeight: 1.6, animation: "fadeUp 0.8s 0.4s ease both", fontWeight: 300 }}>
        An endless runner where your survival is measured in net worth. Collect assets, dodge debt, and navigate market crashes to build your financial empire.
      </p>
      <div style={{ marginTop: 48, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s 0.5s ease both" }}>
        <a href="https://solider-of-wealth.web.app/" target="_blank" rel="noreferrer" className="sow-btn-primary" style={{ fontFamily: "'Black Ops One', cursive", fontSize: 16, letterSpacing: 3, background: "var(--gold)", color: "var(--dark)", border: "none", padding: "16px 40px", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.2s", clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
          ▶ Play Now
        </a>
        <a href="#community" className="sow-btn-secondary" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", background: "transparent", color: "var(--gold)", border: "1px solid var(--gold)", padding: "16px 32px", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.2s" }}>
          Join the War Room ↗
        </a>
      </div>
      <div className="sow-hero-stats" style={{ marginTop: 80, display: "flex", gap: 60, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.8s 0.65s ease both", position: "relative" }}>
        <CountUpStat target={3} label="Market Events" />
        <CountUpStat target={180} label="Seconds Per Run" />
        <CountUpStat target={5} label="Hazard Types" />
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "'Black Ops One', cursive", fontSize: 36, color: "var(--gold)", display: "block" }}>∞</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--muted)" }}>Net Worth Ceiling</span>
        </div>
      </div>
    </section>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="sow-reveal" style={{ display: "flex", alignItems: "center", gap: 20, padding: "0 40px", margin: "80px 0 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold-dim)" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );
}

function GamePreview({ hud }) {
  const nw = hud.cash + hud.assets - hud.debt;
  return (
    <div style={{ maxWidth: 900, margin: "60px auto 0", position: "relative" }}>
      <div style={{ background: "#0A0E14", border: "2px solid var(--border)", aspectRatio: "16/9", position: "relative", overflow: "hidden", clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
        {/* Grid bg */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(240,180,41,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(240,180,41,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Ground */}
        <div style={{ position: "absolute", bottom: "20%", left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #8B6914, #F0B429, #8B6914, transparent)", opacity: 0.4 }} />
        {/* Player */}
        <div style={{ position: "absolute", bottom: "calc(20% + 2px)", left: "15%", width: 32, height: 48, animation: "playerBob 0.4s ease-in-out infinite alternate" }}>
          <div style={{ width: "100%", height: "100%", background: "var(--gold)", clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚔</div>
        </div>
        {/* Coins */}
        <div style={{ position: "absolute", bottom: "32%", left: "35%", fontSize: 20, animation: "floatCoin 2s ease-in-out infinite" }}>🪙</div>
        <div style={{ position: "absolute", bottom: "40%", left: "55%", fontSize: 16, animation: "floatCoin 2s ease-in-out infinite 0.5s" }}>📈</div>
        <div style={{ position: "absolute", bottom: "34%", left: "72%", fontSize: 20, animation: "floatCoin 2s ease-in-out infinite 1s" }}>🪙</div>
        {/* Obstacles */}
        <div style={{ position: "absolute", bottom: "calc(20% + 2px)", right: "20%", fontSize: 28, animation: "obsMove 3s linear infinite" }}>📄</div>
        <div style={{ position: "absolute", bottom: "calc(20% + 2px)", right: "50%", fontSize: 28, animation: "obsMove 4.5s linear infinite 1.5s" }}>💸</div>
        {/* Gate */}
        <div style={{ position: "absolute", bottom: "20%", right: "30%", display: "flex", gap: 16 }}>
          {[{ label: "BOOM", color: "var(--green)", bg: "rgba(56,161,105,0.2)" }, { label: "CRASH", color: "var(--red)", bg: "rgba(229,62,62,0.2)" }].map((g) => (
            <div key={g.label} style={{ width: 48, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Black Ops One', cursive", fontSize: 11, letterSpacing: 1, background: g.bg, border: `2px solid ${g.color}`, color: g.color, animation: "gatePulse 2s ease-in-out infinite" }}>
              {g.label}
            </div>
          ))}
        </div>
        {/* HUD overlay */}
        <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between" }}>
          {[
            { label: "Net Worth", val: `$${nw.toLocaleString()}`, color: "var(--gold)" },
            { label: "Market", val: hud.event, color: hud.eventColor },
            { label: "Health", val: "❤❤❤", color: "var(--red)" },
          ].map((item) => (
            <div key={item.label} style={{ background: "rgba(10,10,8,0.8)", border: "1px solid var(--border)", padding: "6px 14px" }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 16, color: item.color }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoopFlow() {
  return (
    <div className="sow-loop-flow" style={{ display: "flex", alignItems: "center", gap: 0, margin: "60px 0", overflowX: "auto", paddingBottom: 10 }}>
      {LOOP_STEPS.map((step, i) => (
        <div key={step.label} className="sow-loop-step" style={{ flex: 1, minWidth: 120, textAlign: "center", padding: "24px 16px", background: "var(--dark3)", border: "1px solid var(--border)", position: "relative" }}>
          {i < LOOP_STEPS.length - 1 && (
            <span style={{ position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "var(--gold)", zIndex: 2, background: "var(--dark)", padding: "0 4px" }}>→</span>
          )}
          <div style={{ fontSize: 32, marginBottom: 8 }}>{step.icon}</div>
          <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 13, letterSpacing: 2, color: "var(--gold)" }}>{step.label}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, letterSpacing: 1 }}>{step.sub}</div>
        </div>
      ))}
    </div>
  );
}

function MechanicsGrid() {
  return (
    <div className="sow-mechanics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, background: "var(--border)" }}>
      {MECHANICS.map((m) => (
        <div key={m.name} className="sow-mechanic-card" style={{ background: "var(--dark2)", padding: 32, transition: "background 0.2s" }}>
          <span style={{ fontSize: 36, marginBottom: 16, display: "block" }}>{m.icon}</span>
          <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 18, letterSpacing: 2, marginBottom: 8, color: m.color }}>{m.name}</div>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{m.desc}</p>
          <div style={{ marginTop: 12, fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "var(--gold-dim)", letterSpacing: 2 }}>{m.formula}</div>
        </div>
      ))}
    </div>
  );
}

function MarketEvents() {
  const events = [
    {
      type: "boom", label: "Bull Run Activated", title: "BOOM", titleColor: "var(--green)", accentColor: "#38A169",
      effects: [
        { icon: "📈", text: "Increased reward spawn rate — assets and cash flood the lane" },
        { icon: "⚠️", text: "Elevated obstacle frequency — the market punishes the careless" },
        { icon: "💥", text: "High ceiling, high variance — for the aggressive wealth builder" },
        { icon: "🎯", text: "Best path for leaderboard runs when executing cleanly" },
      ],
    },
    {
      type: "crash", label: "Bear Market Incoming", title: "CRASH", titleColor: "var(--red)", accentColor: "#E53E3E",
      effects: [
        { icon: "📉", text: "Reduced reward spawn rate — the market contracts sharply" },
        { icon: "🛡️", text: "Fewer obstacles — room to breathe and survive longer" },
        { icon: "⏱️", text: "Preservation play — protect health, outlast the downturn" },
        { icon: "🧠", text: "Strategic choice when health is low or speed is too high" },
      ],
    },
  ];
  return (
    <section id="events" style={{ padding: "80px 40px", background: "var(--dark2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="sow-reveal" style={{ marginBottom: 60 }}>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Market Conditions</p>
          <h2 style={{ fontFamily: "'Black Ops One', cursive", fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1, textTransform: "uppercase" }}>Choose Your Fate</h2>
        </div>
        <div className="sow-event-cards sow-reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "var(--border)" }}>
          {events.map((ev) => (
            <div key={ev.type} style={{ padding: 48, position: "relative", overflow: "hidden", background: `linear-gradient(135deg, var(--dark2) 0%, ${ev.accentColor}0f 100%)`, borderTop: `3px solid ${ev.accentColor}` }}>
              <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 5, textTransform: "uppercase", marginBottom: 16, color: ev.accentColor }}>{ev.label}</p>
              <h3 style={{ fontFamily: "'Black Ops One', cursive", fontSize: 40, letterSpacing: 3, marginBottom: 24, color: ev.titleColor }}>{ev.title}</h3>
              <ul style={{ listStyle: "none" }}>
                {ev.effects.map((eff, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 15, color: "var(--muted)", padding: "10px 0", borderBottom: i < ev.effects.length - 1 ? "1px solid var(--border)" : "none", letterSpacing: 1 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>{eff.icon}</span>
                    {eff.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HUDSection({ hud }) {
  const nw = hud.cash + hud.assets - hud.debt;
  return (
    <section id="score" className="sow-hud-section" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div className="sow-reveal" style={{ marginBottom: 60 }}>
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Net Worth Formula</p>
        <h2 style={{ fontFamily: "'Black Ops One', cursive", fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1, textTransform: "uppercase" }}>How You're Scored</h2>
      </div>
      <div className="sow-reveal" style={{ background: "var(--dark3)", border: "1px solid var(--border)", padding: 40, clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>Health</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {[true, true, false].map((filled, i) => (
                <div key={i} style={{ width: 16, height: 16, background: filled ? "var(--red)" : "var(--dark4)", clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }} />
              ))}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, letterSpacing: 3, color: "var(--muted)", marginBottom: 8 }}>NET WORTH =</div>
            <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 18, color: "var(--gold)", letterSpacing: 4 }}>CASH + ASSETS − DEBT</div>
          </div>
          <div style={{ background: "rgba(56,161,105,0.1)", border: "1px solid var(--green)", padding: "8px 20px", textAlign: "right" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 4, color: "var(--muted)", marginBottom: 4 }}>Active Event</div>
            <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 20, color: hud.eventColor, letterSpacing: 2 }}>▲ {hud.event}</div>
          </div>
        </div>
        <div className="sow-counter-demo" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, background: "var(--border)" }}>
          {[
            { label: "Cash", val: `$${hud.cash.toLocaleString()}`, color: "var(--gold)" },
            { label: "Assets", val: `$${hud.assets.toLocaleString()}`, color: "var(--blue)" },
            { label: "Debt", val: `$${hud.debt.toLocaleString()}`, color: "var(--red)" },
          ].map((item) => (
            <div key={item.label} style={{ background: "var(--dark2)", padding: 24, textAlign: "center" }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: item.color, marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 28, color: item.color }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Leaderboard({ countdown }) {
  return (
    <section id="leaderboard" style={{ padding: "80px 40px", background: "var(--dark2)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="sow-reveal" style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Season 0</p>
          <h2 style={{ fontFamily: "'Black Ops One', cursive", fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1, textTransform: "uppercase" }}>Leaderboard</h2>
        </div>
        {/* Season banner */}
        <div className="sow-reveal" style={{ background: "linear-gradient(90deg, var(--dark3), var(--dark4))", border: "1px solid var(--border)", borderLeft: "4px solid var(--gold)", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 4, color: "var(--gold-dim)", marginBottom: 4 }}>Current Season</div>
            <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 28, color: "var(--gold)", letterSpacing: 3 }}>PIONEER SEASON</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 4, color: "var(--muted)", marginBottom: 4 }}>Weekly Reset</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 24, color: "var(--text)" }}>{countdown}</div>
          </div>
        </div>
        {/* Header */}
        <div className="sow-reveal" style={{ display: "grid", gridTemplateColumns: "48px 1fr 160px 160px", padding: "10px 24px", background: "var(--dark)" }}>
          {["#", "Player", "Event Path", "Net Worth"].map((h, i) => (
            <div key={h} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--muted)", textAlign: i === 3 ? "right" : "left" }}>{h}</div>
          ))}
        </div>
        {LEADERBOARD.map((row) => {
          const rankColors = { "top-1": "var(--gold)", "top-2": "#B0B0A0", "top-3": "#C87850" };
          const rowBgs = { "top-1": "linear-gradient(90deg, rgba(240,180,41,0.08), var(--dark3))", "top-2": "linear-gradient(90deg, rgba(200,200,200,0.04), var(--dark3))", "top-3": "linear-gradient(90deg, rgba(180,100,50,0.06), var(--dark3))", "": "var(--dark3)" };
          return (
            <div key={row.rank} className="sow-lb-row sow-reveal" style={{ display: "grid", gridTemplateColumns: "48px 1fr 160px 160px", alignItems: "center", padding: "16px 24px", background: rowBgs[row.top], borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}>
              <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: row.top ? 18 : 14, color: rankColors[row.top] || "var(--muted)" }}>{row.rank}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: "var(--dark)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>{row.avatar}</div>
                <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1 }}>{row.name}</span>
                {row.badge && <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: 2, background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.3)", color: "var(--gold)", padding: "2px 8px", marginLeft: 8 }}>{row.badge}</span>}
              </div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 2, color: row.event === "BOOM" ? "var(--green)" : "var(--red)" }}>
                {row.event === "BOOM" ? "▲" : "▼"} {row.event}
              </div>
              <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 20, color: "var(--gold)", textAlign: "right" }}>{row.score}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VoteWidget() {
  const [votes, setVotes] = useState([62, 38]);
  const [voted, setVoted] = useState(false);

  const castVote = (idx) => {
    if (voted) return;
    setVoted(true);
    setVotes(idx === 0 ? [67, 33] : [33, 67]);
  };

  const options = [
    { title: "LIQUIDITY FREEZE", desc: "All players lose 10% cash flow for 1 round. Hoarded cash becomes a liability." },
    { title: "ASSET SEIZURE", desc: "Debt doubles in effect for 10 seconds. High-asset players feel the pinch hardest." },
  ];

  return (
    <section id="community" style={{ padding: "80px 40px", background: "var(--dark2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <div className="sow-reveal">
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Player-Driven Design</p>
          <h2 style={{ fontFamily: "'Black Ops One', cursive", fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1, textTransform: "uppercase" }}>Vote on the Next Event</h2>
          <p style={{ color: "var(--muted)", fontSize: 16, letterSpacing: 1, marginTop: 16 }}>Your vote shapes the game. The winning event gets added and you get credited as designer.</p>
        </div>
        <div className="sow-vote-grid sow-reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "var(--border)", marginTop: 48, textAlign: "left" }}>
          {options.map((opt, i) => (
            <div key={opt.title} className="sow-vote-option" onClick={() => castVote(i)}
              style={{ background: voted && votes[i] > 50 ? "linear-gradient(135deg, var(--dark3), rgba(240,180,41,0.06))" : "var(--dark3)", padding: "28px 32px", cursor: voted ? "default" : "pointer", transition: "background 0.15s", borderTop: voted && votes[i] > 50 ? "2px solid var(--gold)" : "2px solid transparent" }}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 4, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>Community Submission</div>
              <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 20, letterSpacing: 2, color: "var(--text)", marginBottom: 12 }}>{opt.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{opt.desc}</div>
              <div style={{ marginTop: 16, background: "var(--dark)", height: 4 }}>
                <div style={{ height: 4, background: "var(--gold)", width: `${votes[i]}%`, transition: "width 0.8s ease" }} />
              </div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "var(--gold)", marginTop: 6, letterSpacing: 2 }}>{votes[i]}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShareCard() {
  return (
    <section id="share" className="sow-share-section" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div className="sow-reveal">
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Virality Layer</p>
        <h2 style={{ fontFamily: "'Black Ops One', cursive", fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1, textTransform: "uppercase" }}>Your Net Worth Card</h2>
        <p style={{ color: "var(--muted)", fontSize: 16, letterSpacing: 1, marginTop: 16, maxWidth: 500 }}>After each run, share your score to unlock exclusive cosmetics. Flex your net worth. Build the community.</p>
      </div>
      <div className="sow-reveal" style={{ maxWidth: 480, margin: "60px auto 0", background: "var(--dark3)", border: "1px solid var(--border)", padding: 48, textAlign: "center", clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))" }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 6, color: "var(--gold-dim)", textTransform: "uppercase", marginBottom: 24 }}>SOLDIERS OF WEALTH · PIONEER SEASON</div>
        <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 28, color: "var(--text)", letterSpacing: 4, marginBottom: 8 }}>MARKET TITAN</div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 4, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>Final Net Worth</div>
        <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 64, color: "var(--gold)", lineHeight: 1, marginBottom: 32 }}>$84,220</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, borderTop: "1px solid var(--border)", paddingTop: 24, marginBottom: 32 }}>
          {[{ label: "Cash", val: "$48K", color: "var(--gold)" }, { label: "Assets", val: "$52K", color: "var(--blue)" }, { label: "Debt", val: "$16K", color: "var(--red)" }].map((item) => (
            <div key={item.label}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 18, color: item.color }}>{item.val}</div>
            </div>
          ))}
        </div>
        <button className="sow-share-btn" style={{ fontFamily: "'Black Ops One', cursive", fontSize: 14, letterSpacing: 3, background: "var(--gold)", color: "var(--dark)", border: "none", padding: "14px 32px", cursor: "pointer", width: "100%", transition: "background 0.2s" }}>
          Share to Unlock Crash Survivor Skin
        </button>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 2, color: "var(--muted)", marginTop: 12, textTransform: "uppercase" }}>Cosmetic only · No gameplay gating · Ethical unlock</div>
      </div>
    </section>
  );
}

function FounderCTA() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("Join Discord · Get Early Access · Earn Pioneer Tag");
  const [msgColor, setMsgColor] = useState("var(--muted)");

  const handleSignup = () => {
    if (email && email.includes("@")) {
      setMsg("✓ You're enlisted, Commander. Welcome to the War Room.");
      setMsgColor("var(--green)");
      setEmail("");
    } else {
      setMsg("⚠ Enter a valid email to join the War Room.");
      setMsgColor("var(--red)");
    }
  };

  return (
    <section id="play" style={{ padding: "120px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 1000, height: 600, background: "radial-gradient(ellipse, rgba(240,180,41,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
      <h2 className="sow-reveal" style={{ fontFamily: "'Black Ops One', cursive", fontSize: "clamp(36px, 6vw, 80px)", lineHeight: 1, textTransform: "uppercase", marginBottom: 24 }}>
        Join the<br /><em style={{ display: "block", color: "var(--gold)", fontStyle: "normal" }}>War Room</em>
      </h2>
      <p className="sow-reveal" style={{ fontSize: 18, color: "var(--muted)", maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7, fontWeight: 300 }}>
        Founders get early access, in-game credits, and permanent recognition in Soldiers of Wealth. This is Season 0 — the Pioneer window won't last.
      </p>
      <div className="sow-reveal" style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
        {FOUNDER_PERKS.map((p) => (
          <div key={p.text} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--dark3)", border: "1px solid var(--border)", padding: "10px 20px", fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text)" }}>
            <span style={{ color: "var(--gold)" }}>{p.icon}</span> {p.text}
          </div>
        ))}
      </div>
      <div className="sow-reveal" style={{ display: "flex", gap: 0, maxWidth: 500, margin: "0 auto", justifyContent: "center" }}>
        <input
          type="email"
          className="sow-signup-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSignup()}
          placeholder="commander@email.com"
          style={{ flex: 1, background: "var(--dark3)", border: "1px solid var(--border)", borderRight: "none", padding: "14px 20px", fontFamily: "'Share Tech Mono', monospace", fontSize: 12, letterSpacing: 2, color: "var(--text)", outline: "none", transition: "border-color 0.2s" }}
        />
        <button onClick={handleSignup} style={{ fontFamily: "'Black Ops One', cursive", fontSize: 13, letterSpacing: 2, background: "var(--gold)", color: "var(--dark)", border: "none", padding: "14px 28px", cursor: "pointer", transition: "background 0.2s" }}>
          ENLIST
        </button>
      </div>
      <p className="sow-reveal" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 2, color: msgColor, marginTop: 16, textTransform: "uppercase", transition: "color 0.3s" }}>
        {msg}
      </p>
    </section>
  );
}

function Footer() {
  const links = [
    { title: "Play", items: [{ label: "Play Now", href: "https://solider-of-wealth.web.app/" }, { label: "Leaderboard", href: "#leaderboard" }, { label: "Market Events", href: "#events" }] },
    { title: "Community", items: [{ label: "Join Discord", href: "#" }, { label: "Vote on Features", href: "#community" }, { label: "Submit Event Ideas", href: "#community" }] },
    { title: "Studio", items: [{ label: "Asperia Games", href: "https://asperiagames.com/" }, { label: "Ambitious Concepts LLC", href: "#" }] },
  ];
  return (
    <footer style={{ padding: "60px 40px 40px", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Black Ops One', cursive", fontSize: 22, color: "var(--gold)", letterSpacing: 3, marginBottom: 8 }}>SOLDIERS OF WEALTH</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 4, color: "var(--muted)", textTransform: "uppercase" }}>Coin Run · Season 0 · Pioneer</div>
          </div>
          {links.map((group) => (
            <div key={group.title}>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "var(--gold-dim)", marginBottom: 16 }}>{group.title}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="sow-footer-link" style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase" }}>© 2025 Ambitious Concepts LLC · All Rights Reserved</div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: 3, color: "var(--muted)", textTransform: "uppercase" }}>
            Developed by <a href="https://asperiagames.com/" target="_blank" rel="noreferrer" style={{ color: "var(--gold)", textDecoration: "none" }}>Asperia Games</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function CoinRun() {
  const [scrolled, setScrolled] = useState(false);
  const hud = useLiveHUD();
  const countdown = useCountdown();

  // Inject global CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Scroll listener for nav
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Scroll reveal observer
  useScrollReveal();

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)", color: "var(--text)" }}>
      <Nav scrolled={scrolled} />
      <Hero />
      <SectionDivider label="Game Mechanics" />
      <section id="gameplay" className="sow-gameplay" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="sow-reveal" style={{ marginBottom: 60 }}>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>How to Play</p>
          <h2 style={{ fontFamily: "'Black Ops One', cursive", fontSize: "clamp(32px, 5vw, 64px)", lineHeight: 1, textTransform: "uppercase" }}>The Core Loop</h2>
        </div>
        {/* <div className="sow-reveal"><GamePreview hud={hud} /></div> */}
        <div className="sow-reveal"><GameEmbed hud={hud} /></div>
        <div className="sow-reveal"><LoopFlow /></div>
        <div className="sow-reveal"><MechanicsGrid /></div>
      </section>
      <MarketEvents />
      <HUDSection hud={hud} />
      <SectionDivider label="Pioneer Season" />
      <Leaderboard countdown={countdown} />
      <VoteWidget />
      <ShareCard />
      <FounderCTA />
      <Footer />
    </div>
  );
}