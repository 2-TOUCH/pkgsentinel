import json

from core.script_scan import scan_package


def test_env_reporter_is_blocked():
    result = scan_package("demo/packages/env-reporter")
    rules = {f["rule"] for f in result["findings"]}
    assert result["score"] >= 70
    assert "ENV_READ" in rules
    assert "NET_CALL" in rules
    assert "EXFILTRATION" in rules


def test_harmless_build_script_is_not_blocked(tmp_path):
    (tmp_path / "package.json").write_text(
        json.dumps({"name": "native-thing", "scripts": {"install": "node-gyp rebuild"}})
    )
    assert scan_package(tmp_path)["score"] < 40


def test_package_without_scripts_is_safe(tmp_path):
    (tmp_path / "package.json").write_text(json.dumps({"name": "plain"}))
    assert scan_package(tmp_path)["score"] == 0