import json
import re
from pathlib import Path

# Each rule: id, severity (0-100), regex to look for, plain-English explanation.
# Later we will move these into YAML files so anyone can add a rule.
RULES = [
    {"id": "NET_CALL", "severity": 50,
     "pattern": r"\bfetch\(|XMLHttpRequest|\baxios\b|https?\.(get|request)\(|\bcurl\b|\bwget\b|https?://",
     "explain": "Makes a network call during install."},
    {"id": "ENV_READ", "severity": 50,
     "pattern": r"process\.env|os\.environ|getenv\(",
     "explain": "Reads environment variables, where secrets like API keys often live."},
    {"id": "SECRET_FILES", "severity": 80,
     "pattern": r"\.ssh|id_rsa|\.npmrc|\.aws|credentials",
     "explain": "Touches files that hold passwords, SSH keys or cloud credentials."},
    {"id": "OBFUSCATION", "severity": 60,
     "pattern": r"\beval\(|new Function\(|\batob\(|base64",
     "explain": "Uses hidden or encoded code, a common way to hide bad behaviour."},
    {"id": "DOWNLOAD_EXEC", "severity": 90,
     "pattern": r"(curl|wget)[^\n]*\|\s*(sh|bash)",
     "explain": "Downloads something and runs it immediately."},
    {"id": "SHELL_PROFILE", "severity": 70,
     "pattern": r"\.bashrc|\.zshrc|\.profile",
     "explain": "Edits shell startup files, which can give an attacker lasting access."},
]

INSTALL_HOOKS = ("preinstall", "install", "postinstall")
MAX_FILE_SIZE = 200_000  # bytes; we never read huge files


def _scan_text(text, filename):
    """Look at text line by line and return findings."""
    findings = []
    for number, line in enumerate(text.splitlines(), start=1):
        for rule in RULES:
            if re.search(rule["pattern"], line):
                findings.append({
                    "rule": rule["id"],
                    "severity": rule["severity"],
                    "file": filename,
                    "line": number,
                    "snippet": line.strip()[:120],
                    "explain": rule["explain"],
                })
    return findings


def scan_package(package_dir):
    """Read a package's install scripts AS TEXT and return risk findings.
    Nothing is ever executed."""
    pkg_dir = Path(package_dir).resolve()
    manifest = pkg_dir / "package.json"
    if not manifest.exists():
        return {"score": 0, "findings": []}

    data = json.loads(manifest.read_text(encoding="utf-8"))
    scripts = data.get("scripts", {})
    findings = []

    for hook in INSTALL_HOOKS:
        command = scripts.get(hook)
        if not command:
            continue
        # 1) scan the command itself
        findings += _scan_text(command, f"package.json ({hook})")
        # 2) scan any script file the command points to
        for name in re.findall(r"[\w./-]+\.(?:js|cjs|mjs|sh)\b", command):
            target = (pkg_dir / name).resolve()
            inside = pkg_dir in target.parents  # stay inside the package folder
            if inside and target.is_file() and target.stat().st_size <= MAX_FILE_SIZE:
                text = target.read_text(encoding="utf-8", errors="ignore")
                findings += _scan_text(text, name)

    # Sending data out + reading secrets = classic data theft
    fired = {f["rule"] for f in findings}
    if "NET_CALL" in fired and ("ENV_READ" in fired or "SECRET_FILES" in fired):
        findings.append({
            "rule": "EXFILTRATION", "severity": 95,
            "file": "(combined)", "line": 0, "snippet": "",
            "explain": "Reads secrets AND sends data out. This is how install scripts steal keys.",
        })

    score = max((f["severity"] for f in findings), default=0)
    return {"score": score, "findings": findings}