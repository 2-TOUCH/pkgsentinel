from core import registry


def _fake(monkeypatch, info):
    monkeypatch.setattr(registry, "lookup", lambda name: info)


BASE = {"score": 45, "likely": "express", "reasons": ["cut-off name"], "known": False}


def test_widely_used_package_is_cleared(monkeypatch):
    _fake(monkeypatch, {"checked": True, "exists": True, "weekly_downloads": 5_000_000})
    out = registry.enrich(BASE, "expr")
    assert out["score"] == 0
    assert out["known"] is True


def test_low_download_lookalike_stays_suspicious(monkeypatch):
    _fake(monkeypatch, {"checked": True, "exists": True, "weekly_downloads": 12})
    out = registry.enrich(BASE, "expr")
    assert out["score"] == 45
    assert any("12 downloads" in r for r in out["reasons"])


def test_missing_package_is_reported(monkeypatch):
    _fake(monkeypatch, {"checked": True, "exists": False, "weekly_downloads": None})
    out = registry.enrich({"score": 0, "likely": None, "reasons": [], "known": False}, "zzz")
    assert any("not found" in r or "no package" in r for r in out["reasons"])


def test_offline_changes_nothing(monkeypatch):
    _fake(monkeypatch, dict(registry.UNCHECKED))
    out = registry.enrich(BASE, "expr")
    assert out["score"] == 45
    assert out["registry"]["checked"] is False