# PkgSentinel

**Phishing protection for programmers.**

PkgSentinel checks a package before it is installed, and never runs anything. It is a security guard for `npm install`: it checks each package name for look-alike typos and reads each install script as plain text for dangerous behaviour. Every package gets a risk score from 0 to 100 and a plain-English reason.

Built for the Devf8rge x Hacktoberfest Hack Day finals (problem statement PS-06, Supply Chain Sentinel) by Team Exception Handlers.

## The problem

Developers install code from strangers with one command. Attackers publish look-alike packages (`reqeusts` instead of `requests`, `expresss` instead of `express`) or hide install scripts that steal secrets (API keys, SSH keys) the moment you install. It happens in seconds, before the developer notices.

## Our idea

1. Read the dependency list (nothing is downloaded or run).
2. **Name check:** is this name suspiciously close to a popular package?
3. **Script check:** does the install script (read as text only) send data out, read environment variables or `~/.ssh`, or hide code?
4. Give a risk score: BLOCK (70+), WARN (40-69), ALLOW (below 40), with a plain-English reason and a "did you mean...?".

| Verdict | Score | Meaning |
|---------|-------|---------|
| BLOCK | 70 and above | Do not install. |
| WARN | 40 to 69 | Look at it before installing. |
| ALLOW | below 40 | No strong warning signs. |

## What is built

- **Name check:** look-alike characters (`rn` vs `m`, `1` vs `l`, `0` vs `o`), separator tricks, and 1 to 2 letter typos of popular package names, with the differing letters highlighted.
- **Install script check:** reads `preinstall`, `install` and `postinstall` scripts, and the files they call, as **text only**. It looks for reading environment variables, touching secret files, network calls, hidden (obfuscated) code, download-and-run, and shell-profile edits. Reading secrets and sending data out together scores 95.
- **Plain-English reasons:** every verdict shows the exact file, line and code that caused it.
- **Three ways to use it:** a command line tool, an animated web dashboard, and a JSON API.
- **Detection rules as small YAML files** that anyone can add.

## Safety: static analysis only

PkgSentinel **never downloads, installs or runs** any package or script. It only reads text. A test (`tests/test_canary.py`) scans our demo project and checks that a canary file the bad demo script would write is never created, which shows that scripts are not executed.

The demo uses only fake packages and a fake local address (`http://localhost:9999`). Nothing in this repo was ever published to npm or PyPI.

## Quick start

You need Python 3 (developed on 3.13) and Node.js (developed on 22).

**1. Get the code and install the Python parts**

```bash
git clone https://github.com/SMohammedMaaz/pkgsentinel.git
cd pkgsentinel
pip install -r requirements.txt
```

**2. Try the command line**

```bash
python -m cli.main scan demo
python -m cli.main check expresss
```

Add `--json` to `scan` to get machine-readable output.

**3. Start the web dashboard (two terminals)**

Terminal 1, the API:

```bash
python -m uvicorn api.main:app --reload
```

Terminal 2, the web page:

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173 and click **Scan demo project**. API docs are at http://127.0.0.1:8000/docs.

**Run the tests**

```bash
python -m pytest
```

## The demo project

`demo/` is our own sandbox with four dependencies:

| Package | Result | Why |
|---------|--------|-----|
| `express` | ALLOW | Popular, clean name. |
| `lodash` | ALLOW | Popular, clean name. |
| `expresss` | BLOCK (85) | One letter away from `express`. |
| `env-reporter` | BLOCK (95) | Its install script reads environment variables and sends them to a URL. |

## API

| Endpoint | What it does |
|----------|--------------|
| `GET /api/health` | Is the API running? |
| `GET /api/rules` | List the detection rules. |
| `POST /api/scan` | Scan a project, for example `{"path": "demo"}`. |
| `POST /api/check` | Check names in a pasted command, for example `{"command": "npm install expresss"}`. Add `"online": true` to also ask npm if each name exists. |
| `GET /api/scans` | Scan history. |
| `GET /api/scans/{id}` | One past scan. |

Scan paths outside the project folder are rejected.

## How the code is organised

```
core/       the checking logic (reader, name_risk, script_scan, scoring, scanner, rules)
cli/        command line (Typer + Rich)
api/        web API (FastAPI)
rules/      detection rules, one YAML file per rule
demo/       our own fake sandbox project
tests/      automated tests
web/        dashboard (React + Vite + Tailwind + Framer Motion)
```

## Contributing

The easiest way to help is to add **one small rule**. Detection rules are plain YAML files in `rules/`, one rule per file, each with an `id`, `severity`, `pattern` and `explain`. Copy an existing file, change the fields, and add a test. See [CONTRIBUTING.md](CONTRIBUTING.md) for the steps.

Good first issues: add a new YAML rule, grow the list of popular package names, or add a PyPI adapter.

## Honest limits

- This is **one layer of defence, not a guarantee**. Static checks can miss well-hidden code. We flag obfuscation itself, but a determined attacker may get past text rules.
- The popular-names list is a bundled starter list of about 150 names. It is designed to grow.
- Right now it supports npm projects only.
- An optional **online mode** (off by default) asks npm's public download-count API whether a name exists and how many downloads it had last week. It sends package names only, never code, and PkgSentinel works fully offline without it. Existing on npm does not mean a package is safe.
- It checks names and install scripts, not the whole package code or known vulnerabilities. It is meant to sit next to tools like `npm audit`, not replace them.
- A name that looks like a typo can be a legitimate package, so the scores are weighted and medium scores give a WARN.

## AI tools used

**Claude (Anthropic) was used as a coding assistant** while building this project. The detection itself is rule-based and explainable, and does not depend on an AI model to make decisions.

## Credits

See [CREDITS.md](CREDITS.md) for the open-source libraries this project uses.

## License

Apache License 2.0. See [LICENSE](LICENSE).