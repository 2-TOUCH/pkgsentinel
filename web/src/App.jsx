import { useEffect, useState } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Check, Loader2, Lock, ShieldCheck, X } from "lucide-react";

const API = "http://127.0.0.1:8000";
const COLORS = {
  BLOCK: "bg-red-500/20 text-red-400 border-red-500/40",
  WARN: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  ALLOW: "bg-green-500/20 text-green-400 border-green-500/40",
  UNVERIFIED: "bg-slate-500/20 text-slate-300 border-slate-500/40",
};
const ACCENT = {
  BLOCK: "border-l-red-500",
  WARN: "border-l-amber-500",
  ALLOW: "border-l-green-500",
  UNVERIFIED: "border-l-slate-500",
};
const GAUGE_COLORS = {
  BLOCK: "#EF4444",
  WARN: "#F59E0B",
  ALLOW: "#22C55E",
  UNVERIFIED: "#94A3B8",
};
const STEPS = [
  "Reading package list",
  "Checking names for look-alikes",
  "Reading install scripts (as text only)",
  "Scoring risk",
];
const EXAMPLES = [
  "npm install expresss",
  "npm install lodahs",
  "npm install lodash",
];
const UNVERIFIED_TEXT =
  "Not in our list of popular packages, so we can't vouch for it. No look-alike name or risky install script found.";
const KNOWN_TEXT = "Known popular package name. No risks found.";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ALLOW only means "no warning signs". If the name is not a known popular
// package, we show it as UNVERIFIED instead of a green all-clear.
function displayState(verdict, known) {
  return verdict === "ALLOW" && known === false ? "UNVERIFIED" : verdict;
}

// Types phrases one letter at a time, for the input placeholder.
function useTypewriter(phrases) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (reducedMotion()) {
      setText(phrases[0]);
      return;
    }
    let p = 0;
    let c = 0;
    let deleting = false;
    let timer;
    const tick = () => {
      const full = phrases[p];
      c += deleting ? -1 : 1;
      setText(full.slice(0, c));
      let delay = deleting ? 30 : 70;
      if (!deleting && c === full.length) {
        deleting = true;
        delay = 1400;
      } else if (deleting && c === 0) {
        deleting = false;
        p = (p + 1) % phrases.length;
        delay = 400;
      }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [phrases]);
  return text;
}

// Finds which letters of a and b do NOT match (longest common subsequence).
function diffLetters(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const aBad = Array(n).fill(false);
  const bBad = Array(m).fill(false);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      aBad[i - 1] = true;
      i--;
    } else {
      bBad[j - 1] = true;
      j--;
    }
  }
  while (i > 0) aBad[--i] = true;
  while (j > 0) bBad[--j] = true;
  return { aBad, bBad };
}

function LetterDiff({ typed, likely }) {
  const { aBad, bBad } = diffLetters(typed, likely);
  return (
    <div className="mt-3 space-y-1 font-mono text-sm">
      <div className="flex items-center">
        <span className="w-28 shrink-0 font-sans text-xs text-slate-500">
          You typed
        </span>
        <span>
          {typed.split("").map((ch, i) => (
            <span
              key={i}
              className={
                aBad[i] ? "rounded bg-red-500/25 px-0.5 text-red-400" : "text-slate-300"
              }
            >
              {ch}
            </span>
          ))}
        </span>
      </div>
      <div className="flex items-center">
        <span className="w-28 shrink-0 font-sans text-xs text-slate-500">
          Did you mean
        </span>
        <span>
          {likely.split("").map((ch, i) => (
            <span
              key={i}
              className={
                bBad[i]
                  ? "rounded bg-green-500/25 px-0.5 text-green-400"
                  : "text-slate-300"
              }
            >
              {ch}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

function Badge({ state, score }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-md border text-sm ${COLORS[state]} ${
        state === "BLOCK" ? "shake" : ""
      }`}
    >
      {state === "UNVERIFIED" ? "UNVERIFIED" : `${state} ${score}`}
    </span>
  );
}

function Card({ name, state, score, text, likely, index, onClick }) {
  const clickable = Boolean(onClick);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onClick}
      onKeyDown={(e) => clickable && e.key === "Enter" && onClick()}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={`rounded-xl border border-white/10 border-l-4 ${ACCENT[state]} bg-[#121A33] p-4 ${
        clickable ? "cursor-pointer hover:border-blue-500/60 transition" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-white">{name}</span>
        <Badge state={state} score={score} />
      </div>
      <p className="text-sm text-slate-400 mt-2">{text}</p>
      {likely && <LetterDiff typed={name} likely={likely} />}
    </motion.div>
  );
}

function Steps({ step }) {
  return (
    <div className="mt-4 rounded-xl p-4 bg-[#121A33] border border-white/10 space-y-2">
      {STEPS.map((label, i) => {
        if (i > step) return null;
        const done = i < step;
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-sm text-slate-300"
          >
            {done ? (
              <Check size={16} className="text-green-400" />
            ) : (
              <Loader2 size={16} className="animate-spin text-[#8DB0FF]" />
            )}
            {label}
          </motion.div>
        );
      })}
    </div>
  );
}

function Tile({ label, value, color, index }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: reducedMotion() ? 0 : 0.8,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-xl border border-white/10 bg-[#121A33] p-4"
    >
      <div className={`text-3xl font-bold ${color}`}>{shown}</div>
      <div className="mt-1 text-xs tracking-wide text-slate-400">{label}</div>
    </motion.div>
  );
}

function Tiles({ result }) {
  const c = result.counts;
  const items = [
    { label: "SCANNED", value: result.packages.length, color: "text-white" },
    { label: "BLOCKED", value: c.BLOCK, color: "text-red-400" },
    { label: "WARNED", value: c.WARN, color: "text-amber-400" },
    { label: "ALLOWED", value: c.ALLOW, color: "text-green-400" },
  ];
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((t, i) => (
        <Tile key={t.label} index={i} {...t} />
      ))}
    </div>
  );
}

function Gauge({ score, state }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(0, score, {
      duration: reducedMotion() ? 0 : 1,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [score]);

  const R = 52;
  const C = 2 * Math.PI * R;
  const color = GAUGE_COLORS[state];

  return (
    <div className="relative mx-auto mt-6 h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - shown / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{shown}</span>
        <span className="text-xs font-semibold tracking-widest" style={{ color }}>
          {state}
        </span>
      </div>
    </div>
  );
}

function Drawer({ pkg, onClose }) {
  const state = displayState(pkg.verdict, pkg.name_risk.known);
  const findings = [...pkg.script_risk.findings].sort(
    (a, b) => b.severity - a.severity
  );
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.25 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-[#0E1530] border-l border-white/10 p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-mono text-xl text-white">{pkg.name}</h3>
            <p className="text-sm text-slate-400">version {pkg.version}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        <Gauge score={pkg.score} state={state} />

        <h4 className="mt-8 mb-2 text-sm font-semibold text-[#8DB0FF]">
          NAME CHECK
        </h4>
        {pkg.name_risk.reasons.length ? (
          <div className="rounded-lg border border-white/10 bg-[#121A33] p-3 text-sm text-slate-300">
            {pkg.name_risk.reasons.join(". ")}.
            {pkg.name_risk.likely && (
              <LetterDiff typed={pkg.name} likely={pkg.name_risk.likely} />
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            {pkg.name_risk.known === false
              ? "Not in our list of popular packages, so we can't vouch for this name."
              : "Known popular package name."}
          </p>
        )}

        <h4 className="mt-8 mb-2 text-sm font-semibold text-[#8DB0FF]">
          INSTALL SCRIPT CHECK
        </h4>
        {findings.length ? (
          <div className="space-y-3">
            {findings.map((f, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/10 bg-[#121A33] p-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-400">{f.rule}</span>
                  <span className="text-slate-400">
                    {f.line > 0 ? `${f.file}, line ${f.line}` : "combined finding"}
                  </span>
                </div>
                {f.snippet && (
                  <pre className="mt-2 overflow-x-auto rounded-md bg-black/40 p-2 text-xs text-red-300">
                    <code>{f.snippet}</code>
                  </pre>
                )}
                <p className="mt-2 text-sm text-slate-300">{f.explain}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Nothing suspicious in the install scripts.
          </p>
        )}

        <p className="mt-8 text-xs text-slate-500">
          Scripts were read as plain text. Nothing was run.
        </p>
      </motion.aside>
    </>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldCheck size={26} className="text-[#2F6BFF]" />
        <span className="text-lg font-bold text-white">PkgSentinel</span>
      </div>
      <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
        <Lock size={12} className="text-green-400" />
        Reads text only. Never runs code.
      </span>
    </header>
  );
}

export default function App() {
  const [result, setResult] = useState(null);
  const [ms, setMs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [command, setCommand] = useState("");
  const [checked, setChecked] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const typed = useTypewriter(EXAMPLES);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function post(path, body) {
    setError("");
    try {
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Server said ${res.status}`);
      return await res.json();
    } catch (e) {
      setError("Could not reach the API. Is it running on port 8000?");
      return null;
    }
  }

  async function runScan() {
    setLoading(true);
    setResult(null);
    const request = (async () => {
      const t0 = performance.now();
      const data = await post("/api/scan", { path: "demo" });
      return { data, ms: Math.round(performance.now() - t0) };
    })();
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await sleep(350);
    }
    setStep(STEPS.length);
    const done = await request;
    if (done.data) {
      setResult(done.data);
      setMs(done.ms);
    }
    setLoading(false);
  }

  async function checkCommand(cmd = command) {
    if (!cmd.trim()) return;
    const data = await post("/api/check", { command: cmd });
    if (data) setChecked(data.packages);
  }

  function checkText(p, state) {
    if (p.reasons.length) return `${p.reasons.join(". ")}.`;
    return state === "UNVERIFIED" ? UNVERIFIED_TEXT : KNOWN_TEXT;
  }

  function scanText(p, state) {
    if (state === "UNVERIFIED" && p.summary === "No risks found.") {
      return UNVERIFIED_TEXT;
    }
    return p.summary;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <Header />

      <section className="mt-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
        >
          Phishing protection{" "}
          <span className="bg-gradient-to-r from-[#8DB0FF] to-[#2F6BFF] bg-clip-text text-transparent">
            for programmers.
          </span>
        </motion.h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Check a package before you install it. One wrong letter should never
          cost you your keys.
        </p>
      </section>

      {error && <p className="mt-6 text-red-400">{error}</p>}

      <section className="mt-10">
        <div className="flex gap-3">
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkCommand()}
            placeholder={typed}
            aria-label="Paste an install command"
            className="flex-1 rounded-xl border border-white/10 bg-[#121A33] px-4 py-3 font-mono outline-none focus:border-blue-500"
          />
          <button
            onClick={() => checkCommand()}
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500"
          >
            Check
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          Try:
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setCommand(ex);
                checkCommand(ex);
              }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-slate-300 transition hover:border-blue-500/60"
            >
              {ex}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {checked.map((p, i) => {
            const state = displayState(p.verdict, p.known);
            return (
              <Card
                key={p.name}
                index={i}
                name={p.name}
                state={state}
                score={p.score}
                likely={p.likely}
                text={checkText(p, state)}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Scan a project</h2>
            <p className="text-sm text-slate-400">
              Reads the dependency list and every install script, as text.
            </p>
          </div>
          <button
            onClick={runScan}
            disabled={loading}
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 font-medium transition hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Scanning..." : "Scan demo project"}
          </button>
        </div>

        {step < 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-500">
            No scan yet. Click "Scan demo project" to see the results here.
          </div>
        )}
        {step >= 0 && <Steps step={step} />}
        {result && <Tiles result={result} />}
        {result && (
          <p className="mt-4 text-xs text-slate-500">
            Analysis took {ms} ms. Nothing was run. Click a card to see why.
          </p>
        )}
        <div className="mt-2 space-y-3">
          {result?.packages.map((p, i) => {
            const state = displayState(p.verdict, p.name_risk.known);
            return (
              <Card
                key={p.name}
                index={i}
                name={p.name}
                state={state}
                score={p.score}
                likely={p.name_risk.likely}
                text={scanText(p, state)}
                onClick={() => setSelected(p)}
              />
            );
          })}
        </div>
      </section>

      <footer className="mt-16 pb-6 text-center text-xs text-slate-600">
        Static analysis is one layer of defence, not a guarantee. ALLOW means
        no warning signs, not "safe".
      </footer>

      <AnimatePresence>
        {selected && (
          <Drawer pkg={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}