import { useState, useEffect, useRef } from "react";

const HASH_TARGET = "1f91efbaa250a0e2d7113f820e7f2160fe067e02e8a6c1832d4f8f623dc6c041";
const HASH_TARGET_2 = "236b2e7f58a3b1cf9eaf69d1bd40706153cc72c055f1c57cc82a8763320c1270";

interface GhostNodeProps {
  fragment: string;
  index: number;
}

// Composant fantôme — jamais affiché, mais présent dans le DOM React
// Le joueur doit inspecter le source ou les props React DevTools
function GhostNode({ fragment, index }: GhostNodeProps) {
  return (
    <span
      data-ghost-index={index}
      data-fragment={fragment}
      aria-hidden="true"
      style={{ display: "none", visibility: "hidden", pointerEvents: "none" }}
    />
  );
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

// Particules de poussière animées
function DustParticles() {
  const particles: Particle[] = Array.from({ length: 38 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 8 + Math.random() * 16,
    size: 1 + Math.random() * 2.5,
    opacity: 0.08 + Math.random() * 0.18,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {particles.map((p) => (
        <>
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}%`,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              background: `rgba(180,160,120,${p.opacity})`,
              animation: `dustRise ${p.duration}s ${p.delay}s infinite linear`,
            }}
          />
        </>
      ))}
    </div>
  );
}

interface GlitchTextProps {
  text: string;
}

function GlitchText({ text }: GlitchTextProps) {
  const [display, setDisplay] = useState<string>(text);
  const chars = "░▒▓█▄▀■□▪▫";
  useEffect(() => {
    let frame: number;
    let tick = 0;
    const animate = () => {
      tick++;
      if (tick % 18 === 0) {
        const idx = Math.floor(Math.random() * text.length);
        const arr = text.split("");
        arr[idx] = chars[Math.floor(Math.random() * chars.length)];
        setDisplay(arr.join(""));
        setTimeout(() => setDisplay(text), 80);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [text]);
  return <span>{display}</span>;
}

interface TerminalLogProps {
  lines: string[];
}

// Log terminal animé
function TerminalLog({ lines }: TerminalLogProps) {
  const [visible, setVisible] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lines.forEach((line, i) => {
      setTimeout(() => setVisible((v) => [...v, line]), i * 420 + 300);
    });
  }, [lines]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visible]);

  return (
    <div
      ref={scrollRef}
      style={{
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        color: "#5a5040",
        lineHeight: 1.9,
        marginBottom: "2rem",
        maxHeight: "220px",
        overflowY: "auto",
        paddingRight: "10px",
        scrollbarWidth: "none",
      }}
    >
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
      {visible.map((l, i) => (
        <div key={i} style={{ opacity: 0, animation: `fadeIn 0.3s forwards` }}>
          <span style={{ color: "#3a3028", marginRight: "8px" }}>[sys]</span>{l}
        </div>
      ))}
    </div>
  );
}

function SandStorm() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 2,
    duration: 1 + Math.random() * 1.5,
  }));

  return (
    <div className="sand-storm">
      {particles.map((p) => (
        <div
          key={p.id}
          className="sand-particle"
          style={{
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function App() {
  const [input, setInput] = useState<string>("");
  const [status, setStatus] = useState<'correct' | 'wrong' | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [shake, setShake] = useState<boolean>(false);
  const [booted, setBooted] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [level1Cleared, setLevel1Cleared] = useState<boolean>(false);
  const [finalSuccess, setFinalSuccess] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "sys-theme";

    style.textContent = `:root { --sys-id: "_n3v3r"; --sys-build: "0.0.1-dust"; }`;
    document.head.appendChild(style);
    setTimeout(() => setBooted(true), 200);
    return () => style.remove();
  }, []);

  const verify = async () => {
    const h = await sha256(input.trim());
    setAttempts((a) => a + 1);

    if (level === 1) {
      if (h === HASH_TARGET) {
        setStatus("correct");
        setLevel1Cleared(true);
        localStorage.setItem("sys_kernel_key", "SFYRISEC{clarity_at_last}");
        setTimeout(() => {
          setLevel(2);
          setInput("");
          setStatus(null);
        }, 3000);
      } else {
        setStatus("wrong");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } else if (level === 2) {
      if (h === HASH_TARGET_2) {
        setFinalSuccess(true);
        setStatus("correct");
      } else {
        setStatus("wrong");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  const logLines = level === 1 ? [
    "BOOT: legacy_bios v4.2.0 (build 1998) initializing...",
    "MEMORY: 640KB detected... attempting high-mem bypass",
    "HARDWARE: cooling_fan (ID: 02) is jammed by particulate matter",
    "SENSOR: atmospheric pressure high / dust density @ 84%",
    "RECOVERING: scanning UI-layers for data-drifts...",
    "FOUND: fragment_01 (b64) located in ghost_props",
    "FOUND: fragment_02 (css) located in root_vars",
    "FOUND: fragment_03 (dom) located in shadow_attr",
    "WARNING: system is unstable — reconstruction limited",
    "READY: awaiting string to stabilize the lattice"
  ] : [
    "AUTH: level_1 cleared — lattice alignment stabilized",
    "VAULT: 'sys_kernel_key' has been inscribed in [LOCAL] place",
    "CRITICAL: internal thermal surge detected",
    "PROCESS: initiating emergency heatsink purge...",
    "EVENT: mechanical drive (SATA_0) grinding... seeking sector",
    "SIGNAL: re-aligning rusted antenna... 42Hz lock-on [STABLE]",
    "STORAGE: accessing hidden partition in local_vault...",
    "KERNEL: total clearance requires the final hash sequence",
    "NOTICE: the wind is howling outside. don't let the signal fade",
    "AWAITING: final authorization code from the machine's memory..."
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Cinzel:wght@400;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #0c0a08;
          min-height: 100vh;
        }

        @keyframes dustRise {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? "" : "-"}${Math.floor(Math.random() * 60)}px); opacity: 0; }
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }

        @keyframes scanline {
          0%   { top: -10%; }
          100% { top: 110%; }
        }

        @keyframes flicker {
          0%,100% { opacity: 1; }
          92%     { opacity: 1; }
          93%     { opacity: 0.85; }
          94%     { opacity: 1; }
          96%     { opacity: 0.9; }
          97%     { opacity: 1; }
        }

        @keyframes cursorBlink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }

        @keyframes correctPulse {
          0%   { box-shadow: 0 0 0px #b8960020; }
          50%  { box-shadow: 0 0 32px #b8960060; }
          100% { box-shadow: 0 0 0px #b8960020; }
        }

        @keyframes sandBlow {
          0% { transform: translateX(-100%) translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateX(200%) translateY(-20px) rotate(360deg); opacity: 0; }
        }

        @keyframes messageAppear {
          from { opacity: 0; transform: scale(0.9); filter: blur(10px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }

        .sand-storm {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 200;
          overflow: hidden;
        }

        .sand-particle {
          position: absolute;
          background: rgba(184, 150, 0, 0.4);
          border-radius: 50%;
          animation: sandBlow 2s linear infinite;
        }

        .success-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(12, 10, 8, 0.8);
          z-index: 210;
          backdrop-filter: blur(4px);
          animation: fadeIn 1s forwards;
        }

        .success-content {
          text-align: center;
          animation: messageAppear 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .success-text {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          color: #b89600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          text-shadow: 0 0 20px rgba(184, 150, 0, 0.5);
        }

        .dust-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          font-family: 'Share Tech Mono', monospace;
          animation: flicker 8s infinite;
          z-index: 1;
        }

        .scanline {
          position: fixed;
          left: 0; right: 0;
          height: 3px;
          background: rgba(255,240,180,0.03);
          animation: scanline 6s linear infinite;
          pointer-events: none;
          z-index: 100;
        }

        .grain {
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }

        .panel {
          width: 100%;
          max-width: 560px;
          background: rgba(16,12,8,0.92);
          border: 1px solid #2a2218;
          border-top: 1px solid #3a3020;
          padding: 2.5rem 2rem;
          position: relative;
        }

        .panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #6a5830, transparent);
        }

        .title {
          font-family: 'Cinzel', serif;
          font-size: 3.5rem;
          font-weight: 600;
          letter-spacing: 0.5em;
          color: #b89600;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
          filter: blur(0.3px);
        }

        .subtitle {
          font-size: 10px;
          letter-spacing: 0.3em;
          color: #3a3020;
          text-transform: uppercase;
          margin-bottom: 2.5rem;
        }

        .flag-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid #3a3020;
          color: #c8a840;
          font-family: 'Share Tech Mono', monospace;
          font-size: 14px;
          padding: 0.6rem 0;
          outline: none;
          letter-spacing: 0.05em;
          transition: border-color 0.2s;
          caret-color: #b89600;
        }

        .flag-input:focus { border-bottom-color: #6a5030; }
        .flag-input::placeholder { color: #2a2018; }

        .flag-input-wrap {
          position: relative;
          margin-bottom: 1.25rem;
          animation: ${shake ? "shake 0.4s ease" : "none"};
        }

        .flag-input-wrap::after {
          content: '';
          position: absolute;
          right: 0; bottom: 0;
          width: 6px; height: 12px;
          background: #b89600;
          animation: cursorBlink 1s infinite;
        }

        .submit-btn {
          background: transparent;
          border: 1px solid #3a3020;
          color: #6a5030;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          padding: 0.5rem 1.5rem;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s;
          width: 100%;
        }

        .submit-btn:hover {
          border-color: #b89600;
          color: #b89600;
        }

        .status-correct {
          margin-top: 1.5rem;
          color: #b89600;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-align: center;
          animation: correctPulse 2s infinite;
          padding: 1rem;
          border: 1px solid #b8960030;
        }

        .status-wrong {
          margin-top: 1rem;
          color: #5a2020;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-align: center;
        }

        .divider {
          border: none;
          border-top: 1px solid #1e1810;
          margin: 1.5rem 0;
        }

        .hint-text {
          font-size: 10px;
          color: #2a2018;
          letter-spacing: 0.1em;
          line-height: 1.8;
        }

        .attempts {
          position: absolute;
          top: 1rem; right: 1rem;
          font-size: 9px;
          color: #2a2018;
          letter-spacing: 0.1em;
        }
      `}</style>

      <div className="grain" />
      <div className="scanline" />
      <DustParticles />
      {finalSuccess && <SandStorm />}

      <div
        id="sys-recovery-node"
        data-sys-token="_s3ttl3s}"
        data-sys-status="fragment_recovered"
        aria-hidden="true"
        style={{ display: "none" }}
      />

      <div className="dust-root">
        <div className="panel">
          <div className="attempts">
            {attempts > 0 && `attempts: ${attempts}`}
          </div>

          <div className="title">
            <GlitchText text="dust" />
          </div>
          <div className="subtitle">system recovery terminal — v0.0.1</div>

          {booted && (
            <TerminalLog lines={logLines} />
          )}

          <hr className="divider" />

          <div className="flag-input-wrap" style={{ animation: shake ? "shake 0.4s ease" : "none" }}>
            <input
              ref={inputRef}
              className="flag-input"
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setStatus(null); }}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              placeholder={level === 1 ? "SFYRISEC{...}" : "KERNEL_KEY{...}"}
              autoComplete="off"
              spellCheck={false}
            />
            <GhostNode fragment="U0ZZUklTRUN7ZHU1dA==" index={0} />
          </div>

          <button className="submit-btn" onClick={verify}>
            &gt; {level === 1 ? "submit_flag" : "authorize_clearance"}
          </button>

          {(status === "correct" || level1Cleared) && !finalSuccess && (
            <div className="status-correct" style={{ marginTop: '1.5rem' }}>
              ONE FRAGMENT AUTHENTICATED<br />
              <span style={{ fontSize: "10px", opacity: 0.6, display: "block", marginTop: "0.5rem" }}>
                One more key to get the system back in clearance.
              </span>
            </div>
          )}

          {finalSuccess && (
            <div className="success-overlay">
              <div className="success-content">
                <div className="success-text">Congrats you've seen clear in this dust</div>
                <div style={{ color: "#b89600", fontSize: "12px", letterSpacing: "0.2em", opacity: 0.8 }}>
                  ✓ SYSTEM FULLY RECOVERED
                </div>
              </div>
            </div>
          )}

          {status === "wrong" && (
            <div className="status-wrong">
              ✗ authentication failed — the dust remains
            </div>
          )}

          <hr className="divider" />
        </div>
      </div>
    </>
  );
}