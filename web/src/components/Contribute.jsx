import { REPO_URL, contribute } from "../content";
import { useReveals } from "../hooks/useReveals";

export function Contribute() {
  const ref = useReveals();
  return (
    <section ref={ref} id="contribute" aria-labelledby="contribute-title" className="relative overflow-hidden px-4 pb-28 sm:px-6 md:px-[6vw] md:pb-40" style={{ background: "#0A0F1F" }}>
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 h-[90vw] w-[90vw] -translate-x-1/2 rounded-full" style={{ bottom: "-62vw", background: "radial-gradient(circle at 50% 30%, rgba(111,182,255,0.35), rgba(111,182,255,0.05) 55%, transparent 70%)" }} />
      <div className="relative grid gap-12 border-t border-white/10 pt-20 md:grid-cols-2 md:gap-16 md:pt-28">
        <div data-reveal>
          <p className="ps-label text-[#6FB6FF]">{contribute.eyebrow}</p>
          <h2 id="contribute-title" className="ps-display mt-4 text-white" style={{ fontSize: "clamp(1.5rem, 3.4vw, 3.25rem)", lineHeight: 1.1 }}>{contribute.heading}</h2>
          <p className="mt-5 max-w-[28rem] text-[#B8C1DA]/75">{contribute.body}</p>
          <ol className="mt-8 flex flex-wrap items-center gap-2">
            {contribute.steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="ps-mono rounded-full border border-[#6FB6FF]/50 px-3 py-1.5 text-[0.75rem] text-white">{s}</span>
                {i < contribute.steps.length - 1 && <span aria-hidden="true" className="text-[#8DB0FF]">→</span>}
              </li>
            ))}
          </ol>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="ps-mono mt-10 inline-block rounded bg-white px-6 py-4 text-[0.6875rem] uppercase tracking-[0.16em] text-[#0A0F1F] transition-colors hover:bg-[#6FB6FF]">View the repo on GitHub</a>
        </div>
        <div data-reveal className="ps-mono rounded-xl border border-white/10 bg-[#121A33] p-6 text-[0.85rem] leading-7">
          <p className="ps-label mb-3 text-[#8DB0FF]">A detection rule is a small file</p>
          {contribute.rule.map(([k, v]) => (<p key={k}><span className="text-[#8DB0FF]">{k}: </span><span className="text-white">{v}</span></p>))}
        </div>
      </div>
    </section>
  );
}
