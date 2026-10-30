import { useEffect, useRef } from "react";
import { story } from "../content";
import { clamp, pinProgress, range } from "../lib/math";
import { onFrame } from "../lib/scroll";

// The story as a reel of frames. The section pins and the reel slides
// sideways with the scroll; the frame nearest the focus line is in focus,
// the rest dim back, and each frame drifts a little as it passes.
const SECTION_VH = 340;

function Term({ children }) {
  return (
    <div className="ps-mono flex h-full flex-col justify-center gap-3 p-5 text-[0.78rem] leading-6 sm:text-[0.85rem]">
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-green-500" />
      </div>
      {children}
    </div>
  );
}

const FRAMES = [
  {
    tag: "1:00 AM", title: "The tutorial", body: "Maya follows a tutorial. The package name is right.",
    visual: <Term><p className="text-white">$ npm install express</p><p className="text-green-400">✓ express, a known package</p><p className="text-slate-400">Everything is fine.</p></Term>,
    alt: "A terminal showing npm install express succeeding.",
  },
  {
    tag: "1:04 AM", title: "The slip", body: "Tired, she types one extra letter.",
    visual: <Term><p className="text-white">$ npm install expres<span className="rounded bg-red-500/30 px-0.5 text-red-300">s</span>s</p><p className="text-slate-400">No error. It just works.</p><p className="text-amber-300">...or does it?</p></Term>,
    alt: "A terminal showing npm install expresss with the extra s highlighted.",
  },
  {
    tag: "1:04 AM", title: "The hidden helper", body: "An install script runs by itself and reads her secrets.",
    visual: <Term><p className="text-slate-400">"scripts": {"{"}</p><p className="text-slate-300">&nbsp;&nbsp;"postinstall": <span className="rounded bg-red-500/25 px-0.5 text-red-300">"node steal.js"</span></p><p className="text-slate-400">{"}"}</p><p className="mt-2 text-red-300">sends process.env to a stranger</p></Term>,
    alt: "A package.json with a malicious postinstall script highlighted.",
  },
  {
    tag: "With PkgSentinel", title: "Blocked", body: "Same typo. The install stops before anything runs.",
    visual: (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
        <span className="ps-display rounded-md border border-red-500/50 bg-red-500/15 px-4 py-2 text-[1.4rem] text-red-400">BLOCK 85</span>
        <p className="ps-mono text-[0.85rem] text-slate-300">Did you mean <span className="text-green-400">express</span>?</p>
        <p className="ps-mono text-[0.75rem] text-slate-500">Nothing was installed. Nothing ran.</p>
      </div>
    ),
    alt: "A BLOCK 85 verdict asking did you mean express.",
  },
];

export function StoryReel() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const innerRefs = useRef([]);
  const barRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;
      const { p, rect, vh } = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const vw = window.innerWidth;
      const k = range(p, 0.04, 0.96);
      const travel = Math.max(0, track.offsetLeft + track.scrollWidth - vw * 0.94);
      track.style.transform = `translate3d(${-k * travel}px, 0, 0)`;

      let nearest = 0;
      let best = Infinity;
      cardRefs.current.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const off = (r.left + r.width / 2 - vw * 0.62) / vw;
        const a = clamp(Math.abs(off) * 1.6);
        card.style.opacity = String(1 - a * 0.55);
        card.style.transform = `scale(${1 - a * 0.07})`;
        innerRefs.current[i].style.transform = `translate3d(${off * -30}px, 0, 0)`;
        if (Math.abs(off) < best) { best = Math.abs(off); nearest = i; }
      });
      barRef.current.style.transform = `scaleX(${k})`;
      countRef.current.textContent = `0${nearest + 1}`;
    });
  }, []);

  return (
    <section ref={rootRef} id="story" aria-labelledby="story-title" className="relative" style={{ height: `${SECTION_VH}svh`, background: "#0A0F1F" }}>
      <div className="ps-pin sticky top-0 flex flex-col justify-center overflow-hidden pt-16 md:flex-row md:items-center md:justify-start md:pt-0">
        <div className="ps-story-text relative z-10 shrink-0 px-4 sm:px-6 md:w-[32vw] md:py-10 md:pl-[6vw] md:pr-10">
          <p className="ps-label text-[#6FB6FF]">{story.eyebrow}</p>
          <h2 id="story-title" className="ps-display mt-4 text-white" style={{ fontSize: "clamp(1.5rem, 3.4vw, 3.25rem)", lineHeight: 1.1 }}>{story.heading}</h2>
          <p className="mt-5 max-w-[26rem] text-[#B8C1DA]/80 max-md:hidden">{story.body}</p>
          <p className="ps-mono mt-3 text-[0.7rem] text-[#B8C1DA]/50 max-md:hidden">{story.note}</p>
          <div className="ps-label mt-8 flex items-center gap-4 text-[#B8C1DA]/60 max-md:hidden" aria-hidden="true">
            <span><span ref={countRef} className="text-white">01</span> / 0{FRAMES.length}</span>
            <span className="relative h-px w-32 bg-white/15"><span ref={barRef} className="absolute inset-0 origin-left bg-[#6FB6FF]" style={{ transform: "scaleX(0)" }} /></span>
          </div>
        </div>

        <ol ref={trackRef} className="mt-8 flex gap-5 pl-4 will-change-transform sm:pl-6 md:mt-0 md:gap-7 md:pl-0">
          {FRAMES.map((f, i) => (
            <li key={f.title} ref={(el) => { if (el) cardRefs.current[i] = el; }} className="w-[70vw] shrink-0 origin-bottom sm:w-[44vw] md:w-[clamp(16rem,24vw,23rem)]">
              <figure>
                <div role="img" aria-label={f.alt} className="relative aspect-[3/4] overflow-hidden rounded-md border border-white/10 bg-[#0E1530]">
                  <div ref={(el) => { if (el) innerRefs.current[i] = el; }} className="h-full will-change-transform">{f.visual}</div>
                  <span className="ps-mono absolute left-3 top-3 rounded bg-[#0A0F1F]/70 px-2 py-1 text-[0.625rem] uppercase tracking-[0.14em] text-white backdrop-blur">{f.tag}</span>
                </div>
                <figcaption className="mt-4 flex gap-4">
                  <span className="ps-mono text-[0.6875rem] text-[#6FB6FF]">0{i + 1}</span>
                  <span>
                    <span className="ps-display block text-[0.9rem] uppercase tracking-[0.08em] text-white">{f.title}</span>
                    <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-[#B8C1DA]/70">{f.body}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
