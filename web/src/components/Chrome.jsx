import { useState } from "react";
import { nav } from "../content";
import { scrollToHash } from "../lib/scroll";

function go(e, then) {
  const hash = e.currentTarget.getAttribute("href");
  if (!hash || !hash.startsWith("#")) return;
  e.preventDefault();
  if (then) then();
  scrollToHash(hash);
}

function Mark({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2 20 5.5V12c0 4.6-3.2 8.3-8 10-4.8-1.7-8-5.4-8-10V5.5Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 text-white">
      <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5 md:px-[3vw]">
        <a href="#top" onClick={(e) => go(e)} className="flex items-center gap-2.5" aria-label="PkgSentinel, back to top">
          <Mark className="h-5 w-5 text-[#6FB6FF]" />
          <span className="ps-display text-[0.9rem] tracking-[0.3em]">PKGSENTINEL</span>
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={(e) => go(e)} className="ps-mono text-[0.6875rem] uppercase tracking-[0.16em] text-white/75 transition-colors hover:text-white">{item.label}</a>
          ))}
        </nav>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="menu" className="ps-mono text-[0.6875rem] uppercase tracking-[0.16em] md:hidden">{open ? "Close" : "Menu"}</button>
      </div>
      <div id="menu" inert={!open ? "" : undefined} className={`fixed inset-0 -z-10 flex flex-col justify-center gap-6 bg-[#0A0F1F]/95 px-6 backdrop-blur-xl transition-opacity md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        {nav.map((item, i) => (
          <a key={item.href} href={item.href} onClick={(e) => go(e, () => setOpen(false))} className="ps-display flex items-baseline gap-4 text-[1.5rem] uppercase tracking-[0.12em]"><span className="ps-mono text-[0.6875rem] text-[#6FB6FF]">0{i + 1}</span>{item.label}</a>
        ))}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6 md:px-[6vw]" style={{ background: "#0A0F1F" }}>
      <div className="ps-mono flex flex-col gap-4 text-[0.6875rem] uppercase tracking-[0.16em] text-[#C9CCD3]/50 md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2.5 text-white/80"><Mark className="h-4 w-4" />PkgSentinel · Exception Handlers</span>
        <span>Devf8rge × Hacktoberfest 2026 · Static analysis is one layer of defence</span>
        <a href="#top" onClick={(e) => go(e)} className="hover:text-white">Back to the top ↑</a>
      </div>
    </footer>
  );
}
