import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

function Badge({ verdict, score }) {
  return (
    <span className={`px-3 py-1 rounded-md border text-sm ${COLORS[verdict]}`}>
      {verdict} {score}
    </span>
  );
}

function Card({ name, verdict, score, text, index, onClick }) {
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
        <div className="mt-3">
          <Badge verdict={pkg.verdict} score={pkg.score} />
        </div>

        <h4 className="mt-8 mb-2 text-sm font-semibold text-[#8DB0FF]">
          NAME CHECK
        </h4>
        {pkg.name_risk.reasons.length ? (
          <div className="rounded-lg border border-white/10 bg-[#121A33] p-3 text-sm text-slate-300">
            {pkg.name_risk.reasons.join(". ")}.
            {pkg.name_risk.likely && (
              <p className="mt-2 text-green-400">
                Did you mean '{pkg.name_risk.likely}'?
              </p>
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
            text={
              p.reasons.length
                ? p.reasons.join(". ") + (p.likely ? `. Did you mean '${p.likely}'?` : "")
                : "No risks found."
            }
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