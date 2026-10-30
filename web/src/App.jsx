import { useEffect, useState } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";

const API = "http://127.0.0.1:8000";
const COLORS = {
  BLOCK: "bg-red-500/20 text-red-400 border-red-500/40",
  WARN: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  ALLOW: "bg-green-500/20 text-green-400 border-green-500/40",
};
const STEPS = [
  "Reading package list",
  "Checking names for look-alikes",
  "Reading install scripts (as text only)",
  "Scoring risk",
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

function Badge({ verdict, score }) {
  return (
    <span className={`px-3 py-1 rounded-md border text-sm ${COLORS[verdict]}`}>
      {verdict} {score}
    </span>
  );
}

function Card({ name, verdict, score, text, likely, index, onClick }) {
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
      className={`rounded-xl p-4 bg-[#121A33] border border-white/10 ${
        clickable ? "cursor-pointer hover:border-blue-500/60 transition" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono">{name}</span>
        <Badge verdict={verdict} score={score} />
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

function Gauge({ score, verdict }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controls = animate(0, score, {
      duration: reduce ? 0 : 1,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [score]);

  const R = 52;
  const C = 2 * Math.PI * R;
  const color = { BLOCK: "#EF4444", WARN: "#F59E0B", ALLOW: "#22C55E" }[verdict];

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
          {verdict}
        </span>
      </div>
    </div>
  );
}

function Drawer({ pkg, onClose }) {
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
        <Gauge score={pkg.score} verdict={pkg.verdict} />

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
          <p className="text-sm text-slate-400">The name looks fine.</p>
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

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const [command, setCommand] = useState("");
  const [checked, setChecked] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

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
    const request = post("/api/scan", { path: "demo" });
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await sleep(350);
    }
    setStep(STEPS.length);
    const data = await request;
    if (data) setResult(data);
    setLoading(false);
  }

  async function checkCommand() {
    if (!command.trim()) return;
    const data = await post("/api/check", { command });
    if (data) setChecked(data.packages);
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold">PkgSentinel</h1>
      <p className="text-blue-300 mb-6">Phishing protection for programmers.</p>

      {error && <p className="mb-4 text-red-400">{error}</p>}

      <h2 className="text-lg font-semibold mb-2">Paste an install command</h2>
      <div className="flex gap-3">
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && checkCommand()}
          placeholder="npm install expresss"
          className="flex-1 rounded-lg px-4 py-2 font-mono bg-[#121A33] border border-white/10 outline-none focus:border-blue-500"
        />
        <button
          onClick={checkCommand}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
        >
          Check
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {checked.map((p, i) => (
          <Card
            key={p.name}
            index={i}
            name={p.name}
            verdict={p.verdict}
            score={p.score}
            likely={p.likely}
            text={p.reasons.length ? `${p.reasons.join(". ")}.` : "No risks found."}
          />
        ))}
      </div>

      <h2 className="text-lg font-semibold mt-10 mb-2">Scan a project</h2>
      <button
        onClick={runScan}
        disabled={loading}
        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition disabled:opacity-60"
      >
        {loading ? "Scanning..." : "Scan demo project"}
      </button>
      {step >= 0 && <Steps step={step} />}
      {result && (
        <p className="mt-4 text-xs text-slate-500">Click a card to see why.</p>
      )}
      <div className="mt-2 space-y-3">
        {result?.packages.map((p, i) => (
          <Card
            key={p.name}
            index={i}
            name={p.name}
            verdict={p.verdict}
            score={p.score}
            likely={p.name_risk.likely}
            text={p.summary}
            onClick={() => setSelected(p)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <Drawer pkg={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}