import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { clamp, easeOutCubic, lerp, pinProgress, range } from "../lib/math";
import { onFrame } from "../lib/scroll";

// The hero. Layers are stacked and pinned; one scroll range moves each at its
// own rate, so depth comes from layers sliding past each other.
//   0.00 - 0.18  a fog of look-alike package names drifts off the screen
//   0.04 - 0.50  the shield rises from behind the horizon
//   0.08 - 0.24  the title resolves, then yields to the terminal
//   0.30 - 0.62  the terminal rises and the scan prints its verdict
//   0.70 - 1.00  everything lifts away and fades into the page below
const STAGE_VH = 420;
const TOKENS = ["expresss", "lodahs", "raect", "axois", "momnet", "chalk-js", "crossenv", "colour", "reqeusts", "expres", "lodash", "express"];

export function Hero() {
  const rootRef = useRef(null);
  const L = useRef({});
  const veilRef = useRef(null);
  const fogRef = useRef(null);
  const titleRef = useRef(null);
  const hudRef = useRef(null);
  const clockRef = useRef(null);
  const riskRef = useRef(null);
  const checkRef = useRef(null);
  const lineRefs = useRef([]);
  const fadeRef = useRef(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    const c = fogRef.current;
    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = fogRef.current;
    const ctx = canvas.getContext("2d");
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const motes = Array.from({ length: 46 }, (_, i) => ({
      t: TOKENS[i % TOKENS.length], x: rand(), y: rand(), s: 0.3 + rand(), a: 0.15 + rand() * 0.45, f: 11 + rand() * 12,
    }));
    let lastP = -1;
    let lastTime = 0;

    const set = (name, y, scale = 1, opacity = 1) => {
      const el = L.current[name];
      if (!el) return;
      el.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
      el.style.opacity = String(opacity);
    };

    return onFrame((time) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 1 / 60;
      lastTime = time;
      const root = rootRef.current;
      if (!root) return;
      const { p, rect } = pinProgress(root);
      if (rect.bottom < 0) return;

      const veil = 1 - range(p, 0, 0.18);
      if (veil > 0.001) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const dpr = canvas.width / Math.max(1, w);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#cfe0ff";
        for (const m of motes) {
          if (!reducedRef.current) {
            m.x += 0.006 * m.s * dt;
            m.y -= 0.004 * m.s * dt;
            if (m.x > 1) m.x -= 1;
            if (m.y < 0) m.y += 1;
          }
          ctx.globalAlpha = m.a * veil;
          ctx.font = `${m.f * (1 + p * 2)}px "IBM Plex Mono", monospace`;
          ctx.fillText(m.t, m.x * w, (m.y - p * 0.6) * h);
        }
        ctx.globalAlpha = 1;
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const exit = range(p, 0.7, 1);
      const settle = easeOutCubic(range(p, 0, 0.5));

      veilRef.current.style.opacity = String(veil);
      veilRef.current.style.transform = `translate3d(0, ${-range(p, 0, 0.18) * 24}vh, 0) scale(${1 + range(p, 0, 0.18) * 0.25})`;
      canvas.style.opacity = String(veil);

      set("sky", lerp(0, -6, p), lerp(1.12, 1, settle));
      const grid = L.current.grid;
      if (grid) {
        grid.style.opacity = String(1 - exit);
        grid.style.backgroundPosition = `0 ${p * 900}px`;
      }
      const rise = easeOutCubic(range(p, 0.04, 0.5));
      set("shield", lerp(34, 4, rise) - exit * 30, lerp(0.9, 1, rise));
      const term = easeOutCubic(range(p, 0.3, 0.6));
      set("terminal", lerp(30, 0, term) - exit * 60, 1, clamp(term * 2));

      // The check mark inside the shield draws itself late.
      checkRef.current.style.strokeDashoffset = String(1 - easeOutCubic(range(p, 0.52, 0.68)));

      // The scan prints line by line.
      lineRefs.current.forEach((el, i) => {
        const on = range(p, 0.38 + i * 0.07, 0.43 + i * 0.07);
        el.style.opacity = String(on);
        el.style.transform = `translate3d(${(1 - on) * -10}px, 0, 0)`;
      });

      const tIn = easeOutCubic(range(p, 0.08, 0.24));
      const tOut = range(p, 0.4, 0.5);
      const title = titleRef.current;
      title.style.opacity = String(tIn * (1 - tOut));
      title.style.letterSpacing = `${lerp(0.6, 0.2, tIn)}em`;
      title.style.transform = `translate3d(0, ${-p * 6}vh, 0)`;
      title.style.filter = tIn < 0.99 ? `blur(${(1 - tIn) * 10}px)` : "";

      hudRef.current.style.opacity = String(range(p, 0.02, 0.1) * (1 - range(p, 0.66, 0.76)));
      const secs = p * 5400;
      clockRef.current.textContent = `SCAN T+ ${String(Math.floor(secs / 3600)).padStart(2, "0")}:${String(Math.floor((secs % 3600) / 60)).padStart(2, "0")}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
      riskRef.current.textContent = String(Math.round(easeOutCubic(range(p, 0.42, 0.62)) * 85)).padStart(2, "0");

      fadeRef.current.style.opacity = String(range(p, 0.86, 1));
    });
  }, []);

  const layer = (name, children, extra = "") => (
    <div ref={(el) => { if (el) L.current[name] = el; }} className={`absolute inset-0 will-change-transform ${extra}`}>
      {children}
    </div>
  );

  return (
    <section id="top" ref={rootRef} aria-label="PkgSentinel" className="relative" style={{ height: `${STAGE_VH}svh` }}>
      <div className="ps-pin sticky top-0 overflow-hidden" style={{ background: "#0A0F1F" }}>
        {layer("sky", <div className="absolute inset-0" style={{ background: "radial-gradient(70% 55% at 50% 38%, rgba(47,107,255,0.28), transparent 70%), radial-gradient(60% 40% at 80% 10%, rgba(141,176,255,0.12), transparent 70%)" }} />)}

        <div ref={(el) => { if (el) L.current.grid = el; }} aria-hidden="true" className="ps-grid absolute inset-x-0 bottom-0 h-[46%]" />

        {layer("shield",
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 200 240" aria-hidden="true" className="ps-shield h-[46vh] max-h-[430px] w-auto">
              <defs>
                <linearGradient id="shield-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2F6BFF" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#0A0F1F" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path d="M100 8 L184 40 V112 C184 172 148 214 100 234 C52 214 16 172 16 112 V40 Z" fill="url(#shield-fill)" stroke="#8DB0FF" strokeWidth="2" />
              <path d="M100 26 L168 52 V112 C168 162 138 198 100 216 C62 198 32 162 32 112 V52 Z" fill="none" stroke="#8DB0FF" strokeOpacity="0.3" strokeWidth="1" />
              <path ref={checkRef} d="M64 118 L90 144 L140 90" pathLength="1" fill="none" stroke="#22C55E" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset="1" />
            </svg>
          </div>
        )}

        <div ref={titleRef} className="pointer-events-none absolute inset-x-0 top-[19%] text-center md:top-[15%]" style={{ opacity: 0 }}>
          <h1 className="ps-display text-white" style={{ fontSize: "clamp(1.75rem, 6.4vw, 6.5rem)", marginRight: "-0.2em", textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}>PKGSENTINEL</h1>
          <p className="ps-label mt-4 text-[#B8C1DA]">Phishing protection for programmers</p>
        </div>

        {layer("terminal",
          <div className="absolute inset-x-0 bottom-[7%] flex justify-center px-4">
            <div className="ps-mono w-full max-w-[640px] rounded-xl border border-white/10 bg-[#070B18]/90 p-4 text-[0.72rem] leading-6 backdrop-blur sm:text-[0.85rem]">
              <div className="mb-2 flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <p ref={(el) => { if (el) lineRefs.current[0] = el; }} className="text-white">$ npm install expresss</p>
              <p ref={(el) => { if (el) lineRefs.current[1] = el; }} className="text-red-400">[BLOCK] expresss &nbsp;risk 85 &nbsp;did you mean express?</p>
              <p ref={(el) => { if (el) lineRefs.current[2] = el; }} className="text-green-400">Install stopped. Nothing was run.</p>
            </div>
          </div>
        )}

        <div ref={veilRef} aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 50% at 30% 40%, rgba(141,176,255,0.35), transparent 70%), radial-gradient(50% 60% at 75% 60%, rgba(47,107,255,0.3), transparent 70%), radial-gradient(80% 80% at 50% 50%, rgba(10,15,31,0.88), rgba(5,8,18,0.97))" }}>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <p className="ps-label text-[#B8C1DA]">Phishing protection for programmers</p>
            <p className="ps-display mt-3 text-[0.8125rem] text-white/90" style={{ letterSpacing: "0.5em", marginRight: "-0.5em" }}>SCROLL TO CLEAR THE NOISE</p>
            <span aria-hidden="true" className="mt-6 inline-block animate-bounce text-[#B8C1DA] motion-reduce:animate-none">↓</span>
          </div>
        </div>
        <canvas ref={fogRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

        <div ref={hudRef} aria-hidden="true" className="ps-mono pointer-events-none absolute inset-4 text-[0.625rem] uppercase tracking-[0.14em] text-[#B8C1DA]/80 sm:inset-6 md:text-[0.6875rem]" style={{ opacity: 0 }}>
          <div className="ps-brackets absolute inset-0 text-white/30" />
          <div className="absolute left-3 top-16 md:left-4 md:top-20"><p ref={clockRef}>SCAN T+ 00:00:00</p><p className="text-[#B8C1DA]/50">Reads text only</p></div>
          <div className="absolute right-3 top-16 text-right md:right-4 md:top-20"><p>Risk <span ref={riskRef} className="text-red-400">00</span></p><p className="text-[#B8C1DA]/50">expresss</p></div>
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">Never runs code</div>
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">Scroll ↓</div>
        </div>

        <div ref={fadeRef} aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "#0A0F1F", opacity: 0 }} />
      </div>
    </section>
  );
}
