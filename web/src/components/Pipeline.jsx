import { useEffect, useRef, useState } from "react";
import { pipeline } from "../content";
import { clamp, easeOutCubic, pinProgress, range } from "../lib/math";
import { onFrame } from "../lib/scroll";

// The scan pipeline, drawn as you scroll. The section pins while six legs
// ink themselves one after another, a dot riding the leg being drawn. The
// risk score and the verdict are functions of the same scroll progress.
const SECTION_VH = 380;
const WINDOW = [0.06, 0.92];
// Two layouts: left-to-right on wide screens, top-to-bottom on phones.
const WIDE = {
  box: "0 80 1200 440", W: 176, H: 76, fs: 14, sub: 12.5, start: "200 300",
  nodes: {
    A: { x: 110, y: 300 }, B: { x: 330, y: 300 }, C: { x: 580, y: 150 },
    D: { x: 580, y: 450 }, E: { x: 830, y: 300 }, F: { x: 1085, y: 300 },
  },
  legs: [
    "M200 300 L240 300",
    "M420 300 C458 300 456 150 490 150",
    "M420 300 C458 300 456 450 490 450",
    "M670 150 C706 150 706 300 740 300",
    "M670 450 C706 450 706 300 740 300",
    "M920 300 L995 300",
  ],
};
const TALL = {
  box: "0 0 400 560", W: 170, H: 60, fs: 13, sub: 11.5, start: "200 70",
  nodes: {
    A: { x: 200, y: 40 }, B: { x: 200, y: 150 }, C: { x: 95, y: 270 },
    D: { x: 305, y: 270 }, E: { x: 200, y: 390 }, F: { x: 200, y: 500 },
  },
  legs: [
    "M200 70 L200 120",
    "M200 180 C200 215 95 220 95 240",
    "M200 180 C200 215 305 220 305 240",
    "M95 300 C95 335 200 340 200 360",
    "M305 300 C305 335 200 340 200 360",
    "M200 420 L200 470",
  ],
};
const TEXT = {
  A: ["YOUR COMMAND", "npm install expresss"], B: ["READ THE LIST", "package.json + scripts"],
  C: ["NAME CHECK", "one letter off?"], D: ["SCRIPT CHECK", "read as text only"],
  E: ["RISK SCORE", "0"], F: ["VERDICT", "..."],
};
const TO = ["B", "C", "D", "E", "E", "F"];

function useTall() {
  const q = "(max-width: 767px)";
  const [tall, setTall] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setTall(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return tall;
}

export function Pipeline() {
  const rootRef = useRef(null);
  const legRefs = useRef([]);
  const nodeRefs = useRef({});
  const dotRef = useRef(null);
  const scoreRef = useRef(null);
  const verdictRef = useRef(null);
  const [leg, setLeg] = useState(0);
  const tall = useTall();
  const lay = tall ? TALL : WIDE;

  useEffect(() => {
    let lastP = -1;
    let current = 0;
    return onFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const { p, rect, vh } = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const u = range(p, WINDOW[0], WINDOW[1]) * 6;
      const s = clamp(Math.floor(u), 0, 5);
      if (s !== current) { current = s; setLeg(s); }

      legRefs.current.forEach((path, i) => {
        const k = easeOutCubic(clamp(u - i));
        path.style.strokeDashoffset = String(1 - k);
        if (i === s) {
          const pt = path.getPointAtLength(path.getTotalLength() * k);
          dotRef.current.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        }
      });

      // A node lights up once its last incoming leg is fully drawn.
      const arrive = { B: 1, C: 2, D: 3, E: 5, F: 6 };
      Object.entries(arrive).forEach(([key, at]) => {
        const el = nodeRefs.current[key];
        if (!el) return;
        const done = u >= at;
        const bad = key === "F" && done;
        el.style.stroke = bad ? "#EF4444" : done ? "#6FB6FF" : "rgba(255,255,255,0.15)";
        el.style.fill = bad ? "rgba(239,68,68,0.12)" : "#121A33";
      });
      scoreRef.current.textContent = String(Math.round(easeOutCubic(range(u, 3, 5)) * 85));
      verdictRef.current.textContent = u >= 6 ? "BLOCK" : "...";
      verdictRef.current.style.fill = u >= 6 ? "#EF4444" : "#8B909B";
    });
  }, []);

  const cur = pipeline.legs[leg];
  return (
    <section ref={rootRef} id="how" aria-labelledby="how-title" className="relative" style={{ height: `${SECTION_VH}svh`, background: "#0A0F1F" }}>
      <div className="ps-pin sticky top-0 flex flex-col overflow-hidden px-4 pb-8 pt-20 sm:px-6 md:px-[6vw] md:pt-24">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ps-label text-[#6FB6FF]">{pipeline.eyebrow}</p>
            <h2 id="how-title" className="ps-display mt-3 max-w-[20ch] text-white" style={{ fontSize: "clamp(1.5rem, 3.4vw, 3.25rem)", lineHeight: 1.1 }}>{pipeline.heading}</h2>
          </div>
          <p className="ps-label text-[#B8C1DA]/60">Scripts run <span className="text-white">0</span></p>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center">
          <svg viewBox={lay.box} className="h-auto max-h-full w-full" role="img" aria-label="The scan pipeline: command, read the list, name check and script check, risk score, verdict.">
            {lay.legs.map((d, i) => (
              <path key={"g" + i} d={d} fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="3 6" />
            ))}
            {Object.entries(lay.nodes).map(([key, n]) => (
              <g key={key} fontFamily="IBM Plex Mono, monospace">
                <rect ref={(el) => { if (el) nodeRefs.current[key] = el; }} x={n.x - lay.W / 2} y={n.y - lay.H / 2} width={lay.W} height={lay.H} rx="10" fill="#121A33" stroke={key === "A" ? "#6FB6FF" : "rgba(255,255,255,0.15)"} strokeWidth="1.5" />
                <text x={n.x} y={n.y - 8} textAnchor="middle" fontSize={lay.fs} letterSpacing="1.5" fill="#8DB0FF">{TEXT[key][0]}</text>
                <text ref={key === "E" ? scoreRef : key === "F" ? verdictRef : undefined} x={n.x} y={n.y + 16} textAnchor="middle" fontSize={key === "E" || key === "F" ? lay.fs + 6 : lay.sub} fontWeight={key === "E" || key === "F" ? 600 : 400} fill={key === "E" ? "#fff" : "#B8C1DA"}>{TEXT[key][1]}</text>
              </g>
            ))}
            {lay.legs.map((d, i) => (
              <path key={i} ref={(el) => { if (el) legRefs.current[i] = el; }} d={d} pathLength={1} fill="none" stroke={i === 5 ? "#EF4444" : "#6FB6FF"} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset="1" />
            ))}
            <g ref={dotRef} transform={`translate(${lay.start})`}>
              <circle r="11" fill="#6FB6FF" opacity="0.25" />
              <circle r="4.5" fill="#fff" />
            </g>
          </svg>
        </div>

        <div className="grid gap-4 border-t border-white/10 pt-5 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-10">
          <p className="ps-label text-[#6FB6FF]">{cur.tag} / {pipeline.legs.length}</p>
          <div key={leg} className="ps-leg-in" aria-live="polite">
            <h3 className="ps-display text-[1.05rem] uppercase tracking-[0.08em] text-white md:text-[1.3rem]">{cur.title}</h3>
            <p className="mt-1.5 max-w-[40rem] text-[#B8C1DA]/75">{cur.body}</p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {pipeline.legs.map((_, i) => (<span key={i} className={`h-1 w-6 rounded-full transition-colors duration-500 ${i <= leg ? "bg-[#6FB6FF]" : "bg-white/15"}`} />))}
          </div>
        </div>
      </div>
    </section>
  );
}
