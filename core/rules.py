from pathlib import Path

import yaml

RULES_DIR = Path(__file__).resolve().parent.parent / "rules"
REQUIRED = ("id", "severity", "pattern", "explain")


def load_rules(folder=None):
    """Read every .yml file in the rules folder. Each file is one rule card."""
    folder = Path(folder) if folder else RULES_DIR
    rules = []
    for file in sorted(folder.glob("*.yml")):
        rule = yaml.safe_load(file.read_text(encoding="utf-8"))
        missing = [key for key in REQUIRED if key not in rule]
        if missing:
            raise ValueError(f"{file.name} is missing: {', '.join(missing)}")
        rules.append(rule)
    return rules