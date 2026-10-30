from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_scan_demo_blocks_both_threats():
    data = client.post("/api/scan", json={"path": "demo"}).json()
    verdicts = {p["name"]: p["verdict"] for p in data["packages"]}
    assert verdicts["expresss"] == "BLOCK"
    assert verdicts["env-reporter"] == "BLOCK"


def test_scan_rejects_paths_outside_project():
    assert client.post("/api/scan", json={"path": "../.."}).status_code == 400


def test_check_pasted_command():
    data = client.post("/api/check", json={"command": "npm install expresss"}).json()
    assert data["packages"][0]["verdict"] == "BLOCK"
    assert data["packages"][0]["likely"] == "express"