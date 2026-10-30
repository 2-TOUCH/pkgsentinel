import { useState } from "react";
import { motion } from "framer-motion";

const API = "http://127.0.0.1:8000";
const COLORS = {
  BLOCK: "bg-red-500/20 text-red-400 border-red-500/40",
  WARN: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  ALLOW: "bg-green-500/20 text-green-400 border-green-500/40",
};

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runScan() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "demo" }),
      });
      setResult(await res.json());
    } catch (e) {
      setError("Could not reach the API. Is it running on port 8000?");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold">PkgSentinel</h1>
      <p className="text-blue-300 mb-6">Phishing protection for programmers.</p>

      <button
        onClick={runScan}
        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
      >
        {loading ? "Scanning..." : "Scan demo project"}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      <div className="mt-6 space-y-3">
        {result?.packages.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl p-4 bg-[#121A33] border border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono">{p.name}</span>
              <span className={`px-3 py-1 rounded-md border text-sm ${COLORS[p.verdict]}`}>
                {p.verdict} {p.score}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">{p.summary}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}