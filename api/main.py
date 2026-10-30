from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.command import parse_command
from core.name_risk import check_name
from core.rules import load_rules
from core.scanner import scan_project
from core.scoring import verdict

app = FastAPI(title="PkgSentinel API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

HISTORY = []  # recent scans, kept in memory for the demo
ROOT = Path.cwd().resolve()


class ScanRequest(BaseModel):
    path: str = "demo"


class CheckRequest(BaseModel):
    command: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/rules")
def rules():
    return load_rules()


@app.post("/api/scan")
def scan(req: ScanRequest):
    target = (ROOT / req.path).resolve()
    if ROOT not in target.parents and target != ROOT:
        raise HTTPException(400, "Path must be inside the project folder.")
    if not (target / "package.json").exists():
        raise HTTPException(404, "No package.json found there.")
    result = scan_project(target)
    result["id"] = len(HISTORY) + 1
    result["source"] = "web"
    HISTORY.append(result)
    return result


@app.post("/api/check")
def check(req: CheckRequest):
    packages = []
    for name in parse_command(req.command):
        r = check_name(name)
        packages.append({
            "name": name, "score": r["score"], "verdict": verdict(r["score"]),
                     "likely": r["likely"], "reasons": r["reasons"], "known": r["known"],
        })
    return {"command": req.command, "packages": packages}


@app.get("/api/scans")
def scans():
    return HISTORY[::-1]


@app.get("/api/scans/{scan_id}")
def get_scan(scan_id: int):
    for s in HISTORY:
        if s["id"] == scan_id:
            return s
    raise HTTPException(404, "Scan not found.")