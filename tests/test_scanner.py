from core.scanner import scan_project


def test_demo_project_verdicts():
    result = scan_project("demo")
    verdicts = {p["name"]: p["verdict"] for p in result["packages"]}
    assert verdicts["express"] == "ALLOW"
    assert verdicts["lodash"] == "ALLOW"
    assert verdicts["expresss"] == "BLOCK"
    assert verdicts["env-reporter"] == "BLOCK"