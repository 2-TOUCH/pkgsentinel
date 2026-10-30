import json
from pathlib import Path


def read_dependencies(project_path):
    """Read package.json and return {package_name: version}.
    Only reads the file as text. Nothing is downloaded or run."""
    file = Path(project_path) / "package.json"
    data = json.loads(file.read_text(encoding="utf-8"))
    deps = {}
    for section in ("dependencies", "devDependencies"):
        deps.update(data.get(section, {}))
    return deps