from pathlib import Path

from core.scanner import scan_project

CANARY = Path("demo/packages/env-reporter/CANARY_RAN.txt")


def test_scanning_never_executes_install_scripts():
    CANARY.unlink(missing_ok=True)
    result = scan_project("demo")
    verdicts = {p["name"]: p["verdict"] for p in result["packages"]}
    assert verdicts["env-reporter"] == "BLOCK"  # it was found and blocked
    assert not CANARY.exists()                   # but it never ran