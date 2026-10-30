import { useState } from "react";
import { motion } from "framer-motion";

const API = "http://127.0.0.1:8000";
const COLORS = {
  BLOCK: "bg-red-500/20 text-red-400 border-red-500/40",
  WARN: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  ALLOW: "bg-green-500/20 text-green-400 border-green-500/40",
};

function Card({ name, verdict, score, text, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-xl p-4 bg-[#121A33] border border-white/10"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono">{name}</span>
        <span className={`px-3 py-1 rounded-md border text-sm ${COLORS[verdict]}`}>
          {verdict} {score}
        </span>
      </div>
      <p className="text-sm text-slate-400 mt-2">{text}</p>
    </motion.div>
  );
}

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState("");
  const [checked, setChecked] = useState([]);
  const [error, setError] = useState("");

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
    const data = await post("/api/scan", { path: "demo" });
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
        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
      >
        {loading ? "Scanning..." : "Scan demo project"}
      </button>
      <div className="mt-4 space-y-3">
        {result?.packages.map((p, i) => (
          <Card
            key={p.name}
            index={i}
            name={p.name}
            verdict={p.verdict}
            score={p.score}
            text={p.summary}
          />
        ))}
      </div>
    </div>
  );
}