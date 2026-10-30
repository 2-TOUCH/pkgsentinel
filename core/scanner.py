from pathlib import Path

from core.name_risk import check_name
from core.reader import read_dependencies
from core.scoring import combine, verdict
from core.script_scan import scan_package


def find_package_dir(project, name):
    """Look for the package's files on disk (never downloads anything)."""
    for folder in ("node_modules", "packages"):
        candidate = Path(project) / folder / name
        if candidate.is_dir():
            return candidate
    return None


def _summary(name, name_part, script_part):
    parts = []
    if name_part["likely"]:
        parts.append(
            f"'{name}' {name_part['reasons'][0]}. Did you mean '{name_part['likely']}'?"
        )
    if script_part["findings"]:
        worst = max(script_part["findings"], key=lambda f: f["severity"])
        parts.append(f"Install script: {worst['explain']}")
    return " ".join(parts) if parts else "No risks found."


def scan_project(project_path):
    """Scan every dependency in a project's package.json. Read-only."""
    packages = []
    for name, version in read_dependencies(project_path).items():
        name_part = check_name(name)
        package_dir = find_package_dir(project_path, name)
        if package_dir:
            script_part = scan_package(package_dir)
        else:
            script_part = {"score": 0, "findings": []}

        score = combine(name_part["score"], script_part["score"])
        packages.append({
            "name": name,
            "version": version,
            "verdict": verdict(score),
            "score": score,
            "name_risk": name_part,
            "script_risk": script_part,
            "summary": _summary(name, name_part, script_part),
        })

    counts = {"BLOCK": 0, "WARN": 0, "ALLOW": 0}
    for p in packages:
        counts[p["verdict"]] += 1
    return {"project": str(project_path), "counts": counts, "packages": packages}