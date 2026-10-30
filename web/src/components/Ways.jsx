import { ways } from "../content";
import { useReveals } from "../hooks/useReveals";
import { scrollToHash } from "../lib/scroll";

// Three ways in. Each card carries a set of orbit rings as decoration.
export function Ways() {
  const ref = useReveals();
  return (
    <section ref={ref} id="ways" aria-labelledby="ways-title" className="relative px-4 py-28 sm:px-6 md:px-[6vw] md:py-40" style={{ background: "#0A0F1F" }}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-reveal>
        <div>
          <p className="ps-label text-[#6FB6FF]">{ways.eyebrow}</p>
          <h2 id="ways-title" className="ps-display mt-4 text-white" style={{ fontSize: "clamp(1.5rem, 3.4vw, 3.25rem)", lineHeight: 1.1 }}>{ways.heading}</h2>
        </div>
        <p className="ps-label text-[#B8C1DA]/50">{ways.note}</p>
      </div>
      <ol className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-5">
        {ways.items.map((m, i) => (
          <li key={m.name} data-reveal style={{ transitionDelay: `${i * 110}ms` }} className={`group relative flex flex-col overflow-hidden rounded-lg p-6 ring-1 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 md:p-8 ${m.featured ? "bg-[#121A33] ring-[#6FB6FF]/60 hover:shadow-[0_30px_80px_-30px_rgba(111,182,255,0.45)]" : "bg-[#121A33]/60 ring-white/10 hover:ring-white/25"}`}>
            <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -right-10 -top-10 h-48 w-48 text-white/10 transition-transform duration-[1200ms] group-hover:rotate-45">
              {Array.from({ length: m.rings }, (_, k) => (<ellipse key={k} cx="100" cy="100" rx={40 + k * 18} ry={18 + k * 8} fill="none" stroke="currentColor" transform={`rotate(${-20 + k * 14} 100 100)`} />))}
              <circle cx="100" cy="100" r="9" fill="currentColor" />
            </svg>
            {m.featured && <span className="ps-mono self-start rounded bg-[#6FB6FF] px-2 py-1 text-[0.625rem] uppercase tracking-[0.14em] text-[#0A0F1F]">Try it now</span>}
            <h3 className={`ps-display text-[1.2rem] uppercase tracking-[0.14em] text-white ${m.featured ? "mt-5" : ""}`}>{m.name}</h3>
            <p className="ps-mono mt-6 rounded-md bg-black/30 px-3 py-2 text-[0.85rem] text-[#8DB0FF]">{m.code}</p>
            <ul className="mt-8 space-y-2.5 border-t border-white/10 pt-6">
              {m.lines.map((l) => (<li key={l} className="flex gap-3 text-[0.9375rem] text-[#C9CCD3]/80"><span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#6FB6FF]" />{l}</li>))}
            </ul>
            {m.featured && (
              <a href="#try" onClick={(e) => { e.preventDefault(); scrollToHash("#try"); }} className="ps-mono mt-10 rounded bg-[#6FB6FF] px-5 py-3.5 text-center text-[0.6875rem] uppercase tracking-[0.16em] text-[#0A0F1F] transition-colors hover:bg-white">Open the checker</a>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
